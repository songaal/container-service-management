import React from 'react';
import Container from '@material-ui/core/Container';
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';
import Header from "../../../../../components/Header";
import {
    Box,
    MenuItem,
    useTheme,
    CircularProgress,
    Card,
    CardContent,
    Breadcrumbs,
    IconButton,
    Tooltip, TextField,
    Switch, FormControl, TextareaAutosize
} from "@material-ui/core";
import CssBaseline from "@material-ui/core/CssBaseline";
import {makeStyles} from '@material-ui/core/styles';
import Button from '@material-ui/core/Button';
import ArrowDropDownIcon from '@material-ui/icons/ArrowDropDown';
import Menu from "@material-ui/core/Menu";
import Divider from '@material-ui/core/Divider';
import Link from '@material-ui/core/Link';
import {useRouter} from "next/router"
import fetch from "isomorphic-unfetch"
import DialogTitle from "@material-ui/core/DialogTitle";
import DialogContent from "@material-ui/core/DialogContent";
import DialogActions from "@material-ui/core/DialogActions";
import Dialog from "@material-ui/core/Dialog";
import {useSnackbar} from "notistack";
import useMediaQuery from "@material-ui/core/useMediaQuery/useMediaQuery";
import ShareIcon from '@material-ui/icons/Share';
import Autocomplete from "@material-ui/lab/Autocomplete/Autocomplete";
import {lightBlue, red, yellow} from "@material-ui/core/colors";
import dynamic from 'next/dynamic'

import List from "@material-ui/core/List";
import ListItem from "@material-ui/core/ListItem";
const Schedule = require("node-cron")
const AceEditor = dynamic(import("react-ace"), {ssr: false})

const useStyles = makeStyles( theme => ({
    root: {
        flexGrow: 1,
        width: '100%',
        backgroundColor: theme.palette.background.paper,
    },
    label: {
        marginTop: 2,
        marginBottom: 2,
        marginLeft: 10,
        marginRight: 10,
        whiteSpace: "nowrap"
    },
    value: {
        marginTop: 2,
        marginBottom: 2,
        marginLeft: 10,
        marginRight: 10,
        whiteSpace: "nowrap",
        display: "inline",
        // borderBottom: "1px solid silver",
    },
    viewLabel: {
        marginRight: 20,
        marginTop: 10,
        textAlign: "center"
    }
}));

// const CustomTextField = styled(TextField)`
//
// `;

function ShowField({label, val, url, target, style}) {
    const classes = useStyles();
    return (
        <Box my={3} style={style}>
            <Grid container>
                <Grid item xs={3} sm={3}>
                    <Box align={"right"} className={classes.label}>{ label }</Box>
                </Grid>
                <Grid item xs={9} sm={9}>
                    {
                        url ?
                            <Link href={url} target={target}>
                                <Typography className={classes.value}>
                                    {val}
                                </Typography>
                            </Link>
                            :
                            <Typography className={classes.value}>
                                {val}
                            </Typography>
                    }
                </Grid>
            </Grid>
        </Box>
    );
}


function ContainerState({index, name, container, service}) {
    let up = "DOWN"
    let networkMode = ''
    let image = ''
    let PortBindings = ''
    let upTime = ''
    let cpuUsage = ''
    let memUsage = ''
    if (container && !!container['id'] && ((container['inspect']||{})['State']||{})['Status'] === 'running') {
        up = "UP"
        let tmpNetworkModeArr = container['inspect']['HostConfig']['NetworkMode'].split("_")
        if (tmpNetworkModeArr.length >= 2) {
            networkMode = container['inspect']['HostConfig']['NetworkMode'].split("_")[1]
        } else {
            networkMode = container['inspect']['HostConfig']['NetworkMode']
        }
        image = container['inspect']['Config']['Image']
        PortBindings = Object
            .keys(container['inspect']['HostConfig']['PortBindings'])
            .map(containerPort => {
                const hostPort = container['inspect']['HostConfig']['PortBindings'][containerPort][0]['HostPort']
                return `${hostPort}:${containerPort}`
            }).join(", ")
        upTime = container['inspect']['State']['StartedAt']

        let cpu_delta = container['stats']['cpu_stats']['cpu_usage']['total_usage'] - container['stats']['precpu_stats']['cpu_usage']['total_usage']
        let system_cpu_delta = container['stats']['cpu_stats']['system_cpu_usage'] - container['stats']['precpu_stats']['system_cpu_usage']
        let number_cpus = container['stats']['cpu_stats']['online_cpus']
        cpuUsage = Number((cpu_delta / system_cpu_delta) * number_cpus * 100.0).toFixed(2)

        let used_memory = (container['stats']['memory_stats']['usage']||0) - ((((container['stats']||{})['memory_stats']||{})['stats']||{})['cache']||0)
        let available_memory = container['stats']['memory_stats']['limit']
        memUsage = Number(((used_memory / available_memory) * 100.0).toFixed(2)).toFixed(2)
    }

    return (
        <Card style={{marginBottom: "40px"}}>
            <CardContent>
                <Grid container>
                    <Grid item xs={6}>
                        <ShowField label={"컨테이너명"} val={name} />

                        <ShowField label={"네트워크"} val={networkMode} />

                        <ShowField label={"이미지"} val={image} />

                        <ShowField label={"포트"} val={PortBindings} />
                    </Grid>
                    <Grid item xs={6}>
                        <ShowField label={"상태"} val={up} />

                        <ShowField label={"업타임"} val={upTime} />

                        <ShowField label={"사용 CPU(%)"} val={cpuUsage} />

                        <ShowField label={"사용 MEM(%)"} val={memUsage} />

                        <ShowField label={"로그"}
                                   val={up === 'UP' ? "컨테이너 로그 열기" : ""}
                                   url={up === 'UP' ? `/groups/${service['groupId']}/services/${service['id']}/logs/${index}?serverId=${service['serverId']}` : undefined}
                                   target={"_blank"}
                        />

                    </Grid>

                </Grid>

            </CardContent>
        </Card>
    )
}

function ProcessState({process, service}) {
    let up = "DOWN"
    let upTime = ""
    let cpuUsage = ""
    let memUsage = ""
    let threadSize = ""
    let ports = ""
    let logs = []
    let exeCwd = ""

    if (process['pid'] && process['pid'] !== "" && /[0-9]/gi.test(process['pid'])) {
        up = "UP"
        upTime = new Date(process["startTime"]||'').toLocaleString()
        cpuUsage = process["cpuUsage"]||''
        memUsage = process["memUsage"]||''
        threadSize = (process['stat']||[])[19]||''
        ports = process["ports"].filter(port => String(port) !== ".").join(", ")
        logs = service['logFiles']||[]
        exeCwd = (process['exeCwd']||[]).join("")
    }

    return (
        <Card style={{marginBottom: "40px"}}>
            <CardContent>
                <Grid container>
                    <Grid item xs={6}>
                        <ShowField label={"상태"} val={up} />

                        <ShowField label={"업타임"} val={upTime} />

                        <ShowField label={"사용 CPU(%)"} val={cpuUsage} />

                        <ShowField label={"사용 MEM(%)"} val={memUsage} />

                        {/*<ShowField label={"쓰레드"} val={threadSize} />*/}

                        <ShowField label={"명령어"} val={exeCwd} />

                    </Grid>
                    <Grid item xs={6}>

                        <ShowField label={"포트"} val={ports} />

                        {
                            logs.map((log, index) => {

                                return (
                                    <ShowField key={index}
                                               label={log['key']||"로그"}
                                               val={up === 'UP' ? `로그 보기` : ""}
                                               url={up === 'UP' ? `/groups/${service['groupId']}/services/${service['id']}/logs/${log['id']}?serverId=${service['serverId']}` : undefined}
                                               target={"_blank"}
                                    />
                                )
                            })
                        }

                    </Grid>
                </Grid>

            </CardContent>
        </Card>
    )
}

let stateEventCode = null
function ServicesDetail() {
    const { enqueueSnackbar, closeSnackbar } = useSnackbar();
    const theme = useTheme();
    const fullScreen = useMediaQuery(theme.breakpoints.down('xs'));
    const classes = useStyles();
    const router = useRouter()
    const [anchorEl, setAnchorEl] = React.useState(null);
    const [execEl, setExecEl] = React.useState(null);
    const [servers, setServers] = React.useState([])
    const [service, setService] = React.useState({})
    const [removeServiceOpen, setRemoveServiceOpen] = React.useState(false)
    const [state, setState] = React.useState([])
    const [loading, setLoading] = React.useState(false)
    const [processing, setProcessing] = React.useState(false)
    const [disabledAction, setDisabledAction] = React.useState(false)
    const [token, setToken] = React.useState("")
    const [openServiceShare, setOpenServiceShare] = React.useState(false)
    const [groups, setGroups] = React.useState([]);
    const [selectedGroup, setSelectedGroup] = React.useState([]);
    const [shared, setShared] = React.useState(false);
    const [openChangeSchedule, setOpenChangeSchedule] = React.useState(false)
    const [openConfiguration, setOpenConfiguration] = React.useState(false)

    const { groupId, serviceId } = router.query

    React.useEffect(() => {
        init()
        return () => {
            if (stateEventCode) {
                clearTimeout(stateEventCode)
                stateEventCode = null
            }
        }
    }, [])

    const init = () => {
        setLoading(true)
        setProcessing(true)
        setDisabledAction(true)
        fetch(`/api/groups/${groupId}/servers`)
            .then(res => res.json())
            .then(body => setServers(body['servers']))

        fetch(`/api/groups/${groupId}/services/${serviceId}`)
            .then(res => res.json())
            .then(body => {
                setProcessing(false)
                if (body['status'] === 'success') {
                    setShared(groupId !== (body['service']||{})['groupId'])
                    setService(body['service']);
                    setToken(body['token']||"")
                    if (body['service']["serverId"] !== '-1') {
                        setDisabledAction(false)
                        fetchState()
                    } else {
                        setLoading(false)
                        setDisabledAction(true)
                    }
                } else {
                    setDisabledAction(true)
                }
            })
        fetch('/api/groups')
            .then(res => res.json())
            .then(body => {
                if (body['status'] === 'success') {
                    setGroups(body['groups'])
                } else {
                    enqueueSnackbar(body['message'], {variant: "error"});
                }
            })
    }

    const fetchState = ({force}={}) => {
        if (force) {
            clearInterval(stateEventCode)
            stateEventCode = null
        }
        fetch(`/api/groups/${groupId}/services/${serviceId}/action?type=stats`)
            .then(res => res.json())
            .then(body => {
                if (body['status'] === 'success') {
                    setState(body['state'])
                } else {
                    setDisabledAction(true)
                    let errMsg = ""
                    try {
                        errMsg = body['error']['err']
                    } catch (e) {
                        errMsg = body['message']
                    }
                    enqueueSnackbar("서비스 조회를 실패하였습니다. \n" + errMsg, {
                        variant: "error",
                        autoHideDuration: 6000,
                        style: { whiteSpace: 'pre-line' }
                    })
                }
                setLoading(false)
            })
        stateEventCode = setTimeout(() => {
            fetchState()
        }, 3 * 60 * 1000)
    }

    const handleRemoveService = () => {
        fetch(`/api/groups/${groupId}/services/${serviceId}`, {
            method: "DELETE"
        })
        .then(res => res.json())
        .then(body => {
            if (body['status'] === 'success') {
                enqueueSnackbar("서비스를 삭제 완료하였습니다.", { variant: "success" })
                router.replace(`/groups/${groupId}`)
            } else {
                enqueueSnackbar("서비스 삭제 실패하였습니다.", { variant: "error"})
            }
        })
    }

    const handleStartService = () => {
        setExecEl(null)
        setProcessing(true)
        fetch(`/api/groups/${groupId}/services/${serviceId}/action?type=start`, {
            method: "PUT"
        })
        .then(res => res.json())
        .then(body => {
            setProcessing(false)
            if (body['status'] === 'success') {
                fetchState({force:true})
                enqueueSnackbar("서비스를 시작하였습니다.", { variant: "success" })
            } else {
                enqueueSnackbar("오류가 발생하였습니다. \n" + body['message'], {
                    variant: "error",
                    autoHideDuration: 6000,
                    style: { whiteSpace: 'pre-line' }
                })
            }
        })
    }

    const handleStopService = () => {
        setExecEl(null)
        setProcessing(true)
        fetch(`/api/groups/${groupId}/services/${serviceId}/action?type=stop`, {
            method: "PUT"
        })
        .then(res => res.json())
        .then(body => {
            setProcessing(false)
            if (body['status'] === 'success') {
                fetchState({force:true})
                enqueueSnackbar("서비스를 종료하였습니다.", { variant: "success" })
            } else {
                enqueueSnackbar("오류가 발생하였습니다. \n" + body['message'], {
                    variant: "error",
                    autoHideDuration: 6000,
                    style: { whiteSpace: 'pre-line' }
                })
            }
        })
    }

    const handleUpdateService = () => {
        setExecEl(null)
        setProcessing(true)
        fetch(`/api/groups/${groupId}/services/${serviceId}/action?type=update`, {
            method: "PUT"
        })
            .then(res => res.json())
            .then(body => {
                setProcessing(false)
                if (body['status'] === 'success') {
                    fetchState({force:true})
                    enqueueSnackbar("서비스를 업데이트 후 재시작하였습니다.", { variant: "success" })
                } else {
                    enqueueSnackbar("오류가 발생하였습니다. \n" + body['message'], {
                        variant: "error",
                        autoHideDuration: 6000,
                        style: { whiteSpace: 'pre-line' }
                    })
                }
            })
    }

    const handleServicesShare = () => {
        if (selectedGroup.length === 0) {
            enqueueSnackbar("공유할 그룹을 선택하세요.", { variant: "warning" })
            return false
        }


        fetch(`/api/groups/${groupId}/services/${serviceId}/action?type=share`, {
            method: "PUT",
            body: JSON.stringify({
                shareGroupIds: selectedGroup.map(g => g['id'])
            }),
        })
            .then(res => res.json())
            .then(body => {
                if (body['status'] === 'success') {
                    enqueueSnackbar("서비스를 공유하였습니다.", { variant: "success" })
                    setOpenServiceShare(false)
                } else {
                        enqueueSnackbar("오류가 발생하였습니다. \n" + body['message'], {
                            variant: "error",
                            autoHideDuration: 6000,
                            style: { whiteSpace: 'pre-line' }
                        })
                }
            })
    }

    const handleChangeSchedule =() => {

        fetch(`/api/groups/${groupId}/services/${serviceId}/action?type=schedule&isSchedule=${service['isSchedule'] ? 'false' : 'true'}`, {
            method: "PUT"
        })
            .then(res => res.json())
            .then(() => {
                setOpenChangeSchedule(false)
                init()
                enqueueSnackbar("스케줄 변경되었습니다.", { variant: "success" })
            })
    }

    const selectedServer = (servers||[]).find(server => String(server['id']) === service['serverId'])||{}

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
                    <Typography color="textPrimary">{service?.name||''}</Typography>
                </Breadcrumbs>

                <Box my={2}>
                    <Grid container>
                        <Grid item xs={6}>
                            <Box>
                                <Typography variant="h4" gutterBottom>
                                    서비스 조회 {shared ? "(공유)" : ""}
                                </Typography>
                            </Box>
                        </Grid>
                        <Grid item xs={6}>
                            <Box style={{textAlign: "right"}}>

                                <Tooltip title={"서비스 공유하기"}>
                                    <IconButton size={"small"}
                                                style={{marginLeft: "20px", marginRight: "20px", display: shared ? "none" : "inline-flex"}}
                                                onClick={() => setOpenServiceShare(true)}
                                    >
                                        <ShareIcon/>
                                    </IconButton>
                                </Tooltip>


                                <Button size={"small"}
                                        onClick={event => setAnchorEl(event.currentTarget)}
                                        variant={"contained"}
                                        color={"primary"}
                                >
                                    설정 <ArrowDropDownIcon/>
                                </Button>

                                <Menu
                                    style={{marginTop: "45px"}}
                                    anchorEl={anchorEl}
                                    open={Boolean(anchorEl)}
                                    keepMounted
                                    onClose={() => setAnchorEl(null)}
                                >

                                    <MenuItem onClick={() => router.push(`${location.pathname}/edit`)}
                                              style={{display:  shared ? "none" : "inline-flex"}}
                                    >서비스 수정</MenuItem>
                                    <MenuItem onClick={() => setRemoveServiceOpen(true)}>서비스 삭제</MenuItem>
                                </Menu>


                            </Box>
                        </Grid>
                    </Grid>
                </Box>

                <Box my={3}>
                    <Typography variant="h5" gutterBottom>
                        설정
                    </Typography>
                </Box>

                <Box align={"center"}>
                    <Grid container>
                        <Grid item xs={12} sm={12} md={6}>

                            <ShowField label={"서비스명"} val={`${service['name']}`} />

                            <ShowField label={"서비스타입"} val={service['type'] === 'container' ? '컨테이너' : service['type'] === 'process' ? '프로세스' : service['type']} />

                            <ShowField label={"서버"}
                                       val={ selectedServer['id'] ? `${selectedServer['name']||''} (${selectedServer['user']||''}@${selectedServer['ip']||''})` : "할당된 서버가 없습니다."}
                                       url={selectedServer['shared'] === undefined && selectedServer['id'] ? `/servers/${service['serverId']}` : undefined }/>

                            <Box my={3}>
                                <Grid container>
                                    <Grid item xs={3} sm={3}>
                                        <Box align={"right"} className={classes.label}> 구성보기 </Box>
                                    </Grid>

                                    <Grid item xs={9} sm={9}>
                                        <Button size={"small"}
                                                variant={"text"}
                                                color={"primary"}
                                                onClick={() => setOpenConfiguration(true)}
                                        >
                                            보기
                                        </Button>
                                    </Grid>
                                </Grid>
                            </Box>

                        </Grid>
                        <Grid item xs={12} sm={12} md={6}>

                            <Box my={3}>
                                <Grid container>
                                    <Grid item xs={3} sm={3}>
                                        <Box align={"right"} className={classes.label}> 명령 </Box>
                                    </Grid>

                                    <Grid item xs={9} sm={9}>
                                        <Box style={{display: processing ? "none" : "block"}}>
                                            <Button size={"small"}
                                                    onClick={event => setExecEl(event.currentTarget)}
                                                    variant={"outlined"}
                                                    color={"primary"}
                                                    disabled={disabledAction}
                                            >
                                                실행 <ArrowDropDownIcon/>
                                            </Button>
                                            <Menu
                                                anchorEl={execEl}
                                                open={Boolean(execEl)}
                                                keepMounted
                                                onClose={() => setExecEl(null)}
                                            >
                                                <MenuItem onClick={handleStartService}>시작</MenuItem>
                                                <MenuItem onClick={handleStopService}>종료</MenuItem>
                                                <MenuItem onClick={handleUpdateService}
                                                          style={{display: service['type'] === 'container' ? "block" : "none"}}>업데이트후 재시작</MenuItem>
                                                {
                                                    service['isSchedule'] ?
                                                        <MenuItem onClick={() => {setExecEl(null);setOpenChangeSchedule(true)}} style={{backgroundColor: yellow[400]}} >스케줄 중지</MenuItem>
                                                        :
                                                        <MenuItem onClick={() => {setExecEl(null);setOpenChangeSchedule(true)}}>스케줄 시작</MenuItem>
                                                }
                                            </Menu>
                                        </Box>
                                        <Box style={{textAlign: "center", display: processing ? "block" : "none"}}>
                                            <CircularProgress/>
                                        </Box>
                                    </Grid>
                                </Grid>
                            </Box>

                            <ShowField label={"스케줄"} val={`${service['isSchedule'] ? "동작 중" : "정지"} ( ${service['cron']||'' } )`} />

                            <ShowField label={"API"} val={`/api/groups/${service['groupId']}/services/${serviceId}/update`} style={{display: service['type'] === 'container' ? "block" : "none"}}/>

                            <ShowField label={"토큰"} val={token} style={{display: service['type'] === 'container' ? "block" : "none"}}/>

                        </Grid>
                    </Grid>
                </Box>

                <Box my={3}>
                    <Typography variant="h5" gutterBottom>
                        상태
                    </Typography>
                </Box>

                {/*  컨테이너  */}
                <Box my={3}>
                    <Box align={"center"}>
                        <CircularProgress style={{display: loading ? "block" : "none"}}/>
                    </Box>

                    <Box align={"center"} style={{display: loading ? "none" : "block"}}>
                        {
                            state['type'] === 'container' ?
                                (state['services']||[]).map((name, index) => {
                                    const container = state['containers'].find(c => name === c['inspect']['Config']['Labels']['com.docker.compose.service'])
                                    return (
                                        <ContainerState key={index} index={String(index + 1)} name={name} container={container} service={service}/>
                                    )
                                })
                                :
                                state['type'] === 'process' ?
                                    <ProcessState process={state} service={service}/>
                                    :
                                    null
                        }
                    </Box>
                </Box>

                <Dialog
                    fullWidth={true}
                    fullScreen={fullScreen}
                    open={removeServiceOpen}
                    onClose={() => setRemoveServiceOpen(false)}
                >
                    <DialogTitle>
                        서비스삭제
                    </DialogTitle>
                    <DialogContent>
                        <Box color="error.main">서비스를 삭제하시겠습니까?</Box>
                    </DialogContent>
                    <DialogActions>
                        <Grid container>
                            <Grid item xs="6">

                            </Grid>
                            <Grid item xs="6">
                                <Box align="right">
                                    <Button autoFocus
                                            variant={"outlined"}
                                            onClick={handleRemoveService}
                                            color="secondary"
                                    >
                                        삭제
                                    </Button>
                                    <Button style={{marginLeft: "5px"}}
                                            variant={"outlined"}
                                            onClick={() => setRemoveServiceOpen(false)} color="default"
                                    >
                                        취소
                                    </Button>
                                </Box>
                            </Grid>
                        </Grid>
                    </DialogActions>
                </Dialog>


                <Dialog
                    fullWidth={true}
                    fullScreen={fullScreen}
                    open={openServiceShare}
                    onClose={() => setOpenServiceShare(false)}
                >
                    <DialogTitle>
                        서비스 공유
                    </DialogTitle>
                    <DialogContent>


                        <Box my={3}>
                            <Grid container >
                                <Grid item xs={4}>
                                    그룹 선택
                                </Grid>
                                <Grid item xs={8}>
                                    <Autocomplete
                                        size="small"
                                        multiple
                                        options={groups.filter(g => String(g['id']) !== String(groupId)).map(group => ({id: group['id'], title: group['name']}))}
                                        getOptionLabel={(option) => option.title}
                                        onChange={(event, value) => setSelectedGroup(value||[])}
                                        renderInput={(params) => (
                                            <TextField {...params}
                                                       variant="standard"
                                                       fullWidth={true}
                                                       onChange={e => console.log(e.target.value)}

                                            />
                                        )}
                                    />
                                </Grid>
                            </Grid>
                        </Box>

                    </DialogContent>
                    <DialogActions>
                        <Grid container>
                            <Grid item xs="6">

                            </Grid>
                            <Grid item xs="6">
                                <Box align="right">
                                    <Button autoFocus
                                            variant={"outlined"}
                                            color="primary"
                                            onClick={() => handleServicesShare()}
                                    >
                                        공유
                                    </Button>
                                    <Button style={{marginLeft: "5px"}}
                                            variant={"outlined"}
                                            onClick={() => setOpenServiceShare(false)}
                                    >
                                        취소
                                    </Button>
                                </Box>
                            </Grid>
                        </Grid>
                    </DialogActions>
                </Dialog>

                <Dialog
                    fullWidth={true}
                    fullScreen={fullScreen}
                    open={openChangeSchedule}
                    onClose={() => setOpenChangeSchedule(false)}
                >
                    <DialogTitle>
                        스케쥴 변경
                    </DialogTitle>
                    <DialogContent>
                        스케줄 {service['isSchedule'] ? "정지" : "동작"} 하시겠습니까?
                    </DialogContent>
                    <DialogActions>
                        <Button autoFocus
                                variant={"outlined"}
                                color="primary"
                                onClick={handleChangeSchedule}
                        >
                            적용
                        </Button>
                        <Button variant={"outlined"}
                                onClick={() => setOpenChangeSchedule(false)}
                        >
                            취소
                        </Button>
                    </DialogActions>
                </Dialog>


                <Dialog
                    maxWidth={"xl"}
                    fullWidth={true}
                    fullScreen={fullScreen}
                    open={openConfiguration}
                    onClose={() => setOpenConfiguration(false)}
                >
                    <DialogTitle>
                        구성보기
                    </DialogTitle>
                    <DialogContent>


                        <Grid container>
                            <Grid item xs={3} sm={1}>
                                <Box align={"right"} className={classes.viewLabel}>타입</Box>
                            </Grid>
                            <Grid item xs={9} sm={11}>
                                <Box className={classes.viewLabel}>
                                    {(service['type']||'') === 'container' ? "컨테이너" : "프로세스"}
                                </Box>
                            </Grid>
                        </Grid>
                        <br/>

                        {/*  컨테이너  */}
                        <Box display={(service['type']||'') === 'container' ? 'block' : 'none'}>

                        {/*    변수    */}
                            <Grid container>
                                <Grid item xs={3} sm={1}>
                                    <Box align={"right"} className={classes.viewLabel} style={{marginTop: 25}}>변수</Box>
                                </Grid>
                                <Grid item xs={9} sm={11}>
                                    <List dense={true}>
                                        {
                                            (service['variables']||[]).length === 0 ?
                                            <ListItem >
                                                <Box align={"right"} className={classes.viewLabel}> - </Box>
                                            </ListItem>
                                            :
                                            (service['variables']||[]).map((variable, index) => {
                                                return (
                                                    <ListItem key={index}>
                                                        <Grid container>
                                                            <Grid item xs={2}>
                                                                <Box align={"right"} className={classes.viewLabel}>키</Box>
                                                            </Grid>
                                                            <Grid item xs={4}>
                                                                <TextField fullWidth
                                                                           size={"small"}
                                                                           variant={"outlined"}
                                                                           color={"primary"}
                                                                           value={variable['key']}
                                                                           placeholder={"image"}
                                                                           disabled={true}
                                                                />
                                                            </Grid>
                                                            <Grid item xs={2}>
                                                                <Box align={"right"} className={classes.viewLabel}>값</Box>
                                                            </Grid>
                                                            <Grid item xs={4}>
                                                                <TextField fullWidth
                                                                           size={"small"}
                                                                           variant={"outlined"}
                                                                           color={"primary"}
                                                                           required={true}
                                                                           value={variable['value']}
                                                                           disabled={true}
                                                                />
                                                            </Grid>
                                                        </Grid>
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
                                    <Box align={"right"} className={classes.viewLabel} style={{marginTop: 0}}>YAML</Box>
                                </Grid>
                                <Grid item xs={9} sm={11}>
                                    <Box>
                                        <AceEditor
                                            mode="text"
                                            fontSize="15px"
                                            height={"500px"}
                                            width="100%"
                                            tabSize={2}
                                            placeholder=""
                                            setOptions={{ useWorker: false, readOnly: true }}
                                            value={service['yaml']||''}
                                            placeholder={``}
                                        />
                                    </Box>
                                </Grid>
                            </Grid>

                        </Box>

                        {/*  프로세스  */}
                        <Box display={(service['type']||'') === 'process' ? 'block' : 'none'}>

                            <Grid container>
                                <Grid item xs={3} sm={1}>
                                    <Box align={"right"} className={classes.viewLabel} style={{marginTop: 0}}>PID 조회</Box>
                                </Grid>
                                <Grid item xs={9} sm={11}>
                                    <Box>
                                        <AceEditor
                                            mode="text"
                                            fontSize="15px"
                                            height={"100px"}
                                            width="100%"
                                            tabSize={2}
                                            placeholder=""
                                            setOptions={{ useWorker: false, readOnly: true }}
                                            value={service['pidCmd']||''}
                                            placeholder={``}
                                        />
                                    </Box>
                                </Grid>
                            </Grid>
                            <br/>

                            <Grid container>
                                <Grid item xs={3} sm={1}>
                                    <Box align={"right"} className={classes.viewLabel} style={{marginTop: 0}}>시작 스크립트</Box>
                                </Grid>
                                <Grid item xs={9} sm={11}>
                                    <Box>
                                        <AceEditor
                                            mode="text"
                                            fontSize="15px"
                                            height={"300px"}
                                            width="100%"
                                            tabSize={2}
                                            placeholder=""
                                            setOptions={{ useWorker: false, readOnly: true }}
                                            value={service['startScript']||''}
                                            placeholder={``}
                                        />
                                    </Box>
                                </Grid>
                            </Grid>
                            <br/>

                            <Grid container>
                                <Grid item xs={3} sm={1}>
                                    <Box align={"right"} className={classes.viewLabel} style={{marginTop: 0}}>종료 스크립트</Box>
                                </Grid>
                                <Grid item xs={9} sm={11}>
                                    <Box>
                                        <AceEditor
                                            mode="text"
                                            fontSize="15px"
                                            height={"300px"}
                                            width="100%"
                                            tabSize={2}
                                            placeholder=""
                                            setOptions={{ useWorker: false, readOnly: true }}
                                            value={service['stopScript']||''}
                                            placeholder={``}
                                        />
                                    </Box>
                                </Grid>
                            </Grid>
                            <br/>

                            {/*    변수    */}
                            <Grid container>
                                <Grid item xs={3} sm={1}>
                                    <Box align={"right"} className={classes.viewLabel} style={{marginTop: 25}}>로그파일</Box>
                                </Grid>
                                <Grid item xs={9} sm={11}>
                                    <List dense={true}>
                                        {
                                            (service['logFiles']||[]).length === 0 ?
                                                <ListItem >
                                                    <Box align={"right"} className={classes.viewLabel}> - </Box>
                                                </ListItem>
                                                :
                                                (service['logFiles']||[]).map((logFile, index) => {
                                                    return (
                                                        <ListItem key={index}>
                                                            <Grid container>
                                                                <Grid item xs={2}>
                                                                    <Box align={"right"} className={classes.viewLabel}>라벨</Box>
                                                                </Grid>
                                                                <Grid item xs={4}>
                                                                    <TextField fullWidth
                                                                               size={"small"}
                                                                               variant={"outlined"}
                                                                               color={"primary"}
                                                                               value={logFile['key']}
                                                                               placeholder={"image"}
                                                                               disabled={true}
                                                                    />
                                                                </Grid>
                                                                <Grid item xs={2}>
                                                                    <Box align={"right"} className={classes.viewLabel}>경로</Box>
                                                                </Grid>
                                                                <Grid item xs={4}>
                                                                    <TextField fullWidth
                                                                               size={"small"}
                                                                               variant={"outlined"}
                                                                               color={"primary"}
                                                                               required={true}
                                                                               value={logFile['value']}
                                                                               disabled={true}
                                                                    />
                                                                </Grid>
                                                            </Grid>
                                                        </ListItem>
                                                    )
                                                })
                                        }
                                    </List>
                                </Grid>
                            </Grid>
                            <br />

                        </Box>


                    </DialogContent>
                    <DialogActions>
                        <Box align="right">
                            <Button style={{marginLeft: "5px"}}
                                    variant={"outlined"}
                                    onClick={() => setOpenConfiguration(false)} color="default"
                            >
                                닫기
                            </Button>
                        </Box>
                    </DialogActions>
                </Dialog>


            </Container>
        </Box>
    );
}

export default ServicesDetail;
