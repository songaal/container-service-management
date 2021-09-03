import React, { useState } from "react";
import Box from "@material-ui/core/Box";
import {
  Paper,
  Grid,
  Divider,
  InputBase,
  IconButton,
  Input,
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
    padding: "2px 4px",
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
  return " ( " + (bytes/Math.pow(1024, Math.floor(e))).toFixed(2)+" "+ s[e] + ") ";
}

const ServerExplorer = () => {
  const classes = useStyles();
  const steps = getSteps();

  const {enqueueSnackbar, closeSnackbar} = useSnackbar();
  const [showLoader, setShowLoader] = React.useState(false);
  const [currentPath, setCurrentPath] = React.useState();
  const [cmd, setCmd] = React.useState();
  const [dirData, setDirdata] = React.useState();
  const [server, setServer] = React.useState({});
  const [files, setFiles] = useState([]);

  const apiUrl = `/api/servers/${server["id"]}/explorer`;

  const excuteCmd = (root) => {
    if (showLoader !== true) {  // GET FILE 
      
      if((cmd||"").trim().toUpperCase().startsWith("GET ")){ // Download
        let fileNameSplit = String(cmd).trim().split(" ")
        fileNameSplit[0] = ""
        var fileName = fileNameSplit.join("")

        var downloadFile = {
          name : fileName,
          size : 0,
          transferType : "download",
          fileKey : "",
          phase : "R"
        }
        setFiles(files => [...files, downloadFile]);
        handleFileDownload(fileName);
      } else { // 일반 명령어 실행
        setShowLoader(true);
        setDirdata("");
        var url = "/api" + location.pathname.replace("/explorer", "");
        var path = root === undefined ? currentPath : root;
        fetch(`${url}/action?type=exp_excute`, {
          method: "POST",
          body: JSON.stringify({ cmd, path }),
        })
          .then((res) => {
            return res.json();
          })
          .then((data) => {
            if (data.dirFiles.length > 0 && data.pwd.length > 0) {
              setDirdata(data.dirFiles);
              setCurrentPath(data.pwd.replace("\n", ""));
              setCmd("");
              setShowLoader(false);
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
      });
  }, []);

  const dragPrevent = (e) => {
    e.preventDefault();
  };

  // 드래그앤 드랍
  const handleDrop = (e) => {
    var items = [];
    console.log(e.dataTransfer.files[0]);
    for(var i=0; i<e.dataTransfer.files.length; i++){
      items.push(e.dataTransfer.files[i]);
    }
    
    items.forEach(item => {
      setFiles(files => [...files, item])
    })

    e.preventDefault();
  };

  // DB 파일 검색
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
    });
    return result;
  }

  // 항목 삭제
  const deleteFileData = async (fileKey) => {
    var url = "/api" + location.pathname.replace("/explorer", "");
    var result;
    await fetch(`${url}/action?type=removeFile&&filekey=${fileKey}`, {
      method: "GET"
    })
    .then((res) => {
      return res.json();
    })
    .then((data) => {
      result = data.fileList;
    });
    return result;
  }

  // 원격서버로 파일 업로드
  const uploadToRemote = async (fileKey, fileName, idx) => {
    await fetch(
      `${apiUrl}?type=upload&&filekey=${fileKey}&&filename=${fileName}&&path=${currentPath}`,
      {
        method: "GET",
      }
    )
      .then(async (res) => {
        console.log("FILE UPLOAD TO REMOTE");
        var targetFile = await searchFileData(fileKey);
        files[idx]['phase'] = targetFile[0][`phase`];
        setFiles([
          ...files
        ])
      })
      .catch((error) => console.error("Error:", error));
  };

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
        var targetFile = await searchFileData(data.fileKey);
        files[idx]['phase'] = targetFile[0][`phase`];
        files[idx]['fileKey'] = targetFile[0][`fileKey`];
        setFiles([
          ...files
        ])

        // 서버 -> 원격 파일 업로드
        uploadToRemote(data.fileKey, data.fileName, idx);
        setTimeout(()=>{
          excuteCmd();
        })
      }
    })
    .catch((error) =>{ debugger});
  }

  // 파일 다운로드
  const handleFileDownload = async (filename) => {
    await fetch(apiUrl + `?type=download&&filename=${filename}&&path=${currentPath}`, {
      method: "GET",
    })
      .then((res) => {
        return res.json();
      })
      .then((res) => {
        const a = document.createElement("a");
        a.href = `/tempFiles/${res.fileKey}/${res.fileName}`;
        a.download = filename;
        a.click();
        a.remove();
      })
      .catch((error) => console.error("Error:", error));
  };

  const handleFileDelete = async (item, idx) => {
    console.log(files[idx]['fileKey']);
    await deleteFileData(files[idx]['fileKey']);
    files.splice(idx);
    setFiles([...files])
  }

  return (
    <div>
      <Box>
        <Paper elevation={2}>
          <Grid container>
            <Grid item xs={12}>
              <Paper component="form" className={classes.inputRoot}>
                <Typography className={classes.currentPath}>명령어</Typography>
                <Divider className={classes.divider} orientation="vertical" />
                <InputBase
                  className={classes.input}
                  placeholder="ls -al"
                  fullWidth
                  spellCheck={false}
                  value={cmd || ""}
                  onKeyPress={(e) => {
                    if (e.key === "Enter") {
                      excuteCmd();
                      e.preventDefault();
                    }
                  }}
                  onChange={(e) => setCmd(e.target.value) && e.preventDefault()}
                />
                <Divider className={classes.divider} orientation="vertical" />
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
                  overflow: "scroll",
                  height: 500,
                  maxHeight: 500,
                  width: "100%",
                  backgroundColor: "black",
                  overflowX: "hidden",
                }}
              >
                <Input
                  multiline
                  disabled
                  value={dirData || ""}
                  style={{ width: "100%", color: "white", fontSize: "18px" }}
                />
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
              <TableContainer
                component={Paper}
                style={{
                  overflow: "scroll",
                  height: 380,
                  maxHeight: 420,
                  width: "100%",
                  overflowX: "hidden",
                }}
              >
                <div>
                  <Typography>
                    현재 경로: {currentPath}
                  </Typography>
                </div>
                <Divider />
                <Table>
                  <TableBody>
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
                              textAlign: "center",
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
                            {item.name + " " + byteCalculation(item.size)} 
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
                                    if(phase === "L" && label === "Local"){
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
                            <Button
                              variant="contained"
                              style={
                                item.phase === "R" || item.error
                                  ? { display: "inline"}
                                  : { display: "none" }
                              }
                              onClick={e =>handleFileDelete(item, idx)}
                            >
                              항목 제거
                            </Button>
                            <CircularProgress style={item.transferType !== undefined && !item.error && item.phase !== "R" ? {display: "inline-block", textAlign:"center"} : {display: "none"}}>
                            </CircularProgress>
                          </TableCell>
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
                    >
                        <TableCell align="center" style={{ minWidth: 250 }}>
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
