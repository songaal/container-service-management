import React from 'react';
import Container from '@material-ui/core/Container';
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';
import Header from "../../../../../components/Header";
import {
    Box,
    Breadcrumbs,
    FormControl,
    MenuItem,
    Select,
    TextareaAutosize,
    TextField,
    useTheme
} from "@material-ui/core";
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
import {useSnackbar} from 'notistack';
import fetch from "isomorphic-unfetch"
import {useRouter} from "next/router";
import DialogTitle from "@material-ui/core/DialogTitle";
import DialogContent from "@material-ui/core/DialogContent";
import DialogActions from "@material-ui/core/DialogActions";
import Dialog from "@material-ui/core/Dialog";
import useMediaQuery from "@material-ui/core/useMediaQuery/useMediaQuery";
import Link from "@material-ui/core/Link";
import LaunchIcon from "@material-ui/icons/Launch";

const schedule = require("node-cron")

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


function ServiceEdit() {
    const classes = useStyles();
    const router = useRouter();
    const theme = useTheme();
    const fullScreen = useMediaQuery(theme.breakpoints.down('xs'));
    const { enqueueSnackbar, closeSnackbar } = useSnackbar();
    const [servers, setServers] = React.useState([]);
    const [service, setService] = React.useState({})
    const [name, setName] = React.useState("")
    const [server, setServer] = React.useState('-1');
    const [type, setType] = React.useState('container');
    const [invalid, setInvalid] = React.useState({})
    const [editConfirmOpen, setEditConfirmOpen] = React.useState(false)
    const [cron, setCron] = React.useState('');
    const [isSchedule, setSchedule] = React.useState(false);
    const [groups, setGroups] = React.useState([]);
    // 컨테이너
    const [variables, setVariables] = React.useState([{}]);
    const [yaml, setYaml] = React.useState("");
    // 프로세스
    const [pidCmd, setPidCmd] = React.useState("");
    const [startScript, setStartScript] = React.useState("");
    const [stopScript, setStopScript] = React.useState("");
    const [logFiles, setLogFiles] = React.useState([{}]);

    const { groupId, serviceId } = router.query

    React.useEffect(() => {
        init()
    }, [])

    const init = () => {
        fetch('/api/groups')
            .then(res => res.json())
            .then(body => {
                if (body['status'] === 'success') {
                    setGroups(body['groups'])
                } else {
                    enqueueSnackbar(body['message'], {variant: "error"});
                }
            })
        fetch(`/api/groups/${groupId}/servers`)
            .then(res => res.json())
            .then(body => {
                let tmp = [{id: "-1", name: "선택안함"}]
                if (body['status'] === 'success') {
                    tmp = tmp.concat(body['servers'])
                }
                setServers(tmp)
            })
        fetch(`/api/groups/${groupId}/services/${serviceId}`)
            .then(res => res.json())
            .then(body => {
                if (body['status'] === 'success') {
                    const service = body['service'];
                    setName(service['name'])
                    setServer(service['serverId'])
                    setCron(service['cron'])
                    setSchedule(Boolean(service['isSchedule']))
                    setType(service['type'])
                    setVariables(service['variables'].length === 0 ? [{}] : service['variables'])
                    setPidCmd(service['pidCmd'])
                    setStartScript(service['startScript'])
                    setStopScript(service['stopScript'])
                    setYaml(service['yaml'])
                    setLogFiles(service['logFiles'].length === 0 ? [{}] : service['logFiles'])
                    setService(Object.assign({}, {}, body['service']))
                }
            })
    }

    const handleEditService = () => {
        setInvalid({})
        let tmpInvalid = {}
        if(name.trim() === "") {
            tmpInvalid['name'] = "이름을 입력해주세요."
        }
        if (!schedule.validate(cron)) {
            tmpInvalid['cron'] = "형식을 확인해주세요. (ex: 0 14 * * * // 오후 2시)"
        }

        if (Object.keys(tmpInvalid).length > 0) {
            setInvalid(tmpInvalid)
            return false
        }

        fetch(`/api/groups/${groupId}/services/${serviceId}`, {
            method: "PUT",
            body: JSON.stringify({
                name, server, type, isSchedule, cron,
                variables: variables.filter(variable => variable['key'] && variable['value']),
                yaml,
                pidCmd, startScript, stopScript,
                logFiles: logFiles.filter(logFile => logFile['key'] && logFile['value']),
            })
        })
            .then(res => res.json())
            .then(body => {
                if (body['status'] === 'success') {
                    enqueueSnackbar("서비스를 수정하였습니다.", {variant: "success"})
                    // router.push(`/groups/${groupId}/services/${serviceId}`)
                    router.replace(`/groups/${groupId}/services/${serviceId}`)
                } else {
                    enqueueSnackbar("서비스 수정 실패하였습니다.", {variant: "error"})
                }
            })
    }

    return (
        <Box className={classes.root}>
            <CssBaseline />
            <Header  active={1} />

            <Container maxWidth={"xl"}>
                <br/>
                <Breadcrumbs aria-label="breadcrumb">
                    <Link color="inherit" onClick={() => router.push("/groups")} style={{cursor: "pointer"}}>
                        그룹
                    </Link>
                    <Link color="inherit" onClick={() => router.push("/groups/" + groupId)} style={{cursor: "pointer"}}>
                        {
                            groups.find(g => String(g?.id||'') === service['groupId'])?.name||''
                        }
                    </Link>
                    <Link color="inherit" onClick={() => router.push("/groups/" + groupId + "/services/" + serviceId)} style={{cursor: "pointer"}}>
                        {
                            service?.name||''
                        }
                    </Link>
                    <Typography color="textPrimary">서비스 수정</Typography>
                </Breadcrumbs>
                <br/>
                <Grid container>
                    <Grid item xs={6}>
                        <Box>
                            <Typography variant="h4" gutterBottom>
                                서비스 수정
                            </Typography>
                        </Box>
                    </Grid>
                    <Grid item xs={6}>
                        <Box align={"right"}>
                            <Button style={{margin: 5}} variant={"contained"} color={"primary"} onClick={() => setEditConfirmOpen(true)}>저장</Button>
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
                        <Box align={"right"} className={classes.label}>스케줄 주기</Box>
                    </Grid>
                    <Grid item xs={9} sm={11}>
                        <Box>
                            <TextField value={cron}
                                       onChange={e => setCron(e.target.value)}
                               autoFocus={true}
                               fullWidth
                               size={"small"}
                               variant={"outlined"}
                               color={"primary"}
                               required={true}
                               placeholder={"0 14 * * *"}
                               error={invalid['cron']}
                               helperText={invalid['cron']}
                            />
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
                                                                   value={variable['value']}
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
                        <Grid item xs={12}>
                            <Box align={"right"}>
                                <Button variant={"outlined"}
                                        target="_blank"
                                        size={"small"}
                                        href={`https://docs.docker.com/compose/compose-file/compose-file-v2/`}
                                        style={{marginLeft: "10px"}}
                                        color={"primary"}
                                >
                                    도커 작성 가이드 <LaunchIcon color={"primary"}/>
                                </Button>
                            </Box>
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
                                    placeholder={`version: "2"
services: 
  nginx:
    image: \${image}
    ports:
    - 80:80`}
                                    setOptions={{ useWorker: false }}
                                    onChange={(value) => setYaml(value)}
                                    value={yaml}
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
                                    placeholder=""
                                    setOptions={{ useWorker: false }}
                                    value={startScript}
                                    onChange={(value) => setStartScript(value)}
                                    placeholder={`trap '' 1 2
java -jar app.jar -Xms1g -Xmx1g -XX:+HeapDumpOnOutOfMemoryError -server -Dfile.encoding=UTF-8 -Dspring.config.location=file:/home/danawa/application.yml > $OUTPUT_LOG 2>&1 &
return 0
                                    `}
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
                                    placeholder=""
                                    setOptions={{ useWorker: false }}
                                    value={stopScript}
                                    onChange={(value) => setStopScript(value)}
                                    placeholder={`PID=$(ps -ef| grep app.jar |grep -v grep |awk '{print $2}')
if [ -z $PID ];then
    kill -15 $PID
fi
                                    `}
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
                                                        <Box align={"right"} className={classes.label}>라벨</Box>
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
                                                        <Box align={"right"} className={classes.label}>경로</Box>
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


            <Dialog
                fullWidth={true}
                fullScreen={fullScreen}
                open={editConfirmOpen}
                onClose={() => setEditConfirmOpen(false)}
            >
                <DialogTitle>
                    서비스 수정
                </DialogTitle>
                <DialogContent>
                    변경된 내용을 저장하시겠습니까?
                </DialogContent>
                <DialogActions>
                    <Button autoFocus variant={"outlined"} onClick={handleEditService} color="primary">
                        저장
                    </Button>
                    <Button variant={"outlined"} onClick={() => setEditConfirmOpen(false)} color="default">
                        취소
                    </Button>
                </DialogActions>
            </Dialog>


        </Box>
    );
}

export default ServiceEdit;