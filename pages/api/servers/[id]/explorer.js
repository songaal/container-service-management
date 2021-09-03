import formidable from "formidable";
import fs from "fs";
import SshClient from "../../../../utils/SshClient";
import ServerService from "../../../../services/ServerService";
import { withSession } from "next-session";
import FileService from "../../../../services/FileService";
import { logger } from "../../../../utils/winston";
import FileConfig from "./file_config"

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
  return await FileService.newFileInfo({
    userId: userId,
    fileName: file.name,
    fileSize: file.size,
    phase: phase, // L 로컬, F 운영관리 플랫폼, R 원격지
    type: type,
    fileKey: uuid,
    checkTime: new Date(),
  });
};

const updateFileDb = async (userId, filekey, phase) => {
  return await FileService.updateFileInfo(userId, filekey, phase);
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
  const form = new formidable.IncomingForm({maxFileSize : FileConfig.maxFilesize});
  try {
    form.parse(req, async (err, fields, files) => {
        if(err) {
          logger.error("fail to send server : " + err);
          return res.json({status : "500", error : "" + err})
        }

        logger.info("success send to server : " + JSON.stringify(files.file));
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
        } catch (e) {
          logger.error("fail to transfer : " + e);
          throw new Error(e)
        }
        return res.json({
          status: "201",
          fileKey: uuid,
          fileName: files.file.name,
        });
    });
  } catch (e) {
    console.log("#", e);
    return res.json({status: "500", error: e})
  }
};

// SERVER TO REMOTE
const processToRemote = async (req, res, userId) => {
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
      .then((res) => { // 업로드 및 다운로드 curl 결과 리턴
        logger.info(
          `success ${req.query["type"]} to remote server : ${res}`
        );
        res.forEach((ele) => {
          // 파일정보 부분만 저장
          if (ele.indexOf("fileKey") != -1) {
            result = ele;
          }
        });

        try {
          // 업로드 완료시 DB 업데이트, 다운로드 처리는 로컬에서..
          if(req.query["type"] === "upload"){
            updateFileDb(userId, req.query["filekey"], "R");
          }
        } catch (e) {
          console.log(e);
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

export default withSession(async (req, res) => {
  var userId = "";
  if (req.session.auth !== undefined) {
    userId = req.session.auth.user.userId;
  }

  req.method === "POST"
    ? writeFile(req, res, userId)
    : req.method === "PUT"
    ? console.log("PUT")
    : req.method === "DELETE"
    ? deleteFile(req, res)
    : req.method === "GET"
    ? processToRemote(req, res, userId)
    : res.status(404).send("");
});
