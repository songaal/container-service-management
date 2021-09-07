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
const maxFileSize = process.env.MAX_FILE_BYTE_SIZE || 500 * 1024 * 1024 // 500MB;

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
    path: file.path,
    type: type,
    fileKey: uuid,
    checkTime: new Date(),
  });
};

const updateFileDb = async (userId, filekey, phase, path) => {
  return await FileService.updateFileInfo(userId, filekey, phase, path);
};

const downUrl = "http://localhost:3355/tempFiles/";

var process_cmd = (id, processType, filename, path, filekey) => {
  const uploadUrl = `http://localhost:3355/api/servers/${id}/explorer`;
  if (processType === "upload") {
    let enc = encodeURI(`${downUrl}${filekey}/${filename}`);
    return `curl "${enc}" > "${path + filename}"`;
  } else if (processType === "download") {
    console.log(`curl -F "file=@${path + filename}" ${uploadUrl}?filekey=${filekey}`);
    return `curl -F "file=@${path + filename}" ${uploadUrl}?filekey=${filekey}`;
  } else if (processType === "checkExist") {    
    console.log(`cd ${path} && du -h "${filename}"`);
    return `cd ${path} && du -h "${filename}"`;
  }
};

// DELETE FILE
const deleteFile = async (req, res) => {
  fs.rmSync(`${tempDir}/` + req.__NEXT_INIT_QUERY["filename"]);
  return;
};

// WRITE FILE
const writeFile = async (req, res, userId) => {
  const form = new formidable.IncomingForm({maxFileSize : maxFileSize});
  try {
    form.parse(req, async (err, fields, files) => {
        if(err) {
          logger.error("fail to send server : " + err);
          return res.json({status : "500", error : "" + err})
        }

        logger.info("success send to server : " + JSON.stringify(files.file));
        var uuid = req.query['filekey'] || getRandomUuid();
        var file = files.file;
  
        // 임시파일 -> 파일이동
        fs.mkdirSync(`${tempDir}/${uuid}`);
        fs.renameSync(file.path, `${tempDir}/${uuid}/${decodeURI(file.name)}`);
  
        fs.stat(`${tempDir}/${uuid}/${decodeURI(file.name)}`, (err, stat) => {
          if (err) console.log("error: ", error);
          logger.info("success move to tempfile : " + JSON.stringify(stat));
        });        

        try {
          if(req.query['filekey'] === undefined){
            await insertFileDb(
              userId,
              file,
              uuid,
              req.__NEXT_INIT_QUERY["type"],
              "F"
            );
          }
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
    let result;

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
        result = res;

        if(req.query["type"] === "upload" || req.query["type"] === "download"){
          logger.info(
            `success ${req.query["type"]} to remote server : ${res}`
          );
          res.forEach((ele) => {
            // 파일정보 부분만 저장
            if (ele.indexOf("fileKey") != -1) {
              result = ele;
            }
          });
        }

        try {
          // 업로드 완료시 DB 업데이트
          if(req.query["type"] === "upload" || req.query["type"] === "download"){
            let phase = req.query["type"] === "upload" ? "R" : "F";
            updateFileDb(userId, req.query["filekey"], phase, req.query["path"]);
          } else if(req.query["type"] === "checkExist"){
            let fileInfo = res[0].split("\t");
            let uuid = getRandomUuid();
            let file = {
              name : req.query["filename"],
              size : fileInfo[0],
              path : req.query["path"]
            }
            insertFileDb(userId, file, uuid, "download", "R");
            res[0] += "\t" + uuid
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
