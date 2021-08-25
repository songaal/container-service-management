import formidable from "formidable";
import fs from "fs";
import SshClient from "../../../utils/SshClient";

export const config = {
  api: {
    bodyParser: false,
  },
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
  console.log("## SET LOCAL TO SERVER ##");
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
const uploadToRemote = async (req, res) => {
  console.log("### UPLOAD SERVER TO REMOTE ###");
  const filename = req.__NEXT_INIT_QUERY["filename"];
  const path = req.__NEXT_INIT_QUERY["path"] + "/";
  const downUrl = "http://192.168.0.144:3000/tempFiles/";

  const sshClient = new SshClient("127.0.0.1", "50000", "ysban", "1234");
  console.log("URL -> curl " + downUrl + filename + " > " + path + filename);

  try {
      const msg = await sshClient.exec("curl " + downUrl + filename + " > " + path + filename, {})
      await fs.rmSync(`./public/tempFiles/` + req.__NEXT_INIT_QUERY["filename"]);
      console.log(msg);
      return res.send({status: "success", data: msg.join("")})
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
    ? console.log("DELETE")
    : req.method === "GET"
    ? uploadToRemote(req, res)
    : res.status(404).send("");
};
