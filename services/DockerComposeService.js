import fs from "fs"
import path from "path";


export default {
    async getDockerComposeFilePath({serverId, groupId, serviceId}) {
        // 1. 도커파일 경로 생성
        const dockerComposeRootPath = process.env.docker_compose_root_path
        const dockerComposeName = process.env.docker_compose_file_name
        const dockerComposeHomePath = path.join(dockerComposeRootPath, String(serverId), String(groupId), String(serviceId))
        const dockerComposeFilePath = path.join(dockerComposeHomePath, dockerComposeName)

        fs.mkdirSync(dockerComposeHomePath, {recursive: true});
        return dockerComposeFilePath
    },
    async cleanDockerComposeFile(dockerComposeFilePath) {
        try {
            if(fs.existsSync(dockerComposeFilePath)) {
                fs.unlinkSync(dockerComposeFilePath)
            }
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