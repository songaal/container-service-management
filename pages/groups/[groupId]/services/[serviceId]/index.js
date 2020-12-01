import React from 'react';
import Container from '@material-ui/core/Container';
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';
import Header from "../../../../../components/Header";
import {Box, MenuItem, useTheme, CircularProgress, Card, CardContent } from "@material-ui/core";
import CssBaseline from "@material-ui/core/CssBaseline";
import {makeStyles} from '@material-ui/core/styles';
import Button from '@material-ui/core/Button';
import ArrowDropDownIcon from '@material-ui/icons/ArrowDropDown';
import Menu from "@material-ui/core/Menu";
import Divider from '@material-ui/core/Divider';
import Link from '@material-ui/core/Link';
import { unstable_Box} from "@material-ui/core/Box";
import {useRouter} from "next/router"
import fetch from "isomorphic-unfetch"
import DialogTitle from "@material-ui/core/DialogTitle";
import DialogContent from "@material-ui/core/DialogContent";
import DialogActions from "@material-ui/core/DialogActions";
import Dialog from "@material-ui/core/Dialog";
import {useSnackbar} from "notistack";
import useMediaQuery from "@material-ui/core/useMediaQuery/useMediaQuery";

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
    }
}));

// const CustomTextField = styled(TextField)`
//
// `;

function ShowField({label, val, url, target}) {
    const classes = useStyles();
    return (
        <Box my={3}>
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
        networkMode = container['inspect']['HostConfig']['NetworkMode'].split("_")[1]
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

        let used_memory = container['stats']['memory_stats']['usage'] - container['stats']['memory_stats']['stats']['cache']
        let available_memory = container['stats']['memory_stats']['limit']
        memUsage = Number(((used_memory / available_memory) * 100.0).toFixed(2)).toFixed(2)
    }

    const aa = () => {
        window.open("/gorups", "","target=_blank")
    }

    return (
        <Card style={{marginBottom: "40px"}}>
            <CardContent>
                <Grid container>
                    <Grid item xs={6}>
                        <ShowField label={"서비스명"} val={name} />

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
    if (process['pid'] && process['pid'] !== "" && /[0-9]/gi.test(process['pid'])) {
        up = "UP"
        upTime = new Date(process["startTime"]||'').toLocaleString()
        cpuUsage = process["cpuUsage"]||''
        memUsage = process["memUsage"]||''
        threadSize = (process['stat']||[])[19]||''
        ports = process["ports"].join(", ")
        logs = service['logFiles']||[]
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

                    </Grid>
                    <Grid item xs={6}>

                        <ShowField label={"포트"} val={ports} />

                        {
                            logs.map((log, index) => {

                                return (
                                    <ShowField key={index}
                                               label={`log-${index + 1}`}
                                               val={up === 'UP' ? `${log['key']}` : ""}
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
    const { groupId, serviceId } = router.query
    const [processing, setProcessing] = React.useState(false)
    const [disabledAction, setDisabledAction] = React.useState(false)

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
                    setService(body['service']);

                    if (body['service']["serverId"] !== '-1') {
                        setDisabledAction(false)
                        fetchState()
                    } else {
                        setDisabledAction(true)
                    }
                } else {
                    setDisabledAction(true)
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
                    enqueueSnackbar("서비스 조회를 실패하였습니다. \n" + body['message'], {
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

    const selectedServer = (servers||[]).find(server => String(server['id']) === service['serverId'])||{}

    return (
        <Box className={classes.root}>
            <CssBaseline />
            <Header  active={1} />

            <Container maxWidth={"xl"}>
                <Box my={2}>
                    <Grid container>
                        <Grid item xs={6}>
                            <Box>
                                <Typography variant="h4" gutterBottom>
                                    서비스 조회
                                </Typography>
                            </Box>
                        </Grid>
                        <Grid item xs={6}>
                            <Box style={{textAlign: "right"}}>
                                <Button size={"small"} onClick={event => setAnchorEl(event.currentTarget)} variant={"contained"} color={"primary"}>
                                    설정 <ArrowDropDownIcon/>
                                </Button>

                                <Menu
                                    style={{marginTop: "45px"}}
                                    anchorEl={anchorEl}
                                    open={Boolean(anchorEl)}
                                    keepMounted
                                    onClose={() => setAnchorEl(null)}
                                >
                                    <MenuItem onClick={() => router.push(`${location.pathname}/edit`)}>서비스 수정</MenuItem>
                                    <MenuItem onClick={() => setRemoveServiceOpen(true)}>서비스 삭제</MenuItem>
                                </Menu>
                            </Box>
                        </Grid>
                    </Grid>
                </Box>

                <Box align={"center"}>
                    <Grid container>
                        <Grid item xs={12} sm={12} md={6}>

                            <ShowField label={"서비스명"} val={service['name']} />

                            <ShowField label={"서비스타입"} val={service['type'] === 'container' ? '컨테이너' : service['type'] === 'process' ? '프로세스' : service['type']} />

                            <ShowField label={"서버"} val={ selectedServer['id'] ? `${selectedServer['name']||''} (${selectedServer['user']||''}@${selectedServer['ip']||''})` : "할당된 서버가 없습니다."} url={selectedServer['id'] ? `/servers/${service['serverId']}` : undefined }/>

                        </Grid>
                        <Grid item xs={12} sm={12} md={6}>

                            <Box my={3}>
                                <Grid container>
                                    <Grid item xs={3} sm={3}>
                                        <Box align={"right"} className={classes.label}> 실행 </Box>
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
                                            </Menu>
                                        </Box>
                                        <Box style={{textAlign: "center", display: processing ? "block" : "none"}}>
                                            <CircularProgress/>
                                        </Box>
                                    </Grid>
                                </Grid>
                            </Box>

                        </Grid>
                    </Grid>
                </Box>

                <Box my={3}>
                    <Divider />
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

            </Container>
        </Box>
    );
}

export default ServicesDetail;