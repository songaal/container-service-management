import { withSession } from "next-session";
import AuthService from "../../../../services/AuthService";
import GroupDeployHstService from "../../../../services/DeployHistoryService";
import GroupDeployService from "../../../../services/DeployService";
import GroupSvcService from "../../../../services/GroupSvcService";
import request from "request";

let taskLogger = [];
// {
//   groupId : "1" // 작업하는 그룹 아이디
//   deployType : "1" // 검색 서비스,
//   taskID : "UUID",
//   message : "로그 메시지"
//   result : "run // run - 진행중, done - 완료, fail - 실패"
//   pause : "false // 중지 여부"
// }

function createTaskLogger(groupId, deployType, taskId, msg) {
  taskLogger.push({groupId : groupId, deployType : deployType, taskId : taskId, message : msg, result : "run", pause : false});
}

function findTaskLoggerIndex(taskId) {
  let findIdx;

  taskLogger.forEach((ele, idx) => {
    if(ele.taskId !== undefined){
      if(ele.taskId === taskId){
        findIdx = idx;
      }
    }
  })

  return findIdx;
}

function removeTaskLogger(taskId) {
  let removeItemIdx = findTaskLoggerIndex(taskId);
  taskLogger.splice(removeItemIdx, 1);
}

function findTaskLogger(taskId) {
  let item;

  taskLogger.forEach(ele => {
    if(ele.taskId !== undefined){
      if(ele.taskId === taskId){
        item = ele;
      }
    }
  })

  return item;
}

function updateTaskLogger(taskId, message, result, pause) {
  let targetIdx = findTaskLoggerIndex(taskId);
  if(message){
    taskLogger[targetIdx].message = taskLogger[targetIdx].message + `\n${dateFormat(new Date())} ` + message;
  }

  if(result){
    taskLogger[targetIdx].result = result;
  }

  if(pause){
    taskLogger[targetIdx].pause = pause;
  }
}


function textLengthOverCut(txt, len, lastTxt) {
  if (len == "" || len == null) { // 기본값
      len = 350;
  }
  if (lastTxt == "" || lastTxt == null) { // 기본값
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

  month = month >= 10 ? month : '0' + month;
  day = day >= 10 ? day : '0' + day;
  hour = hour >= 10 ? hour : '0' + hour;
  minute = minute >= 10 ? minute : '0' + minute;
  second = second >= 10 ? second : '0' + second;

  return date.getFullYear() + '-' + month + '-' + day + ' ' + hour + ':' + minute + ':' + second;
}

async function checkCurrentWork(groupId, serviceType){
  let isEnable = true;
  
  // 실행중인 서비스 파악
  taskLogger.forEach((ele)=> {
    if(ele.groupId === groupId && ele.deployType === serviceType && ele.result === "run"){
      isEnable = false;  
    }
  })

  return isEnable;
}

const sleep = (delay) => new Promise((resolve) => setTimeout(resolve, delay * 1000));

async function updateServiceSeed (updateList, option) {
  option['search_api'].forEach(search_api_url => {

    console.log("searchApi 호출", search_api_url, updateList, option['target']);

    const url = {
      uri:'http://localhost:7090/managements/update-seeds',  // search_api_url
      method: 'POST',
      body: {
        "target" : option['target'],
        "seeds" : updateList
      }
    }

    request.put(url, function(err,httpResponse,body) {
      console.log("isCallback : ", err, httpResponse, body);
    })
  })
}

async function excuteDeployService(deployType, user, groupId, taskId, taskList, option, loopInterval) {
  try {
    let initTime = new Date();
    createTaskLogger(groupId, deployType, taskId, `${dateFormat(new Date())} 작업이 실행되었습니다.`);

    // 동적색인 ON/OFF
    if(findTaskLogger(taskId).pause === false){

    }
    
    // 점검모드 ON/OFF
    if(findTaskLogger(taskId).pause === false){
      
    }
    
    // 반복문 형태 [{id : 2, name : es1}, {id : 3, name : es2}, {id : 4, name : es3}]
    if(findTaskLogger(taskId).pause === false){
      for(const taskInfo of taskList) {
        if(findTaskLogger(taskId).pause === false){
          let updateList = [];
          let tempName = [];
    
          // 업데이트 대상 선별
          Object.keys(option['service_url']).map((name) => {
            if(taskInfo.name !== name){
              updateList.push(option['service_url'][name])
              tempName.push(name);
            }
          });
    
          // await updateServiceSeed(updateList, option);
          updateTaskLogger(taskId, "[ "+ tempName + " ] " + "시드 정보 교체 완료했습니다.");
          updateTaskLogger(taskId, "[ "+ taskInfo.name + " ] " + "재시작 진행합니다.");
    
          // // 서비스 재시작
          // await GroupSvcService.stopServices(user, groupId, taskInfo.id);     
          // await GroupSvcService.startServices(user, groupId, taskInfo.id)
    
          updateTaskLogger(taskId, "[ "+ taskInfo.name + " ] " + "재시작 완료하였습니다.");
    
          updateTaskLogger(taskId,  `${"[ "+ taskInfo.name + " ] "}서비스 재시작 후 대기 중 (${option.node_ready_time} 초) ...`); 
          await sleep(option.node_ready_time);
        }
      } 
    }

    // 전체 시드 업데이트
    if(findTaskLogger(taskId).pause === false){
      
    }
    
    // 동적색인 ON/OFF
    if(findTaskLogger(taskId).pause === false){
      
    }

    // 점검모드 ON/OFF
    if(findTaskLogger(taskId).pause === false){
      
    }

    // 완료 시
    if(findTaskLogger(taskId).pause === true){
      updateTaskLogger(taskId, "사용자의 요청으로 강제 중지 되었습니다.", "done");  
    }

    GroupDeployHstService.newDeployHistory({
      deployTime: initTime,
      user: JSON.stringify(user),
      result: findTaskLogger(taskId).pause === true ? "강제 중지" : "성공",
      service: JSON.stringify(taskList),
      groupId: groupId,
      deployId: taskId,
      deployEndTime: new Date(),
      deployType: deployType
    });

    updateTaskLogger(taskId, "작업이 완료되었습니다.", "done");
  } catch (e){
    GroupDeployHstService.newDeployHistory({
      deployTime: initTime,
      user: JSON.stringify(user),
      result: `실패`,
      service: JSON.stringify(taskList),
      groupId: groupId,
      deployId: taskId,
      deployEndTime: new Date(),
      deployType: deployType
    });
    updateTaskLogger(taskId, textLengthOverCut(""+e) + ("\n작업이 종료되었습니다."), "fail");
  } finally {
    setTimeout(() => {
      removeTaskLogger(taskId);
    }, loopInterval * 2)
  }
}


async function groupsServiceDeploy(req, res) {
  res.statusCode = 200;
  res.setHeader("Content-Type", "application/json");
  await AuthService.validate(req, res);

  try {
    const groupId = req.query["groupId"];
    const user = req.session.auth.user;

    if (req.method === "GET") {
      if(req.query["taskId"]){
        res.send({
          status: "success",
          taskId: req.query["taskId"],
          taskLogger: taskLogger
        });
      } else if (req.query["serviceType"]){
        res.send({
          status : "success",
          enable : await checkCurrentWork(groupId, req.query["serviceType"])
        })
      } else {
        res.send({
          status: "success",
          histories: await GroupDeployHstService.findDeployHistory(groupId),
          json: await GroupDeployService.findDeploy(groupId),
        });
      }
    } else if (req.method === "POST") {
      const body = JSON.parse(req.body);

      if (body.type === "history") {
        res.send({
          status: "success",
          histories: await GroupDeployHstService.newDeployHistory(body),
        });
      } else if (body.type === "deployJson") {
        body["groupId"] = groupId;

        const isExist = await GroupDeployService.findExistDeploy(
          body["groupId"],
          body["deploy_type"]
        );

        if (isExist) {
          res.send({
            status: "success",
            json: await GroupDeployService.updateDeploy(body),
          });
        } else {
          res.send({
            status: "success",
            json: await GroupDeployService.newDeploy(body),
          });
        }ㄴ
      }
    } else if (req.method === "PUT") {
      const body = JSON.parse(req.body);

      // 검색서비스 배포
      if(body.serviceType === "1"){
        excuteDeployService(body.serviceType, user, groupId, body.taskId, body.taskList, body.option, body.loopInterval);

        res.send({
          status: "success",
          taskId: body.taskId
        });
      } 
      else if(body.serviceType === "pause"){
        updateTaskLogger(body.taskId, undefined, undefined, true);

        console.log("pause service", findTaskLogger(body.taskId));

        res.send({
          status: "success",
          taskId: body.taskId
        });
      }
    }
  } catch (error) {
    res.send({
      status: "error",
      message: textLengthOverCut(""+error)
    });
  }
}

export default withSession(groupsServiceDeploy);