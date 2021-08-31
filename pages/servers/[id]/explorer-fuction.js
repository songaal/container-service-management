import React, { useState } from "react";

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
      .then((res) => {
        return res.json();
      })
      .then((data) => {
        console.log(data);
        if (data.status === "201") {
          // 서버 -> 원격 파일 업로드
          uploadToRemote(data.fileKey, data.fileName);
        }
      })
      .catch((error) => console.error("Error:", error));
  };

  const tableCRUD = (e) => {
    fetch(apiUrl + `?type=${e.target.value}`, {
      method: "PUT",
    })
      .then((res) => {
        return res.json();
      })
      .then((res) => {
        debugger;
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
        a.href = `http://localhost:3355/tempFiles/${res.fileKey}/${res.fileName}`;
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
        <button
          className="btn btn-primary"
          type="submit"
          onClick={tableCRUD}
          value="search"
        >
          Search
        </button>
        <button
          className="btn btn-primary"
          type="submit"
          onClick={tableCRUD}
          value="update"
        >
          Update
        </button>
        <button
          className="btn btn-primary"
          type="submit"
          onClick={tableCRUD}
          value="remove"
        >
          Remove
        </button>
      </div>
    </div>
  );
};

export default ServerExplorer;
