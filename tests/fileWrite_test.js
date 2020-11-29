const yaml = require('js-yaml');
const fs = require("fs")
const path = require("path")
const compose = require('docker-compose')

const dockerComposeYaml = `version: "3.7"
services:
  image: \${image}
  ports:
  - \${port}:80`
const variables = [{key: "image", value: "nginx"}, {key: "image1", value: "nginx"}, {key: "port", value: "8080"}]



async function newDockerComposeFile({serverId, groupId, serviceId, yaml, variables}) {

    // 1. 도커파일 경로 생성
    const rootPath = "D:\\docker-compose-files"
    const dockerComposeName = "docker-compose.yml";
    const dockerComposeHomePath = path.join(rootPath, String(serverId), String(groupId), String(serviceId))
    const dockerComposeFilePath = path.join(dockerComposeHomePath, dockerComposeName)
    fs.mkdirSync(dockerComposeHomePath, {recursive: true});

    // 2. 도커 컴포즈 파일 삭제(clean)
    if(fs.existsSync(dockerComposeFilePath)) {
        fs.unlink(dockerComposeFilePath, function (err) {})
    }

    // 3. 변수 맵핑
    let convertYaml = String(dockerComposeYaml)
    for (let i = 0; i < variables.length; i++) {
        let key = variables[i]['key']
        let val = variables[i]['value']
        if (key && val) {
            convertYaml = convertYaml.replace(`\${${key}}`, val)
        } else {
            console.log("mapping fail...", key, val, serverId, groupId, serviceId, dockerComposeYaml, variables)
        }
    }

    // 3. 도커 컴포즈 파일 생성
    fs.appendFileSync(dockerComposeFilePath, convertYaml)

    return {
        dockerComposeFilePath,
        originalYaml: dockerComposeYaml,
        convertYaml,
    }
}

async function getPath({serverId, groupId, serviceId}) {
    // 1. 도커파일 경로 생성
    const rootPath = "D:\\docker-compose-files"
    return path.join(rootPath, String(serverId), String(groupId), String(serviceId))
}


async function run({serverId, groupId, serviceId}) {
    try {
        const path = await getPath({serverId, groupId, serviceId})
        console.log('path', path)
        //
        // const result = await compose.upAll({ cwd: path, log: false, config: 'docker-compose.yml' });
        // console.log('result', result)


        console.log(await compose.down({
            cwd: path,
            log: false,
            env: { DOCKER_HOST: "kube1.danawa.io:30200" }
        }))


        // console.log(await compose.upAll({
        //     cwd: path,
        //     log: false,
        //     env: { DOCKER_HOST: "kube1.danawa.io:30200" }
        // }));
    } catch (err) {
        console.log('err >>', err)
    }
}


new Promise((resolve, reject) => {
    (async () => {
        try {
            // await newDockerComposeFile({serverId: 2, groupId: 1, serviceId: 33, variables, dockerComposeYaml})
            const doc = yaml.safeLoad(fs.readFileSync("C:\\TEST_HOME\\danawa\\data\\4\\25\\docker-compose.yml", 'utf8'));
            Object.keys(doc['services'])
            console.log(doc);

        } catch(err) {
            reject(err)
        }
    })()
})


