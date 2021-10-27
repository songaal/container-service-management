import React from "react";
import {
  Box,
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
import dynamic from "next/dynamic";
import DialogTitle from "@material-ui/core/DialogTitle";
import DialogContent from "@material-ui/core/DialogContent";
import DialogActions from "@material-ui/core/DialogActions";
import Dialog from "@material-ui/core/Dialog";
import EditIcon from "@material-ui/icons/Edit";
import DialogContentText from "@material-ui/core/DialogContentText";
import MultiSelect from "./MultiSelect";
import { SnackbarProvider, useSnackbar } from 'notistack';

const AceEditor = dynamic(import("react-ace"), { ssr: false });

// 검색 서비스 기본 템플릿 JSON
let default_json = `{
  "indexing": [
    {
      "url": "http:;//esapi1.danawa.com/8100/managements/consume",
      "consume_size": "2 // 재시작 시작은 무조건 0, 완료후 컨슘 사이즈를 설정",
      "queue": "VM,aa"
    }
  ],
  "target": "search  # search or office, // 검색API에선 상품,오피스 구분이 필요함.",
  "search_api": [
    "http://esapi1.danawa.com:7090/seed-update",
    "http://esapi2.danawa.com:7090/seed-update",
    "http://esapi3.danawa.com:7090/seed-update"
  ],
  "service_url": {
    "esdata1": "http://192.168.1.141:9200",
    "esdata2": "http://192.168.1.142:9200",
    "esdata3": "http://192.168.1.143:9200",
    "esdata4": "http://192.168.1.144:9200",
    "esdata5": "http://192.168.1.145:9200",
    "esdata6": "http://192.168.1.146:9200",
    "esdata7": "http://192.168.1.147:9200",
    "esdata8": "http://192.168.1.148:9200",
    "esdata9": "http://192.168.1.148:9200",
    "esdata10": "http://192.168.1.148:9200"
  },
  "node_ready_time": "300, // seconds",
  "allocate_disable_url": "dsearch-server.danawa.io / ~~~?on or off,",
  "node_ready_check_uri": "/check // 상품명분석기 사전로딩 API 필요,,"
}`;

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
  const [deployScript, setDeployScript] = React.useState(default_json);
  const [deployService, setDeployService] = React.useState([]);
  const [deployHistory, setDeployHistory] = React.useState([]);
  const [isEditable, setIsEditable] = React.useState(false);
  const [openExecLog, setOpenExecLog] = React.useState(false);
  const [openAlert, setOpenAlert] = React.useState(false);
  const [selectedOptions, setSelectedOptions] = React.useState([]);
  const { enqueueSnackbar, closeSnackbar } = useSnackbar();
  const [services, setServices] = React.useState([]);

  React.useEffect(() => {
      init()
  }, [])
  
  const init = async () => {
    let tmpService = [];

    // 그룹 내 서비스 조회
    await fetch(`/api${location.pathname}/services`)
    .then(res => res.json())
    .then(body => {
        if (body['status'] === 'error') {
            console.error(body)
            enqueueSnackbar('조회 중 에러가 발생하였습니다.', {
                variant: "error"
            });
        } else {
            setServices(body['services'])
            tmpService = body['services'];
        }
    })

    // 그룹의 배포 히스토리 및 구성 JSON 조회
    await fetch(`/api${location.pathname}/deploy`)
    .then(res => res.json())
    .then(body => {
        if (body['status'] === 'error') {
          console.error(body)
          enqueueSnackbar('조회 중 에러가 발생하였습니다.', {
              variant: "error"
          });
        } else {
          setDeployHistory(body['histories'])
          // JSON의 서비스
          let target = body['json'].length === 0 ? JSON.parse(default_json)["service_url"] : body['json'].deploy_json["service_url"];
          let tempArr = [];

          // JSON VS 그룹서비스
          Object.keys(target).map((_Nodename) => {
              tmpService.forEach(myService => {
                if(myService.name === _Nodename){
                  tempArr.push({ label: _Nodename, value: _Nodename })
                }
              })              
            }            
          );

          setDeployService(tempArr);
        }
    })
  }

  // 실행 다이얼로그 오픈
  const handleOpenExecDialog = () => {
    setOpenAlert(false);
    setOpenExecLog(true);
  };

  // 구성 JSON 저장
  // const saveDeployJson = () => {
  //   fetch(`/api${location.pathname}/deploy`, {
  //     method: "POST",
  //     body:{deploy_json:deployScript, deploy_type}
  //   })
  //   .then(res => res.json())
  //   .then(body => {
  //       if (body['status'] === 'error') {
  //           console.error(body)
  //           enqueueSnackbar('저장 중 에러가 발생하였습니다.', {
  //               variant: "error"
  //           });
  //       } else {
  //           setServices(body['services'])
  //       }
  //   })
  // }


  // 수정내용 저장
  const handleSaveDepolyScript = () => {
    setIsEditable(false);

    // 저장 API
    saveDeployJson(deployScript);

    let tempArr = [];
    let target = JSON.parse(deployScript)["service_url"];

    Object.keys(target).map((_Nodename) => {
        services.forEach(myService => {
          if(myService.name === _Nodename){
            tempArr.push({ label: _Nodename, value: _Nodename })
          }
        })              
      }            
    );

    setDeployService(tempArr);
  };

  // 내용수정
  const setJsonDeployScript = (e) => {
    try {
      setDeployScript(e);
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
    `;

  return (
    <div className={classes.root}>
      <Card>
        <Grid container spacing={3}>
          <Grid item xs>
            <Typography
              variant={"h5"}
              style={
                { marginLeft: "20px", marginTop: "20px" }
              }
            >
              {isDeployMode ? "배포하기" : "배포 히스토리"}
            </Typography>
          </Grid>
          <Grid item xs={6}></Grid>
          <Grid item xs>
            <Button
              style={
                 {
                  height: "40px",
                  margin: "40px 20px 0 15px",
                  float: "right",
                 }
              }
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
                <TableCell>결과</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {deployHistory.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} align={"center"}>
                    배포 내역이 없습니다.
                  </TableCell>
                </TableRow>
              ) : (
                deployHistory.map((hst, index) => {
                  return (
                    <TableRow key={index}>
                      <TableCell>{index + 1}</TableCell>
                      <TableCell>{hst.deployTime}</TableCell>
                      <TableCell>{hst.service}</TableCell>
                      <TableCell>{hst.result}</TableCell>
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
              ? { display: "inherit"}
              : { display: "none" }
          }
        >
          <Grid container spacing={1}>
            <Grid item xs={12} md={12}>
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
                      deployServiceType.map((item, index) => {
                        return (
                          <MenuItem key={1}>
                            item.name
                          </MenuItem>
                        );
                      })
                    }
                  </Select>
                </FormControl>
              </Box>
            </Grid>
            <Grid item xs={8} md={11}>
              <Box>서비스 선택</Box>
              <Box>
                <MultiSelect
                  items={deployService}
                  getOptionLabel={(option) => `${option.label}`}
                  selectedValues={selectedOptions}
                  placeholder="서비스를 선택하세요"
                  selectAllLabel="모두 선택하기"                  
                  onToggleOption={(selectedOptions) =>
                    setSelectedOptions(selectedOptions)
                  }
                  onClearOptions={() => setSelectedOptions([])}
                  onSelectAll={(isSelected) => {
                    if (isSelected) {
                      setSelectedOptions(deployService);
                    } else {
                      setSelectedOptions([]);
                    }
                  }}
                />
              </Box>
            </Grid>
            <Grid item xs={4} md={1}>
              <Box>
                <Button
                  style={{ height: "40px", width: "100%", marginTop: "10px" }}
                  variant={"contained"}
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

          <Grid container style={{ width: "100%", marginTop: "15px" }}>
            <Grid style={{ width: "100%" }}>
              <Box>
                <AceEditor
                  mode="text"
                  fontSize="15px"
                  height="520px"
                  width="100%"
                  tabSize={2}
                  value={deployScript}
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
                  fontSize={"small"}
                  style={{ marginTop: "-3.8px", marginLeft: "8px" }}
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
                variant={"contained"}
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
                        backgroundColor: "#D5455A",
                        color: "white",
                      }
                    : { display: "none" }
                }
                variant={"contained"}
                onClick={() => {
                  setIsEditable(false);
                  setDeployScript(default_json);
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
          >
            <DialogTitle>
              실행 로그
            </DialogTitle>
            <DialogContent
              style={{
                backgroundColor: "black",
                border: "1.5px solid white",
                padding: "0",
                margin: "0",
                height: "700px",
              }}
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
                style={{
                  backgroundColor: "#D5455A",
                  color: "white",
                }}
              >
                취소
              </Button>
              <Button
                variant={"contained"}
                color={"primary"}
                onClick={handleOpenExecDialog}
                autoFocus
              >
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