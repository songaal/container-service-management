



sequelize model:create --name user      --attributes user_id:string,name:string,password:string,admin:boolean

sequelize model:create --name group     --attributes name:string,description:string

sequelize model:create --name service   --attributes group_id:string,server_id:string,name:string,pid_cmd:string,start_script:string,stop_script:string,yaml:string

sequelize model:create --name variable   --attributes service_id:string,key:string,value:string,type:string

sequelize model:create --name server    --attributes name:string,user:string,password:string,ip:string,port:string

sequelize model:create --name group_server --attributes server_id:string,group_id:string

sequelize model:create --name group_auth --attributes user_id:string,group_id:string

