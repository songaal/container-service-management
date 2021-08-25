import React, { useState } from "react";
s
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
    await fetch("/api/explorer?filename=" + filename + "&&path=" + path, {
      method: "GET",
    })
      .then((res) => {
        console.log(res);
      })
      .catch((error) => console.error("Error:", error));
  };

  const upload = async () => {
    const body = new FormData();
    body.append("file", file);

    await fetch("/api/explorer", {
      method: "POST",
      body,
    })
      .then((res) => {
        console.log(res);
        // created
        if (res.status === 201) {
          uploadToRemote();
        }
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
        <button
          className="btn btn-primary"
          type="submit"
          onClick={uploadToRemote}
        >
          Download
        </button>
      </div>
    </div>
  );
};

export default ExpExample;
