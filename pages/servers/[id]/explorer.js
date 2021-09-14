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
import InputIcon from "@material-ui/icons/Input";
import Button from "@material-ui/core/Button";
import Typography from "@material-ui/core/Typography";
import CircularProgress from "@material-ui/core/CircularProgress";
import FileIcon from "@material-ui/icons/Description";
import {useSnackbar} from "notistack";
import Chip from '@material-ui/core/Chip';
import Autocomplete from '@material-ui/lab/Autocomplete';
import TextField from '@material-ui/core/TextField';


const useStyles = makeStyles((theme) => ({
  root: {
    width: "100%",
  },
  backButton: {
    marginRight: theme.spacing(1),
  },
  instructions: {
    marginTop: theme.spacing(1),
    marginBottom: theme.spacing(1),
  },
  inputRoot: {
    // padding: "2px 4px",
    marginLeft: '4px',
    marginRight: '4px',
    display: "flex",
    alignItems: "center",
  },
  input: {
    marginLeft: theme.spacing(1),
    flex: 1,
  },
  iconButton: {
    padding: 10,
  },
  currentPath: {
    padding: 10,
    backgroundColor: "silver",
  },
  divider: {
    height: 28,
    margin: 4,
  },
  dropzone: {
    width: "100%",
    height: "350px",
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
}));

function getSteps() {
  return ["Local", "Server", "Remote"];
}

function byteCalculation(bytes) { 
  var bytes = parseInt(bytes);
  var s = ['bytes', 'KB', 'MB', 'GB', 'TB', 'PB'];

  var e = Math.floor(Math.log(bytes)/Math.log(1024));
  if(e == "-Infinity") return " ( " + "0 "+s[0] + ") "; 
  else 
  return " (" + (bytes/Math.pow(1024, Math.floor(e))).toFixed(2)+" "+ s[e] + ") ";
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
                  var downloadFile = {
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
        setShowLoader(true);
        setDirdata("");
        var url = "/api" + location.pathname.replace("/explorer", "");
        var path = root === undefined ? currentPath : root;
        const tmpCmd = root === undefined ? cmd : `ls -al`;
        fetch(`${url}/action?type=exp_excute`, {
          method: "POST",
          body: JSON.stringify({ cmd: tmpCmd, path }),
        })
          .then((res) => {
            return res.json();
          })
          .then((data) => {
            setCurrentPath(data.pwd.replace("\n", ""));
            setCmd("");
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
    var url = "/api" + location.pathname.replace("/explorer", "");
    fetch(url)
      .then((res) => res.json())
      .then((body) => {
        console.log(body["server"]);
        setServer(body["server"]);
        excuteCmd(`/home/${body["server"].user}`);
        searchFileData();
      });
  }, []);

  const dragPrevent = (e) => {
    e.preventDefault();
  };

  // 파일 셋팅
  const handleDrop = (e) => {
    let items = [];
    let fileList = e.dataTransfer === undefined ? e.target.files : e.dataTransfer.files;

    for(let i=0; i<fileList.length; i++){
      fileList[i]['path'] = currentPath;
      items.push(fileList[i]);
    }
    
    items.forEach(item => {
      setFiles(files => [...files, item])
    })

    e.preventDefault();
  };

  // DB 검색
  const searchFileData = async (fileKey) => {
    var url = "/api" + location.pathname.replace("/explorer", "");
    var result;
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
            error : ele.errorMsg
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
    var url = "/api" + location.pathname.replace("/explorer", "");
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
    console.log(fileKey);
    var url = "/api" + location.pathname.replace("/explorer", "");
    var result;
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
          console.log("FILE UPLOAD TO REMOTE");
          files[idx]['phase'] = 'R';
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
        console.log(data.error);
        enqueueSnackbar(data.error, {variant: "error"})
        files[idx]['error'] = data.error;
        setFiles([
          ...files
        ])
      } else if(data.status === "201"){ // created
        files[idx]['phase'] = 'F';
        setFiles([
          ...files
        ])

        // 서버 -> 원격 파일 업로드
        await uploadToRemote(data.fileKey, data.fileName, idx);
      }
    })
    .catch((error) =>{ debugger});
  }

  // 파일 다운로드
  const handleFileDownload = async (filename, filekey, path) => {
    await fetch(apiUrl + `?type=download&&filekey=${filekey}&&filename=${filename}&&path=${path}`, {
      method: "GET",
    })
      .then((res) => {
        setFiles(files => {          
          files[files.length-1]['phase'] = 'F';
          setFiles([
            ...files
          ])
        });  
        return res.json();
      })
      .then((res) => {
        if(!res.status) {
          res.forEach(ele => {
            if(ele.startsWith("{\"status\":\"500\"")){
              enqueueSnackbar(ele, {variant: "error"})
              setFiles(files => {          
                files[files.length-1]['error'] = ele;
                setFiles([
                  ...files
                ])
              }); 
            }
          })
        } else {
          setFiles(files => {          
            files[files.length-1]['phase'] = 'L';
            setFiles([
              ...files
            ])
          }); 
      
          updateFileData(res.fileKey, 'L', path);
          const a = document.createElement("a");
          a.href = `/tempFiles/${res.fileKey}/${res.fileName}`;
          a.download = filename;
          a.click();
          a.remove();
          setTimeout(() => {
            deleteFileData(filekey, false);
          }, 500)
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

  const handleTypeAccept = (type) => {    
    return (cmd||"").trim().toUpperCase().startsWith(type)
  }

  const setGuideOptions = () => {
    if(handleTypeAccept("CD") || handleTypeAccept("GET")) {
      const base = dirData.split("\n").slice(2);
      const fileNames = dirFile[0].split("\n");      

      var typeGroup = {
          directory : [],
          file : []
      }

      base.forEach((ele, idx) => {
          let fileLine = ele.split(" ");
          let fileName = (fileNames[idx]||"");

          if(fileLine[0].startsWith('d')){
              if(fileName !== `.` && fileName !== `..` && (fileName.toUpperCase()).includes((cmd.toUpperCase().replace("CD", "").trim()||""))){                
                  typeGroup['directory'].push(fileName);
              }
          } else if(fileLine[0].startsWith('-')){
              if((fileName.toUpperCase()).includes((cmd.toUpperCase().replace("GET", "").trim()||""))){
                typeGroup['file'].push(fileName);
              }
          }
      });    

      return handleTypeAccept("CD") ? typeGroup['directory'].map((option) => option) : typeGroup['file'].map((option) => option);
    } else {
      return [];
    } 
  }


  return (
    <div>
      <Box>
        <Paper elevation={2}>

          <Grid container style={{textAlign: "center"}}>
            <Grid item xs={4}>
              <Box>
                서버명: {server['name']||''}
              </Box>
            </Grid>
            <Grid item xs={4}>
              <Box>
                아이피: {server['ip']||''}
              </Box>
            </Grid>
            <Grid item xs={4}>
              <Box>
                계정: {server['user']||''}
              </Box>
            </Grid>
          </Grid>

          <Grid container>
            <Grid item xs={12}>
              <Paper component="form" className={classes.inputRoot}>
                <Typography className={classes.currentPath}>명령어</Typography>
                <Autocomplete
                  freeSolo
                  value={cmd||""}
                  className={classes.input}
                  options={setGuideOptions()}
                  onChange={(e, v) => {
                      if(e.key === "Enter" || e.type === "click"){
                        if((cmd||"").toLowerCase().includes("cd")){
                          setCmd(`cd ${v}`);
                        } else if((cmd||"").toLowerCase().includes("get")){
                          setCmd(`get ${v}`);
                        }
                      }
                  }}
                  onInputChange={(e, v, r) => {
                      setCmd(v);
                  }}
                  onKeyPress={(e) => {
                    if (e.key === "Enter") {
                      excuteCmd();
                      e.preventDefault();
                    }
                  }}
                  renderInput={(params) => (
                    <TextField {...params} placeholder="ls -al // 다운로드는 `GET 파일명`" margin="normal" variant="outlined"/>
                  )}
                />
                <IconButton
                  color="primary"
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
                    height: 550,
                    maxHeight: 550,
                    backgroundColor: "black",
                    color: "white",
                    fontSize: "18px",
                    letterSpacing: "1.3px",
                    lineHeight: "25px",
                    textIndent: "5px",
                    border: "2px solid white"
                  }}
                >
                  {dirData}
                </textarea>
                <div
                  style={
                    showLoader === true
                      ? { display: "block" }
                      : { display: "none" }
                  }
                >
                  <CircularProgress
                    style={{ position: "absolute", top: "30%", left: "45%" }}
                  />
                </div>
              </div>
              <Typography style={{display: 'inline', marginLeft: "10px"}}>List of Upload / Download Files</Typography>

              <TableContainer
                component={Paper}
                style={{
                  overflow: "hidden",
                  // maxHeight: 645,
                  width: "100%",
                  padding: "10px 10px 0 10px",
                  border: "1px solid silver"
                }}
              >
                <div style={{ width: "100%", marginRight:"30px", textAlign: 'right' }}>
                  <Button
                    color="primary"
                    variant="contained"
                    style={
                      files.length > 0 ? 
                      { marginBottom: "10px", diplay: "inline"} : { display : "none"}
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
                      { marginBottom: "10px", marginLeft: "10px", diplay: "inline"} : { display : "none"}
                    }
                    onClick={e => handleFileDeleteAll()}
                  >
                    전체항목 제거
                  </Button>
                </div>
                  <Divider/>
                <Table>
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
                                var chkStep = (transferType, phase) => {
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
                            <Typography>
                              {item.error}
                            </Typography>
                          </TableCell>
                          <TableCell style={{ minWidth: 250, textAlign: "center" }}>
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
