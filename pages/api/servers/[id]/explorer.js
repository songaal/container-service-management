import formidable from "formidable";
import fs from "fs";
import SshClient from "../../../../utils/SshClient";
import ServerService from "../../../../services/ServerService";
import { withSession } from "next-session";
import FileService from "../../../../services/FileService";
// const logger = "../utils/winston";

export const config = {
  api: {
    bodyParser: false,
  },
};

const tempDir = process.env.TEMP_FILES_DIR || "./public/tempFiles";
const maxUploadFileSize = process.env.MAX_UPFILE_BYTE || 500 * 1024 * 1024 // 500MB, 524288000BYTE;
const maxDownFileSize = process.env.MAX_DOWNFILE_BYTE || 500 * 1024 * 1024 * 1024 // 50GB, 536870912000BYTE;
const localhost_url = process.env.LOCALHOST_URL || "http://localhost:3000";


function getRandomUuid() {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (c) {
    var r = (Math.random() * 16) | 0, v = c == "x" ? r : (r & 0x3) | 0x8;
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

const updateFileError = async (filekey, errorMsg) => {
  console.log("#### filekey, errorMsg", filekey, errorMsg);
  return await FileService.updateFileError(filekey, errorMsg);
};

const downUrl = localhost_url + "/tempFiles/";

var process_cmd = (id, processType, filename, path, filekey) => {
  const uploadUrl = localhost_url + `/api/servers/${id}/explorer`;
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
  const maxFileSize = req.__NEXT_INIT_QUERY["type"] === "upload" ? maxUploadFileSize : maxDownFileSize;
  const form = new formidable.IncomingForm({maxFileSize : maxFileSize});
  var uuid = req.query['filekey'] || getRandomUuid();
  const fileUploadPath = `${tempDir}/${uuid}`
  form.uploadDir = fileUploadPath;
  fs.mkdirSync(fileUploadPath, {
    recursive: true,
    mode: "777"
  });

  try {
    form.parse(req, async (err, fields, files) => {
        if(err) {
          console.error("fail to send server : " + err);
          updateFileError(req.query["filekey"], err.message);
          return res.json({status : "500", error : "" + err})
        }

        console.info("success send to server : " + JSON.stringify(files.file));

        var file = files.file;
  
        // 임시파일 -> 파일이동

        fs.renameSync(file.path, `${fileUploadPath}/${decodeURI(file.name)}`);
  
        fs.stat(`${fileUploadPath}/${decodeURI(file.name)}`, (err, stat) => {
          if (err) console.log("error: ", error);
          console.info("success move to tempfile : " + JSON.stringify(stat));
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
          console.error("fail to transfer : " + e);
          throw new Error(e)
        }
        return res.json({
          status: "201",
          fileKey: uuid,
          fileName: files.file.name,
        });
    });
  } catch (e) {
    updateFileError(req.query["filekey"], e.message);
    return res.json({status: "500", error: e})
  }
};

// SERVER TO REMOTE
const processToRemote = async (req, res, userId) => {
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
          console.info(
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
          } 
        } catch (e) {
          console.error(e);
        }
        
        return res;
      });

    if(req.query["type"] === "checkExist"){      
      await sshClient.exec(`cd ${req.query["path"]} && file ${req.query["filename"]}` , {})
        .then((data) => {
          let checkResult = data[0].split(" ");
          let checkTarget = checkResult[1].replace("\n", "")
          let checkMsg = checkTarget === "directory" || checkTarget === "symbolic" ? `${checkTarget} 는 다운로드할 수 없습니다.` : null

          if(result[0].startsWith("du: cannot access") === false && checkMsg === null){
            let fileInfo = result[0].split("\t");
            let uuid = getRandomUuid();
            let file = {
              name : req.query["filename"],
              size : fileInfo[0],
              path : req.query["path"]
            }
            insertFileDb(userId, file, uuid, "download", "R");
            result[0] += "\t" + uuid
          } else {
            if(result[0].startsWith("du: cannot access") === true){
              result[0] = "error : " + result[0]
            } else if(checkMsg !== null) {
              result[0] = "error : " + checkMsg
            }
          }
        })      
    }

    if (req.query["type"] === "upload") {
      await fs.rmdirSync(`${tempDir}/` + req.query["filekey"], {
        recursive: true,
      });
    }

    return res.status(201).send(result);
  } catch (e) {
    console.error(e);
    updateFileError(req.query["filekey"], e.message);
    return res.send(e);
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
