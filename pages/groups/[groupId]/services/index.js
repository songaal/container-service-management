import React from 'react';
import Container from '@material-ui/core/Container';
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';
import Header from "../../../../components/Header";
import {Box, FormControl, MenuItem, Select, TextField} from "@material-ui/core";
import CssBaseline from "@material-ui/core/CssBaseline";
import {makeStyles} from '@material-ui/core/styles';
import Button from '@material-ui/core/Button';
import Radio from '@material-ui/core/Radio';
import RadioGroup from '@material-ui/core/RadioGroup';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemSecondaryAction from '@material-ui/core/ListItemSecondaryAction';
import IconButton from '@material-ui/core/IconButton';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import AddBoxIcon from '@material-ui/icons/AddBox';
import IndeterminateCheckBoxIcon from '@material-ui/icons/IndeterminateCheckBox';
import dynamic from 'next/dynamic'
const AceEditor = dynamic(import("react-ace"), {ssr: false})
// dynamic(import("ace-builds/src-noconflict/mode-yaml"), {ssr: false})
// dynamic(import("ace-builds/src-noconflict/theme-kuroir"), {ssr: false})
import {OptionsObject, SnackbarMessage, SnackbarProvider, useSnackbar} from 'notistack';
import fetch from "isomorphic-unfetch"
import {useRouter} from "next/router";

const useStyles = makeStyles( theme => ({
    root: {
        flexGrow: 1,
        width: '100%',
        backgroundColor: theme.palette.background.paper,
    },
    select: {
        minWidth: 210
    },
    label: {
        marginRight: 20,
        marginTop: 10,
        textAlign: "center"
    }
}));

// function generate(element) {
//     return [0, 1].map((value) =>
//         React.cloneElement(element, {
//             key: value,
//         }),
//     );
// }

function Services() {
    const classes = useStyles();
    const router = useRouter();
    const { enqueueSnackbar, closeSnackbar } = useSnackbar();
    const [servers, setServers] = React.useState([]);

    const [name, setName] = React.useState("")
    const [server, setServer] = React.useState('-1');
    const [type, setType] = React.useState('container');
    const [invalid, setInvalid] = React.useState({})

    // 컨테이너
    const [variables, setVariables] = React.useState([{}]);
    const [yaml, setYaml] = React.useState("");
    const [dockerPort, setDockerPort] = React.useState("2375");
    // 프로세스
    const [pidCmd, setPidCmd] = React.useState("");
    const [startScript, setStartScript] = React.useState("");
    const [stopScript, setStopScript] = React.useState("");
    const [logFiles, setLogFiles] = React.useState([{}]);

    const { groupId } = router.query

    React.useEffect(() => {
        init()
    }, [])

    const init = () => {
        fetch(`/api/groups/${groupId}/servers`)
            .then(res => res.json())
            .then(body => {
                let tmp = [{id: "-1", name: "선택안함"}]
                if (body['status'] === 'success') {
                    tmp = tmp.concat(body['servers'])
                }
                setServers(tmp)
            })
    }

    const handleAddService = () => {
        setInvalid({})
        let tmpInvalid = {}
        if(name.trim() === "") {
            tmpInvalid['name'] = "이름을 입력해주세요."
        }

        // if (type === "container") {
        //     if (dockerComposeYml.trim() === "") {
        //         tmpInvalid['dockerComposeYml'] = "도커 컴포즈를 입력하세요."
        //     }
        // } else if (type === "process") {
        //     if(pidCmd.trim() === "") {
        //         tmpInvalid['pidCmd'] = "PID 조회 명령어를 입력하세요."
        //     }
        //     if (startScript.trim() === "") {
        //         tmpInvalid['startScript'] = "시작스크립트를 입력하세요."
        //     }
        //     if (stopScript.trim() === "") {
        //         tmpInvalid['stopScript'] = "종료스크립트를 입력하세요."
        //     }
        // }

        if (Object.keys(tmpInvalid).length > 0) {
            setInvalid(tmpInvalid)
            return false
        }

        fetch(`/api/groups/${groupId}/services`, {
            method: "POST",
            body: JSON.stringify({
                name, server, type,
                variables: variables.filter(variable => variable['key'] && variable['value']),
                yaml, dockerPort,
                pidCmd, startScript, stopScript,
                logFiles: logFiles.filter(logFile => logFile['key'] && logFile['value']),
            })
        })
            .then(res => res.json())
            .then(body => {
                if (body['status'] === 'success') {
                    enqueueSnackbar("서비스를 등록하였습니다.", {variant: "success"})
                    router.replace(`/groups/${groupId}`)
                } else {
                    enqueueSnackbar("서비스 등록 실패하였습니다.", {variant: "error"})
                }
            })
    }

    return (
        <Box className={classes.root}>
            <CssBaseline />
            <Header  active={1} />

            <Container maxWidth={"xl"}>
                <br/>
                <Grid container>
                    <Grid item xs={6}>
                        <Box>
                            <Typography variant="h4" gutterBottom>
                                서비스 추가
                            </Typography>
                        </Box>
                    </Grid>
                    <Grid item xs={6}>
                        <Box align={"right"}>
                            <Button style={{margin: 5}} variant={"contained"} color={"primary"} onClick={handleAddService}>저장</Button>
                            <Button style={{margin: 5}} variant={"contained"} color={"secondary"} onClick={() => router.back()}>취소</Button>
                        </Box>
                    </Grid>
                </Grid>

                <Box mt={5}> </Box>

                <Grid container>
                    <Grid item xs={3} sm={1}>
                        <Box align={"right"} className={classes.label}>이름</Box>
                    </Grid>
                    <Grid item xs={9} sm={11}>
                        <Box>
                            <TextField value={name}
                                       onChange={event => setName(event.target.value)}
                                       autoFocus={true}
                                       fullWidth
                                       size={"small"}
                                       variant={"outlined"}
                                       color={"primary"}
                                       required={true}
                                       error={invalid['name']}
                                       helperText={invalid['name']}
                            />
                        </Box>
                    </Grid>
                </Grid>
                <br/>
                <Grid container>
                    <Grid item xs={3} sm={1}>
                        <Box align={"right"} className={classes.label}>서버</Box>
                    </Grid>
                    <Grid item xs={9} sm={11}>
                        <Box>
                            <FormControl autoFocus={true} fullWidth size={"small"} variant={"outlined"} color={"primary"} className={classes.select}>
                                <Select
                                    value={server}
                                    onChange={event => setServer(event.target.value)}
                                >
                                    {
                                        servers.map(server => <MenuItem key={"server-" + server['id']} value={server['id']}>{server['name']}</MenuItem>)
                                    }
                                </Select>
                            </FormControl>
                        </Box>
                    </Grid>
                </Grid>

                <br/>

                <Grid container>
                    <Grid item xs={3} sm={1}>
                        <Box align={"right"} className={classes.label}>타입</Box>
                    </Grid>
                    <Grid item xs={9} sm={11}>
                        <Box>
                            <FormControl component="fieldset" fullWidth={true}>
                                <RadioGroup value={type} onChange={event => setType(event.target.value)} row={true}>
                                    <FormControlLabel value={"container"} control={<Radio />} label="컨테이너" />
                                    <FormControlLabel value={"process"} control={<Radio />} label="프로세스" />
                                </RadioGroup>
                            </FormControl>
                        </Box>
                    </Grid>
                </Grid>

                <br/>

                {/*  컨테이너  */}
                <Box display={type === 'container' ? 'block' : 'none'}>

                    <Grid container>
                        <Grid item xs={3} sm={1}>
                            <Box align={"right"} className={classes.label}>포트</Box>
                        </Grid>
                        <Grid item xs={9} sm={11}>
                            <Box>
                                <TextField value={dockerPort}
                                           onChange={event => setDockerPort(event.target.value)}
                                           autoFocus={true}
                                           fullWidth
                                           size={"small"}
                                           variant={"outlined"}
                                           color={"primary"}
                                           required={true}
                                           error={invalid['dockerPort']}
                                           helperText={invalid['dockerPort']}
                                />
                            </Box>
                        </Grid>
                    </Grid>


                    <Grid container>
                        <Grid item xs={3} sm={1}>
                            <Box align={"right"} className={classes.label} style={{marginTop: 25}}>변수</Box>
                        </Grid>
                        <Grid item xs={9} sm={11}>
                            <List dense={true}>

                                {
                                    variables.map((variable, index) => {
                                        return (
                                            <ListItem key={index}>
                                                <Grid container>
                                                    <Grid item xs={1}>
                                                        <Box align={"right"} className={classes.label}>키</Box>
                                                    </Grid>
                                                    <Grid item xs={4}>
                                                        <TextField fullWidth
                                                                   size={"small"}
                                                                   variant={"outlined"}
                                                                   color={"primary"}
                                                                   required={true}
                                                                   value={variable['key']}
                                                                   onChange={event => {
                                                                       variables[index]['key'] = event.target.value
                                                                       setVariables([
                                                                           ...variables,
                                                                       ])
                                                                   }}
                                                                   placeholder={"image"}
                                                        />
                                                    </Grid>
                                                    <Grid item xs={1}>
                                                        <Box align={"right"} className={classes.label}>값</Box>
                                                    </Grid>
                                                    <Grid item xs={4}>
                                                        <TextField fullWidth
                                                                   size={"small"}
                                                                   variant={"outlined"}
                                                                   color={"primary"}
                                                                   required={true}
                                                                   // value={variable['val']}
                                                                   onChange={event => {
                                                                       variables[index]['value'] = event.target.value
                                                                       setVariables([
                                                                           ...variables,
                                                                       ])
                                                                   }}
                                                                   placeholder={"nginx"}
                                                        />
                                                    </Grid>
                                                </Grid>

                                                <ListItemSecondaryAction>
                                                    <IconButton edge="start" onClick={() => {
                                                        setVariables(variables.concat({}))
                                                    }}>
                                                        <AddBoxIcon/>
                                                    </IconButton>

                                                    <IconButton edge="end" onClick={() => {
                                                        let t = []
                                                        variables.length === 1 ?
                                                            t= [{}]
                                                            :
                                                            t = variables.slice(0, index).concat(variables.slice(index +1))
                                                        setVariables(t)
                                                    }}>
                                                        <IndeterminateCheckBoxIcon/>
                                                    </IconButton>
                                                </ListItemSecondaryAction>
                                            </ListItem>
                                        )
                                    })
                                }
                            </List>
                        </Grid>
                    </Grid>

                    <br />

                    <Grid container>
                        <Grid item xs={3} sm={1}>
                            <Box align={"right"} className={classes.label} style={{marginTop: 0}}>YAML</Box>
                        </Grid>
                        <Grid item xs={9} sm={11}>
                            <Box>
                                <AceEditor
                                    mode="yaml"
                                    theme="kuroir"
                                    fontSize="15px"
                                    height={"400px"}
                                    width="100%"
                                    tabSize={2}
                                    placeholder={`version: '3.7'
services: 
  nginx:
    image: \${image}
    ports:
    - 80:80`}
                                    setOptions={{ useWorker: false }}
                                    onChange={(value) => setYaml(value)}
                                />
                            </Box>
                        </Grid>
                    </Grid>
                </Box>

                {/*  프로세스  */}
                <Box display={type === 'process' ? 'block' : 'none'}>
                    {/*<Box mt={2}> </Box>*/}
                    <Grid container>
                        <Grid item xs={3} sm={1}>
                            <Box align={"right"} className={classes.label}>PID 조회</Box>
                        </Grid>

                        <Grid item xs={9} sm={11}>
                            <Box>
                                <TextField fullWidth
                                           size={"small"}
                                           variant={"outlined"}
                                           color={"primary"}
                                           required={true}
                                           placeholder={"ps -ef| grep app.jar |grep -v grep |awk '{print $2}'"}
                                           value={pidCmd}
                                           onChange={event => setPidCmd(event.target.value)}
                                           error={invalid['pidCmd']}
                                           helperText={invalid['pidCmd']}
                                />
                            </Box>
                        </Grid>
                    </Grid>

                    <br />

                    <Grid container>
                        <Grid item xs={3} sm={1}>
                            <Box align={"right"} className={classes.label} style={{marginTop: 0}}>시작<br />스크립트</Box>
                        </Grid>
                        <Grid item xs={9} sm={11}>
                            <Box>
                                <AceEditor
                                    mode="text"
                                    theme="kuroir"
                                    fontSize="15px"
                                    height={"300px"}
                                    width="100%"
                                    tabSize={2}
                                    placeholder={`trap '' 1 2
java -jar app.jar -Xms1g -Xmx1g -XX:+HeapDumpOnOutOfMemoryError -server -Dfile.encoding=UTF-8 -Dspring.config.location=file:/home/danawa/application.yml > $OUTPUT_LOG 2>&1 &
return 0
                                    `}
                                    setOptions={{ useWorker: false }}
                                    onChange={(value) => setStartScript(value)}
                                />
                            </Box>
                        </Grid>
                    </Grid>

                    <br />

                    <Grid container>
                        <Grid item xs={3} sm={1}>
                            <Box align={"right"} className={classes.label} style={{marginTop: 0}}>종료<br />스크립트</Box>
                        </Grid>
                        <Grid item xs={9} sm={11}>
                            <Box>
                                <AceEditor
                                    mode="text"
                                    theme="kuroir"
                                    fontSize="15px"
                                    height={"300px"}
                                    width="100%"
                                    tabSize={2}
                                    placeholder={`PID=$(ps -ef| grep app.jar |grep -v grep |awk '{print $2}')
if [ -z $PID ];then
    kill -15 $PID
fi
                                    `}
                                    setOptions={{ useWorker: false }}
                                    onChange={(value) => setStopScript(value)}
                                />
                            </Box>
                        </Grid>
                    </Grid>

                    <br/>

                    <Grid container>
                        <Grid item xs={3} sm={1}>
                            <Box align={"right"} className={classes.label} style={{marginTop: 25}}>로그파일</Box>
                        </Grid>
                        <Grid item xs={9} sm={11}>
                            <List dense={true}>
                                {
                                    logFiles.map((logFile, index) => {
                                        return (
                                            <ListItem key={index}>
                                                <Grid container>
                                                    <Grid item xs={1}>
                                                        <Box align={"right"} className={classes.label}>키</Box>
                                                    </Grid>
                                                    <Grid item xs={4}>
                                                        <TextField fullWidth
                                                                   size={"small"}
                                                                   variant={"outlined"}
                                                                   color={"primary"}
                                                                   required={true}
                                                                   value={logFile['key']}
                                                                   onChange={event => {
                                                                       logFiles[index]['key'] = event.target.value
                                                                       setVariables([
                                                                           ...logFiles,
                                                                       ])
                                                                   }}
                                                                   placeholder={"access log"}
                                                        />
                                                    </Grid>
                                                    <Grid item xs={1}>
                                                        <Box align={"right"} className={classes.label}>값</Box>
                                                    </Grid>
                                                    <Grid item xs={4}>
                                                        <TextField fullWidth
                                                                   size={"small"}
                                                                   variant={"outlined"}
                                                                   color={"primary"}
                                                                   required={true}
                                                                   value={logFile['value']}
                                                                   onChange={event => {
                                                                       logFiles[index]['value'] = event.target.value
                                                                       setVariables([
                                                                           ...logFiles,
                                                                       ])
                                                                   }}
                                                                   placeholder={"/var/log/access.log"}
                                                        />
                                                    </Grid>
                                                </Grid>


                                                <ListItemSecondaryAction>
                                                    <IconButton edge="start" onClick={() => setLogFiles(logFiles.concat({}))}>
                                                        <AddBoxIcon/>
                                                    </IconButton>

                                                    <IconButton edge="end" onClick={() => {
                                                        let t = []
                                                        logFiles.length === 1 ?
                                                            t= [{}]
                                                            :
                                                            t = logFiles.slice(0, index).concat(logFiles.slice(index +1))
                                                        setLogFiles(t)
                                                    }}>
                                                        <IndeterminateCheckBoxIcon/>
                                                    </IconButton>
                                                </ListItemSecondaryAction>
                                            </ListItem>
                                        )
                                    })
                                }
                            </List>
                        </Grid>
                    </Grid>

                </Box>

                <br/>
                <br/>
            </Container>
        </Box>
    );
}

export default Services;