import React, { useState } from "react";

const ServerExplorer = () => {
  const [file, setFile] = useState(null);  
  const [server, setServer] = React.useState({})  
  const apiUrl = `/api/servers/${server['id']}/explorer`;

  React.useEffect(() => {
      const url = "/api" + location.pathname.replace("/explorer", "")
      fetch(url)
          .then(res => res.json())
          .then(body => {
              console.log(body['server']);
              setServer(body['server'])
          })
  }, [])

  if (Object.keys(server).length < 3) {
      return null
  }

  const uploadToClient = (event) => {
    if (event.target.files && event.target.files[0]) {
      const i = event.target.files[0];
      setFile(i);
    }
  };

  const uploadToRemote = async () => {
    const filename = file.name;
    const path = "/home/danawa/apps/explorer";
    await fetch(
      apiUrl + `?type=upload&&filename=${filename}&&path=${path}`,
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
    await fetch(apiUrl, {
      method: "POST",
      body,
    }).then((res) => {
      console.log(res);
      // created
      if (res.status === 201) {
        // 서버 -> 원격 파일 업로드
        uploadToRemote();
      }
    })
    .catch((error) => console.error("Error:", error));
    // .then(function(response) {
    //   return response.json();
    // }).then(function(data) {
    //   console.log(data);
    // })
  };

  const download = async () => {
    const filename = file.name;
    const path = "/home/danawa/apps/explorer";

    await fetch(
      apiUrl + `?type=download&&filename=${filename}&&path=${path}`,
      {
        method: "GET",
      }
    )
      .then((res) => {
        const a = document.createElement("a");
        a.href = "http://localhost:3355/tempFiles/" + filename;
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
      </div>
    </div>
  );
};

export default ServerExplorer;