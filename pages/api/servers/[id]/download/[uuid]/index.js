import React from 'react';
import fetch from "isomorphic-unfetch";
import fs from "fs"
const mime = require('mime-types');

const tempDir = process.env.TEMP_FILES_DIR || "./public/tempFiles";

async function download(req, res) {
    console.log('file Download call')
    res.statusCode = 200;
    try {
        const uuid = req.query['uuid'];
        const fileName = req.query['fileName'];
        const fileFullPath = `${tempDir}/${uuid}/${fileName}`
        console.log('file Download .. path: ', fileFullPath)
        if (fs.existsSync(fileFullPath)) {
            let mimeType = mime.lookup(fileFullPath);
            res.setHeader('Content-disposition', 'attachment; filename=' + fileName);
            res.setHeader('Content-type', mimeType);
            console.log('download >>> ', mimeType, fileFullPath)
            fs.createReadStream(fileFullPath).pipe(res);
        } else {
            res.statusCode = 403;
            res.send({
                status: "error",
                message: "파일이 존재하지 않습니다."
            })
        }
    } catch (error) {
        console.error(error);
        res.send({
            status: "error",
            message: "에러가 발생하였습니다."
        })
    }
}

export default download