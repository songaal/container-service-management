import React, { useState } from "react";
import Box from "@material-ui/core/Box";
import { Paper, Grid, Divider, InputBase, IconButton, Input } from "@material-ui/core";
import Table from "@material-ui/core/Table";
import TableBody from "@material-ui/core/TableBody";
import TableCell from "@material-ui/core/TableCell";
import TableContainer from "@material-ui/core/TableContainer";
import TableRow from "@material-ui/core/TableRow";
import Stepper from '@material-ui/core/Stepper';
import Step from '@material-ui/core/Step';
import StepButton from '@material-ui/core/StepButton';
import { makeStyles } from '@material-ui/core/styles';
import DownloadIcon from '@material-ui/icons/GetApp';
import UploadIcon from '@material-ui/icons/Publish';
import InputIcon from '@material-ui/icons/Input';
import Button from '@material-ui/core/Button';
import Typography from '@material-ui/core/Typography';
import CircularProgress from '@material-ui/core/CircularProgress';

const useStyles = makeStyles((theme) => ({
  root: {
    width: '100%',
  },
  backButton: {
    marginRight: theme.spacing(1),
  },
  instructions: {
    marginTop: theme.spacing(1),
    marginBottom: theme.spacing(1),
  },
  inputRoot: {
    padding: '2px 4px',
    display: 'flex',
    alignItems: 'center',

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
    backgroundColor: "silver"
  },
  divider: {
    height: 28,
    margin: 4,
  },
}));

function getSteps() {
  return ['Local', 'Server', 'Remote'];
}

const ServerExplorer = () => {  
  const classes = useStyles();  
  const steps = getSteps();

  const [showLoader, setShowLoader] = React.useState(false);
  const [currentPath, setCurrentPath] = React.useState();
  const [cmd, setCmd] = React.useState();
  const [dirData, setDirdata] = React.useState();
  const [server, setServer] = React.useState({});


  const excuteCmd = (root) => {    
    if(showLoader !== true){
      setShowLoader(true);
      setDirdata("");
      var url = "/api" + location.pathname.replace("/explorer", "");
      var path = root === undefined ? currentPath : root
      fetch(`${url}/action?type=exp_excute`, {
        method: "POST",
        body: JSON.stringify({cmd, path})
      })
      .then((res) => {
        return res.json();
      }).then((data) => {
        if(data.dirFiles.length > 0 && data.pwd.length > 0){            
          setDirdata(data.dirFiles);
          setCurrentPath(data.pwd.replace("\n", ""));
          setCmd("");
          setShowLoader(false);
        }
      })
    }
  }

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

  return (
    <div>
      <Box >
        <Paper elevation={2} >
            <Grid container>
                <Grid item xs={12}>
                    <Paper component="form" className={classes.inputRoot}>
                      <Typography className={classes.currentPath}>
                        명령어
                      </Typography>
                      <Divider className={classes.divider} orientation="vertical" />
                        <InputBase
                            className={classes.input}
                            placeholder="ls -al"
                            fullWidth
                            spellCheck={false}
                            value={cmd || ""}
                            onKeyPress={e => {
                              if (e.key === 'Enter') {                                                                
                                excuteCmd()
                                e.preventDefault();
                              }
                            }}
                            onChange={e => setCmd(e.target.value) && e.preventDefault()}
                        />
                        <Divider className={classes.divider} orientation="vertical" />
                        <IconButton color="primary" className={classes.iconButton} aria-label="directions" onClick={() => {excuteCmd()}}>
                            <InputIcon />
                        </IconButton>
                    </Paper>
                </Grid>
            </Grid>
          <Divider />
          <Grid container alignItems="center">
            <div
              style={{
                overflow: "scroll",
                height: 500,
                maxHeight: 500,
                width: "100%",
                backgroundColor: "black",
                overflowX: "hidden"
              }}
            >
              <Input multiline disabled value={dirData || ""} style={{width:"100%", color: "white", sfontSize: "18px"}}/>    
              <div style={showLoader === true ? {display: "block"} : {display: "none"}}>
                <CircularProgress style={{position: "absolute", top: "30%", left: "45%"}}/>
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
                  {
                    <TableRow>
                      <TableCell component="th" scope="row" style={{width: "80px",  backgroundColor:"#A4C4EE", borderRight: "1px solid silver", textAlign: "center"}}>
                          <UploadIcon fontSize="large" />
                      </TableCell>
                      <TableCell component="th" scope="row" style={{minWidth:100}}>
                        /temp/Docker-compose.yml
                      </TableCell>
                      <TableCell align="left" style={{minWidth:250}}>
                      <Stepper style={{margin:"0", padding:"0"}}  alternativeLabel>
                        {steps.map((label, index) => {
                            const stepProps = {};
                            return (
                                <Step key={label} {...stepProps}>
                                    <StepButton                                      
                                        disabled
                                        completed={index === 0 || index === 1 ? true : false}
                                    >
                                    {label}
                                </StepButton>
                                </Step>
                            );
                        })}
                      </Stepper>
                        <div align="center">
                          시작 : 2021.08.30 09:40 소요시간 : 40분
                        </div>
                      </TableCell>
                      <TableCell align="center" style={{minWidth:250}}>Uploading ...</TableCell>
                    </TableRow>
                  }
                  {
                    <TableRow>
                      <TableCell component="th" scope="row" style={{width: "80px",  backgroundColor:"#C2DA4A", borderRight: "1px solid silver", textAlign: "center"}}>
                          <DownloadIcon fontSize="large" />
                      </TableCell>
                      <TableCell component="th" scope="row" style={{minWidth:100}}>
                        /temp/Docker-compose.yml
                      </TableCell>
                      <TableCell align="left" style={{minWidth:250}}>
                      <Stepper style={{margin:"0", padding:"0"}}  alternativeLabel>
                        {steps.reverse().map((label, index) => {
                            const stepProps = {};
                            return (
                                <Step key={label} {...stepProps}>
                                    <StepButton                                      
                                        disabled
                                        completed={true}
                                    >
                                    {label}
                                </StepButton>
                                </Step>
                            );s
                        })}
                      </Stepper>
                        <div align="center">
                          시작 : 2021.08.30 09:40 소요시간 : 40분
                        </div>
                      </TableCell>
                      <TableCell align="center" style={{minWidth:250}}><Button variant="contained">항목 제거</Button></TableCell>
                    </TableRow>
                  }
                </TableBody>
              </Table>
            </TableContainer>
          </Grid>
        </Paper>
      </Box>
    </div>
  );
};

export default ServerExplorer;