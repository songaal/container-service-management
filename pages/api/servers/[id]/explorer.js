import formidable from "formidable";
import fs from "fs";
import SshClient from "../../../../utils/SshClient";
import ServerService from "../../../../services/ServerService";
import { withSession } from "next-session";
import FileService from "../../../../services/FileService";

export const config = {
  api: {
    bodyParser: false,
  },
};

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
    initTime: new Date(),
    fileSize: file.size,
    phase: phase, // L 로컬, F 운영관리 플랫폼, R 원격지
    type: type,
    fileKey: uuid,
    checkTime: new Date(),
  });
};

const downUrl = "http://localhost:3355/tempFiles/";

var process_cmd = (id, processType, filename, path, filekey) => {
  const uploadUrl = `http://localhost:3355/api/servers/${id}/explorer`;
  if (processType === "upload") {
    var enc = encodeURI(`${downUrl}${filekey}`);
    return `curl "${enc}" > "${path + filename}"`;
  } else if (processType === "download") {
    return `curl -F "file=@${path + filename}" ${uploadUrl}?type="download"`;
  }
};

// DELETE FILE
const deleteFile = async (req, res) => {
  fs.rmSync(`./public/tempFiles/` + req.__NEXT_INIT_QUERY["filename"]);
  return;
};

// WRITE FILE
const writeFile = async (req, res, userId) => {
  const form = new formidable.IncomingForm();
  form.parse(req, async function (err, fields, files) {
    try {
      var uuid = getRandomUuid();
      await saveFile(files.file, uuid, req.__NEXT_INIT_QUERY["type"], userId);
    } catch (e) {
      console.log(e);
    }
    return res.json({
      status: "201",
      fileKey: uuid,
      fileName: files.file.name,
    });
  });
};

// LOCAL TO SERVER
const saveFile = async (file, uuid, type, userId) => {
  console.log("## SAVE AT SERVER ##");
  const data = fs.readFileSync(file.path);
  try {
    if (type === "upload") {
      fs.writeFileSync(`./public/tempFiles/${uuid}`, data);
      await fs.unlinkSync(file.path);
      // DB에 파일내용 저장
      var file = await insertFileDb(userId, file, uuid, type, "F");
      return;
    } else if (type === "download") {
      fs.mkdirSync(`./public/tempFiles/${uuid}`);
      fs.writeFileSync(
        `./public/tempFiles/${uuid}/${decodeURI(file.name)}`,
        data
      );
      await fs.unlinkSync(file.path);
      return;
    }
  } catch (e) {
    console.log(e);
  }
};

// SERVER TO REMOTE
const processToRemote = async (req, res) => {
  let server = await ServerService.findServerById(req.query["id"]);
  const sshClient = new SshClient(
    server.ip,
    server.port,
    server.user,
    server.password
  );
  console.log("## PROCESS TO REMOTE ##");
  try {
    var result;
    const msg = await sshClient
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
        res.forEach((ele) => {
          if (ele.indexOf("fileKey") != -1) {
            result = ele;
          }
        });

        return res;
      });

    if (req.query["type"] === "upload") {
      await fs.rmSync(`./public/tempFiles/` + req.query["filekey"]);
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

const excuteCmd = async (req, res) => {
  let server = await ServerService.findServerById(req.query["id"]);
  const sshClient = new SshClient(
    server.ip,
    server.port,
    server.user,
    server.password
  );

  try {
    const cmd = await sshClient.exec(req.query["cmd"], {}).then((res) => {
      console.log(res);
      return res;
    });

    return res.send(result);
  } catch (e) {
    console.log(e);
  }
};

export default withSession(async (req, res) => {
  // 원격에서 curl로 들어올때 세션처리...??
  var userId = "";
  if (req.session.auth !== undefined) {
    userId = req.session.auth.user.userId;
  }
  req.method === "POST"
    ? writeFile(req, res, userId)
    : req.method === "PUT"
    ? excuteCmd(req, res)
    : req.method === "DELETE"
    ? deleteFile(req, res)
    : req.method === "GET"
    ? processToRemote(req, res)
    : res.status(404).send("");
});
