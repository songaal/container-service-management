



sequelize model:create --name user      --attributes userId:string,name:string,password:string,admin:boolean

sequelize model:create --name group     --attributes name:string,description:string

sequelize model:create --name service   --attributes groupId:string,serverId:string,name:string,pidCmd:string,startScript:string,stopScript:string,yaml:string

sequelize model:create --name variable   --attributes serviceId:string,key:string,value:string,type:string

sequelize model:create --name server    --attributes type:string,name:string,user:string,password:string,ip:string,port:string

sequelize model:create --name group_server --attributes serverId:string,groupId:string

sequelize model:create --name group_auth --attributes userId:string,groupId:string

