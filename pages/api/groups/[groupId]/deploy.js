import { withSession } from 'next-session';
import AuthService from "../../../../services/AuthService";
import GroupDeployHstService from "../../../../services/DeployHistoryService";
import GroupDeployService from "../../../../services/DeployService";


async function groupsService(req, res) {
    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json')
    await AuthService.validate(req, res);

    try {
        const groupId = req.query['groupId'];

        if (req.method === "GET") {
            res.send({
                status: "success",
                histories: await GroupDeployHstService.findDeployHistory(groupId),
                json: await GroupDeployService.findDeploy(groupId)
            })
        } else if(req.method === "POST"){
            const body = JSON.parse(req.body);

            if(body.type === "history"){
                res.send({
                    status: "success",
                    histories: await GroupDeployHstService.newDeployHistory(body)
                })    
            } else if(body.type === "deployJson"){
                body['groupId'] = groupId;

                const isExist = await GroupDeployService.findExistDeploy(body['groupId'], body['deploy_type']);

                if(isExist){
                    res.send({
                        status: "success",
                        json: await GroupDeployService.updateDeploy(body)
                    })
                } else {
                    res.send({
                        status: "success",
                        json: await GroupDeployService.newDeploy(body)
                    })
                }
            }
        }
    } catch (error) {
        console.error(error);
        res.send({
            status: "error",
            message: "에러가 발생하였습니다.",
            error: JSON.stringify(error)
        })
    }
}

export default withSession(groupsService)