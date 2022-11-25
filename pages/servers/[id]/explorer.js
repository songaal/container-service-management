import React, { useState, useRef } from "react";
import Box from "@material-ui/core/Box";
import {
  Paper,
  Grid,
  Divider,
  IconButton,
} from "@material-ui/core";
import Table from "@material-ui/core/Table";
import TableBody from "@material-ui/core/TableBody";
import TableCell from "@material-ui/core/TableCell";
import TableContainer from "@material-ui/core/TableContainer";
import TableRow from "@material-ui/core/TableRow";
import Stepper from "@material-ui/core/Stepper";
import Step from "@material-ui/core/Step";
import StepButton from "@material-ui/core/StepButton";
import { makeStyles } from "@material-ui/core/styles";
import DownloadIcon from "@material-ui/icons/GetApp";
import UploadIcon from "@material-ui/icons/Publish";
import InputIcon from '@material-ui/icons/SubdirectoryArrowLeft';
import Button from "@material-ui/core/Button";
import Typography from "@material-ui/core/Typography";
import CircularProgress from "@material-ui/core/CircularProgress";
import FileIcon from "@material-ui/icons/Description";
import {useSnackbar} from "notistack";
import Chip from '@material-ui/core/Chip';
import Autocomplete from '@material-ui/lab/Autocomplete';
import TextField from '@material-ui/core/TextField';
import AppBar from '@material-ui/core/AppBar';


const useStyles = makeStyles((theme) => ({
  root: {
    width: "100%",
    height: "100%",
  },
  backButton: {
    marginRight: theme.spacing(1),
  },
  instructions: {
    marginTop: theme.spacing(1),
    marginBottom: theme.spacing(1),
  },
  inputRoot: {    
    width: "100%",
    height: "100%",
    display: "flex",
    alignItems: "center",
    backgroundColor: "silver",
    borderLeft: "1px solid white",
    borderRight: "1px solid white"
  },
  input: {
    marginLeft: theme.spacing(1),
    flex: 1,
  },
  iconButton: {
    padding: 10,
  },
  commandLine: {
    padding: 8,    
    borderRadius: "5px",
    marginLeft: 3,
    marginTop: 5,    
  },
  divider: {
    height: 28,
    margin: 4,
  },
  dropzone: {
    width: "100%",  
    height: "30vh",  
    display: "flex",
    flex: "auto",
    flexFlow: "column",
    alignItems: "center",
    justifyContent: "center",
    textAlign: "center",
    backgroundColor: "hsla(0, 10%, 20%, 0.1)",
    border: "2px dotted black",
    margin: "0 auto",
  },
  appBar: {
    borderBottom: `1px solid`,
  },
}));

function getSteps() {
  return ["Local", "Server", "Remote"];
}

function byteCalculation(bytes) { 
  let byte = parseInt(bytes);
  let s = ['bytes', 'KB', 'MB', 'GB', 'TB', 'PB'];

  let e = Math.floor(Math.log(byte)/Math.log(1024));
  if(e == "-Infinity") return " ( " + "0 "+s[0] + ") "; 
  else 
  return " (" + (byte/Math.pow(1024, Math.floor(e))).toFixed(2)+" "+ s[e] + ") ";
}

const ServerExplorer = () => {
  const classes = useStyles();
  const steps = getSteps();

  const {enqueueSnackbar, closeSnackbar} = useSnackbar();
  const [showLoader, setShowLoader] = React.useState(false);
  const [currentPath, setCurrentPath] = React.useState();
  const [cmd, setCmd] = React.useState();
  const [dirData, setDirdata] = React.useState();
  const [dirFile, setDirFiles] = React.useState();
  const [server, setServer] = React.useState({});
  const [files, setFiles] = useState([]);
  const $input = useRef(null);
  const scrollRef = useRef();

  const commandGroup = {
    "CD"  : "directory",
    "RMDIR"  : "directory",
    "GET" : "file",
    "RM"  : "file",
    "CAT"  : "file",
  }

  const scrollToBottom = () => {
      // 스크롤 내리기
      scrollRef.current.scrollIntoView({ behavior: 'smooth', block: 'end', inline: 'nearest' });
  };

  const apiUrl = `/api/servers/${server["id"]}/explorer`;

  const excuteCmd = async (root) => {
    if (showLoader !== true) {  // GET FILE
      if((cmd||"").trim().toUpperCase().startsWith("GET ")){ // Download
        let fileNameTrimSplit = String(cmd).trim().split(" ");
        fileNameTrimSplit[0] = "";

        if(fileNameTrimSplit.length > 2 && !fileNameTrimSplit[1].startsWith("/")){ // 띄어쓰기 파일명 처리
          for(let i=2; i<fileNameTrimSplit.length; i++){
            fileNameTrimSplit[i] = " " + fileNameTrimSplit[i];
          }
        }

        let fileNameSlashSplit = fileNameTrimSplit.join("").split("/");        
        let fileName = fileNameSlashSplit[fileNameSlashSplit.length-1];
        let filePath = currentPath + (fileNameTrimSplit[1].startsWith("/") ? fileNameTrimSplit.join("").replace("/" + fileName, "") : "");

        let fileInfo;

        // 파일 체크
        try {
          await fetch(
            `${apiUrl}?type=checkExist&&filekey=&&filename=${fileName}&&path=${filePath}`,
            {
              method: "GET",
            }
            )
            .then((res) => {
              return res.json();
            })
            .then(async (data) => {
              setCmd("");
              if(data && data.status !== 'error'){
                if(data[0].startsWith("error : ") === false){ // 존재
                  fileInfo = data[0].split("\t")
                  // 파일 추가
                  let downloadFile = {
                    name : fileName,
                    size : fileInfo[0],
                    path : filePath,
                    transferType : "download",
                    fileKey : fileInfo[2],
                    phase : "R"                
                  }
                  setFiles(files => [...files, downloadFile]);        
                  handleFileDownload(fileName, downloadFile.fileKey, downloadFile.path);      
                } else { // 오류
                  enqueueSnackbar(data[0], {variant: "error"})
                }
              } else {
                enqueueSnackbar(data.message, {variant: "error"})
              }
            })
            .catch((error) => {console.log(error)}); 
        } catch (error) {
          console.log(error);
        }      
      } else { // 일반 명령어 실행
        let command = cmd;
        setCmd("")
        setShowLoader(true);
        setDirdata("");
        let url = "/api" + location.pathname.replace("/explorer", "");
        let path = root === undefined ? currentPath : root;
        const tmpCmd = root === undefined ? command : `ls -al`;
        fetch(`${url}/action?type=exp_excute`, {
          method: "POST",
          body: JSON.stringify({ cmd: tmpCmd, path }),
        })
          .then((res) => {
            return res.json();
          })
          .then((data) => {
            setCurrentPath(data.pwd.replace("\n", ""));
            setShowLoader(false);
            if (data.dirFiles.length > 0 && data.pwd.length > 0) {
              setDirdata(data.dirFiles);
              setDirFiles(data.dirFileNames);
            }
          });
      }
    }
  };

  React.useEffect(() => {
    let url = "/api" + location.pathname.replace("/explorer", "");
    fetch(url)
      .then((res) => res.json())
      .then((body) => {
        setServer(body["server"]);
        excuteCmd(`/home/${body["server"].user}`);
        searchFileData();
      });
  }, []);

  const dragPrevent = (e) => {
    e.preventDefault();
  };

  const getTransferTime = (type, time) => {
    return (type === "createdAt" ? "시작" : "종료") + " 일시 : " + new Date(time||new Date).toLocaleString();
  }

  // 파일 셋팅
  const handleDrop = async (e) => {
    let items = [];
    let fileList = e.dataTransfer === undefined ? e.target.files : e.dataTransfer.files;

    for(let i=0; i<fileList.length; i++){
      fileList[i]['isDirectory'] = e.dataTransfer === undefined ? false : e.dataTransfer.items[i].webkitGetAsEntry().isDirectory;
      fileList[i]['path'] = currentPath;
      items.push(fileList[i]);
    }    
    
    items.forEach(item => {
      if(item.isDirectory === true){
        enqueueSnackbar(`디렉토리(${item.name})는 업로드할 수 있습니다.`, {variant: "warning"});
      } else {
        setFiles(files => [...files, item]);
      }
    }) 

    e.preventDefault();

    setTimeout(() => {
      scrollToBottom();
    })
  };

  // DB 검색
  const searchFileData = async (fileKey) => {
    let url = "/api" + location.pathname.replace("/explorer", "");
    let result;
    await fetch(`${url}/action?type=searchFile&&filekey=${fileKey}`, {
      method: "GET"
    })
    .then((res) => {
      return res.json();
    })         
    .then((data) => {
      result = data.fileList;
      if(!fileKey && result && result.length > 0){
        let arr = [];

        result.forEach(ele => {
          let existFile = {
            name : ele.fileName,
            size : ele.fileSize,
            path : ele.path,
            transferType : ele.type,
            fileKey : ele.fileKey,
            phase : ele.phase,
            error : ele.errorMsg,
            createdAt : getTransferTime("createdAt", ele.createdAt),
            updatedAt : getTransferTime("updatedAt", ele.updatedAt)
          }
          arr.push(existFile);
        })
        
        setFiles(arr);
      }
    });
    return result;
  }

  // DB 업데이트
  const updateFileData = async (fileKey, phase, path) => {
    let url = "/api" + location.pathname.replace("/explorer", "");
    await fetch(`${url}/action?type=updateFile&&filekey=${fileKey}&&phase=${phase}&&path=${path}`, {
      method: "GET"
    })
    .then((res) => {
      return res.json();
    })
    .then((data) => {
    });

    return;
  }

  // 항목 삭제
  const deleteFileData = async (fileKey, isFileDelete) => {
    let url = "/api" + location.pathname.replace("/explorer", "");
    let result;
    await fetch(`${url}/action?type=removeFile&&filekey=${fileKey}&&isFileDelete=${isFileDelete}`, {
      method: "DELETE"
    })
    .then((res) => {
      return res.json();
    })
    .then((data) => {
      result = data.fileList;
    });
    return result;
  }

  // 운영관리 -> 원격서버로 파일 업로드
  const uploadToRemote = async (fileKey, fileName, idx) => {
    await fetch(
      `${apiUrl}?type=upload&&filekey=${fileKey}&&filename=${fileName}&&path=${currentPath}`,
      {
        method: "GET",
      }
    )
      .then(res => {
        return res.json();
      })
      .then(data => {
        if(data.status !== "error"){
          files[idx]['phase'] = 'R';
          files[idx]['updatedAt'] = getTransferTime("updatedAt");
          setFiles([
            ...files
          ])
          
          setTimeout(() => {
            deleteFileData(fileKey, false);
          })
        } else {
          files[idx]['error'] = data.message;
          setFiles([
            ...files
          ])
          enqueueSnackbar(data.message, {variant: "error"})
        }
      })
      .catch((error) => console.error("Error:", error));
  };

  // 파일 업로드
  const handleFileUpload = async (item, idx) => {
    const body = new FormData();
    body.append("file", item);    

    files[idx]['transferType'] = "upload"
    files[idx]['createdAt'] =  getTransferTime('createdAt')
    files[idx]['updatedAt'] =  getTransferTime('updatedAt')
    setFiles([
      ...files
    ])

    // 로컬 -> 서버 파일 업로드
    await fetch(apiUrl + "?type=upload", {
      method: "POST",
      body,
    })
    .then((res) => {
      return res.json();
    })
    .then( async (data) => {
      if(data.status === "500"){ // error
        enqueueSnackbar(data.error, {variant: "error"})
        files[idx]['error'] = data.error;
        files[idx]['updatedAt'] = getTransferTime('updatedAt')
        setFiles([
          ...files
        ])
      } else if(data.status === "201"){ // created
        files[idx]['phase'] = 'F';
        files[idx]['updatedAt'] = getTransferTime('updatedAt')
        setFiles([
          ...files
        ])

        // 서버 -> 원격 파일 업로드
        await uploadToRemote(data.fileKey, data.fileName, idx);
      }
    })
    .catch((error) =>{ console.log(error) });
  }

   // 파일 일괄 업로드
   const handleFileBatchUpload = async () => {
    files.forEach((item, idx) => {
      handleFileUpload(item, idx);   
    })
  }

  // 파일 다운로드
  const handleFileDownload = async (filename, filekey, path) => {
    setFiles(files => {
      files[files.length-1]['createdAt'] =  getTransferTime('createdAt');
      files[files.length-1]['updatedAt'] =  getTransferTime('updatedAt');
      setFiles([
        ...files
        ])
    });
    
    console.log("bbbbbbbbbbbbbb")

    await fetch(apiUrl + `?type=download&&filekey=${filekey}&&filename=${filename}&&path=${path}`, {
      method: "GET",
    })
      .then((res) => {
        console.log("qqqqqqqqqqqqqqqqqqqqq")
        setFiles(files => {          
          files[files.length-1]['phase'] = 'F';
          files[files.length-1]['updatedAt'] =  getTransferTime('updatedAt');
          setFiles([
            ...files
          ])
        });  
        return res.json();
      })
      .then((res) => {
        console.log("kkkkkkkkkkkkkkkkkkk")
      
        if(!res.status) {
          console.log("nnnnnnnnnnnnnnnnnnn")
          res.forEach(ele => {
            if(ele.startsWith("{\"status\":\"500\"")){
              enqueueSnackbar(ele, {variant: "error"})
              setFiles(files => {          
                files[files.length-1]['error'] = ele;
                files[files.length-1]['updatedAt'] =  getTransferTime('updatedAt');
                setFiles([
                  ...files
                ])
              }); 
            }
          })
        } else {
           console.log("zzzzzzzzzzzzzzzzzz")
          
          setFiles(files => {          
            files[files.length-1]['phase'] = 'L';
            files[files.length-1]['updatedAt'] =  getTransferTime('updatedAt');
            setFiles([
              ...files
            ])
          }); 
      
          updateFileData(res.fileKey, 'L', path);
          
          console.log("aaaaaaaaaaaaaaaaaa")
          
          const a = document.createElement("a")          
          a.href = `/api${location.pathname.replace("/explorer", `/download/${res.fileKey}`)}?fileName=${res.fileName}`
          a.download = filename;
          a.click();
          a.remove();

          
          
          console.log("cccccccccccccccccc")
          
          
          setTimeout(() => {
            deleteFileData(filekey, false);
          }, 3000)
        }     
      })
      .catch((error) => console.error("Error:", error));
  };

  const handleFileDelete = async (idx) => {
    if(idx !== undefined){
      await deleteFileData(files[idx]['fileKey'], true);
      files.splice(idx, 1);
      setFiles([...files])
    } else {
      files.forEach((ele) => {
        if(ele.phase && ele.transferType && ((ele.transferType === "download" && ele.phase === "L") || (ele.transferType === "upload" && ele.phase === "R"))){
          deleteFileData(ele.fileKey, true);
        }
      })
      
      setFiles([...files.filter(file => !file.phase || !file.transferType || (file.transferType === "download" && file.phase !== "L") || (file.transferType === "upload" && file.phase !== "R"))]);
    }
  }

  const handleFileDeleteAll = async () => {
    files.forEach((ele) => {
      if(ele.fileKey){
        deleteFileData(ele.fileKey, true);
      }
    })

    setFiles([])
  }

  const handleTypeAccept = () => {
    return commandGroup[(cmd||"").trim().toUpperCase().split(" ")[0]];
  }

  const setAutoCompOptions = () => {
    if(handleTypeAccept() !== undefined) {
      const base = dirData.split("\n").slice(2);
      const fileNames = dirFile[0].split("\n");      

      let typeGroup = {
          directory : [],
          file : []
      }

      base.forEach((ele, idx) => {
          let fileLine = ele.split(" ");
          let fileName = (fileNames[idx]||"");
          let key_exist = (fileName.toUpperCase()).includes((cmd.toUpperCase().replace((cmd||"").trim().toUpperCase().split(" ")[0], "").trim()||""));
          let key_exact = fileName.toUpperCase() === (cmd.toUpperCase().replace((cmd||"").trim().toUpperCase().split(" ")[0], "").trim()||"");

          if(fileLine[0].startsWith('d')){
              if(fileName !== `.` && fileName !== `..` && key_exist){
                if(key_exact !== true){ // 명령어와 자동완성 정확하게 일치하는 경우는 안보여주도록 구현 => 자동완성 api에서 변경점을 인식못함
                  typeGroup['directory'].push(fileName);
                }
              }
          } else if(fileLine[0].startsWith('-')){
              if(key_exist){
                if(key_exact !== true){
                  typeGroup['file'].push(fileName);
                }
              }
          }
      });    
      return typeGroup[handleTypeAccept()].map((option) => option);
    } else {
      return [];
    } 
  }


  return (
    <div style={{position: "fixed", width: "100%", height: "100%"}}>
      <Box>
        <AppBar position="static" color="default">        
          <Grid container style={{textAlign: "center", alignItems: "center", height:"30px"}}>
              <Grid item xs={4}>
                <Box>
                    서버명 : {server['name']||''}
                </Box>
              </Grid>
              <Grid item xs={4}>
                <Box>
                    아이피 : {server['ip']||''}
                </Box>
              </Grid>
              <Grid item xs={4}>
                <Box>
                    계정 : {server['user']||''}
                </Box>
              </Grid>
          </Grid>
        </AppBar>
        <Paper elevation={2}>
          <Grid container>
            <Grid item xs={12}>
              <Paper component="form" className={classes.inputRoot}>
                <Typography className={classes.commandLine}>명령어</Typography>
                <Autocomplete
                  freeSolo
                  value={cmd||""}
                  className={classes.input}
                  options={setAutoCompOptions()}
                  onChange={(e, v) => {
                    if((e.key === "Enter" || e.type === "click") && cmd !== null && v !== null){
                      setCmd(`${(cmd||"").trim().split(" ")[0]} ${v}`);
                    } else {
                      setCmd('');
                    }
                  }}
                  onInputChange={(e, v, r) => {
                    if(r === 'input'){
                      setCmd(v);
                    } else if(r === 'clear'){
                      setCmd('');
                    }
                  }}
                  onKeyPress={(e) => {
                    if (e.key === "Enter") {
                      excuteCmd();
                      e.preventDefault();
                    }
                  }}
                  renderInput={(params) => (
                    <TextField {...params} placeholder="ls -al // 다운로드는 `GET 파일명`" margin="normal" variant="outlined" size="small" style={{backgroundColor:"white", borderRadius:"4px"}} />
                  )}
                />
                <IconButton
                  className={classes.iconButton}
                  aria-label="directions"
                  onClick={() => {
                    excuteCmd();
                  }}
                >
                  <InputIcon />
                </IconButton>
              </Paper>
            </Grid>
          </Grid>
          <Divider />
          <div
            className="dropzone"
            onDrop={e => handleDrop(e)}
            onDragOver={e => dragPrevent(e)}
            onDragEnter={e => dragPrevent(e)}
            onDragLeave={e => dragPrevent(e)}
            style={{overflowX: "hidden"}}
          >
            <Grid container alignItems="center">
              <div
                style={{
                  width: "100%",
                  overflowX: "hidden",
                }}
              >
                <textarea
                  spellCheck={false}
                  disabled
                  value={dirData}
                  style={{
                    padding: "15px 0px 0px 15px",
                    width: "100%",
                    height: "55vh", 
                    backgroundColor: "black",
                    color: "white",
                    fontSize: "16px",
                    letterSpacing: "1.3px",
                    lineHeight: "25px",
                    textIndent: "5px",
                    border: "1px solid white"
                  }}
                >
                </textarea>
                <div
                  style={
                    showLoader === true
                      ? { display: "block" }
                      : { display: "none" }
                  }
                >
                  <CircularProgress
                    style={{ position: "absolute", top: "35%", left: "48%" }}
                  />
                </div>
              </div>
              
              <Typography style={{display: 'inline', marginLeft: "10px", width: "100%", height: "2.7vh"}}>
                업로드/다운로드 파일 리스트
              </Typography>

              <TableContainer
                component={Paper}
                style={{               
                  width: "100%",
                  height: "36vh",
                  padding: "10px",
                  border: "1px solid silver"
                }}
              >
                <div style={{ width: "100%", marginBottom: "10px", textAlign: 'right' }}>
                  <Button
                    color="default"
                    variant="contained"
                    style={
                      files.length > 0 ? 
                      {diplay: "inline", float:"left"} : { display : "none"}
                    }
                    onClick={e => $input.current.click()}
                  >
                    업로드할 파일 선택
                  </Button>

                  <Button
                    color="default"
                    variant="contained"
                    style={
                      files.length > 0 ? 
                      { marginLeft: "10px", diplay: "inline"} : { display : "none"}
                    }
                    onClick={e => handleFileBatchUpload()}
                  >
                    파일 일괄 업로드
                  </Button>

                  <Button
                    color="primary"
                    variant="contained"
                    style={
                      files.length > 0 ? 
                      { marginLeft: "10px", diplay: "inline"} : { display : "none"}
                    }
                    onClick={e => handleFileDelete()}
                  >
                    완료항목 제거
                  </Button>          
                  <Button
                    color="secondary"
                    variant="contained"
                    style={
                      files.length > 0 ? 
                      { marginLeft: "10px", diplay: "inline"} : { display : "none"}
                    }
                    onClick={e => handleFileDeleteAll()}
                  >
                    전체항목 제거
                  </Button>
                </div>
                  <Divider/>
                <Table ref={scrollRef}>
                  <TableBody >
                    {files.map((item, idx) => {                      
                      return (
                        <TableRow key={idx}>
                          <TableCell
                            component="th"
                            scope="row"
                            style={{
                              width: "80px",
                              backgroundColor: (item.error && '#DB5548') || ((item.transferType === undefined || item.transferType === "upload") && "#A4C4EE") || (item.transferType === "download" && "#C2DA4A"), 
                              borderRight: "1px solid silver",
                              textAlign: "center"
                            }}
                          >
                            <UploadIcon fontSize="large" style={!item.transferType || item.transferType === "upload" ? {display:"inline"} : {display:"none"}}/>
                            <DownloadIcon fontSize="large" style={item.transferType === "download" ? {display:"inline"} : {display:"none"}}/>
                          </TableCell>
                          <TableCell
                            component="th"
                            scope="row"
                            style={{ minWidth: 100 }}
                          >
                            {item.path}/{item.name} <br/>
                            {item.transferType !== "download" ? byteCalculation(item.size) : "(" + item.size + ")"} 
                          </TableCell>
                          <TableCell align="center" style={{ minWidth: 250 }}>
                            <Stepper
                              style={{ margin: "0", padding: "0" }}
                              alternativeLabel
                            >
                              {
                              steps.map((label, index) => {
                                let chkStep = (transferType, phase) => {
                                  if(transferType === "upload" || transferType === undefined){
                                    if(phase === "F" && label === "Server"){
                                      return true;
                                    } else if(phase === "R" && (label === "Remote" || label === "Server")){
                                      return true;
                                    } else if(label === "Local"){
                                      return true;
                                    } else {
                                      return false;
                                    }
                                  } else if(transferType === "download"){
                                    if(phase === "L"){
                                      return true;
                                    } else if(phase === "F" && (label === "Remote" || label === "Server")){
                                      return true;
                                    } else if(label === "Remote"){
                                      return true;
                                    } else {
                                      return false;
                                    }
                                  }
                                }
                                return (
                                  <Step key={label}>
                                    <StepButton disabled active={false} completed={chkStep(item.transferType, item.phase)}>
                                      {label}
                                    </StepButton>
                                  </Step>
                                );
                              })}
                            </Stepper>
                            <Typography style={{fontSize:"0.7rem"}}>
                              {item.createdAt}
                            </Typography>
                            <Typography style={{fontSize:"0.7rem"}}>
                              {item.updatedAt}
                            </Typography>
                            <Typography>
                              {item.error}
                            </Typography>
                          </TableCell>
                          <TableCell style={{ minWidth: 200, textAlign: "center" }}>
                            <Button
                              variant="contained"
                              style={
                                item.transferType
                                  ? { display: "none" }
                                  : { display: "inline" }
                              }
                              onClick={e => handleFileUpload(item, idx)}
                            >
                              업로드
                            </Button>

                            <div style={(item.phase === "L" && item.transferType === "download") || (item.phase === "R" && item.transferType === "upload") && !item.error
                                  ? { display: "inline"}
                                  : { display: "none" }}>
                              <Chip color="primary" label="완료"/>
                            </div>

                            <div style={!item.error ? { display: "none"} : { display: "inline" }}>
                              <Chip label="실패" style={{marginRight:10, backgroundColor:"#DB5548", color:"white"}}/>
                            </div>

                            <Button
                              variant="contained"
                              style={
                                item.transferType !== undefined && item.error === undefined && ((item.phase !== "R" && item.transferType === "upload") || (item.phase !== "L" && item.transferType === "download"))
                                  ? { display: "none"}
                                  : { display: "inline", marginLeft: "10px" }
                              }
                              onClick={e => handleFileDelete(idx)}
                            >
                              항목 제거
                            </Button> 

                            <CircularProgress style={item.transferType !== undefined && item.error === undefined && ((item.phase !== "R" && item.transferType === "upload") || (item.phase !== "L" && item.transferType === "download")) ? {display: "inline-block", textAlign:"center"} : {display: "none"}}>
                            </CircularProgress>
                          </TableCell>
                          <TableCell
                            component="th"
                            scope="row"
                            style={{
                              borderRight: "1px solid silver",
                              textAlign: "center"
                            }}
                          ></TableCell>
                        </TableRow>
                      );
                    })}
                    {
                    <TableRow
                      className={classes.dropzone}
                      style={
                        files.length > 0
                          ? { display: "none" }
                          : { display: "flex" }
                      }
                      onClick={e => $input.current.click()}
                    >
                        <TableCell align="center" style={{ minWidth: 250, borderBottom: "none" }}>
                            <input type="file" style={{display: "none"} } ref={$input} multiple
                              onChange={e => {
                                handleDrop(e);
                              }}/>
                            <FileIcon style={{ fontSize: 80 }} />
                            <Typography>
                              File Upload
                            </Typography>
                        </TableCell>
                    </TableRow>
                    }
                  </TableBody>
                </Table>
              </TableContainer>
            </Grid>
          </div>
        </Paper>
      </Box>
    </div>
  );
};

export default ServerExplorer;
