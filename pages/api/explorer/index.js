import formidable from "formidable";
import fs from "fs";
import SshClient from "../../../utils/SshClient";

export const config = {
  api: {
    bodyParser: false,
  },
};

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
    return res.status(201).send("");
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
  const processType = req.__NEXT_INIT_QUERY["type"];
  const filename = req.__NEXT_INIT_QUERY["filename"];
  const path = req.__NEXT_INIT_QUERY["path"] + "/";
  const sshClient = new SshClient("127.0.0.1", "50000", "ysban", "1234");

  if(processType === 'upload') {    
    const downUrl = "http://192.168.0.144:3000/tempFiles/";
    console.log("URL -> curl " + downUrl + filename + " > " + path + filename);

    try {
        const msg = await sshClient.exec("curl " + downUrl + filename + " > " + path + filename, {})
        await fs.rmSync(`./public/tempFiles/` + req.__NEXT_INIT_QUERY["filename"]);
        console.log(msg);
        return res.send({status: "success", data: msg.join("")})
    } catch (e) {
      console.log(e);
    }
  } else if(processType === 'download'){
    const uploadUrl = "http://192.168.0.144:3000/api/explorer";
    console.log("URL -> curl -F \"file=@" + path + filename + "\" " + uploadUrl + ' && rm -rf ' + path + filename);
    try {
      const msg = await sshClient.exec("curl -F \"file=@" + path + filename + "\" " + uploadUrl + ' && rm -rf ' + path + filename , {})
      // await fs.rmSync(`./public/tempFiles/` + req.__NEXT_INIT_QUERY["filename"]);
      console.log(msg);
      return res.send({status: "success", data: msg.join("")})
    } catch (e) {
      console.log(e);
    }
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
