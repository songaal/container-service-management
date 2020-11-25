import fs from "fs"
import path from "path";


export default {
    async getDockerComposeFilePath({serverId, groupId, serviceId}) {
        // 1. 도커파일 경로 생성
        const dockerComposeHomePath = path.join(process.env.docker_compose_root_path, String(serverId), String(groupId), String(serviceId))
        fs.mkdirSync(dockerComposeHomePath, {recursive: true});
        return dockerComposeHomePath
    },
    async cleanDockerComposeFile(dockerComposeFilePath) {
        try {
            const dockerComposeFilePath = path.join(dockerComposeFilePath, process.env.docker_compose_file_name)
            if(fs.existsSync(dockerComposeFilePath)) {
                fs.unlinkSync(dockerComposeFilePath)
            }
            console.log("old docker-compose.yml file clean")
        } catch (e) {
            // ignore
            console.log("not found yaml file")
        }
    },
    async writeDockerCompose({dockerComposeFilePath, yaml, variables}) {
        let convertYaml = String(yaml)
        for (let i = 0; i < variables.length; i++) {
            let key = variables[i]['key']
            let val = variables[i]['value']
            if (key && val) {
                convertYaml = convertYaml.replace(`\${${key}}`, val)
            } else {
                console.log("mapping fail...", key, val, dockerComposeFilePath)
            }
        }
        // 3. 도커 컴포즈 파일 생성
        fs.appendFileSync(dockerComposeFilePath, convertYaml)
        return {
            originalYaml: yaml,
            convertYaml,
        }
    },

}