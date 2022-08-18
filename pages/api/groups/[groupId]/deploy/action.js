import { withSession } from "next-session";
import AuthService from "../../../../../services/AuthService";
import DeployService from "../../../../../services/DeployService";

async function groupsServiceDeployAction(req, res) {
  res.statusCode = 200;
  res.setHeader("Content-Type", "application/json");
  await AuthService.validate(req, res);

  try {
    const groupId = req.query["groupId"];
    const user = req.session.auth.user;

    if (req.method === "GET") {
      if(req.query["taskId"]){
        return res.send({
          status: "success",
          taskId: req.query["taskId"],
          taskLogger: await DeployService.findTaskLog(req.query["taskId"]) 
        });
      } else if (req.query["serviceType"]){
        return res.send({
          status : "success",
          enable : await DeployService.checkCurrentWork(groupId, req.query["serviceType"])
        })
      }
    } else if (req.method === "PUT") {
      const body = JSON.parse(req.body);

      // 검색서비스 배포
      if(body.serviceType === "1"){
        DeployService.excuteDeployService(body.serviceType, user, groupId, body.taskId, body.taskList, body.option, body.loopInterval);

        return res.send({
          status: "success",
          taskId: body.taskId
        });
      } 
      else if(body.serviceType === "stop"){
        DeployService.updateTaskLog(body.taskId, undefined, undefined, true);

        console.log("stop service", DeployService.findTaskLog(body.taskId));

        return res.send({
          status: "success",
          taskId: body.taskId
        });
      }
    }
  } catch (error) {
    return res.send({
      status: "error",
      message: ""+error
    });
  }
}

export default withSession(groupsServiceDeployAction);