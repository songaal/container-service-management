const { Deploy, DeployHistory } = require("../models");

export default {
  newDeploy: async (deploy) => {
    try {
        let registerDep = await Deploy.create(deploy);
        return {
            status: "success",
            deploy: registerDep
        }
    } catch (e) {
        console.log(e)
        return {
            status: "error",
            message: "에러가 발생하였습니다."
        }
    }
  }, 
  findDeploy: async (groupId) => {
      console.log("  findDeploy", groupId);
      return await Deploy.findAll({where: {groupId: groupId}})
  },
  findExistDeploy: async (groupId, deploy_type) => {
      return await Deploy.findOne({where: {groupId: groupId, deploy_type: deploy_type}})
  },
  updateDeploy:  async (deploy) => {
      await Deploy.update({
          deploy_json: deploy.deploy_json
      }, {
          where: {
              groupId: deploy.groupId,
              deploy_type: deploy.deploy_type
          }
      })
  },
  removeDeploy: async () => {
      await Deploy.destroy({where: {groupId: "1"}})
  },
  newDeployHistory: async (history) => {
    try {
      let registerHst = await DeployHistory.create(history);
      return {
        status: "success",
        deployHistory: registerHst,
      };
    } catch (e) {
      console.log(e);
      return {
        status: "error",
        message: "에러가 발생하였습니다.",
      };
    }
  },
  findDeployHistory: async (groupId) => {
    return await DeployHistory.findAll({
      where: { groupId: groupId },
      order: [
        ["deployTime", "DESC"],
        ["id", "DESC"],
      ],
    });
  },
  removeDeployHistory: async () => {
    await DeployHistory.destroy();
  },
};
