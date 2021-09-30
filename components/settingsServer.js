import React from "react";
import {useSnackbar} from "notistack";
import {
    Box,
    Card,
    Grid,
    Button,
    CardContent,
    Link,
    Checkbox,
    FormControlLabel,
    Table, TableBody, TableCell,
    TableHead, TableRow,
    TextField,
    useTheme,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
} from "@material-ui/core";
import useMediaQuery from "@material-ui/core/useMediaQuery/useMediaQuery";
import Autocomplete from "@material-ui/lab/Autocomplete/Autocomplete";
import {makeStyles} from "@material-ui/core/styles";
import fetch from "isomorphic-unfetch";
import {useRouter} from "next/router";
import LaunchIcon from "@material-ui/icons/Launch";

const useStyles = makeStyles( theme => ({
    root: {
        flexGrow: 1,
        width: '100%',
        backgroundColor: theme.palette.background.paper,
    }
}));

function SettingsServer() {
    const classes = useStyles();
    const { enqueueSnackbar, closeSnackbar } = useSnackbar();
    const theme = useTheme();
    const router = useRouter()
    const fullScreen = useMediaQuery(theme.breakpoints.down('sm'));
    const [open, setOpen] = React.useState(false);
    const [sampleHidden, setSampleHidden] = React.useState(false)
    const [servers, setServers] = React.useState([]);
    const [groups, setGroups] = React.useState([]);
    const [inValid, setInValid] = React.useState({});
    const [tmpKeyword, setTmpKeyword] = React.useState("");
    const [keyword, setKeyword] = React.useState("");

    // new
    const [name, setName] = React.useState("");
    const [selectedGroup, setSelectedGroup] = React.useState([]);
    const [ip, setIp] = React.useState("");
    const [port, setPort] = React.useState("22");
    const [user, setUser] = React.useState("");
    const [password, setPassword] = React.useState("");
    const [process, setProcess] = React.useState(false);
    const [dockerPort, setDockerPort] = React.useState("2375");

    React.useEffect(() => {
        init()
        return () => {
            setServers([])
            setGroups([])
        }
    }, [])

    const init = () => {
        setServers([])
        setGroups([])
        fetch('/api/settings/servers')
            .then(res => res.json())
            .then(body => {
                if (body['status'] === 'success') {
                    setServers(body['servers'])
                } else {
                    enqueueSnackbar(body['message'], {variant: "error"});
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

    const cleanUI = () => {
        setInValid({});
        setName('')
        setSelectedGroup([])
        setIp('')
        setPort('22')
        setUser('')
        setPassword('')
        setDockerPort('')
    }

    const handleClickOpen = () => {
        cleanUI();
        setOpen(true);
    };

    const handleClose = () => {
        cleanUI();
        setOpen(false);
    };

    const handleSearchKeyword = () => {
        setKeyword(tmpKeyword)
    }

    const handleConnectionTest = () => {
        setInValid({})
        setProcess(true)
        let tmpInvalid = {}
        if (ip.trim() === '') {
            tmpInvalid['ip'] = '아이피를 입력하세요.'
        }
        if (port.trim() === '') {
            tmpInvalid['port'] = '포트를 입력하세요.'
        }
        if (user.trim() === '') {
            tmpInvalid['user'] = '계정을 입력하세요.'
        }
        if (password.trim() === '') {
            tmpInvalid['password'] = '비밀번호를 입력하세요.'
        }
        if (Object.keys(tmpInvalid).length > 0) {
            setInValid(tmpInvalid)
            setProcess(false)
            return false
        }


        fetch(`/api/servers/action?type=test`, {
            method: "POST",
            body: JSON.stringify({ ip, port, user, password})
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

    const handleAddServer = () => {
        setInValid({})
        setProcess(true)
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
        if (password.trim() === '') {
            tmpInvalid['password'] = '비밀번호를 입력하세요.'
        }
        if (!/[0-9]+/g.test(dockerPort.trim())) {
            tmpInvalid['dockerPort'] = '도커 포트는 숫자만 입력해주세요.'
        }

        if (Object.keys(tmpInvalid).length > 0) {
            setInValid(tmpInvalid)
            setProcess(false)
            return false
        }

        fetch(`/api/settings/servers`, {
            method: "POST",
            body: JSON.stringify({name, groups: selectedGroup, ip, port, user, password, dockerPort})
        })
            .then(res => res.json())
            .then(body => {
                setProcess(false)
                if (body.status === 'success') {
                    init()
                    enqueueSnackbar("서버를 추가하였습니다.", {variant: "success"});
                    handleClose()
                } else {
                    enqueueSnackbar(JSON.stringify(body.message), {variant: "error"});
                }
            })
            .catch(error => {
                setProcess(false)
                enqueueSnackbar(JSON.stringify(error), {variant: "error"});
            })
    }

    let viewServers = []
    if (sampleHidden === true) {
        viewServers = servers.filter(server => server['service_count'] === 0 )
    } else {
        viewServers = servers
    }

    if(keyword.trim().length > 0) {
        viewServers = viewServers
            .filter(server =>
                server['name'].includes(keyword)
                || server['ip'].includes(keyword)
                || server['user'].includes(keyword)
            )
    }

    return (
        <React.Fragment>
            <Card>
                <CardContent>
                    <Box my={2}>
                        <Grid container>
                            <Grid item xs={8}>
                                <TextField variant={"outlined"}
                                           color={"primary"}
                                           size={"small"}
                                           placeholder="검색"
                                           value={tmpKeyword}
                                           onChange={event => setTmpKeyword(event.target.value)}
                                           onKeyUp={event => event.keyCode === 13 ? handleSearchKeyword() : null}
                                />
                                <Button style={{height: '40px',  marginLeft: '5px'}}
                                        variant={"outlined"}
                                        color={"default"}
                                        onClick={handleSearchKeyword}
                                >검색</Button>
                                <FormControlLabel control={<Checkbox style={{marginLeft: '20px', height:'40px'}} />}
                                                  label="서비스 미할당 서버"
                                                  onChange={() => setSampleHidden(!sampleHidden)}
                                />
                            </Grid>
                            <Grid item xs={4}>
                                <Box align={"right"}>
                                    <Button variant={"contained"} color={"primary"} onClick={handleClickOpen}>서버추가</Button>
                                </Box>
                            </Grid>
                        </Grid>
                    </Box>

                    <Table my={2}>
                        <TableHead>
                            <TableRow>
                                <TableCell>#</TableCell>
                                <TableCell>서버</TableCell>
                                <TableCell>아이피</TableCell>
                                <TableCell>포트</TableCell>
                                <TableCell>도커 포트</TableCell>
                                <TableCell>계정</TableCell>
                                <TableCell>할당그룹</TableCell>
                                <TableCell>할당서비스</TableCell>
                                <TableCell>액션</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>

                            {
                                viewServers.length === 0 ?
                                    <TableRow>
                                        <TableCell align={"center"} colSpan={"9"}>등록된 서버가 없습니다.</TableCell>
                                    </TableRow>
                                    :
                                    viewServers.map((server, index) => {
                                        return (
                                            <TableRow key={server['id']}
                                                      style={{cursor: "pointer"}}
                                            >
                                                <TableCell onClick={() => router.push(`/settings/servers/${server['id']}`)}>{index + 1}</TableCell>
                                                <TableCell onClick={() => router.push(`/settings/servers/${server['id']}`)}>{server['name']}</TableCell>
                                                <TableCell onClick={() => router.push(`/settings/servers/${server['id']}`)}>{server['ip']}</TableCell>
                                                <TableCell onClick={() => router.push(`/settings/servers/${server['id']}`)}>{server['port']}</TableCell>
                                                <TableCell onClick={() => router.push(`/settings/servers/${server['id']}`)}>{server['dockerPort']}</TableCell>
                                                <TableCell onClick={() => router.push(`/settings/servers/${server['id']}`)}>{server['user']}</TableCell>
                                                <TableCell onClick={() => router.push(`/settings/servers/${server['id']}`)}>{server['group_server_count']}</TableCell>
                                                <TableCell onClick={() => router.push(`/settings/servers/${server['id']}`)}>{server['service_count']}</TableCell>
                                                <TableCell>
                                                    <Button variant={"outlined"}
                                                            color={"primary"}
                                                            target="_blank"
                                                            href={`/servers/${server['id']}/explorer`}
                                                            size={"small"}
                                                    >
                                                        탐색기 열기 <LaunchIcon color={"primary"} />
                                                    </Button>
                                                    <Button variant={"outlined"}
                                                            color={"primary"}
                                                            target="_blank"
                                                            size={"small"}
                                                            onClick={e => {
                                                                e.preventDefault();
                                                                window.open(`/servers/${server['id']}/terminal`, `${server['name']}(${server['ip']})`)
                                                            }}
                                                            style={{marginLeft: "10px"}}
                                                            // href={`/servers/${server['id']}/terminal`}
                                                    >
                                                        터미널 열기 <LaunchIcon color={"primary"} />
                                                    </Button>
                                                </TableCell>
                                            </TableRow>
                                        )
                                    })
                            }
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            <Dialog
                fullWidth={true}
                fullScreen={fullScreen}
                open={open}
                onClose={handleClose}
            >
                <DialogTitle>서버추가</DialogTitle>
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
                                           value={name}
                                           onChange={event => setName(event.target.value)}
                                           error={inValid['name']}
                                           helperText={inValid['name']}
                                />
                            </Grid>
                        </Grid>
                    </Box>
                    <Box my={3}>
                        <Grid container >
                            <Grid item xs={4}>
                                할당그룹
                            </Grid>
                            <Grid item xs={8}>
                                <Autocomplete
                                    size="small"
                                    multiple
                                    options={groups.map(group => ({id: group['id'], title: group['name']}))}
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
                    <Box my={3}>
                        <Grid container>
                            <Grid item xs={4}>
                                아이피
                            </Grid>
                            <Grid item xs={8}>
                                <TextField fullWidth={true}
                                           label={""}
                                           required={true}
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
                                           value={user}
                                           onChange={event => setUser(event.target.value)}
                                           error={inValid['user']}
                                           helperText={inValid['user']}
                                />
                            </Grid>
                        </Grid>
                    </Box>
                    <Box my={3}>
                        <Grid container>
                            <Grid item xs={4}>
                                비밀번호
                            </Grid>
                            <Grid item xs={8}>
                                <TextField fullWidth={true}
                                           label={""}
                                           required={true}
                                           type={"password"}
                                           value={password}
                                           onChange={event => setPassword(event.target.value)}
                                           error={inValid['password']}
                                           helperText={inValid['password']}
                                />
                            </Grid>
                        </Grid>
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Grid container>
                        <Grid item xs={4}>
                            <Button variant={"outlined"}
                                    color="secondary"
                                    onClick={handleConnectionTest}
                                    disabled={process}
                            >
                                연결테스트
                            </Button>
                        </Grid>
                        <Grid item xs={8}>
                            <Box align={"right"}>
                                <Button style={{marginLeft: "2px", marginRight: "2px"}}
                                        autoFocus
                                        variant={"outlined"}
                                        onClick={handleAddServer}
                                        color="primary"
                                        disabled={process}
                                >
                                    추가
                                </Button>
                                <Button style={{marginLeft: "2px", marginRight: "2px"}}
                                        variant={"outlined"}
                                        onClick={handleClose}
                                        color="default"
                                >
                                    닫기
                                </Button>
                            </Box>
                        </Grid>
                    </Grid>

                </DialogActions>
            </Dialog>

        </React.Fragment>
    )
}

export default SettingsServer;