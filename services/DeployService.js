const fetch = require("isomorphic-unfetch");
import GroupSvcService from "./GroupSvcService";
import DeployHistoryService from "./DeployHistoryService";

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
    if(option["update_delay_sec"]){
      console.log("업데이트 후 대기중 "+ option["update_delay_sec"] + "초" + dateFormat(new Date()));
      await sleep(option["update_delay_sec"]);
    } else {
      console.log("업데이트 후 대기중 "+ " 10초" + dateFormat(new Date()));
      await sleep(10);
    }

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
    
    updateTaskLogger(taskId,  `${"[ "+ taskInfo.name + " ] "}서비스 재시작 후 대기 중 ...`);    
    if(option["node_ready_check_uri"]){
      const url_check_div = option["node_ready_check_div"] || 10; 
      // 설정한 간격으로 시간 간격을 나누어 URL 호출한다.
      for(var i = 0; i < url_check_div; i++){
        console.log(option['node_ready_time_sec'] / url_check_div + " 초 대기 중");
        await sleep(option['node_ready_time_sec'] / url_check_div);   
        if(await intervalCheckUri(option['service_url'][taskInfo.name] + option["node_ready_check_uri"])){
          console.log("사전 로딩 완료");
          break;
        } else if(i === url_check_div - 1){
          // 마지막까지 반복문을 못빠져나갔을경우 에러로 처리한다.
          updateTaskLogger(
            taskId,
            "[ " + taskInfo.name + " ] " + "서비스가 시작 되지않아 작업을 중지합니다",
            "stop",
            true
          );
          updateTaskHistory(taskId, "실패");
        }
      }
    } else {
      await sleep(option.node_ready_time_sec);
    }      
  } catch (e) {
    updateTaskLogger(
      taskId,
      e,
      "fail",
      true
    );
  }
}

async function intervalCheckUri(es_check_url) {
  try {
    console.log("es_check_url 호출 : ", es_check_url);
    let result = false;
    let res = await fetch(es_check_url); 
    let body = await res.json();

    console.log("ES 사전 로딩 여부 (dict.loaded)", body.loaded);
    result = body.loaded
    return result;
  } catch (e){
    console.log(e);
    console.log("ES 사전 로딩 여부 (dict.loaded)", false);
  } 
}

const sleep = (delay) =>
  new Promise((resolve) => setTimeout(resolve, delay * 1000));

async function updateServiceSeed(option, selectAll, taskInfo, taskId) {
  let updateList = [];
  let tempName = [];

  try {
     // 업데이트 대상 선별
    Object.keys(option["service_url"]).map((name) => {
      if (selectAll || (selectAll === false && taskInfo.name !== name)) {
        updateList.push(option["service_url"][name]);
        tempName.push(name);
      }
    });

    for (const search_api_url of option["search_api"]) {
      const seed_option = {
        method: "PUT",
        headers: {
          'Content-Type': 'application/json;charset=UTF-8'
        },
        body: JSON.stringify({
          target: option["target"],
          seeds: updateList,
        })
      };

      console.log("searchApi 호출 :", search_api_url);

      let res = await fetch(search_api_url, seed_option);
      if(res.status === 200){
        console.log( taskId,
          "searchApi : " +
            updateList +
            " 시드 정보 교체 완료했습니다. [ " +
            tempName +
            " ] ")
              
        updateTaskLogger(
          taskId,
          "searchApi : " + search_api_url + " " +
            updateList +
            " 시드 정보 교체 완료했습니다. [ " +
            tempName +
            " ] "
        );
      }
    }
  } catch (e){
    console.log("error", e);
    updateTaskLogger(
      taskId,
      "searchApi : " +
        updateList +
        " 시드 정보 교체 실패했습니다. [ " +
        tempName +
        " ] " + textLengthOverCut(e + "")
    );
  }
}

async function setDynamicEnable(taskId, enable, dymic_info){
  try {
    for (const dymic_enable_url of dymic_info) {
      // 동적색인 ON, OFF
      let option = {
        method: "PUT",
        headers: {
          'Content-Type': 'application/json;charset=UTF-8'
        },
        body: JSON.stringify({
            enable: enable
        })
      };
      let res = await fetch(dymic_enable_url, option)
      console.log("동적 색인 ON/OFF 호출", dymic_enable_url, res.status);
      if (res.status === 200) {
        updateTaskLogger(taskId, "큐 인덱서 [ "+ dymic_enable_url + " ] 동적 색인 "+ (enable ? "ON" : "OFF") +" 되었습니다.");
        return "success";
      } else {
        return "error";
      }
    }
  } catch (err){
    console.log(err);
    updateTaskLogger(
      taskId,
      textLengthOverCut(err + ""),
      "fail"
    );
    throw new Error("동적색인 ON/OFF 중 에러발생 ! " + err);
  }
}

async function setInspectEnable(taskId, enable, check_info){
  try {
    // 점검모드 ON, OFF
    let url = check_info.url + (enable ? check_info.disableValue : check_info.enableValue);
    let res = await fetch(url, {
      method: "PUT",
      headers: {
        "cluster-id": `${check_info.clusterId}`
      }
    })
    if (res.status == 200) {
      console.log("점검 모드 ON/OFF 호출", url, res.status);
      updateTaskLogger(taskId, "점검 모드가 "+ (enable ? "OFF" : "ON") +" 되었습니다.");
      return "success";
    } else {
      return "error";
    }      
  } catch (err){
    updateTaskLogger(
      taskId,
      textLengthOverCut(err + ""),
      "fail"
    );
    throw new Error("점검모드 ON/OFF 중 에러발생 ! " + err);
  }
}


// false => 동적색인 OFF, 점검모드 ON, true는 반대
async function controlDymicAndInsp(enable, dymicParams, InspParams, taskId) {
  try {
    let resultData = { result: "true" };

    if (enable === false) {
      resultData.result = await setDynamicEnable(taskId, enable, dymicParams);
      resultData.result = await setInspectEnable(taskId, enable, InspParams);
    } else if (enable === true) {
      resultData.result = await setInspectEnable(taskId, enable, InspParams);
      resultData.result = await setDynamicEnable(taskId, enable, dymicParams);
    }

    return resultData;
  } catch (error) {
    updateTaskLogger(
      taskId,
      textLengthOverCut(error + ""),
      "fail"
    );
    throw new Error(error);
  }
}

async function restartContainer(taskId, taskList, option, user, groupId){
  try {
    for (const taskInfo of taskList) {
      if (taskLogger[taskId].stop === false) {
        // 시드 업데이트
        await updateServiceSeed(option, false, taskInfo, taskId);
        await dockerServiceRestart(user, groupId, taskInfo, option, taskId);
      }
    }
    
    // 전체 시드 업데이트
    if (taskLogger[taskId].stop === false) {
      await updateServiceSeed(option, true, {name:null}, taskId);
    }
  } catch (e){
    throw new Error("서비스 재시작시 에러 발생!");  
  }
}

 async function initTask(deployType, user, groupId, taskId, taskList, initTime, result) {
  taskLogger[taskId] = {
    groupId: groupId,
    deployType: deployType,
    taskId: taskId,
    message: `${dateFormat(new Date())} 작업이 실행되었습니다.`,
    result: "run",
    stop: false,
  }

  DeployHistoryService.newDeployHistory({
    deployTime: initTime,
    user: JSON.stringify(user),
    result: result,
    service: JSON.stringify(taskList),
    groupId: groupId,
    deployId: taskId,
    deployEndTime: new Date(),
    deployType: deployType,
  });
}

async function updateTaskHistory (taskId, status) {
  DeployHistoryService.updateDeployHistoryStatus(taskId, status)
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
    await initTask(deployType, user, groupId, taskId, taskList, initTime, "진행");

    try {
      // 동적색인과 점검모드 ON/OFF
      if (taskLogger[taskId].stop === false) {
        await controlDymicAndInsp(false, option["indexing"], option["checkMode"], taskId)
      }

      // 시드 업데이트와 컨테이너 재시작
      if (taskLogger[taskId].stop === false) {
        await restartContainer(taskId, taskList, option, user, groupId);
      }

      // 동적색인과 점검모드 ON/OFF
      if (taskLogger[taskId].stop === false) {
        await controlDymicAndInsp(true, option["indexing"], option["checkMode"], taskId);
      }

      // 강제종료시
      if (taskLogger[taskId].stop === true) {
        updateTaskLogger(taskId, "강제 중지 되었습니다.", "done");

        // enable 처리
        await controlDymicAndInsp(true, option["indexing"], option["checkMode"], taskId)
        await updateTaskHistory(taskId, "강제종료");
      }

      if (taskLogger[taskId].stop === false) {
        updateTaskLogger(taskId, "작업이 완료되었습니다.", "done");
        await updateTaskHistory(taskId, "성공");
      }
    } catch (e) {
      await updateTaskHistory(taskId, `실패`);

      // enable 처리
      await controlDymicAndInsp(true, option["indexing"], option["checkMode"], taskId)

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
