import formidable from "formidable";
import fs from "fs";
import SshClient from "../../../../utils/SshClient";
import ServerService from "../../../../services/ServerService";
import { withSession } from "next-session";
import FileService from "../../../../services/FileService";
import { logger } from "../../../../utils/winston";

export const config = {
  api: {
    bodyParser: false,
  },
};

const tempDir = process.env.TEMP_FILES_DIR || "./public/tempFiles";

function getRandomUuid() {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (c) {
    var r = (Math.random() * 16) | 0,
      v = c == "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

const insertFileDb = async (userId, file, uuid, type, phase) => {
  return await FileService.newFile({
    userId: userId,
    fileName: file.name,
    fileSize: file.size,
    phase: phase, // L 로컬, F 운영관리 플랫폼, R 원격지
    type: type,
    fileKey: uuid,
    checkTime: new Date(),
  });
};

const updateFileDb = async (userId, file, uuid, type, phase) => {
  return await FileService.newFile({
    userId: userId,
    phase: phase,
    fileKey: uuid,
    checkTime: new Date(),
  });
};

const downUrl = "http://localhost:3355/tempFiles/";

var process_cmd = (id, processType, filename, path, filekey) => {
  const uploadUrl = `http://localhost:3355/api/servers/${id}/explorer`;
  if (processType === "upload") {
    var enc = encodeURI(`${downUrl}${filekey}/${filename}`);
    console.log(`curl "${enc}" > "${path + filename}"`);
    return `curl "${enc}" > "${path + filename}"`;
  } else if (processType === "download") {
    return `curl -F "file=@${path + filename}" ${uploadUrl}?type="download"`;
  }
};

// DELETE FILE
const deleteFile = async (req, res) => {
  fs.rmSync(`${tempDir}/` + req.__NEXT_INIT_QUERY["filename"]);
  return;
};

// WRITE FILE
const writeFile = async (req, res, userId) => {
  const form = new formidable.IncomingForm();
  form.parse(req, async function (err, fields, files) {
    logger.info("success send to server : " + JSON.stringify(files.file));
    try {
      var uuid = getRandomUuid();
      var file = files.file;

      //임시파일 이동
      fs.mkdirSync(`${tempDir}/${uuid}`);
      fs.renameSync(file.path, `${tempDir}/${uuid}/${decodeURI(file.name)}`);

      fs.stat(`${tempDir}/${uuid}/${decodeURI(file.name)}`, (err, stat) => {
        if (err) console.log("error: ", error);
        logger.info("success move to tempfile : " + JSON.stringify(stat));
      });

      try {
        await insertFileDb(
          userId,
          file,
          uuid,
          req.__NEXT_INIT_QUERY["type"],
          "F"
        );
      } catch (err) {
        console.log(err);
      }
    } catch (e) {
      logger.error("fail to transfer : " + e);
    }
    return res.json({
      status: "201",
      fileKey: uuid,
      fileName: files.file.name,
    });
  });
};

// SERVER TO REMOTE
const processToRemote = async (req, res) => {
  console.log("## PROCESS TO REMOTE ##");
  let server = await ServerService.findServerById(req.query["id"]);
  const sshClient = new SshClient(
    server.ip,
    server.port,
    server.user,
    server.password
  );
  try {
    var result;

    await sshClient
      .exec(
        process_cmd(
          req.query["id"],
          req.query["type"],
          req.query["filename"],
          req.query["path"] + "/",
          req.query["filekey"]
        ),
        {}
      )
      .then((res) => {
        logger.info(
          "success upload to remote server : " + res
        );
        res.forEach((ele) => {
          if (ele.indexOf("fileKey") != -1) {
            result = ele;
          }
        });

        try {
          await insertFileDb(
            userId,
            file,
            uuid,
            req.__NEXT_INIT_QUERY["type"],
            "F"
          );
        } catch (err) {
          console.log(err);
        }

        return res;
      });

    if (req.query["type"] === "upload") {
      await fs.rmdirSync(`${tempDir}/` + req.query["filekey"], {
        recursive: true,
      });
    }

    return res.status(201).send(result);
  } catch (e) {
    console.log(e);
  }
};

const controlData = async (req, res, userId) => {
  if (req.query["type"] === "search") {
    res.send({
      status: "success",
      fileList: await FileService.findFiles(userId),
    });
  } else if (req.query["type"] === "update") {
    res.send({
      status: "success",
      fileList: await FileService.updateFiles(userId),
    });
  } else if (req.query["type"] === "remove") {
    await FileService.removeFiles(userId);
    res.send({
      status: "success",
    });
  }
};

export default withSession(async (req, res) => {
  var userId = "";
  if (req.session.auth !== undefined) {
    userId = req.session.auth.user.userId;
  }

  // /서버들/5/액션?타입=명령어실행,
  // 메소드: 포스트, 경로 /서버들/5/파일

  req.method === "POST"
    ? writeFile(req, res, userId)
    : req.method === "PUT"
    ? console.log("PUT")
    : req.method === "DELETE"
    ? deleteFile(req, res)
    : req.method === "GET"
    ? processToRemote(req, res)
    : res.status(404).send("");
});
