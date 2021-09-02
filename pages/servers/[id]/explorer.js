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
import { addAbortSignal } from "stream";

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
    height: "380px",
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

const ServerExplorer = () => {
  const classes = useStyles();
  const steps = getSteps();

  const [showLoader, setShowLoader] = React.useState(false);
  const [currentPath, setCurrentPath] = React.useState();
  const [cmd, setCmd] = React.useState();
  const [dirData, setDirdata] = React.useState();
  const [server, setServer] = React.useState({});
  const [files, setFiles] = useState([]);

  const excuteCmd = (root) => {
    if (showLoader !== true) {
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

  const handleDrop = (e) => {
    var items = [];

    for(var i=0; i<e.dataTransfer.files.length; i++){
      items.push(e.dataTransfer.files[i]);
    }
    
    items.forEach(item => {
      setFiles(files => [...files, item])
    })

    e.preventDefault();
  };

  const handleFileUpload = (e) => {
    console.log(e);
    debugger;
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
                  style={{ width: "100%", color: "white", sfontSize: "18px" }}
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
                              backgroundColor: "#A4C4EE",
                              borderRight: "1px solid silver",
                              textAlign: "center",
                            }}
                          >
                            <UploadIcon fontSize="large" />
                          </TableCell>
                          <TableCell
                            component="th"
                            scope="row"
                            style={{ minWidth: 100 }}
                          >
                            {item.name}
                          </TableCell>
                          <TableCell align="left" style={{ minWidth: 250 }}>
                            <Stepper
                              style={{ margin: "0", padding: "0" }}
                              alternativeLabel
                            >
                              {steps.map((label, index) => {
                                const stepProps = {};
                                return (
                                  <Step key={label} {...stepProps}>
                                    <StepButton disabled completed={false}>
                                      {label}
                                    </StepButton>
                                  </Step>
                                );
                                s;
                              })}
                            </Stepper>
                          </TableCell>
                          <TableCell align="center" style={{ minWidth: 250 }}>
                            <Typography
                              style={
                                item.phase
                                  ? { display: "inline" }
                                  : { display: "none" }
                              }
                            >
                              Uploading ...
                            </Typography>
                            <Button
                              variant="contained"
                              style={
                                item.phase
                                  ? { display: "none" }
                                  : { display: "inline" }
                              }
                              onClick={e => handleFileUpload(idx)}
                            >
                              업로드
                            </Button>
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
