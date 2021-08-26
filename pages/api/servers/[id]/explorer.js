import formidable from "formidable";
import fs from "fs";
import SshClient from "../../../../utils/SshClient";
import ServerService from "../../../../services/ServerService"

export const config = {
  api: {
    bodyParser: false,
  },
};

const downUrl = "http://localhost:3355/tempFiles/";

var process_cmd = (id, processType, filename, path) => {
  const uploadUrl = `http://localhost:3355/api/servers/${id}/explorer`;
  if (processType === "upload") {
    return `curl ${downUrl}${filename} > ${path+filename}`;
  } else if (processType === "download") {
    return `curl -F "file=@${path+filename}" ${uploadUrl} && rm -rf ${path+filename}`
  }
};

// DELETE FILE
const deleteFile = async (req, res) => {
  fs.rmSync(`./public/tempFiles/` + req.__NEXT_INIT_QUERY["filename"]);
  return;
};

// WRITE FILE
const writeFile = async (req, res) => {
  const form = new formidable.IncomingForm();
  form.parse(req, async function (err, fields, files) {
    try {
      await saveFile(files.file);
    } catch (e) {
      console.log(e);
    }
    return res.status(201).json({fileId: "aaaa.afarg.ageeargh"});
  });
};

// LOCAL TO SERVER
const saveFile = async (file) => {
  console.log("## SAVE AT SERVER ##");
  const data = fs.readFileSync(file.path);
  try {
    fs.writeFileSync(`./public/tempFiles/${file.name}`, data);
    await fs.unlinkSync(file.path);
    return;
  } catch (e) {
    console.log(e);
  }
};

// SERVER TO REMOTE
const processToRemote = async (req, res) => {
  let server = await ServerService.findServerById(req.query['id']);
  const sshClient = new SshClient(server.ip, server.port, server.user, server.password);
  console.log("## PROCESS TO REMOTE ##");
  try {
    const msg = await sshClient.exec(
      process_cmd(req.query['id'], req.query["type"], req.query["filename"], req.query["path"] + "/"),
      {}
    );

    if (req.query["type"] === "upload") {
      await fs.rmSync(`./public/tempFiles/` + req.query["filename"]);
    }

    return res.send({ status: "success", data: msg.join("") });
  } catch (e) {
    console.log(e);
  }
};

export default (req, res) => {
  req.method === "POST"
    ? writeFile(req, res)
    : req.method === "PUT"
    ? console.log("PUT")
    : req.method === "DELETE"
    ? deleteFile(req, res)
    : req.method === "GET"
    ? processToRemote(req, res)
    : res.status(404).send("");
};
