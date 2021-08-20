import React, { useState } from "react";
import Moment from "moment";
import dynamic from 'next/dynamic'
import DeleteIcon from "@material-ui/icons/Delete";
import AddIcon from "@material-ui/icons/CreateNewFolder";
import ReplaceIcon from "@material-ui/icons/Edit";
import IconButton from "@material-ui/core/IconButton";
import Folder from "@material-ui/icons/Folder";
import File from "@material-ui/icons/CropPortrait";
import DownloadButton from "@material-ui/icons/GetApp";
import UploadButton from "@material-ui/icons/Publish";
import { DataGrid } from "@material-ui/data-grid";

const ExpExample = () => {
  const root = "/";

  // 아이콘 셋팅
  const renderTitleColumn = (GridCellParams) => {
    return (
      <div>
        <div style={{ float: "left", marginTop: "7%" }}>
          <Folder
            style={
              GridCellParams.row.type === "d"
                ? { display: "inline" }
                : { display: "none" }
            }
          />
          <File
            style={
              GridCellParams.row.type === "d"
                ? { display: "none" }
                : { display: "inline" }
            }
          />
        </div>
        {GridCellParams.row.title}
      </div>
    );
  };

  // 그리드 컬럼 스키마
  const columns = [
    { field: "id", headerName: "id", hide: true },
    {
      field: "title",
      headerName: "이름",
      width: 200,
      renderCell: renderTitleColumn,
    },
    { field: "fileSize", headerName: "크기", width: 110 },
    { field: "modified", headerName: "최근 수정일", width: 170 },
    { field: "owner", headerName: "소유자", width: 155 },
    { field: "group", headerName: "그룹", width: 155 },
    { field: "right", headerName: "권한", width: 155 },
    { field: "type", headerName: "type", width: 100, hide: true },
  ];

  const singleFrame = [
    {
      id: 0,
      title: "·",
      modified: "",
      owner: "",
      group: "",
      right: "",
      type: "d",
    }
  ]

  const multiFrame = [
    {
      id: 0,
      title: "·",
      modified: "",
      owner: "",
      group: "",
      right: "",
      type: "d",
    },
    {
      id: 1,
      title: "··",
      modified: "",
      owner: "",
      group: "",
      right: "",
      type: "d",
    }
  ]

  // 샘플 데이터
  var initData = [       
    {
      id: 1,
      title: "animal",
      modified: "1 year ago",
      owner: "Kim",
      group: "software",
      right: "drwxr-----",
      type: "d",
    },
    {
      id: 2,
      title: "sports",
      modified: "1 year ago",
      owner: "Kim",
      group: "software",
      right: "drwxr-----",
      type: "d",
    },
    {
      id: 3,
      title: "index.js",
      fileSize: "3Kb",
      modified: "1 year ago",
      owner: "Lee",
      group: "hardware",
      right: "-rwxr-----",
      type: "l",
    },
    {
      id: 4,
      title: "home.html",
      fileSize: "156Kb",
      modified: "1 year ago",
      owner: "Lee",
      group: "hardware",
      right: "--wxr-----",
      type: "l",
    },
    {
      id: 5,
      title: "readme.md",
      fileSize: "320Byte",
      modified: "1 year ago",
      owner: "Lee",
      group: "hardware",
      right: "-r-xr-----",
      type: "l",
    },
  ];

  var animal = [
    {
      id: 2,
      title: "tiger.jpg",
      fileSize: "15Kb",
      modified: "1 year ago",
      type: "l",
    },
    {
      id: 3,
      title: "lion.jpg",
      fileSize: "100Kb",
      modified: "1 year ago",
      type: "l",
    },
    {
      id: 4,
      title: "eagle.jpeg",
      fileSize: "320Byte",
      modified: "1 year ago",
      type: "l",
    },
  ];

  var sports = [
    {
      id: 2,
      title: "baseball.jpg",
      fileSize: "15Kb",
      modified: "1 year ago",
      type: "l",
    },
    {
      id: 3,
      title: "tennis.jpg",
      fileSize: "100Kb",
      modified: "1 year ago",
      type: "l",
    },
    {
      id: 4,
      title: "soccer.jpeg",
      fileSize: "320Byte",
      modified: "1 year ago",
      type: "l",
    },
  ];  

  singleFrame.push(...initData);
  multiFrame.push(...animal);
  multiFrame.push(...sports);

  const [path, setPath] = useState("/");
  const [rows, setRows] = useState(singleFrame);
  const [selectRow, setSelectRow] = useState();
  const [src, setSrc] = useState();

  const sampleData = {};
  sampleData["initData"] = singleFrame;
  sampleData["animal"] = multiFrame;
  sampleData["sports"] = multiFrame;


  const uploadfiles = (buffer) => {
    console.log("init ! " + buffer);
    fetch('/api/explorer', {
      method: 'PUT',
      body: buffer,
      headers:{
        'Content-Type': 'multipart/form-data'
      }
      }).then(res => res.json())
      .then(response => {
        console.log(response);
      })
      .catch(error => console.error('Error:', error));
  }

  const handleCreateFolder = (key) => {
    setfiles(
      files.concat([
        {
          key: key,
        },
      ])
    );
  };

  const handleRenameFolder = (oldKey, newKey) => {
    setfiles(() => {
      const newFiles = [];
      files.map((file) => {
        if (file.key.substr(0, oldKey.length) === oldKey) {
          newFiles.push({
            ...file,
            key: file.key.replace(oldKey, newKey),
          });
        } else {
          newFiles.push(file);
        }
      });
      return newFiles;
    });
  };

  const handleRenameFile = () => {
    selectRow.api.setCellMode('3', 'title', 'edit');
  };

  const handleChange = (e) => {
    console.log(e)
  }

  const handleDeleteFolder = (folderKey) => {
    setfiles(() => {
      const newFiles = [];
      files.map((file) => {
        if (file.key.substr(0, folderKey[0].length) !== folderKey[0]) {
          newFiles.push(file);
        }
      });
      return newFiles;
    });
  };

  const handleDeleteFile = () => {
    // fetch(), sftp.remove(), getCurrentDir() 순으로 진행
    setRows(() => {
      const newRows = [];
      rows.map((row) => {
        if (row.id !== selectRow.row.id) {
          newRows.push(row);
        }
      });
      return newRows;
    });
  };

  // 현재 디렉토리 조회, (.) 클릭 시
  const getCurrentDir = () => {
    // fetch(), sftp.list(pwd), setRows(data) 순으로 진행
    try {
      setPath(path);
      setRows(rows);
    } catch (error) {
      console.log(error);
    }
  };

  // 상위 디렉토리 조회, (..) 클릭 시
  const getUpperDir = (e) => {
    // fetch(), sftp.list(..) && sftp.cwd() , setRows(data) 순으로 진행
    try {
      setPath(root);
      setRows(sampleData["initData"]);
    } catch (error) {
      console.log(error);
    }
  };

  // 그리드 더블클릭 이벤트
  const handleDblClick = (cellValue) => {
    var selectCell = cellValue.row;
    if(selectCell.title === "·"){
      getCurrentDir()
    } else if(selectCell.title === "··"){
      getUpperDir()
    } else {
      // case directory only
    if (selectCell.type === "d") {
      // fetch(), sftp.list(./title) && sftp.cwd() , setRows(data) 순으로 진행
      try {
        setPath(selectCell.title);
        if (sampleData[selectCell.title] !== undefined) {
          setRows(sampleData[selectCell.title]);
        } else {
          setRows([]);
        }
      } catch (e) {
        console.log(e);
      }
    }
    }
  };

  // 그리드 클릭 이벤트
  const handleCellClick = (cellValue) => {
    setSelectRow(cellValue);
  };

  // 파일업로드 이벤트
  const handleUploadFile = (e) => {
    const uploadfile = e.target.files;

    const formData = new FormData();
    formData.append(
      "uploadFile",
      uploadfile[0],
      "abc.txt"
    );
    
    uploadfiles(formData.get("uploadFile"));

    // for(var i=0;i<uploadfile.length;i++){
    //   if (uploadfile[i]) {
    //     let reader = new FileReader();
    //     reader.readAsDataURL(uploadfile[i]);
    //     uploadfiles(reader);

        // reader.onloadend = () => {
        //   const base64 = reader.result;
        //   console.log(base64)
        //   if (base64) {
        //   var base64Sub = base64.toString()
        //   console.log(base64Sub);
        //   }
        // }
    //   }
    // }    

    setRows(() => {
        var newfile = 
          {
            id: rows.length,
            title: uploadfile.name,
            fileSize: uploadfile.size + "BYTE",
            modified: "1 year ago",
            type: "l",
          }
        ;

        const newFiles = [];

        rows.map((row) => {
          newFiles.push(row);
          if (row.id === rows.length-1) {
            newFiles.push(newfile);
          }
        });

        return newFiles;
      }        
    )
  }

  return (
    <div style={{ height: "91vh" }}>
      <div>
        <IconButton aria-label="Add">
          <AddIcon />
        </IconButton>

        <IconButton
          variant="contained"
          component="label"
        >
          <UploadButton/>
          <input
            id="uploadInput"
            type="file"
            hidden
            onChange={handleUploadFile}
          />
        </IconButton>

        <IconButton aria-label="Download">
          <DownloadButton />
        </IconButton>

        <IconButton
          aria-label="ReplaceName"
          onClick={handleRenameFile}
          disabled={selectRow !== undefined ? false : true}
        >
          <ReplaceIcon />
        </IconButton>

        <IconButton
          aria-label="Delete"
          onClick={handleDeleteFile}
          disabled={
            selectRow !== undefined && selectRow.row.type !== "d" ? false : true
          }
        >
          <DeleteIcon />
        </IconButton>
      </div>

      <DataGrid
        className="stop-dragging"
        rows={rows}
        columns={columns}
        hideFooter={true}
        style={{ fontFamily: "Arial, sans-serif", userSelect: "none", fontSize: "medium", fontWeight: 'bold' }}
        onCellClick={handleCellClick}
        onCellDoubleClick={handleDblClick}
      />
    </div>
  );
};

export default ExpExample;
