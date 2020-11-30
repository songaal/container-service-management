import path from "path";
import fs from "fs";
const yaml = require('js-yaml');

const dockerComposeHomePath = process.env['docker_compose_home_path']
const dockerComposeName = process.env['docker_compose_file_name']

const deleteFolderRecursive = function(path) {
    if( fs.existsSync(path) ) {
        fs.readdirSync(path).forEach(function(file,index){
            let curPath = path + "/" + file;
            if(fs.statSync(curPath).isDirectory()) { // recurse
                deleteFolderRecursive(curPath);
            } else { // delete file
                fs.unlinkSync(curPath);
            }
        });
        fs.rmdirSync(path);
    }
}

export default {
    getHomePath() {
        return dockerComposeHomePath
    },
    async deleteFolderRecursive(path) {
        await deleteFolderRecursive(path)
    },
    async getDockerComposeServicePath({groupId, serviceId}) {
        const dockerComposeServicePath = path.join(dockerComposeHomePath, String(groupId), String(serviceId))
        await fs.mkdirSync(dockerComposeServicePath, {recursive: true});
        return dockerComposeServicePath
    },
    async getDockerComposeFilePath({groupId, serviceId}) {
        return path.join(dockerComposeHomePath, String(groupId), String(serviceId), dockerComposeName)
    },
    async cleanDockerComposeFile(dockerComposeServicePath) {
        try {
            const isExists = await fs.existsSync(dockerComposeServicePath)
            if(isExists) {
                await deleteFolderRecursive(dockerComposeServicePath)
            }
        } catch (e) {
            // ignore
            console.log("clean fail", e)
        }
    },
    async writeDockerCompose({dockerComposeServicePath, yaml, variables}) {
        let convertYaml = String(yaml||"")
        for (let i = 0; i < variables.length; i++) {
            let key = variables[i]['key']
            let val = variables[i]['value']
            let replaceKey = "${" + key + "}"
            while (convertYaml.includes(replaceKey)) {
                convertYaml = convertYaml.replace(replaceKey, String(val||""))
            }
        }
        const dockerFilePath = path.join(dockerComposeServicePath, dockerComposeName)
        await fs.mkdirSync(dockerComposeServicePath, {recursive: true});
        await fs.appendFileSync(dockerFilePath, convertYaml)
        return {
            originalYaml: yaml,
            convertYaml,
        }
    },
    async getServiceNameList({groupId, serviceId}) {
        const path = await this.getDockerComposeFilePath({groupId, serviceId})
        const contents = yaml.safeLoad(fs.readFileSync(path, 'utf8'));
        let result = []
        try {
            result = Object.keys(contents['services'])
        } catch (err) {
            console.error(err)
        }
        return result
    }
}