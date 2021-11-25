const request = require("request-promise-native");
import GroupSvcService from "./GroupSvcService";
import DeployHistoryService from "./DeployHistoryService";

const url_check_div = process.env.URL_CHECK_DIV || 10;

let taskLogger = {};
// {
//   groupId : "1" // 작업하는 그룹 아이디
//   deployType : "1" // 검색 서비스,
//   taskID : "UUID",
//   message : "로그 메시지"
//   result : "run // run - 진행중, done - 완료, fail - 실패"
//   stop : "false // 중지 여부"
// }

function updateTaskLogger(taskId, message, result, stop) {
  console.log('taskLogger[taskId]', taskId, message, result, stop);
  if (message) {
    if(taskLogger[taskId].message){
        taskLogger[taskId].message = taskLogger[taskId].message + `\n${dateFormat(new Date())} ` + message;
    } else {
        taskLogger[taskId].message = `${dateFormat(new Date())} ` + message;
    }
  }

  if (result) {
    taskLogger[taskId].result = result;
  }

  if (stop) {
    taskLogger[taskId].stop = stop;
  }
}

function textLengthOverCut(txt, len, lastTxt) {
  if (len == "" || len == null) {
    // 기본값
    len = 350;
  }
  if (lastTxt == "" || lastTxt == null) {
    // 기본값
    lastTxt = " ... MORE TEXT";
  }
  if (txt.length > len) {
    txt = txt.substr(0, len) + lastTxt;
  }
  return txt;
}

function dateFormat(date) {
  let month = date.getMonth() + 1;
  let day = date.getDate();
  let hour = date.getHours();
  let minute = date.getMinutes();
  let second = date.getSeconds();

  month = month >= 10 ? month : "0" + month;
  day = day >= 10 ? day : "0" + day;
  hour = hour >= 10 ? hour : "0" + hour;
  minute = minute >= 10 ? minute : "0" + minute;
  second = second >= 10 ? second : "0" + second;

  return (
    date.getFullYear() +
    "-" +
    month +
    "-" +
    day +
    " " +
    hour +
    ":" +
    minute +
    ":" +
    second
  );
}

async function dockerServiceRestart(user, groupId, id) {    
  try {
     // 서비스 재시작
    await GroupSvcService.stopServices(user, groupId, id);

    let stopAndHealth = await GroupSvcService.getState(groupId, id);

    console.log(stopAndHealth);
    
    await GroupSvcService.startServices(user, groupId, id);

    let startAndHealth = await GroupSvcService.getState(groupId, id);

    console.log(startAndHealth);

  } catch (e) {
    console.log(e);
  }
}

async function intervalCheckUri(es_check_url) {
  let resultData = { message: "", result: "true" };

  // const url = {
  //   uri: es_check_url,
  //   method: 'GET'
  // }

  // await request(url, function(err, res, body) {
  //   if(err){
  //     resultData.message = err;
  //     resultData.result = "error";
  //   } else {
  //     console.log(res);
  //     console.log(body);
  //     resultData.message = body.message;
  //     resultData.result = body.result;
  //   }
  // }).catch((err)=> {
  //   resultData.message = err.error;
  //   resultData.result = "error";
  // })

  return false;
}

const sleep = (delay) =>
  new Promise((resolve) => setTimeout(resolve, delay * 1000));

async function updateServiceSeed(updateList, option) {
  let resultData = { message: "", result: "true" };

  for (const search_api_url of option["search_api"]) {
    const url = {
      uri: search_api_url,
      method: "PUT",
      body: {
        target: option["target"],
        seeds: updateList,
      },
      json: true,
    };

    await request(url, function (err, res, body) {
        console.log(
            "searchApi 호출 :",
            url,
            res.statusCode
          );
      
      if (err) {
        resultData.message = err;
        resultData.result = "error";
      } else {
        resultData.message = body.message;
        resultData.result = body.result;
      }
    }).catch((err) => {
      resultData.message = err.error;
      resultData.result = "error";
    });
  }

  return resultData;
}

async function setDymicEnable(taskId, enable, dymic_info){
  for (const dymic_enable_url of dymic_info) {
    // 동적색인 OFF
    let url = {
      uri: dymic_enable_url,
      method: "PUT",
      body: {
        enable: enable,
      },
      json: true,
    };

    await request(url, function (err, res, body) {
      console.log("동적 색인 ON/OFF 호출", url, res.statusCode);

      if (res.statusCode === 200) {
        updateTaskLogger(taskId, "큐 인덱서 [ "+ dymic_enable_url + " ] 동적 색인 "+ (enable ? "ON" : "OFF") +" 되었습니다.");
        return "true";
      } else {
        return "error";
      }
    }).catch((err) => {
      throw new Error("동적색인 ON/OFF 중 에러발생 ! " + err);
    });
  }
}



async function controlDymicAndInsp(enable, dymic_info, check_info, taskId) {
  try {
    let resultData = { result: "true" };

    if (enable === false) {
      resultData.result = await setDymicEnable(taskId, enable, dymic_info);

      // 점검모드 ON
      let url = {
        uri: check_info.url + check_info.enableValue,
        method: "PUT",
        headers: {
          "cluster-id": `${check_info.clusterId}`,
        },
        body: {
          transient: {
            cluster: {
              routing: {
                allocation: {
                  enable: "none",
                },
              },
            },
          },
        },
        json: true,
      };

      await request(url, function (err, res, body) {
        console.log("점검 모드 ON 호출", url, res.statusCode);
        if (res.statusCode === 200) {
          resultData.result = resultData.result === "error" ? "error" : "true";
          updateTaskLogger(taskId, "점검 모드가 ON 되었습니다.");
        } else {
          resultData.result = "error";
        }
      }).catch((err) => {
        throw new Error("점검모드 ON/OFF 중 에러발생 ! " + err);
      });
    } else if (enable === true) {
      // 푸는 로직
      // 점검모드 OFF
      let url = {
        uri: check_info.url + check_info.disableValue,
        method: "PUT",
        headers: {
          "cluster-id": `${check_info.clusterId}`,
        },
        body: {
          transient: {
            cluster: {
              routing: {
                allocation: {
                  enable: "all",
                },
              },
            },
          },
        },
        json: true,
      };

      await request(url, function (err, res, body) {
        console.log("점검 모드 OFF 호출", url, res.statusCode);
        if (res.statusCode === 200) {
          resultData.result = "true";
          updateTaskLogger(taskId, "점검 모드가 OFF 되었습니다.");
        } else {
          resultData.result = "error";
        }
      }).catch((err) => {
        throw new Error("점검모드 ON/OFF 중 에러발생 ! " + err);
      });

      // 동적색인 ON
      resultData.result = await setDymicEnable(taskId, enable, dymic_info);
    }

    return resultData;
  } catch (error) {
    throw new Error(error);
  }
}

export default {
  findTaskLog: async (taskId) => {
    return taskLogger[taskId];
  },
  updateTaskLog: (taskId, message, result, stop) => {
    if (message) {
      taskLogger[taskId].message =
        taskLogger[taskId].message + `\n${dateFormat(new Date())} ` + message;
    }
  
    if (result) {
      taskLogger[taskId].result = result;
    }
  
    if (stop) {
      taskLogger[taskId].stop = stop;
    }
  },
  checkCurrentWork: async (groupId, serviceType) => {
    let isEnable = true;

    // 실행중인 서비스 파악    
    Object.keys(taskLogger).forEach(function(k){
        if(taskLogger[k] !== undefined){
            if(
                taskLogger[k].groupId === groupId &&
                taskLogger[k].deployType === serviceType &&
                taskLogger[k].result === "run"
            ){
                isEnable = false;
            }
        }
    });

    return isEnable;
  },
  excuteDeployService: async (
    deployType,
    user,
    groupId,
    taskId,
    taskList,
    option,
    loopInterval
  ) => {
    let initTime = new Date();
    try {
      taskLogger[taskId] = {
        groupId: groupId,
        deployType: deployType,
        taskId: taskId,
        message: `${dateFormat(new Date())} 작업이 실행되었습니다.`,
        result: "run",
        stop: false,
      }

      // 동적색인과 점검모드 ON/OFF
      if (taskLogger[taskId].stop === false) {
        await controlDymicAndInsp(
          false,
          option["indexing"],
          option["checkMode"],
          taskId
        ).then((res) => {
          if (res.result === "error") {
            throw new Error(
              "동적색인과 점검모드 ON/OFF 중 오류가 발생했습니다 "
            );
          }
        });
      }

      // 반복문 형태 [{id : 2, name : es1}, {id : 3, name : es2}, {id : 4, name : es3}]
      if (taskLogger[taskId].stop === false) {
        for (const taskInfo of taskList) {
          if (taskLogger[taskId].stop === false) {
            let updateList = [];
            let tempName = [];

            // 업데이트 대상 선별
            Object.keys(option["service_url"]).map((name) => {
              if (taskInfo.name !== name) {
                updateList.push(option["service_url"][name]);
                tempName.push(name);
              }
            });

            await updateServiceSeed(updateList, option).then((res) => {
              if (res.result === "error") {
                throw new Error(
                  "시드 업데이트 중 오류가 발생했습니다 " + res.message + ""
                );
              } else {
                console.log( taskId,
                    "searchApi : " +
                      updateList +
                      " 시드 정보 교체 완료했습니다. [ " +
                      tempName +
                      " ] ")
                updateTaskLogger(
                  taskId,
                  "searchApi : " +
                    updateList +
                    " 시드 정보 교체 완료했습니다. [ " +
                    tempName +
                    " ] "
                );
              }
            });

            console.log(taskId,
                "[ " + taskInfo.name + " ] " + "서비스 재시작 진행합니다.");

            updateTaskLogger(
              taskId,
              "[ " + taskInfo.name + " ] " + "서비스 재시작 진행합니다."
            );

            await dockerServiceRestart(user, groupId, taskInfo.id);

            updateTaskLogger(
              taskId,
              "[ " + taskInfo.name + " ] " + "서비스 재시작 완료하였습니다."
            );

            console.log(taskId,
                "[ " + taskInfo.name + " ] " + "서비스 재시작 완료하였습니다.");
            
            updateTaskLogger(
              taskId,
              `${"[ " + taskInfo.name + " ] "}서비스 재시작 후 대기 중 (${
                option.node_ready_time_sec
              } 초) ...`
            );

            await sleep(option.node_ready_time_sec);

            // if(option["node_ready_check_uri"] && option["node_ready_check_uri"] !== ""){
            //   updateTaskLogger(taskId,  `${"[ "+ taskInfo.name + " ] "}서비스 재시작 후 대기 중 ...`);

            //   간격을 N등분하여 URL 호출
            //   for(var i = 0; i < url_check_div; i++){
            //     if(await intervalCheckUri(option['service_url'][taskInfo.name] + option["node_ready_check_uri"]) === true){
            //       break;
            //     }
            //     await sleep((option.node_ready_time_sec / url_check_div));
            //   }
            // } else {
            //   updateTaskLogger(taskId,  `${"[ "+ taskInfo.name + " ] "}서비스 재시작 후 대기 중 (${option.node_ready_time_sec} 초) ...`);
            // }
          }
        }
      }

      // 전체 시드 업데이트
      if (taskLogger[taskId].stop === false) {
        // 업데이트 대상 선별
        let allUpdateList = [];
        let allTempName = [];

        Object.keys(option["service_url"]).map((name) => {
          allUpdateList.push(option["service_url"][name]);
          allTempName.push(name);
        });

        await updateServiceSeed(allUpdateList, option).then((res) => {
          if (res.result === false) {
            throw new Error(
              "시드 업데이트 중 오류가 발생했습니다 " + res.message + ""
            );
          } else {
            updateTaskLogger(
              taskId,
              "searchApi : " +
                allUpdateList +
                " 전체 시드 정보 교체 완료했습니다." +
                "[ " +
                allTempName +
                " ] "
            );
          }
        });
      }

      // 동적색인과 점검모드 ON/OFF
      if (taskLogger[taskId].stop === false) {
        await controlDymicAndInsp(
          true,
          option["indexing"],
          option["checkMode"],
          taskId
        ).then((res) => {
          if (res.result === "error") {
            throw new Error(
              "동적색인과 점검모드 ON/OFF 중 오류가 발생했습니다 "
            );
          }
        });
      }

      // 강제종료시
      if (taskLogger[taskId].stop === true) {
        updateTaskLogger(
          taskId,
          "사용자의 요청으로 강제 중지 되었습니다.",
          "done"
        );
      }

      DeployHistoryService.newDeployHistory({
        deployTime: initTime,
        user: JSON.stringify(user),
        result: taskLogger[taskId].stop === true ? "강제 중지" : "성공",
        service: JSON.stringify(taskList),
        groupId: groupId,
        deployId: taskId,
        deployEndTime: new Date(),
        deployType: deployType,
      });

      updateTaskLogger(taskId, "작업이 완료되었습니다.", "done");
    } catch (e) {
      DeployHistoryService.newDeployHistory({
        deployTime: initTime,
        user: JSON.stringify(user),
        result: `실패`,
        service: JSON.stringify(taskList),
        groupId: groupId,
        deployId: taskId,
        deployEndTime: new Date(),
        deployType: deployType,
      });
      updateTaskLogger(
        taskId,
        textLengthOverCut("" + e) + "\n작업이 종료되었습니다.",
        "fail"
      );
    } finally {
      setTimeout(() => {
        console.log("실행후 시간이 경과해서 이 작업의 로그를 지웁니다");
        taskLogger[taskId] = undefined;
      }, loopInterval);
    }
  },
};
