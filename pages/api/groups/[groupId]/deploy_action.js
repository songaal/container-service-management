import { withSession } from "next-session";
import AuthService from "../../../../services/AuthService";
import GroupDeployHstService from "../../../../services/DeployHistoryService";
import GroupDeployService from "../../../../services/DeployService";
import GroupSvcService from "../../../../services/GroupSvcService";
import request from "request-promise-native";

const url_check_div = process.env.URL_CHECK_DIV || 10;
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

async function intervalCheckUri(es_check_url){
  let resultData = {message:"", result:"true"}
  
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

async function updateServiceSeed(updateList, option) {
  let resultData = {message:"", result:"true"}

  for(const search_api_url of option['search_api']) {
    console.log("searchApi seedupdate 호출 파라미터", search_api_url, updateList, option['target'])

    const url = {
      uri: search_api_url,
      method: 'PUT',
      body: {
        "target" : option['target'],
        "seeds" : updateList
      },
      json: true
    }

    await request(url, function(err, res, body) {
      if(err){
        resultData.message = err;
        resultData.result = "error";
      } else {
        resultData.message = body.message;
        resultData.result = body.result;
      }
    }).catch((err)=> {
      resultData.message = err.error;
      resultData.result = "error";
    })
  }

  return resultData;
}

async function controlDymicAndInsp(enable, dymic_info, check_info, taskId){
  try {
    let resultData = {result:"true"}

    if(enable === false){ // 막는 로직

      for(const dymic_info_item of dymic_info) {
        // "queue1, queue2" 한번에 처리가 안되서 스플릿 && 반복문
        let queueList = dymic_info_item.queue.replace(/(\s*)/g, "").split(",");

        // 동적색인 OFF
        for(const queue of queueList) {
          let url = {
            uri: dymic_info_item.url,
            method: 'PUT',
            body: {
              "queue" : queue,
              "size" : 0
            },
            json: true
          }
      
          await request(url, function(err, res, body) {
            if(res.statusCode === 200){
              resultData.result = "true";
              updateTaskLogger(taskId, queue + " 동적 색인 OFF 되었습니다.");
            } else {
              resultData.result = "error";
            }      
          }).catch((err)=> {
            throw new Error("동적색인 ON/OFF 중 에러발생 ! " + err);
          })
        }
      }

      // 점검모드 ON    
      let url = {
        uri: check_info.url + check_info.enableValue,
        method: 'PUT',
        headers: {
          "cluster-id": `${check_info.clusterId}`
        },
        body: {
            transient : {
                cluster : {
                    routing : {
                        allocation : {
                            enable : "none"
                        }
                    }
                }
            }
        },
        json: true
      }
  
      await request(url, function(err, res, body) {
        if(res.statusCode === 200){
          resultData.result = resultData.result === "error" ? "error" : "true";
          updateTaskLogger(taskId, "점검 모드가 ON 되었습니다.");
        } else {
          resultData.result = "error";
        }
      }).catch((err)=> {
        throw new Error("점검모드 ON/OFF 중 에러발생 ! " + err);
      })
      
    } else if(enable === true){ // 푸는 로직
      // 점검모드 OFF 
      let url = {
        uri: check_info.url + check_info.disableValue,
        method: 'PUT',
        headers: {
          "cluster-id": `${check_info.clusterId}`
        },
        body: {
            transient : {
                cluster : {
                    routing : {
                        allocation : {
                            enable : "all"
                        }
                    }
                }
            }
        },
        json: true
      }
  
      await request(url, function(err, res, body) {
        if(res.statusCode === 200){
          resultData.result = "true";
          updateTaskLogger(taskId, "점검 모드가 OFF 되었습니다.")
        } else {
          resultData.result = "error";
        }
      }).catch((err)=> {
        throw new Error("점검모드 ON/OFF 중 에러발생 ! " + err);
      })
      
      // 동적색인 ON
      for(const dymic_info_item of dymic_info) {
        // "queue1, queue2" 한번에 처리가 안되서 스플릿 && 반복문
        let queueList = dymic_info_item.queue.replace(/(\s*)/g, "").split(",");

        // 동적색인 OFF
        for(const queue of queueList) {
          let url = {
            uri: dymic_info_item.url,
            method: 'PUT',
            body: {
              "queue" : queue,
              "size" : dymic_info_item.consume_size
            },
            json: true
          }
      
          await request(url, function(err, res, body) {
            if(res.statusCode === 200){
              resultData.result = "true";
              updateTaskLogger(taskId, queue + " 동적 색인 ON 되었습니다.");
            } else {
              resultData.result = "error";
            }      
          }).catch((err)=> {
            throw new Error("동적색인 ON/OFF 중 에러발생 ! " + err);
          })
        }
      }
  
    }
    
    return resultData;

  } catch (error) {
    throw new Error(error);
  }
}

async function excuteDeployService(deployType, user, groupId, taskId, taskList, option, loopInterval) {
  let initTime = new Date();
  try {  
    createTaskLogger(groupId, deployType, taskId, `${dateFormat(new Date())} 작업이 실행되었습니다.`);

    // 동적색인과 점검모드 ON/OFF
    if(findTaskLogger(taskId).pause === false){
      await controlDymicAndInsp(false, option['indexing'], option['checkMode'], taskId).then((res)=> {
        if(res.result === "error"){
          throw new Error("동적색인과 점검모드 ON/OFF 중 오류가 발생했습니다 ");
        }
      })
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
        
          await updateServiceSeed(updateList, option).then((res)=> {
            if(res.result === "error"){
              throw new Error("시드 업데이트 중 오류가 발생했습니다 " + res.message+"");
            } else {
              updateTaskLogger(taskId, "searchApi : "+ updateList + " 시드 정보 교체 완료했습니다. [ "+ tempName + " ] ");
            }
          })
          
          updateTaskLogger(taskId, "[ "+ taskInfo.name + " ] " + "서비스 재시작 진행합니다.");

          // 서비스 재시작
          await GroupSvcService.stopServices(user, groupId, taskInfo.id);

          let stopAndHealth = await GroupSvcService.getState(groupId, taskInfo.id);

          console.log(stopAndHealth);

          await GroupSvcService.startServices(user, groupId, taskInfo.id);

          let startAndHealth = await GroupSvcService.getState(groupId, taskInfo.id);

          console.log(startAndHealth);

          updateTaskLogger(taskId, "[ "+ taskInfo.name + " ] " + "서비스 재시작 완료하였습니다.");
          updateTaskLogger(taskId,  `${"[ "+ taskInfo.name + " ] "}서비스 재시작 후 대기 중 (${option.node_ready_time} 초) ...`); 

          // if(option["node_ready_check_uri"] && option["node_ready_check_uri"] !== ""){
          //   updateTaskLogger(taskId,  `${"[ "+ taskInfo.name + " ] "}서비스 재시작 후 대기 중 ...`);

          //   간격을 N등분하여 URL 호출
          //   for(var i = 0; i < url_check_div; i++){
          //     if(await intervalCheckUri(option['service_url'][taskInfo.name] + option["node_ready_check_uri"]) === true){
          //       break;
          //     }
          //     await sleep((option.node_ready_time / url_check_div));
          //   }
          // } else {
          //   updateTaskLogger(taskId,  `${"[ "+ taskInfo.name + " ] "}서비스 재시작 후 대기 중 (${option.node_ready_time} 초) ...`);
          // }
        }
      } 
    }

    // 전체 시드 업데이트
    if(findTaskLogger(taskId).pause === false){
      // 업데이트 대상 선별
      let allUpdateList = [];
      let allTempName = [];

      Object.keys(option['service_url']).map((name) => {
        allUpdateList.push(option['service_url'][name])
        allTempName.push(name);
      });

      await updateServiceSeed(allUpdateList, option).then((res)=> {
        if(res.result === false){
          throw new Error("시드 업데이트 중 오류가 발생했습니다 " + res.message+"");
        } else {
          updateTaskLogger(taskId, "searchApi : "+ allUpdateList + " 전체 시드 정보 교체 완료했습니다." + "[ "+ allTempName + " ] ");
        }
      })
    }
    
    // 동적색인과 점검모드 ON/OFF
    if(findTaskLogger(taskId).pause === false){
      await controlDymicAndInsp(true, option['indexing'], option['checkMode'], taskId).then((res)=> {
        if(res.result === "error"){
          throw new Error("동적색인과 점검모드 ON/OFF 중 오류가 발생했습니다 ");
        }
      })  
    }

    // 강제종료 시
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
      console.log("실행후 시간이 경과해서 이 작업의 로그를 지웁니다");
      removeTaskLogger(taskId);
    }, loopInterval)
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
      } else  {
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
        }
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