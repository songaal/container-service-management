const { DeployHistory } = require("../models");

export default {
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
