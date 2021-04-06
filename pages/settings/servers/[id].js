import React from 'react';
import Container from '@material-ui/core/Container';
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';
import Header from "../../../components/Header";
import {
    Box,
    Card,
    CardContent, Table, TableBody, TableCell,
    TableHead,
    TableRow,
    TextareaAutosize,
    TextField,
    Tooltip,
    useTheme,
} from "@material-ui/core";
import CssBaseline from "@material-ui/core/CssBaseline";
import {makeStyles} from '@material-ui/core/styles';
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';
import AppBar from '@material-ui/core/AppBar';
import Button from '@material-ui/core/Button';
import DialogTitle from "@material-ui/core/DialogTitle";
import DialogContent from "@material-ui/core/DialogContent";
import DialogActions from "@material-ui/core/DialogActions";
import Dialog from "@material-ui/core/Dialog";
import useMediaQuery from "@material-ui/core/useMediaQuery/useMediaQuery";
import Link from "@material-ui/core/Link";
import ButtonGroup from '@material-ui/core/ButtonGroup';
import PropTypes from "prop-types";
import Checkbox from '@material-ui/core/Checkbox';
import Autocomplete from '@material-ui/lab/Autocomplete';
import CheckBoxOutlineBlankIcon from '@material-ui/icons/CheckBoxOutlineBlank';
import CheckBoxIcon from '@material-ui/icons/CheckBox';
import fetch from "isomorphic-unfetch"
import {useRouter} from "next/router"
import { SnackbarProvider, useSnackbar } from 'notistack';
import Menu from "@material-ui/core/Menu";
import MenuItem from "@material-ui/core/MenuItem";
import ArrowDropDownIcon from '@material-ui/icons/ArrowDropDown';
import LaunchIcon from '@material-ui/icons/Launch';
import ServerTerminal from "./../../servers/[id]/terminal";

const icon = <CheckBoxOutlineBlankIcon fontSize="small" />;
const checkedIcon = <CheckBoxIcon fontSize="small" />;

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


function ShowField({label, val, url}) {
    const classes = useStyles();
    return (
        <Box my={3}>
            <Grid container>
                <Grid item xs={2} sm={1}>
                    <Box align={"center"} className={classes.label}>{ label }</Box>
                </Grid>
                <Grid item xs={10} sm={11}>
                    {
                        url ?
                            <Link href={"#"}>
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

function TabPanel(props) {
    const { children, value, index, ...other } = props;
    return (
        <Box hidden={value !== index} {...other}>
            {value === index && (
                <Box>
                    {children}
                </Box>
            )}
        </Box>
    );
}
TabPanel.propTypes = {
    children: PropTypes.node,
    index: PropTypes.any.isRequired,
    value: PropTypes.any.isRequired,
};

function a11yProps(index) {
    return {
        id: `scrollable-auto-tab-${index}`,
        'aria-controls': `scrollable-auto-tabpanel-${index}`,
    };
}

function SystemStatus({server}) {
    const classes = useStyles();
    const [cmdName, setCmdName] = React.useState("위 버튼을 눌러 조회하세요.")
    const [cmdResult, setCmdResult] = React.useState("")
    const [openTerminal, setOpenTerminal] = React.useState(false)

    const execCmd = (cmd, name) => {
        setOpenTerminal(false)
        setCmdResult("")
        setCmdName("조회 중입니다.")

        fetch(`${location.pathname.replace("/settings", "/api")}/action?type=exec`, {
            method: "POST",
            body: JSON.stringify({cmd, name})
        })
            .then(res => res.json())
            .then(body => {
                if (body['status'] === 'success') {
                    let tmpResult = "";
                    (body['result']||[]).forEach(text => {
                        tmpResult += text;
                    })
                    setCmdName(name)
                    setCmdResult(tmpResult)
                } else if (body['status'] === 'error') {
                    setCmdName(name)
                    setCmdResult((body['error']||{})['message']||body['message'])
                }
            })
    }

    return (
        <Card>
            <CardContent>
                <Box my={1}>
                    <Grid container>
                        <Grid item xs={12} sm={8}>
                            <ButtonGroup color="primary">
                                <Tooltip title="top -b -n 1">
                                    <Button onClick={() => execCmd("uptime", "TOP 조회")}
                                    >UPTIME 조회</Button>
                                </Tooltip>
                                <Tooltip title="top -b -n 1">
                                    <Button onClick={() => execCmd("top -b -n 1", "TOP 조회")}
                                    >TOP 조회</Button>
                                </Tooltip>
                                <Tooltip title="ps -xfl">
                                    <Button onClick={() => execCmd("ps -xfl", "PS 조회")}
                                    >PS 조회</Button>
                                </Tooltip>
                                <Tooltip title="netstat -tnlp">
                                    <Button onClick={() => execCmd("netstat -tnlp", "NetStat 조회")}
                                    >NetStat 조회</Button>
                                </Tooltip>
                                <Tooltip title="who">
                                    <Button onClick={() => execCmd("w", "사용자 조회")}
                                    >사용자 조회</Button>
                                </Tooltip>
                            </ButtonGroup>

                            <ButtonGroup color="primary" style={{marginLeft: "10px"}}>
                                <Tooltip title="who">
                                    <Button onClick={() => setOpenTerminal(true)}
                                    >터미널 열기</Button>
                                </Tooltip>
                            </ButtonGroup>

                        </Grid>

                        <Grid item xs={12} sm={4}>
                            <Box align={"right"}>
                                <Button variant={"outlined"}
                                        color={"primary"}
                                        target="_blank"
                                        href={`/servers/${server['id']}/terminal`}
                                >
                                    터미널 열기 <LaunchIcon color={"primary"} />
                                </Button>
                            </Box>
                        </Grid>
                    </Grid>
                </Box>

                <Box my={3}>
                    {
                        openTerminal ?
                            <iframe src={`/servers/${server['id']}/terminal`}
                                    style={{
                                        width: "100%",
                                        height: "600px",
                                        backgroundColor: "black",
                                        color: "white",
                                    }}>

                            </iframe>
                            :
                            <TextareaAutosize defaultValue="위 버튼을 누르면 결과를 즉시 확인할 수 있습니다."
                                              readOnly={true}
                                              style={{
                                                  width: '100%',
                                                  height: "600px",
                                                  backgroundColor: "black",
                                                  color: "white",
                                                  padding: '10px',
                                                  overflow: "scroll"
                                              }}
                                              value={cmdResult || cmdName}
                            />
                    }
                </Box>
            </CardContent>
        </Card>
    )
}

function AdminGroup(server) {
    const classes = useStyles();
    const theme = useTheme();
    const fullScreen = useMediaQuery(theme.breakpoints.down('xs'));
    const { enqueueSnackbar, closeSnackbar } = useSnackbar();
    const [groups, setGroups] = React.useState([])
    const [useGroups, setUseGroups] = React.useState([])
    const [selectedGroups, setSelectedGroups] = React.useState([])
    const [deleteGroupOpen, setDeleteGroupOpen] = React.useState(false)
    const [selectedGroup, setSelectedGroup] = React.useState({})

    React.useEffect(() => {
        init()
    }, [])

    const init = () => {
        fetch(`/api/groups`)
            .then(res => res.json())
            .then(body => {
                if (body['status'] === 'success') {
                    setGroups(body['groups'])
                } else {
                    enqueueSnackbar(body['message'], {variant: "error"})
                }
            })

        fetch(`/api${location.pathname}/groups`)
            .then(res => res.json())
            .then(body => {
                if (body['status'] === 'success') {
                    setUseGroups(body['groups'])
                } else {
                    enqueueSnackbar(body['message'], {variant: "error"})
                }
            })


    }

    const handleDeleteGroup = () => {
        fetch(`/api${location.pathname}/groups/${selectedGroup['id']}`, {
            method: "DELETE"
        })
            .then(res => res.json())
            .then(body => {
                setDeleteGroupOpen(false)
                init()
                enqueueSnackbar("그룹을 제거 하였습니다.", {variant: "success"})
            })
    }

    const handleAddGroup = () => {
        let tmpMap = {}
        const reqBody = {
            groupIds: selectedGroups
                .map(g => String(g['id']))
                .filter(g => {
                    if(tmpMap[g]) {
                        return false
                    } else {
                        tmpMap[g] = true
                        return true
                    }
                })
        }
        fetch(`/api${location.pathname}/groups`, {
                    method: "POST",
                    body: JSON.stringify(reqBody)
                })
                    .then(res => res.json())
                    .then(body => {
                        if (body['status'] === "success") {
                            setSelectedGroups([])
                            init()
                            enqueueSnackbar("그룹을 추가 하였습니다.", {variant: "success"})
                        } else {
                            enqueueSnackbar("그룹을 추가 실패하였습니다.", {variant: "error"})
                        }

                    })
    }

    const groupOptions = groups.filter(group => {
        for (let i = 0; i < useGroups.length; i++) {
            if (String(group['id']) === useGroups[i]['groupId']) {
                return false
            }
        }
        return true
    })

    return (
        <React.Fragment>
            <Card>
                <CardContent>
                    <Box my={2}>
                        <Autocomplete
                            multiple
                            size="small"
                            options={groupOptions}
                            disableCloseOnSelect
                            getOptionLabel={(option) => option.name}
                            renderOption={(option, { selected }) => (
                                <React.Fragment>
                                    <Checkbox
                                        icon={icon}
                                        checkedIcon={checkedIcon}
                                        style={{ marginRight: 8 }}
                                        checked={selected}
                                    />
                                    {option.name}
                                </React.Fragment>
                            )}
                            style={{display: "inline"}}
                            renderInput={(params) => (
                                <TextField {...params} variant="outlined" label="그룹 추가" placeholder="" style={{minWidth: 300}} />
                            )}
                            value={selectedGroups}
                            onChange={(event, value)=> setSelectedGroups(value)}
                            onKeyUp={event => event.keyCode === 13 ? handleAddGroup() : null}
                        />
                        <Button variant={"outlined"} color={"primary"} style={{height: '40px'}} onClick={handleAddGroup}>추가</Button>
                    </Box>

                    <Box style={{minHeight: '300px'}}>
                        <Table my={2}>
                            <TableHead>
                                <TableRow>
                                    <TableCell>#</TableCell>
                                    <TableCell>그룹</TableCell>
                                    <TableCell>할당된 서비스</TableCell>
                                    <TableCell>추가날짜</TableCell>
                                    <TableCell>제거</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {
                                    useGroups.length === 0 ?
                                        <TableRow>
                                            <TableCell colSpan={5} align={"center"}>할당된 그룹이 없습니다.</TableCell>
                                        </TableRow>
                                        :
                                        useGroups.map((useGroup, index) => {
                                            const tmpGroup = groups.find(g => String(g['id']) === useGroup['groupId']||'')
                                            return (
                                                <TableRow key={index}>
                                                    <TableCell>{index + 1}</TableCell>
                                                    <TableCell>
                                                        <Link href={`/groups/${useGroup['groupId']||''}`}>{(tmpGroup||{})['name']||""}</Link>
                                                    </TableCell>
                                                    <TableCell>{useGroup['service_count']}</TableCell>
                                                    <TableCell>{useGroup['createdAt']}</TableCell>
                                                    <TableCell>
                                                        <Button style={{color: "white", backgroundColor: "red"}}
                                                                variant={"contained"}
                                                                onClick={() => {
                                                                    setSelectedGroup(tmpGroup);
                                                                    setDeleteGroupOpen(true)
                                                                }}
                                                        >
                                                            제거
                                                        </Button>
                                                    </TableCell>
                                                </TableRow>
                                            )
                                        })
                                }
                            </TableBody>
                        </Table>
                    </Box>

                </CardContent>
            </Card>

            <Dialog
                fullWidth={true}
                fullScreen={fullScreen}
                open={deleteGroupOpen}
                onClose={() => setDeleteGroupOpen(false)}
            >
                <DialogTitle>그룹 제거</DialogTitle>
                <DialogContent>
                    <Box component={"span"} style={{fontWeight: "bold"}}>{(selectedGroup||{})['name']||''}</Box> 그룹을 제거하시겠습니까?
                </DialogContent>
                <DialogActions>
                    <Grid container>
                        <Grid item xs={12}>
                            <Box align={"right"}>
                                <Button style={{marginLeft: "2px", marginRight: "2px"}}
                                        autoFocus
                                        variant={"outlined"}
                                        onClick={handleDeleteGroup}
                                        color="secondary"
                                >
                                    삭제
                                </Button>
                                <Button style={{marginLeft: "2px", marginRight: "2px"}}
                                        variant={"outlined"}
                                        onClick={() => setDeleteGroupOpen(false)}
                                        color="default"
                                >
                                    취소
                                </Button>
                            </Box>
                        </Grid>
                    </Grid>

                </DialogActions>
            </Dialog>
        </React.Fragment>
    )
}

function AdminServerDetail() {
    const classes = useStyles();
    const router = useRouter();
    const { enqueueSnackbar, closeSnackbar } = useSnackbar();
    const theme = useTheme();
    const [open, setOpen] = React.useState(false);
    const fullScreen = useMediaQuery(theme.breakpoints.down('xs'));
    const [tabIndex, setTabIndex] = React.useState(0);
    const [server, setServer] = React.useState({})
    const [editOpen, setEditOpen] = React.useState(false);
    const [name, setName] = React.useState("");
    const [ip, setIp] = React.useState("");
    const [port, setPort] = React.useState("");
    const [dockerPort, setDockerPort] = React.useState("");
    const [user, setUser] = React.useState("");
    const [inValid, setInValid] = React.useState({});
    const [anchorEl, setAnchorEl] = React.useState(null);
    const [removeServiceOpen, setRemoveServiceOpen] = React.useState(false);
    const [editPassword, setEditPassword] = React.useState("")
    const [confirmPassword, setConfirmPassword] = React.useState("")
    const [process, setProcess] = React.useState(false)

    React.useEffect(() => {
        init()
    }, [])

    const init = () => {
        const url = location.pathname.replace("\/settings", "\/api")
        fetch(url)
            .then(res => res.json())
            .then(body => {
                if (body['status'] === 'success') {
                    setServer(body['server'])
                } else {
                    enqueueSnackbar("서버 정보 조회를 실패하였습니다.", {variant: "error"})
                }
            })
    }

    const handleEditOpen = () => {
        setInValid({})
        setName(server['name'])
        setIp(server['ip'])
        setPort(server['port'])
        setDockerPort(server['dockerPort'])
        setUser(server['user'])
        setEditOpen(true)
    }
    const handleEditClose = () => {
        setEditOpen(false)
    }
    const handleEditServer = () => {
        setInValid({})
        let tmpInvalid = {}
        if (name.trim() === '') {
            tmpInvalid['name'] = '이름을 입력하세요.'
        }
        if (ip.trim() === '') {
            tmpInvalid['ip'] = '아이피를 입력하세요.'
        }
        if (port.trim() === '') {
            tmpInvalid['port'] = '포트를 입력하세요.'
        }
        if (!/[0-9]+/g.test(port.trim())) {
            tmpInvalid['port'] = '포트는 숫자만 입력해주세요.'
        }
        if (user.trim() === '') {
            tmpInvalid['user'] = '계정을 입력하세요.'
        }
        if (Object.keys(tmpInvalid).length > 0) {
            setInValid(tmpInvalid)
            return false
        }
        if (!/[0-9]+/g.test(dockerPort.trim())) {
            tmpInvalid['dockerPort'] = '도커 포트는 숫자만 입력해주세요.'
        }

        fetch(location.pathname.replace("/settings", "/api"), {
            method: "PUT",
            body: JSON.stringify({ id: server['id'], name, ip, port, user, dockerPort})
        })
            .then(res => res.json())
            .then(body => {
                if (body['status'] === 'success') {
                    init()
                    handleEditClose()
                    enqueueSnackbar("서버 정보를 수정하였습니다.", {variant: "success"})
                }
            })
    }

    const handleClose = () => {
        setInValid({})
        setEditPassword("")
        setConfirmPassword("")
        setOpen(false);
    };

    const handleRemoveService =() => {
        fetch(location.pathname.replace("/settings", "/api"), {
            method: "DELETE"
        })
            .then(res => res.json())
            .then(body => {
                if (body['status'] === 'success') {
                    handleEditClose()
                    enqueueSnackbar("서버를 삭제하였습니다.", {variant: "success"})
                    router.replace("/settings")
                }
            })
    }

    const handleConnectionTest = () => {
        setInValid({})
        let tmpInValid = {}

        if (editPassword.trim() === '') {
            tmpInValid['editPassword'] = "신규 비밀번호를 입력하세요."
        }
        if (confirmPassword.trim() === '') {
            tmpInValid['confirmPassword'] = "확인 비밀번호를 입력하세요."
        }
        if (confirmPassword.trim() !== editPassword.trim()) {
            tmpInValid['editPassword'] = "비밀번호를 확인하세요."
            tmpInValid['confirmPassword'] = "비밀번호를 확인하세요."
        }
        if (Object.keys(tmpInValid).length > 0) {
            setInValid(tmpInValid)
            return false
        }

        setProcess(true)
        fetch(`/api/servers/action?type=test`, {
            method: "POST",
            body: JSON.stringify({
                ip: server['ip'],
                port: server['port'],
                user: server['user'],
                password: editPassword
            })
        })
            .then(res => res.json())
            .then(body => {
                setProcess(false)
                if (body['status'] === "success") {
                    enqueueSnackbar("정상적으로 연결되었습니다.", {variant: "success"});
                } else {
                    enqueueSnackbar(body['message'], {variant: "error"});
                }
            })
            .catch(error => {
                setProcess(false)
                enqueueSnackbar(JSON.stringify(error), {variant: "error"});
            })
    }

    const handleEditPassword = () => {
        setInValid({})
        let tmpInValid = {}

        if (editPassword.trim() === '') {
            tmpInValid['editPassword'] = "신규 비밀번호를 입력하세요."
        }
        if (confirmPassword.trim() === '') {
            tmpInValid['confirmPassword'] = "확인 비밀번호를 입력하세요."
        }
        if (confirmPassword.trim() !== editPassword.trim()) {
            tmpInValid['editPassword'] = "비밀번호를 확인하세요."
            tmpInValid['confirmPassword'] = "비밀번호를 확인하세요."
        }
        if (Object.keys(tmpInValid).length > 0) {
            setInValid(tmpInValid)
            return false
        }

        fetch(`/api${location.pathname}`, {
            method: "PUT",
            body: JSON.stringify({ password: editPassword })
        })
            .then(res => res.json())
            .then(body => {
                if (body['status'] === "success") {
                    handleClose()
                    enqueueSnackbar("비밀번호가 변경되었습니다.", {variant: "success"});
                } else {
                    enqueueSnackbar(body['message'], {variant: "error"});
                }
            })
            .catch(error => {
                enqueueSnackbar(JSON.stringify(error), {variant: "error"});
            })
    }

    return (
        <Box className={classes.root}>
            <CssBaseline />
            <Header  active={2} />
            <Container maxWidth={"xl"} >

                <Box my={2}>
                    <Grid container>
                        <Grid item xs={6}>
                            <Box>
                                <Typography variant="h4" gutterBottom>
                                    서버 설정 조회
                                </Typography>
                            </Box>
                        </Grid>
                        <Grid item xs={6}>
                            <Box align={"right"}>
                                <Button size={"small"} onClick={event => setAnchorEl(event.currentTarget)} variant={"outlined"} color={"primary"}>
                                    설정 <ArrowDropDownIcon/>
                                </Button>
                                <Menu
                                    style={{marginTop: "45px"}}
                                    anchorEl={anchorEl}
                                    open={Boolean(anchorEl)}
                                    keepMounted
                                    onClose={() => setAnchorEl(null)}
                                >
                                    <MenuItem onClick={handleEditOpen}>서버 수정</MenuItem>
                                    <MenuItem onClick={() => setRemoveServiceOpen(true)}>서버 삭제</MenuItem>
                                </Menu>
                            </Box>
                        </Grid>
                    </Grid>
                </Box>

                <ShowField label={"이름"} val={server['name']} />

                <ShowField label={"아이피"} val={server['ip']} />

                <ShowField label={"포트"} val={server['port']} />

                <ShowField label={"도커포트"} val={server['dockerPort']} />

                <ShowField label={"계정"} val={server['user']} />

                <Box my={3}>
                    <Grid container>
                        <Grid item xs={2} sm={1}>
                            <Box align={"center"} className={classes.label}>비밀번호</Box>
                        </Grid>
                        <Grid item xs={10} sm={11}>
                            <Button size={"small"}
                                    variant={"contained"}
                                    color={"primary"}
                                    onClick={() => setOpen(true)}
                            >비밀번호 변경</Button>
                        </Grid>
                    </Grid>
                </Box>

                <Box mt={3}>
                    <AppBar position="static" color="default">
                        <Tabs
                            value={tabIndex}
                            onChange={(event, value) => setTabIndex(value)}
                            indicatorColor="primary"
                            textColor="primary"
                            variant="scrollable"
                            scrollButtons="auto"
                            aria-label="scrollable auto tabs example"
                        >
                            <Tab label="시스템" {...a11yProps(0)} />
                            <Tab label="그룹" {...a11yProps(1)} />
                        </Tabs>
                    </AppBar>
                    <TabPanel value={tabIndex} index={0}>
                        <SystemStatus server={server} />
                    </TabPanel>
                    <TabPanel value={tabIndex} index={1}>
                        <AdminGroup server={server}/>
                    </TabPanel>
                </Box>



                <Dialog
                    fullWidth={true}
                    fullScreen={fullScreen}
                    open={open}
                    onClose={handleClose}
                >
                    <DialogTitle>
                        비밀번호 변경
                    </DialogTitle>
                    <DialogContent>
                        <Box my={3}>
                            <Grid container>
                                <Grid item xs={4}>
                                    신규 비밀번호
                                </Grid>
                                <Grid item xs={8}>
                                    <TextField fullWidth={true}
                                               label={""}
                                               required={true}
                                               type={"password"}
                                               value={editPassword}
                                               onChange={event => setEditPassword(event.target.value)}
                                               error={inValid['editPassword']}
                                               helperText={inValid['editPassword']}
                                    />
                                </Grid>
                            </Grid>
                        </Box>
                        <Box my={3}>
                            <Grid container>
                                <Grid item xs={4}>
                                    확인 비밀번호
                                </Grid>
                                <Grid item xs={8}>
                                    <TextField fullWidth={true}
                                               label={""}
                                               required={true}
                                               type={"password"}
                                               value={confirmPassword}
                                               onChange={event => setConfirmPassword(event.target.value)}
                                               error={inValid['confirmPassword']}
                                               helperText={inValid['confirmPassword']}
                                    />
                                </Grid>
                            </Grid>
                        </Box>
                    </DialogContent>
                    <DialogActions>
                        <Grid container>
                            <Grid item xs={4}>
                                <Button autoFocus variant={"outlined"} onClick={handleConnectionTest} color="primary" disabled={process}>
                                    연결테스트
                                </Button>
                            </Grid>
                            <Grid item xs={8}>
                                <Box align={"right"}>
                                    <Button style={{marginLeft: '2px', marginRight: '2px'}} autoFocus variant={"outlined"} onClick={handleEditPassword} color="primary" disabled={process}>
                                        변경
                                    </Button>
                                    <Button style={{marginLeft: '2px', marginRight: '2px'}} variant={"outlined"} onClick={handleClose} color="default">
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
                    open={editOpen}
                    onClose={handleEditClose}
                >
                    <DialogTitle>서버수정</DialogTitle>
                    <DialogContent>
                        <Box my={3}>
                            <Grid container>
                                <Grid item xs={4}>
                                    이름
                                </Grid>
                                <Grid item xs={8}>
                                    <TextField fullWidth={true}
                                               label={""}
                                               required={true}
                                               placeholder={"개발서버"}
                                               value={name}
                                               onChange={event => setName(event.target.value)}
                                               error={inValid['name']}
                                               helperText={inValid['name']}
                                    />
                                </Grid>
                            </Grid>
                        </Box>
                        <Box my={3}>
                            <Grid container>
                                <Grid item xs={4}>
                                    아이피
                                </Grid>
                                <Grid item xs={8}>
                                    <TextField fullWidth={true}
                                               label={""}
                                               required={true}
                                               placeholder={"192.168.0.1"}
                                               value={ip}
                                               onChange={event => setIp(event.target.value)}
                                               error={inValid['ip']}
                                               helperText={inValid['ip']}
                                    />
                                </Grid>
                            </Grid>
                        </Box>
                        <Box my={3}>
                            <Grid container>
                                <Grid item xs={4}>
                                    포트
                                </Grid>
                                <Grid item xs={8}>
                                    <TextField fullWidth={true}
                                               label={""}
                                               required={true}
                                               placeholder={"22"}
                                               value={port}
                                               onChange={event => setPort(event.target.value)}
                                               error={inValid['port']}
                                               helperText={inValid['port']}
                                    />
                                </Grid>
                            </Grid>
                        </Box>

                        <Box my={3}>
                            <Grid container>
                                <Grid item xs={4}>
                                    도커포트
                                </Grid>
                                <Grid item xs={8}>
                                    <TextField fullWidth={true}
                                               label={""}
                                               required={true}
                                               placeholder={"2375"}
                                               value={dockerPort}
                                               onChange={event => setDockerPort(event.target.value)}
                                               error={inValid['dockerPort']}
                                               helperText={inValid['dockerPort']}
                                    />
                                </Grid>
                            </Grid>
                        </Box>

                        <Box my={3}>
                            <Grid container>
                                <Grid item xs={4}>
                                    계정
                                </Grid>
                                <Grid item xs={8}>
                                    <TextField fullWidth={true}
                                               label={""}
                                               required={true}
                                               placeholder={"root"}
                                               value={user}
                                               onChange={event => setUser(event.target.value)}
                                               error={inValid['user']}
                                               helperText={inValid['user']}
                                    />
                                </Grid>
                            </Grid>
                        </Box>
                    </DialogContent>
                    <DialogActions>
                        <Grid container>
                            <Grid item xs={12}>
                                <Box align={"right"}>
                                    <Button style={{marginLeft: "2px", marginRight: "2px"}}
                                            autoFocus
                                            variant={"outlined"}
                                            onClick={handleEditServer}
                                            color="primary"
                                    >
                                        저장
                                    </Button>
                                    <Button style={{marginLeft: "2px", marginRight: "2px"}}
                                            variant={"outlined"}
                                            onClick={handleEditClose}
                                            color="default"
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
                    open={removeServiceOpen}
                    onClose={() => setRemoveServiceOpen(false)}
                >
                    <DialogTitle>서버 삭제</DialogTitle>
                    <DialogContent>
                        서버를 삭제하시겠습니까?
                    </DialogContent>
                    <DialogActions>
                        <Grid container>
                            <Grid item xs={12}>
                                <Box align={"right"}>
                                    <Button style={{marginLeft: "2px", marginRight: "2px"}}
                                            autoFocus
                                            variant={"outlined"}
                                            onClick={handleRemoveService}
                                            color="secondary"
                                    >
                                        삭제
                                    </Button>
                                    <Button style={{marginLeft: "2px", marginRight: "2px"}}
                                            variant={"outlined"}
                                            onClick={() => setRemoveServiceOpen(false)}
                                            color="default"
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

export default AdminServerDetail;