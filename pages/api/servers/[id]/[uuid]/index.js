import React from 'react';
import fetch from "isomorphic-unfetch";
import { withSession } from 'next-session';
import fs from "fs"
const mime = require('mime-types');

async function download(req, res) {
    const tempDir = process.env.TEMP_FILES_DIR || "./public/tempFiles";
    res.statusCode = 200;
    const uuid = req.query['uuid'];
    const fileName = req.query['fileName'];
    const fileFullPath = `${tempDir}/${uuid}/${fileName}`
    try {
        let mimeType = mime.lookup(fileFullPath);
        res.setHeader('Content-disposition', 'attachment; filename=' + fileName);
        res.setHeader('Content-type', mimeType);
        fs.createReadStream(fileFullPath).pipe(res);
    } catch (error) {
        console.error(error);
        res.send({
            status: "error",
            message: "에러가 발생하였습니다."
        })
    }
}

export default withSession(download)