import React, { useState } from "react";
import Box from "@material-ui/core/Box";
import ListItem from "@material-ui/core/ListItem";
import { Paper, Grid, Divider, List, InputBase, IconButton } from "@material-ui/core";
import Table from "@material-ui/core/Table";
import TableBody from "@material-ui/core/TableBody";
import TableCell from "@material-ui/core/TableCell";
import TableContainer from "@material-ui/core/TableContainer";
import TableRow from "@material-ui/core/TableRow";
import Stepper from '@material-ui/core/Stepper';
import Step from '@material-ui/core/Step';
import StepButton from '@material-ui/core/StepButton';
import { makeStyles } from '@material-ui/core/styles';
import DownloadButton from '@material-ui/icons/GetApp';
import UploadButton from '@material-ui/icons/Publish';
import InputIcon from '@material-ui/icons/Input';

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

  const [currentPath, setCurrentPath] = useState("/home/danawa");
  const [cmd, setCmd] = useState("ls -al");
  const [dirData, setDirdata] = useState();

  React.useEffect(() => {
    var url = "/api" + location.pathname.replace("/explorer", "");
    fetch(url)
      .then((res) => res.json())
      .then((body) => {
        console.log(body["server"]);
        setServer(body["server"]);
      });

    fetch(apiUrl + `?cmd=${cmd}&&currentPath=${currentPath}`, {
      method: "PUT",
    })
      .then((res) => {
        return res.json();
      })
      .then((res) => {
        debugger;
      })
      .catch((error) => console.error("Error:", error));
  }, []);

  return (
    <div>
      <Box >
        <Paper elevation={2} >
            <Grid container>
                <Grid item xs={12}>
                    <Paper component="form" className={classes.inputRoot}>
        
                        <InputBase
                            className={classes.input}
                            placeholder="ls -al"
                            fullWidth
                        />
                        
                        <Divider className={classes.divider} orientation="vertical" />
                        <IconButton color="primary" className={classes.iconButton} aria-label="directions">
                            <InputIcon />
                        </IconButton>
                    </Paper>
                </Grid>
            </Grid>
          <Divider />
          <Grid container alignItems="center">
            <List
              dense={true}
              style={{
                overflow: "scroll",
                height: 500,
                maxHeight: 500,
                width: "100%",
                backgroundColor: "black",
                color: "white",
                font: "sans-serif",
                fontSize: "16px",
                overflowX: "hidden"
              }}
            >
              <ListItem>
                drwx------. 19 danawa users 4096 8월 26 14:05 .
                <br />
                drwxr-xr-x. 11 root root 144 7월 1 16:12 ..
                <br />
                -rw------- 1 danawa users 258506 8월 30 09:31 .bash_history
                <br />
                -rw-r--r--. 1 danawa users 18 8월 8 2019 .bash_logout
                <br />
                -rw-r--r--. 1 danawa users 193 8월 8 2019 .bash_profile
                <br />
                -rw-r--r-- 1 danawa users 259 4월 6 2020 .bashrc
                <br />
                drwxr-xr-x 3 danawa users 22 5월 10 14:16 .cache
                <br />
                drwxr-xr-x 9 danawa users 122 12월 16 2020 .gradle
                <br />
                drwxr-xr-x 3 danawa users 24 12월 7 2020 .java
                <br />
                drwxr-xr-x 4 danawa users 39 2월 1 2021 .m2
                <br />
                drwxr-xr-x 122 danawa users 4096 5월 31 15:21 .npm
                <br />
                drwxr----- 3 danawa users 19 5월 20 2020 .pki
                <br />
                drwx------ 2 danawa users 48 10월 16 2020 .ssh
                <br />
                drwxr-xr-x 2 danawa users 24 7월 23 12:58 .vim
                <br />
                -rw------- 1 danawa users 14049 8월 26 14:05 .viminfo
                <br />
                -rw------- 1 danawa users 0 4월 6 2020 .viminfo.tmp
                <br />
                -rw------- 1 danawa users 0 6월 18 2020 .viminfz.tmp
                <br />
                drwxr-xr-x 4 danawa users 47 5월 10 14:13 Application
                <br />
                drwxr-xr-x 38 danawa users 4096 8월 27 17:57 apps
                <br />
                drwxr-xr-x 5 danawa users 72 8월 18 17:18 backup
                <br />
                drwxr-xr-x 2 danawa users 37 8월 6 08:59 cache
                <br />
                -rw-r--r-- 1 danawa users 0 1월 25 2021 crontab.log
                <br />
                drwxr-xr-x 3 danawa users 17 5월 10 14:16 go
                <br />
                -rw-r--r-- 1 danawa users 73 5월 28 13:59 java.Polic
                <br />
                -rwxrwxrwx 1 danawa users 2301 7월 28 2020 jvm.options
                <br />
                drwxr-xr-x 3 danawa users 17 12월 30 2020 lib
                <br />
                -rwxrwxrwx 1 danawa users 7921 8월 20 09:29 log4j2.properties
                <br />
                drwxr-xr-x 3 danawa users 62 6월 1 17:15 redis
                <br />
                drwxr-xr-x 4 danawa users 72 5월 4 16:10 scrap
                <br />
                drwxr-xr-x 2 danawa users 24 8월 11 16:13 tmp
              </ListItem>
            </List>
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
                          <UploadButton fontSize="large" />
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