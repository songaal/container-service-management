import React from "react";
import {
  Box,
  TextField,
  Card,
  CardContent,
  FormControl,
  MenuItem,
  Select,
  TextareaAutosize,
} from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import Button from "@material-ui/core/Button";
import Grid from "@material-ui/core/Grid";
import CheckBoxOutlineBlankIcon from "@material-ui/icons/CheckBoxOutlineBlank";
import CheckBoxIcon from "@material-ui/icons/CheckBox";
import fetch from "isomorphic-unfetch";
import { useSnackbar } from "notistack";
import Autocomplete from "@material-ui/lab/Autocomplete";
import Checkbox from "@material-ui/core/Checkbox";
import dynamic from "next/dynamic";
import DialogTitle from "@material-ui/core/DialogTitle";
import DialogContent from "@material-ui/core/DialogContent";
import DialogActions from "@material-ui/core/DialogActions";
import Dialog from "@material-ui/core/Dialog";
import IconButton from "@material-ui/core/IconButton";
import CloseIcon from "@material-ui/icons/Close";

const AceEditor = dynamic(import("react-ace"), { ssr: false });

const icon = <CheckBoxOutlineBlankIcon fontSize="small" />;
const checkedIcon = <CheckBoxIcon fontSize="small" />;

const useStyles = makeStyles((theme) => ({
  root: {
    flexGrow: 1,
    width: "100%",
    backgroundColor: theme.palette.background.paper,
  },
}));

function Deploy() {
  const classes = useStyles();
//   const { enqueueSnackbar, closeSnackbar } = useSnackbar();
//   const [users, setUsers] = React.useState([]);
//   const [groupAuthList, setGroupAuthList] = React.useState([]);
  const [isEditable, setIsEditable] = React.useState(false);
  const [openExecLog, setOpenExecLog] = React.useState(false);

  let sampleErrorLog = `
    Step 1.
    request: http://esapi1.danawa.com:7090/seed-update { body ... }
    response: 200 {status: “success”}

    Service Restart …… 

    Step 2.
    request: http://esapi2.danawa.com:7090/seed-update { body ... }
    response: 200 {status: “success”}

    Step 3.
    WARNING [http-nio-8080-exec-6] org.springframework.web.servlet.mvc.support.DefaultHandlerExceptionResolver.logException Resolved [org.springframework.web.HttpMediaTypeNotSupportedException: Content type 'application/json;charset=UTF-8' not supported]

    exit

    Step 1.
    request: http://esapi1.danawa.com:7090/seed-update { body ... }
    response: 200 {status: “success”}

    Service Restart …… 

    Step 2.
    request: http://esapi2.danawa.com:7090/seed-update { body ... }
    response: 200 {status: “success”}

    Step 3.
    WARNING [http-nio-8080-exec-6] org.springframework.web.servlet.mvc.support.DefaultHandlerExceptionResolver.logException Resolved [org.springframework.web.HttpMediaTypeNotSupportedException: Content type 'application/json;charset=UTF-8' not supported]

    exit

    Step 1.
    request: http://esapi1.danawa.com:7090/seed-update { body ... }
    response: 200 {status: “success”}

    Service Restart …… 

    Step 2.
    request: http://esapi2.danawa.com:7090/seed-update { body ... }
    response: 200 {status: “success”}

    Step 3.
    WARNING [http-nio-8080-exec-6] org.springframework.web.servlet.mvc.support.DefaultHandlerExceptionResolver.logException Resolved [org.springframework.web.HttpMediaTypeNotSupportedException: Content type 'application/json;charset=UTF-8' not supported]

    exit
    `;

  let config = {
    loadbalancer: [
      "http://esapi1.danawa.com:7090/seed-update",
      "http://esapi2.danawa.com:7090/seed-update",
      "http://esapi3.danawa.com:7090/seed-update",
    ],
    service_url: {
      esdata1: "http://192.168.1.141:9200",
      esdata2: "http://192.168.1.142:9200",
      esdata3: "http://192.168.1.143:9200",
      esdata4: "http://192.168.1.144:9200",
      esdata5: "http://192.168.1.145:9200",
      esdata6: "http://192.168.1.146:9200",
      esdata7: "http://192.168.1.147:9200",
      esdata8: "http://192.168.1.148:9200",
      esdata9: "http://192.168.1.148:9200",
      esdata10: "http://192.168.1.148:9200",
    },
    node_ready_time: 300, // seconds
    // # node_ready_check_uri: “/check”
  };

  let sample_arr = [];

  Object.keys(config["service_url"]).map((_Nodename) =>
    sample_arr.push(_Nodename)
  );

//   React.useEffect(() => {
//     init();
//   }, []);

//   const init = () => {
//     fetch(`/api${location.pathname}/users`)
//       .then((res) => res.json())
//       .then((body) => {
//         if (body["status"] === "success") {
//           setUsers(body["users"]);
//           setGroupAuthList(body["groupAuthList"]);
//         } else {
//           enqueueSnackbar(body["message"], { variant: "error" });
//         }
//       });
//   };

  return (
    <div className={classes.root}>
      <Card>
        <CardContent style={{ marginLeft: "7%" }}>
        
        <Grid container spacing={1}>
          <Grid item xs={12} md={11}>
          <Box>배포 타입</Box>
            <Box>
              <FormControl
                autoFocus={true}
                size={"small"}
                variant={"outlined"}
                color={"primary"}
                className={classes.select}
                style={{ width: "100%" }}
              >
                <Select value={1}>
                  {
                    <MenuItem key={1} value={1}>
                      검색 서비스
                    </MenuItem>
                  }
                </Select>
              </FormControl>
            </Box>
          </Grid>
          <Grid item xs={8} md={10}>
          <Box>서비스 선택</Box>
            <Box>
              <Autocomplete
                multiple
                size="small"
                options={sample_arr}
                disableCloseOnSelect
                getOptionLabel={(option) =>
                  option + "(" + config["service_url"][option] + ")"
                }
                renderOption={(option, { selected }) => (
                  <React.Fragment>
                    <Checkbox
                      icon={icon}
                      checkedIcon={checkedIcon}
                      style={{ marginRight: 8 }}
                      checked={selected}
                    />
                    {option}
                  </React.Fragment>
                )}
                style={{ width: "100%", float: "left" }}
                renderInput={(params) => (
                  <TextField {...params} variant="outlined" />
                )}
              />
            </Box>
          </Grid>
          <Grid item xs={4} md={1}>
          <Box>  
            <Button
                style={{ height: "40px", width: "100%", marginTop: "19.8px" }}
                variant={"outlined"}
                color={"primary"}
                onClick={() => {
                  setOpenExecLog(true);
                }}
              >
              실행
            </Button>
            </Box>
          </Grid>
        </Grid>

                
          <Grid container style={{ width: "92%", marginTop: "20px"}}>
            <Grid style={{ width: "100%" }}>
              <Box style={isEditable === false ? {cursor:"none", pointerEvents:"none" } : {pointerEvents:"all"}}>
                <AceEditor
                  mode="text"
                  fontSize="15px"
                  height="420px"
                  width="100%"
                  tabSize={2}
                  value={JSON.stringify(config, null, "\t")}
                  readOnly={isEditable === false ? true : false}
                  highlightActiveLine={isEditable === false ? false : true}                                                
                />
              </Box>
              <Button
                style={
                  isEditable
                    ? { display: "none" }
                    : {
                        height: "40px",
                        marginTop: "5px",
                        marginLeft: "5px",
                        float: "right",
                      }
                }
                variant={"outlined"}
                color={"default"}
                onClick={() => {
                  setIsEditable(true);
                }}
              >
                내용 수정
              </Button>
              <Button
                style={
                  isEditable
                    ? {
                        height: "40px",
                        marginTop: "5px",
                        marginLeft: "5px",
                        float: "right",
                      }
                    : { display: "none" }
                }
                variant={"outlined"}
                color={"primary"}
                onClick={() => {
                  setIsEditable(false);
                }}
              >
                저장
              </Button>
              <Button
                style={
                  isEditable
                    ? {
                        height: "40px",
                        marginTop: "5px",
                        marginLeft: "5px",
                        float: "right",
                      }
                    : { display: "none" }
                }
                variant={"outlined"}
                color={"secondary"}
                onClick={() => {
                  setIsEditable(false);
                }}
              >
                취소
              </Button>
            </Grid>
          </Grid>

          <Dialog
            maxWidth={"lg"}
            fullWidth={true}
            open={openExecLog}
            onClose={() => setOpenExecLog(false)}
          >
            <DialogTitle>
              실행 로그
              <IconButton
                aria-label="close"
                onClick={() => setOpenExecLog(false)}
                style={{ float: "right", marginTop: "-10px" }}
              >
                <CloseIcon />
              </IconButton>
            </DialogTitle>
            <DialogContent style={{backgroundColor: "black", border:"1.5px solid white"}}>
                <Grid container>
                  <Grid item xs={12}>
                    <TextareaAutosize
                      style={{
                        width: "100%",
                        minHeight: "700px",
                        backgroundColor: "black",
                        color: "white",
                        fontSize: "16px",
                        border:"none"
                      }}
                      readOnly={true}
                      disabled={true}
                      value={sampleErrorLog}
                      spellCheck={false}
                    />
                  </Grid>
                </Grid>
            </DialogContent>
            <DialogActions>
              <Box>
                <Button
                  style={{ position: "absolute", left: "0.5%", color: "red" }}
                  variant={"outlined"}
                  color={"secondary"}
                  onClick={() => setOpenExecLog(false)}
                  color="default"
                >
                  강제 중지
                </Button>

                <Button
                  variant={"outlined"}
                  onClick={() => setOpenExecLog(false)}
                  color="default"
                >
                  닫기
                </Button>
              </Box>
            </DialogActions>
          </Dialog>
        </CardContent>
      </Card>
    </div>
  );
}

export default Deploy;
