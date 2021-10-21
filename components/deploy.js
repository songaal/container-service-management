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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
} from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import Button from "@material-ui/core/Button";
import Grid from "@material-ui/core/Grid";
import CheckBoxOutlineBlankIcon from "@material-ui/icons/CheckBoxOutlineBlank";
import CheckBoxIcon from "@material-ui/icons/CheckBox";
import Autocomplete from "@material-ui/lab/Autocomplete";
import Checkbox from "@material-ui/core/Checkbox";
import dynamic from "next/dynamic";
import DialogTitle from "@material-ui/core/DialogTitle";
import DialogContent from "@material-ui/core/DialogContent";
import DialogActions from "@material-ui/core/DialogActions";
import Dialog from "@material-ui/core/Dialog";
import IconButton from "@material-ui/core/IconButton";
import CloseIcon from "@material-ui/icons/Close";
import EditIcon from "@material-ui/icons/Edit";
import DialogContentText from "@material-ui/core/DialogContentText";

const AceEditor = dynamic(import("react-ace"), { ssr: false });

const icon = <CheckBoxOutlineBlankIcon fontSize="small" />;
const checkedIcon = <CheckBoxIcon fontSize="small" />;


// DB에서 불러와야할내용
let config = {
  indexing: [
    {
      url: "http:;//esapi1.danawa.com/8100/managements/consume",
      consume_size: 2, // 재시작 시작은 무조건 0, 완료후 컨슘 사이즈를 설정
      queue: "VM,aa",
    },
    // ...
  ],
  target: "search  # search or office", // 검색API에선 상품,오피스 구분이 필요함.
  search_api: [
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
  allocate_disable_url: "dsearch-server.danawa.io / ~~~?on or off",
  node_ready_check_uri: "/check", // 상품명분석기 사전로딩 API 필요,,
};

const useStyles = makeStyles((theme) => ({
  root: {
    flexGrow: 1,
    width: "100%",
    backgroundColor: theme.palette.background.paper,
  },
}));

function Deploy() {
  const classes = useStyles();
  const [isDeployMode, setIsDeployMode] = React.useState(false);
  const [isEditable, setIsEditable] = React.useState(false);
  const [openExecLog, setOpenExecLog] = React.useState(false);
  const [openAlert, setOpenAlert] = React.useState(false);
  const [deployScript, setDeployScript] = React.useState(config);

  // 실행 다이얼로그 오픈
  const handleOpenExecDialog = () => {
    setOpenAlert(false);
    setOpenExecLog(true);
  };

  // 수정내용 저장, 취소시 복원용
  const handleSaveDepolyScript = () => {
    setIsEditable(false);
    config = deployScript;
  };

  // 내용수정
  const setJsonDeployScript = (e) => {
    try {
      setDeployScript(JSON.parse(e));
    } catch (e) {
      console.log(e);
    }
  };

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

    Step 1.
    request: http://esapi1.danawa.com:7090/seed-update { body ... }
    response: 200 {status: “success”}

    Service Restart …… 

    Step 2.
    request: http://esapi2.danawa.com:7090/seed-update { body ... }
    response: 200 {status: “success”}

    Step 3.
    WARNING [http-nio-8080-exec-6] org.springframework.web.servlet.mvc.support.DefaultHandlerExceptionResolver.logException Resolved [org.springframework.web.HttpMediaTypeNotSupportedException: Content type 'application/json;charset=UTF-8' not supported]

    Step 1.
    request: http://esapi1.danawa.com:7090/seed-update { body ... }
    response: 200 {status: “success”}

    Service Restart …… 

    Step 2.
    request: http://esapi2.danawa.com:7090/seed-update { body ... }
    response: 200 {status: “success”}

    Step 3.
    WARNING [http-nio-8080-exec-6] org.springframework.web.servlet.mvc.support.DefaultHandlerExceptionResolver.logException Resolved [org.springframework.web.HttpMediaTypeNotSupportedException: Content type 'application/json;charset=UTF-8' not supported]

    Step 1.
    request: http://esapi1.danawa.com:7090/seed-update { body ... }
    response: 200 {status: “success”}

    Service Restart …… 

    Step 2.
    request: http://esapi2.danawa.com:7090/seed-update { body ... }
    response: 200 {status: “success”}

    Step 3.
    WARNING [http-nio-8080-exec-6] org.springframework.web.servlet.mvc.support.DefaultHandlerExceptionResolver.logException Resolved [org.springframework.web.HttpMediaTypeNotSupportedException: Content type 'application/json;charset=UTF-8' not supported]
    `;

  // 서버에서 가져올 서비스
  let sample_arr = [];

  Object.keys(config["service_url"]).map((_Nodename) =>
    sample_arr.push(_Nodename)
  );

  let sample_history = [
    {
      date: "2021/10/20 12:30:31",
      service:
        "esdata1, esdata2, esdata3, esdata4, esdata5, esdata6, esdata7, esdata8, esdata9, esdata10",
    },
    { date: "2021/10/20 12:30:31", service: "esdata1" },
    {
      date: "2021/09/10 10:48:51",
      service: "esdata1, esdata2, esdata3, esdata4, esdata5",
    },
    {
      date: "2021/09/10 10:48:51",
      service: "esdata1, esdata2, esdata3, esdata4, esdata5",
    },
    {
      date: "2021/09/10 10:48:51",
      service: "esdata1, esdata2, esdata3, esdata4, esdata5",
    },
    {
      date: "2021/09/10 10:48:51",
      service: "esdata1, esdata2, esdata3, esdata4, esdata5",
    },
    {
      date: "2021/09/10 10:48:51",
      service: "esdata1, esdata2, esdata3, esdata4, esdata5",
    },
    {
      date: "2021/09/10 10:48:51",
      service: "esdata1, esdata2, esdata3, esdata4, esdata5",
    },
    {
      date: "2021/10/20 16:44:30",
      service: "esdata1, esdata2, esdata3, esdata4, esdata5",
    },
    {
      date: "2021/10/20 16:44:30",
      service: "esdata1, esdata2, esdata3, esdata4, esdata5",
    },
    {
      date: "2021/09/10 09:02:06",
      service: "esdata1, esdata2, esdata3, esdata4, esdata5",
    },
    {
      date: "2021/09/10 09:02:06",
      service: "esdata1, esdata2, esdata3, esdata4, esdata5",
    },
    {
      date: "2021/09/10 09:02:06",
      service: "esdata1, esdata2, esdata3, esdata4, esdata5",
    },
    {
      date: "2021/09/10 09:02:06",
      service: "esdata1, esdata2, esdata3, esdata4, esdata5",
    },
    {
      date: "2021/09/10 09:02:06",
      service: "esdata1, esdata2, esdata3, esdata4, esdata5",
    },
    {
      date: "2021/09/10 09:02:06",
      service: "esdata1, esdata2, esdata3, esdata4, esdata5",
    },
    {
      date: "2021/10/20 13:41:51",
      service: "esdata1, esdata2, esdata3, esdata4, esdata5",
    },
    {
      date: "2021/10/20 13:41:51",
      service: "esdata1, esdata2, esdata3, esdata4, esdata5",
    },
    { date: "2021/09/10 11:45:58", 
      service: "esdata1, esdata2" 
    },
    {
      date: "2021/09/10 11:45:58",
      service: "esdata1, esdata2, esdata3, esdata4, esdata5",
    },
    {
      date: "2021/09/10 11:45:58",
      service: "esdata1, esdata2, esdata3, esdata4, esdata5",
    },
    {
      date: "2021/09/10 11:45:58",
      service: "esdata1, esdata2, esdata3, esdata4, esdata5",
    },
    {
      date: "2021/09/10 11:45:58",
      service: "esdata1, esdata2, esdata3, esdata4, esdata5",
    },
    {
      date: "2021/09/10 11:45:58",
      service: "esdata1, esdata2, esdata3, esdata4, esdata5",
    },
  ];

  return (
    <div className={classes.root}>
      <Card>


      <Grid container spacing={3}>
        <Grid item xs>
          <Typography variant={"h5"} style={isDeployMode ? {marginLeft: "33.5%", marginTop: "30px"} : {marginLeft: "50px", marginTop: "40px"}}>
            {isDeployMode ? "배포하기" : "배포 히스토리"}
          </Typography>
        </Grid>
        <Grid item xs={6}>
        </Grid>
        <Grid item xs>
        <Button
          style={
            isDeployMode === true ? 
          {
            height: "40px",
            margin: "40px 36% 0 15px",
            float: "right",
          }
          :  
          {
            height: "40px",
            margin: "40px 20px 0 15px",
            float: "right",
          }}
          variant={"contained"}
          color={isDeployMode === true ? "default" : "primary"}
          onClick={() => {
            if (isDeployMode === false) {
              setIsDeployMode(true);
            } else {
              setIsDeployMode(false);
            }
          }}
        >
          {isDeployMode === true ? "배포내역 보기" : "배포하기"}
        </Button>
        </Grid>
      </Grid>

        <CardContent
          style={
            isDeployMode === true ? { display: "none" } : { display: "inherit" }
          }
        >
          <Table my={2}>
            <TableHead>
              <TableRow>
                <TableCell>#</TableCell>
                <TableCell>배포일시</TableCell>
                <TableCell>참여 서비스</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {sample_history.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={3} align={"center"}>
                    배포 내역이 없습니다.
                  </TableCell>
                </TableRow>
              ) : (
                sample_history.map((hst, index) => {
                  return (
                    <TableRow key={index}>
                      <TableCell>{index + 1}</TableCell>
                      <TableCell>{hst.date}</TableCell>
                      <TableCell>{hst.service}</TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </CardContent>
        <CardContent
          style={
            isDeployMode === true
              ? { display: "inherit", marginLeft: "7%" }
              : { display: "none" }
          }
        >
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
                  getOptionLabel={(option) => {
                      return option + "(" + deployScript["service_url"][option] + ")"
                    }
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
                  style={{ height: "40px", width: "100%", marginTop: "19.7px" }}
                  variant={"outlined"}
                  color={"primary"}
                  onClick={() => {
                    setOpenAlert(true);
                  }}
                >
                  실행
                </Button>
              </Box>
            </Grid>
          </Grid>

          <Grid container style={{ width: "91.5%", marginTop: "20px" }}>
            <Grid style={{ width: "100%" }}>
              <Box>
                <AceEditor
                  mode="text"
                  fontSize="15px"
                  height="420px"
                  width="100%"
                  tabSize={2}
                  value={JSON.stringify(deployScript, null, "\t")}
                  readOnly={isEditable === false ? true : false}
                  highlightActiveLine={isEditable === false ? false : true}
                  style={{ border: "0.1px solid #E0E0E0" }}
                  onChange={(e) => {
                    setJsonDeployScript(e);
                  }}
                />
              </Box>
              <Button
                style={
                  isEditable
                    ? { display: "none" }
                    : {
                        height: "40px",
                        marginTop: "15px",
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
                내용 수정{" "}
                <EditIcon
                  style={{ border: "3px solid #949494", marginLeft: "4px" }}
                />
              </Button>
              <Button
                style={
                  isEditable
                    ? {
                        height: "40px",
                        marginTop: "15px",
                        marginLeft: "5px",
                        float: "right",
                      }
                    : { display: "none" }
                }
                variant={"outlined"}
                color={"primary"}
                onClick={() => {
                  handleSaveDepolyScript();
                }}
              >
                저장
              </Button>
              <Button
                style={
                  isEditable
                    ? {
                        height: "40px",
                        marginTop: "15px",
                        marginLeft: "5px",
                        float: "right",
                      }
                    : { display: "none" }
                }
                variant={"outlined"}
                color={"secondary"}
                onClick={() => {
                  setIsEditable(false);
                  setDeployScript(config);
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
            <DialogContent
              style={{ backgroundColor: "black", border: "1.5px solid white", padding:"0", margin:"0", height:"700px"}}
            >
              <Grid container>
                <Grid item xs={12}>
                  <TextareaAutosize
                    style={{
                      width: "100%",
                      backgroundColor: "black",
                      color: "white",
                      fontSize: "16px",
                      border: "none",                      
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

          <Dialog
            open={openAlert}
            onClose={() => {
              setOpenAlert(false);
            }}
          >
            <DialogTitle id="alert-dialog-title">
              {"배포를 실행하시겠습니까?"}
            </DialogTitle>
            <DialogContent>
              <DialogContentText>
                작성한 내용으로 배포를 실행합니다. 실행하시려면 실행 버튼을
                누르세요.
              </DialogContentText>
            </DialogContent>
            <DialogActions>
              <Button
                onClick={() => {
                  setOpenAlert(false);
                }}
              >
                취소
              </Button>
              <Button onClick={handleOpenExecDialog} autoFocus>
                실행
              </Button>
            </DialogActions>
          </Dialog>
        </CardContent>
      </Card>
    </div>
  );
}

export default Deploy;
