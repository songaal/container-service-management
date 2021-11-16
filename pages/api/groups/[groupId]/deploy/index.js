import { withSession } from "next-session";
import AuthService from "../../../../../services/AuthService";
import GroupDeployHstService from "../../../../../services/DeployHistoryService";

async function groupsServiceDeploy(req, res) {
  res.statusCode = 200;
  res.setHeader("Content-Type", "application/json");
  await AuthService.validate(req, res);

  try {
    const groupId = req.query["groupId"];

    if (req.method === "GET") {
        res.send({
          status: "success",
          histories: await GroupDeployHstService.findDeployHistory(groupId),
          json: await GroupDeployHstService.findDeploy(groupId),
        });
    } else if (req.method === "POST") {
      const body = JSON.parse(req.body);

      if (body.type === "history") {
        res.send({
          status: "success",
          histories: await GroupDeployHstService.newDeployHistory(body),
        });
      } else if (body.type === "deployJson") {
        body["groupId"] = groupId;

        const isExist = await GroupDeployHstService.findExistDeploy(
          body["groupId"],
          body["deploy_type"]
        );

        if (isExist) {
          res.send({
            status: "success",
            json: await GroupDeployHstService.updateDeploy(body),
          });
        } else {
          res.send({
            status: "success",
            json: await GroupDeployHstService.newDeploy(body),
          });
        }
      }
    }
  } catch (error) {
    res.send({
      status: "error",
      message: error
    });
  }
}

export default withSession(groupsServiceDeploy);