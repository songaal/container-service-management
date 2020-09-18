'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    /**
     * Add seed commands here.
     *
     * Example:
     * await queryInterface.bulkInsert('People', [{
     *   name: 'John Doe',
     *   isBetaMember: false
     * }], {});
    */
    await queryInterface.bulkInsert('users', [
      {
        id: 1, createdAt: new Date(), updatedAt: new Date(),
        userId: "admin@example.com", name: "관리자", admin: true,
        password: "$2a$12$KFcxKcSBknVnI3PNkCpmke3ohpLLYHEK5pCFRnGu1nF0Jvp5M1jqa"
      }
    ]);

    await queryInterface.bulkInsert('groups', [
      {
        id: 1, createdAt: new Date(), updatedAt: new Date(),
        name: "샘플", description: "도커와 서버기반 하이브리드 PC웹서버 입니다."
      }
    ]);
    await queryInterface.bulkInsert('group_auths', [
      {
        id: 1, createdAt: new Date(), updatedAt: new Date(),
        userId: "1", groupId: 1
      }
    ]);


  },

  down: async (queryInterface, Sequelize) => {
    /**
     * Add commands to revert seed here.
     *
     * Example:
     * await queryInterface.bulkDelete('People', null, {});
     */
  }
};
