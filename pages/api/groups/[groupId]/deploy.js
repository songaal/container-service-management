import { withSession } from 'next-session';
import AuthService from "../../../../services/AuthService";
import GroupDeployHstService from "../../../../services/DeployHistoryService";
import GroupDeployService from "../../../../services/DeployService";


async function groupsService(req, res) {
    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json')
    await AuthService.validate(req, res);

    try {
        if (req.method === "GET") {
            res.send({
                status: "success",
                histories: await GroupDeployHstService.findAllDeployHistory(),
                jsonAndType: await GroupDeployService.findDeploy()
            })
        } else if(req.method === "POST"){
            console.log(req.body);
            if(req.body.type === "history"){
                res.send({
                    status: "success",
                    histories: await GroupDeployHstService.newDeployHistory(JSON.parse(req.body))
                })    
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