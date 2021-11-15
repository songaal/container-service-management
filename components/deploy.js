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
  TableContainer,
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
import HelpIcon from "@material-ui/icons/Help";
import DialogContentText from "@material-ui/core/DialogContentText";
import MultiSelect from "./MultiSelect";
import { SnackbarProvider, useSnackbar } from "notistack";
import LinearProgress from "@material-ui/core/LinearProgress";

const AceEditor = dynamic(import("react-ace"), { ssr: false });

// API 호출 간격
const loopInterval = 5000;

// 검색 서비스 기본 템플릿 JSON
let default_json = `{
  "indexing": [
    {
      "url": "",
      "consume_size": "2",
      "queue": ""
    }
  ],
  "target": "search",
  "search_api": [
  ],
  "service_url": {
  },
  "node_ready_time": "300",
  "node_ready_check_uri": "",
  "checkMode": {
    "url": "http://dsearch-server.danawa.io/clusters/check?flag=",
    "clusterId": "abcd-1234-bbsargg-athah",
    "enableValue": "true",
    "disableValue": "false"
  }
}`;

function createData(name, desc) {
  return { name, desc };
}

const rows = [
  createData(
    "indexing.url",
    `"http://queue-indexer:8100/managements/consume", //큐인덱서 URL`
  ),
  createData("indexing.consume_size", `2, // 컨슘 원복 갯수`),
  createData(
    "indexing.queue",
    `VM,PDM,APL,AC,..." // 큐선택 ,(콤마) 구분으로 입력`
  ),
  createData("target", `"search", // "search" or "office" 배포 선택`),
  createData(
    "search_api",
    `"http://search-api:7090/managements/update-seeds", //  시드정보는 서비스URL기반으로 자동 할당됩니다. \n ex) body { target: "office", seeds: [ ... ] }`
  ),
  createData("service_url", `search_api 전송될 시드 목록입니다. `),
  createData("node_ready_time", `300 // 서비스 재시작 후 대기시간 (단위: 초)`),
  createData("node_ready_check_url", `/check" // 서비스 상태체크 url`),
  createData(
    "checkMode.url",
    "http://dsearch-server.danawa.io/clusters/check?flag= // Dsearch 서버 점검모드 ON/OFF API 주소"
  ),
  createData(
    "checkMode.clusterId",
    "abcd-1234-bbsargg-athah // 클러스터 아이디"
  ),
  createData(
    "checkMode.enableValue",
    "true 점검모드 활성화"
  ),
  createData(
    "checkMode.disableValue",
    "false 점검모드 비활성화"
  ),
];

const useStyles = makeStyles((theme) => ({
  root: {
    flexGrow: 1,
    width: "100%",
    backgroundColor: theme.palette.background.paper,
  },
}));

function getRandomUuid() {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (c) {
    let r = (Math.random() * 16) | 0,
      v = c == "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

function dateFormat(date) {
  let month = date.getMonth() + 1;
  let day = date.getDate();
  let hour = date.getHours();
  let minute = date.getMinutes();
  let second = date.getSeconds();

  month = month >= 10 ? month : '0' + month;
  day = day >= 10 ? day : '0' + day;
  hour = hour >= 10 ? hour : '0' + hour;
  minute = minute >= 10 ? minute : '0' + minute;
  second = second >= 10 ? second : '0' + second;

  return date.getFullYear() + '-' + month + '-' + day + ' ' + hour + ':' + minute + ':' + second;
}

function Deploy() {
  const classes = useStyles();
  const [isDeployMode, setIsDeployMode] = React.useState(false);
  const [deployScript, setDeployScript] = React.useState("");
  const [deployService, setDeployService] = React.useState([]);
  const [deployHistory, setDeployHistory] = React.useState([]);
  const [isEditable, setIsEditable] = React.useState(false);
  const [isDisable, setIsDisable] = React.useState(false);
  const [openExecLog, setOpenExecLog] = React.useState(false);
  const [execLogContents, setExecLogContents] = React.useState("");
  const [openAlert, setOpenAlert] = React.useState(false);
  const [selectedOptions, setSelectedOptions] = React.useState([]);
  const { enqueueSnackbar, closeSnackbar } = useSnackbar();
  const [services, setServices] = React.useState([]);
  const [deployServiceType, setDeployServiceType] = React.useState([
    { id: "1", name: "검색 서비스" },
  ]);
  const [serviceType, setServiceType] = React.useState("1");
  const [alertContents, setAlertContents] = React.useState("");
  const [alertTitle, setAlertTitle] = React.useState("");
  const [alertType, setAlertType] = React.useState("");
  const [displayProgressBar, setDisplayProgressBar] = React.useState(false);
  const [processList, setProcessList] = React.useState([]);

  React.useEffect(() => {
    init();
  }, []);

  const init = async () => {
    let tmpService = [];

    // 그룹 내 서비스 조회
    await fetch(`/api${location.pathname}/services`)
      .then((res) => res.json())
      .then((body) => {
        if (body["status"] === "error") {
          console.error(body);
          enqueueSnackbar("조회 중 에러가 발생하였습니다.", {
            variant: "error",
          });
        } else {
          setServices(body["services"]);
          tmpService = body["services"];
        }
      });

    // 그룹의 배포 히스토리 및 구성 JSON 조회
    await fetch(`/api${location.pathname}/deploy_action`)
      .then((res) => res.json())
      .then((body) => {
        if (body["status"] === "error") {
          console.error(body);
          enqueueSnackbar("조회 중 에러가 발생하였습니다.", {
            variant: "error",
          });
        } else {
          setDeployHistory(body["histories"]);

          let service_url;

          // JSON의 서비스
          if (body["json"].length === 0) {
            // 그룹에 저장된 템플릿이 없을경우
            service_url = JSON.parse(default_json)["service_url"];
            setDeployScript(default_json);
          } else {
            service_url = JSON.parse(body["json"][0].deploy_json)[
              "service_url"
            ];
            setDeployScript(body["json"][0].deploy_json);

            //취소시 되돌리기용
            default_json = body["json"][0].deploy_json;
          }

          let tempArr = [];

          // JSON VS 그룹서비스
          Object.keys(service_url).map((_Nodename) => {
            tmpService.forEach((myService) => {
              if (myService.name === _Nodename) {
                tempArr.push({ label: _Nodename, value: myService.id });
              }
            });
          });

          setDeployService(tempArr);
        }
      });
  };

  const sleep = (delay) => new Promise((resolve) => setTimeout(resolve, delay));

  const handleDialogAction = () => {
    setOpenAlert(false);

    switch (alertType) {
      case "excute":
        return handleServiceExcute();
      case "jsonSave":
        return handleSaveDepolyScript();
      case "pauseService":
        return handleServicePause();
    }
  };

  // 요청 실행
  const handleServiceExcute = async () => {
    setOpenExecLog(true);
    setDisplayProgressBar(true);
    setExecLogContents("");

    let taskId = getRandomUuid();

    // 검색 서비스 실행
    if (serviceType === "1") {
      // 작업 목록
      let taskUrlList = JSON.parse(deployScript)["service_url"];
      let taskList = [];

      // 선택한 이름으로 서비스ID 찾아서 매칭
      Object.keys(taskUrlList).map(async (name) => {
        deployService.forEach((service) => {
          if (service.label === name) {
            taskList.push({ id: service.value, name: name });
          }
        });
      });

      if ((await execService(taskId, taskList)) === false) {
        setExecLogContents(
          (execLogContents) =>
            execLogContents + "\n실행 API 호출시 에러가 발생했습니다."
        );
      }
    }
  };

  // 작업 중단
  const handleServicePause = () => {
    let taskId = "";

    processList.forEach((ele) => {
      if (ele.serviceType === serviceType) {
        if (ele.step === "run") {
          taskId = ele.taskId;

          processList.forEach((ele) => {
            if (taskId === ele.taskId) {
              if (ele.step === "done" || ele.step === "fail") {
                taskId = "";
              }
            }
          });
        }
      }
    });

    if (taskId !== "") {
      fetch(`/api${location.pathname}/deploy_action`, {
        method: "PUT",
        body: JSON.stringify({
          serviceType: "pause",
          taskId: taskId,
        }),
      })
        .then((res) => res.json())
        .then((body) => {
          if (body.status === "success") {
            getLogMessage(taskId);
          } else {
            enqueueSnackbar("정지중 오류가 발생하였습니다.", {
              variant: "error",
            });
          }
        });
      setIsDisable(true);
    } else {
      enqueueSnackbar("정지할 작업이 존재하지 않습니다.", {
        variant: "warning",
      });
    }
  };

  // 서비스 실행 API
  const execService = async (taskId, taskList) => {
    let result = false;

    setProcessList((processList) => [
      ...processList,
      { taskId: taskId, serviceType: serviceType, step: "run" },
    ]);
    setIsDisable(false);

    try {
      await fetch(`/api${location.pathname}/deploy_action`, {
        method: "PUT",
        body: JSON.stringify({
          serviceType: serviceType,
          taskId: taskId,
          taskList: taskList,
          option: JSON.parse(deployScript),
          loopInterval: loopInterval,
        }),
      })
        .then((res) => res.json())
        .then((body) => {
          if (body.status === "success") {
            result = true;
            getLogMessage(taskId);
          } else {
            result = false;
            setDisplayProgressBar(false);
            enqueueSnackbar("실행 중 오류가 발생하였습니다.", {
              variant: "error",
            });
            setExecLogContents(body.message);
          }
        });
    } catch (e) {
      enqueueSnackbar("서비스 호출중 에러가 발생했습니다" + e, {
        variant: "error",
      });
      result = false;
      return result;
    }

    return result;
  };  

  // 로그 수집 API
  const getLogMessage = async (taskId) => {
    let logMessage = "";
    let isWorking = true;
    let result = false;
    await fetch(`/api${location.pathname}/deploy_action?taskId=${taskId}`)
      .then((res) => res.json())
      .then((body) => {
        if(body["taskLogger"].length > 0){
          body["taskLogger"].forEach((ele) => {
            if (ele.taskId === taskId) {
              logMessage = `${ele.message}`;
  
              if (ele.result === "run") {
                isWorking = true;
              } else if (ele.result === "done") {
                setProcessList((processList) => [
                  ...processList,
                  { taskId: taskId, serviceType: serviceType, step: "done" },
                ]);
                enqueueSnackbar("실행이 완료되었습니다.", {
                  variant: "success",
                });
                setDisplayProgressBar(false);
                setIsDisable(true);
                isWorking = false;
              } else {
                setProcessList((processList) => [
                  ...processList,
                  { taskId: taskId, serviceType: serviceType, step: "fail" },
                ]);
                enqueueSnackbar("실행 중 오류가 발생하였습니다.", {
                  variant: "error",
                });
                setIsDisable(true);
                setDisplayProgressBar(false);
                isWorking = false;
              }
            }
          });

          if (body["status"] === "error") {
            enqueueSnackbar("로그 수집중에 오류가 발생하였습니다.", {
              variant: "error",
            });
            setIsDisable(true);
            setProcessList((processList) => [
              ...processList,
              { taskId: taskId, serviceType: serviceType, step: "fail" },
            ]);
            setDisplayProgressBar(false);
            isWorking = false;
          }
  
          setExecLogContents(logMessage);
       }
    });
    
    if(isWorking && loopInterval){
      await sleep(loopInterval);
      getLogMessage(taskId)
     } else {
      result = isWorking;
     }

     return result;
  };

  // 수정내용 저장
  const handleSaveDepolyScript = () => {
    setIsEditable(false);

    // 저장 API
    default_json = deployScript;
    saveDeployJson(deployScript);

    let tempArr = [];
    let target = JSON.parse(deployScript)["service_url"];

    Object.keys(target).map((_Nodename) => {
      services.forEach((myService) => {
        if (myService.name === _Nodename) {
          tempArr.push({ label: _Nodename, value: myService.id });
        }
      });
    });

    setDeployService(tempArr);
  };

  // 구성 JSON 저장
  const saveDeployJson = () => {
    fetch(`/api${location.pathname}/deploy_action`, {
      method: "POST",
      body: JSON.stringify({
        type: "deployJson",
        deploy_json: deployScript,
        deploy_type: serviceType,
      }),
    })
      .then((res) => res.json())
      .then((body) => {
        if (body["status"] === "error") {
          console.error(body);
          enqueueSnackbar("저장 중 에러가 발생하였습니다.", {
            variant: "error",
          });
        } else {
          enqueueSnackbar("구성이 성공적으로 저장되었습니다.", {
            variant: "success",
          });
        }
      });
  };

  const checkInputJsonData = (e) => {
    try {
      let flag = true;
      let json = JSON.parse(deployScript);
      
      if(!json.indexing){
        enqueueSnackbar("indexing 항목의 값이 없습니다.", {
          variant: "error",
        });
        flag = false;   
      } else {
        json.indexing.forEach((ele, idx) => {
          if((!ele.url || ele.url === "") ||
          (!ele.consume_size || ele.consume_size === "") || 
          (!ele.queue || ele.queue === "")){
            enqueueSnackbar(`indexing ${idx+1}번째 항목의 값이 없습니다.`, {
              variant: "error",
            });
            flag = false;
          }
        });
      }  
      
      if (!json.checkMode || (!json.checkMode.url || json.checkMode.url === "") ||
          (!json.checkMode.clusterId || json.checkMode.clusterId === "") || 
          (!json.checkMode.enableValue || json.checkMode.enableValue === "") ||
          (!json.checkMode.disableValue || json.checkMode.disableValue === "")) {
        enqueueSnackbar("checkMode 항목의 값이 없습니다.", {
          variant: "error",
        });
        flag = false;
      } else if (!json.service_url) {
        enqueueSnackbar("service_url 항목의 값이 없습니다.", {
          variant: "error",
        });
        flag = false;
      } else if (!json.search_api) {
        enqueueSnackbar("search_api 항목의 값이 없습니다.", {
          variant: "error",
        });
        flag = false;
      } else if (!json.target) {
        enqueueSnackbar("target 항목의 값이 없습니다.", {
          variant: "error",
        });
        flag = false;
      }

      return flag;
    } catch (error) {
      enqueueSnackbar(error + "", {
        variant: "error",
      });
      return false;
    }
  };

  const checkEnableExcute = async () => {
    let isEnable = true;

    // 실행 여부 조회
    await fetch(`/api${location.pathname}/deploy_action?serviceType=${serviceType}`)
      .then((res) => res.json())
      .then((body) => {
        if (body["status"] === "error") {
          console.error(body);
          enqueueSnackbar("실행여부 조회 중 에러가 발생하였습니다.", {
            variant: "error",
          });
        } else {
          isEnable = body["enable"];
        }
      });

    return isEnable;
  };

  // 내용수정
  const setJsonDeployScript = (e) => {
    try {
      setDeployScript(e);
    } catch (e) {
      console.log(e);
    }
  };

  const pauseDeployService = () => {
    setOpenAlert(true);
    setAlertType("pauseService");
    setAlertTitle("배포 서비스가 진행중입니다. 중지하시겠습니까?");
    setAlertContents(`작업이 중간에 종료됩니다. 중지하려면 확인 버튼을
    누르세요.`);
  };

  return (
    <div className={classes.root}>
      <Card>
        <Grid container spacing={3}>
          <Grid item xs>
            <Typography
              variant={"h5"}
              style={{ marginLeft: "20px", marginTop: "20px" }}
            >
              {isDeployMode ? "배포하기" : "배포 히스토리"}
            </Typography>
          </Grid>
          <Grid item xs={6}></Grid>
          <Grid item xs>
            <Button
              style={{
                height: "40px",
                margin: "40px 20px 0 15px",
                float: "right",
              }}
              variant={"contained"}
              color={isDeployMode === true ? "default" : "primary"}
              onClick={async () => {
                if (isDeployMode === false) {                
                  setIsDeployMode(true);
                } else {
                  init();
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
                      <TableCell>{dateFormat(new Date(hst.deployTime))}</TableCell>
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
            isDeployMode === true ? { display: "inherit" } : { display: "none" }
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
                  <Select
                    value={serviceType}
                    onChange={(event) => setServiceType(event.target.value)}
                  >
                    {deployServiceType.map((type) => (
                      <MenuItem key={type["id"]} value={type["id"]}>
                        {type["name"]}
                      </MenuItem>
                    ))}
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
                  selectAllLabel={
                    deployService.length > 0
                      ? "모두 선택하기"
                      : "구성과 일치하는 서비스가 없습니다."
                  }
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
                  disabled={isEditable}
                  onClick={async () => {
                    if (selectedOptions.length > 0) {
                      let checkInputBool = false;
                      let checkExcuteBool = false;

                      checkInputBool = checkInputJsonData();
                      checkExcuteBool = await checkEnableExcute();

                      if (checkExcuteBool === false) {
                        enqueueSnackbar(
                          "현재 그룹에서 서비스 배포가 진행중입니다. 잠시후에 시도해주세요. ",
                          {
                            variant: "warning",
                          }
                        );
                      } else {
                        if (checkInputBool) {
                          setOpenAlert(true);
                          setAlertType("excute");
                          setAlertTitle("배포를 실행하시겠습니까?");
                          setAlertContents(`작성한 내용으로 배포를 실행합니다. 실행하시려면 확인 버튼을
                          누르세요.`);
                        }
                      }
                    } else {
                      enqueueSnackbar(
                        "선택된 서비스가 없습니다. 서비스를 선택해주세요.",
                        {
                          variant: "warning",
                        }
                      );
                    }
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
                  let checkInputBool = false;

                  checkInputBool = checkInputJsonData();

                  if (default_json === deployScript) {
                    enqueueSnackbar("변경된 내용이 없습니다.", {
                      variant: "warning",
                    });
                    checkInputBool = false;
                  }

                  if (checkInputBool) {
                    setOpenAlert(true);
                    setAlertType("jsonSave");
                    setAlertTitle("입력한 내용을 저장하시겠습니까?");
                    setAlertContents(`작성한 내용으로 배포 구성을 저장합니다. 저장하려면 확인 버튼을
                    누르세요.`);
                  }
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
              <Button
                style={{
                  height: "40px",
                  marginTop: "15px",
                  marginLeft: "5px",
                  float: "right",
                }}
                variant={"outlined"}
                color={"default"}
                onClick={() => {
                  setOpenAlert(true);
                  setAlertType("jsonGuide");
                  setAlertTitle("검색서비스 배포 구성 가이드");
                }}
              >
                작성 가이드{" "}
                <HelpIcon
                  fontSize={"small"}
                  style={{ marginTop: "-3.8px", marginLeft: "8px" }}
                />
              </Button>
            </Grid>
          </Grid>

          <Dialog maxWidth={"lg"} fullWidth={true} open={openExecLog}>
            <DialogTitle>실행 로그</DialogTitle>
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
                      fontSize: "18px",
                      border: "none",
                      padding: "6px",
                    }}
                    readOnly={true}
                    disabled={true}
                    value={execLogContents}
                    spellCheck={false}
                  />
                </Grid>
              </Grid>
            </DialogContent>
            <LinearProgress
              style={
                displayProgressBar === true
                  ? { height: "11px" }
                  : { display: "none" }
              }
            />
            <DialogActions>
              <Box>
                <Button
                  style={{ position: "absolute", left: "0.5%" }}
                  variant={"outlined"}
                  color={"default"}
                  onClick={() => pauseDeployService()}
                  disabled={isDisable}
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
            maxWidth={"md"}
            fullWidth={true}
            open={openAlert}
            onClose={() => {
              setOpenAlert(false);
            }}
          >
            <DialogTitle id="alert-dialog-title">{alertTitle}</DialogTitle>
            <DialogContent>
              <DialogContentText>
                {alertType === "jsonGuide" ? (
                  <TableContainer>
                    <Table sx={{ minWidth: 650 }}>
                      <TableHead>
                        <TableRow>
                          <TableCell>필드명</TableCell>
                          <TableCell align="left">예시 및 설명</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {rows.map((row) => (
                          <TableRow key={row.name}>
                            <TableCell component="th" scope="row">
                              {row.name}
                            </TableCell>
                            <TableCell align="left">{row.desc}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                ) : (
                  alertContents
                )}
              </DialogContentText>
            </DialogContent>
            <DialogActions>
              <Button
                onClick={() => {
                  setOpenAlert(false);
                }}
                style={
                  alertType === "jsonGuide"
                    ? {
                        display: "none",
                      }
                    : {
                        backgroundColor: "#D5455A",
                        color: "white",
                      }
                }
              >
                취소
              </Button>
              <Button
                variant={"contained"}
                color={"primary"}
                onClick={handleDialogAction}
                autoFocus
              >
                확인
              </Button>
            </DialogActions>
          </Dialog>
        </CardContent>
      </Card>
    </div>
  );
}

export default Deploy;