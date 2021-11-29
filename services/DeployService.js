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

async function dockerServiceRestart(user, groupId, taskInfo, option, taskId) {    
  try {
    console.log(taskId,
      "[ " + taskInfo.name + " ] " + "서비스 재시작 진행합니다.");

    updateTaskLogger(
      taskId,
      "[ " + taskInfo.name + " ] " + "서비스 재시작 진행합니다."
    );


     // 서비스 재시작
    await GroupSvcService.stopServices(user, groupId, taskInfo.id);
    await GroupSvcService.startServices(user, groupId, taskInfo.id);

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

async function updateServiceSeed(option, selectAll, taskInfo, taskId) {
  let resultData = { message: "", result: "true" };
  let updateList = [];
  let tempName = [];

  // 업데이트 대상 선별
  Object.keys(option["service_url"]).map((name) => {
    if (selectAll || (selectAll === false && taskInfo.name !== name)) {
      updateList.push(option["service_url"][name]);
      tempName.push(name);
    }
  });

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

  return resultData;
}

async function setDymicEnable(taskId, enable, dymic_info){
  for (const dymic_enable_url of dymic_info) {
    // 동적색인 ON, OFF
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
        return "success";
      } else {
        return "error";
      }
    }).catch((err) => {
      updateTaskLogger(
        taskId,
        textLengthOverCut(err + ""),
        "fail"
      );

      throw new Error("동적색인 ON/OFF 중 에러발생 ! " + err);
    });
  }
}

async function setInspEnable(taskId, enable, check_info){
  // 점검모드 ON, OFF
  let url = {
    uri: check_info.url + (enable ? check_info.disableValue : check_info.enableValue),
    method: "PUT",
    headers: {
      "cluster-id": `${check_info.clusterId}`
    },
    json: true,
  };

  await request(url, function (err, res, body) {
    console.log("점검 모드 ON/OFF 호출", url, res.statusCode);
    if (res.statusCode === 200) {
      updateTaskLogger(taskId, "점검 모드가 "+ (enable ? "OFF" : "ON") +" 되었습니다.");
      return "success";
    } else {
      return "error";
    }
  }).catch((err) => {
    throw new Error("점검모드 ON/OFF 중 에러발생 ! " + err);
  });
}


// false => 동적색인 OFF, 점검모드 ON, true는 반대
async function controlDymicAndInsp(enable, dymic_info, check_info, taskId) {
  try {
    let resultData = { result: "true" };

    if (enable === false) {
      resultData.result = await setDymicEnable(taskId, enable, dymic_info);
      resultData.result = await setInspEnable(taskId, enable, check_info);
    } else if (enable === true) {
      resultData.result = await setInspEnable(taskId, enable, check_info);
      resultData.result = await setDymicEnable(taskId, enable, dymic_info);
    }

    return resultData;
  } catch (error) {
    throw new Error(error);
  }
}

async function restartContainer(taskId, taskList, option, user, groupId){
  for (const taskInfo of taskList) {
    if (taskLogger[taskId].stop === false) {
      // 시드 업데이트
      await updateServiceSeed(option, false, taskInfo, taskId).then((res) => {
        if (res.result === "error") {
          throw new Error(
            "시드 업데이트 중 오류가 발생했습니다 " + res.message + ""
          );
        }
      });

      await dockerServiceRestart(user, groupId, taskInfo, option, taskId);

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
  
  // 전체 시드 업데이트
  if (taskLogger[taskId].stop === false) {
    await updateServiceSeed(option, true, {name:null}, taskId).then((res) => {
      if (res.result === false) {
        throw new Error(
          "시드 업데이트 중 오류가 발생했습니다 " + res.message + ""
        );
      }
    });
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

      // 시드 업데이트와 컨테이너 재시작
      if (taskLogger[taskId].stop === false) {
        await restartContainer(taskId, taskList, option, user, groupId);
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

        // enable 처리
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

      if (taskLogger[taskId].stop === false) {
        updateTaskLogger(taskId, "작업이 완료되었습니다.", "done");
      }
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
      
      // enable 처리
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
