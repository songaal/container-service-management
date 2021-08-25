import React, { useState } from "react";

const ExpExample = () => {
  const [file, setFile] = useState(null);

  const uploadToClient = (event) => {
    if (event.target.files && event.target.files[0]) {
      const i = event.target.files[0];
      setFile(i);
    }
  };

  const uploadToRemote = async () => {
    const filename = file.name;
    const path = "/home/danawa";
    await fetch(
      "/api/explorer?type=upload&&filename=" + filename + "&&path=" + path,
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
    await fetch("/api/explorer", {
      method: "POST",
      body,
    })
      .then((res) => {
        console.log(res);
        // created
        if (res.status === 201) {
          // 서버 -> 원격 파일 업로드
          uploadToRemote();
        }
      })
      .catch((error) => console.error("Error:", error));
  };

  const download = async () => {
    console.log("this is download");
    const filename = file.name;
    const path = "/home/danawa";

    await fetch(
      "/api/explorer?type=download&&filename=" + filename + "&&path=" + path,
      {
        method: "GET",
      }
    )
      .then((res) => {
        const a = document.createElement("a");
        a.href = "http://localhost:3000/tempFiles/" + filename;
        a.download = file.name;
        a.click();
        a.remove();
        setTimeout(() => {
          fetch(
              "/api/explorer?filename=" + filename,
              {
                method: "DELETE",
              }
            )     
        });
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

export default ExpExample;
