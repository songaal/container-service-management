import React, { useState } from "react";
const { Users } = require("../../../models")
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableContainer from '@material-ui/core/TableContainer';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';

const ServerExplorer = () => {
  const [file, setFile] = useState(null);
  const [fileRow, setFileRow] = useState([]); 
  const [server, setServer] = React.useState({});
  const apiUrl = `/api/servers/${server["id"]}/explorer`;

  React.useEffect(() => {
    const url = "/api" + location.pathname.replace("/explorer", "");
    fetch(url)
      .then((res) => res.json())
      .then((body) => {
        console.log(body["server"]);
        setServer(body["server"]);
        debugger;
        // let registerUser = Users.findOne({where: {userId: userId}})
      });


  }, []);

  if (Object.keys(server).length < 3) {
    return null;
  }

  const uploadToClient = (event) => {
    if (event.target.files && event.target.files[0]) {
      const i = event.target.files[0];
      setFile(i);
    }
  };

  const uploadToRemote = async (fileKey, fileName) => {
    const path = "/home/danawa/apps/explorer";
    await fetch(
      apiUrl +
        `?type=upload&&filekey=${fileKey}&&filename=${fileName}&&path=${path}`,
      {
        method: "GET",
      }
    )
      .then((res) => {
        console.log(res);
      })
      .catch((error) => console.error("Error:", error));
  };

  // 파일 업로드
  const upload = async () => {
    const body = new FormData();
    body.append("file", file);

    // 로컬 -> 서버 파일 업로드
    await fetch(apiUrl + "?type=upload", {
      method: "POST",
      body,
    })
      .then(res => {
        return res.json();
      })
      .then(data => {
        console.log(data);
        if (data.status === "201") {
          // 서버 -> 원격 파일 업로드
          uploadToRemote(data.fileKey, data.fileName);
        }
      })
      .catch((error) => console.error("Error:", error));
  };

  const download = async () => {
    const filename = file.name;
    const path = "/home/danawa/apps/explorer";

    await fetch(apiUrl + `?type=download&&filename=${filename}&&path=${path}`, {
      method: "GET",
    })
      .then((res) => {  
        return res.json();      
      })
      .then((res) => {
        const a = document.createElement("a");
        a.href = `http://localhost:3355/tempFiles/${res.fileKey}/${res.fileName}`
        a.download = file.name;
        a.click();
        a.remove();
        // setTimeout(() => {
        //   fetch(
        //       "/api/servers/explorer?filename=" + filename,
        //       {
        //         method: "DELETE",
        //       }
        //     )
        // });
      })
      .catch((error) => console.error("Error:", error));
  };

  function createData(name, calories, fat, carbs, protein) {
    return { name, calories, fat, carbs, protein };
  }
  
  const rows = [
    createData('Frozen yoghurt', 159, 6.0, 24, 4.0),
    createData('Ice cream sandwich', 237, 9.0, 37, 4.3),
    createData('Eclair', 262, 16.0, 24, 6.0),
    createData('Cupcake', 305, 3.7, 67, 4.3),
    createData('Gingerbread', 356, 16.0, 49, 3.9),
  ];

  return (
    <div>
      <div>
        <h4>Select file</h4>
        <input type="file" name="myFile" onChange={uploadToClient} />
        <button className="btn btn-primary" type="submit" onClick={upload}>
          Upload
        </button>
        <button className="btn btn-primary" type="submit" onClick={download}>
          Download
        </button>
        <TableContainer>
        <Table size="small" aria-label="a dense table">
          <TableHead>
            <TableRow>
              <TableCell align="right">userId</TableCell>
              <TableCell align="right">fileName</TableCell>
              <TableCell align="right">fileSize</TableCell>
              <TableCell align="right">filekey</TableCell>
              <TableCell align="right">initTime</TableCell>
              <TableCell align="right">phase</TableCell>
              <TableCell align="right">type</TableCell>
              <TableCell align="right">checkTime</TableCell>
              <TableCell align="right">phase</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {rows.map((row) => (
              <TableRow key={row.name}>
                <TableCell align="right">{row.calories}</TableCell>
                <TableCell align="right">{row.calories}</TableCell>
                <TableCell align="right">{row.fat}</TableCell>
                <TableCell align="right">{row.carbs}</TableCell>
                <TableCell align="right">{row.protein}</TableCell>
                <TableCell align="right">{row.calories}</TableCell>
                <TableCell align="right">{row.fat}</TableCell>
                <TableCell align="right">{row.calories}</TableCell>
                <TableCell align="right">{row.fat}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      </div>
    </div>
  );
};

export default ServerExplorer;
