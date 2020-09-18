import React from 'react';
import PropTypes from 'prop-types';
import Container from '@material-ui/core/Container';
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';
import Header from "../../components/Header";
import {
    Box,
    Card,
    CardContent,
    Checkbox,
    FormControlLabel,
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableRow,
    TextareaAutosize,
    TextField,
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
import Autocomplete from '@material-ui/lab/Autocomplete';
import Switch from '@material-ui/core/Switch';
import Paper from '@material-ui/core/Paper';
import Collapse from '@material-ui/core/Collapse';
import {useSnackbar} from "notistack";
import fetch from "isomorphic-unfetch";
import Router from "next/router";

const useStyles = makeStyles( theme => ({
    root: {
        flexGrow: 1,
        width: '100%',
        backgroundColor: theme.palette.background.paper,
    }
}));

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

function Service() {
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
                                />
                                <Button style={{height: '40px'}} variant={"outlined"} color={"default"}>검색</Button>
                            </Grid>
                            <Grid item xs={4}>
                            </Grid>
                        </Grid>
                    </Box>

                    <Table my={2}>
                        <TableHead>
                            <TableRow>
                                <TableCell>#</TableCell>
                                <TableCell>그룹</TableCell>
                                <TableCell>서비스</TableCell>
                                <TableCell>서버</TableCell>
                                <TableCell>타입</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            <TableRow>
                                <TableCell>1</TableCell>
                                <TableCell><Link href={"/groups/1"}>검색</Link></TableCell>
                                <TableCell><Link href={"/services/1"}>엘라스틱서치</Link></TableCell>
                                <TableCell><Link href={"/server/1"}>elk1-dev</Link></TableCell>
                                <TableCell>프로세스</TableCell>
                            </TableRow>
                            <TableRow>
                                <TableCell>2</TableCell>
                                <TableCell><Link href={"/groups/1"}>검색</Link></TableCell>
                                <TableCell><Link href={"/services/1"}>데이터</Link></TableCell>
                                <TableCell><Link href={"/server/1"}>elk2-dev</Link></TableCell>
                                <TableCell>프로세스</TableCell>
                            </TableRow>
                            <TableRow>
                                <TableCell>3</TableCell>
                                <TableCell><Link href={"/groups/1"}>ES검색</Link></TableCell>
                                <TableCell><Link href={"/services/1"}>elasticsearch</Link></TableCell>
                                <TableCell><Link href={"/server/1"}>elk1-prod</Link></TableCell>
                                <TableCell>컨테이너</TableCell>
                            </TableRow>
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </React.Fragment>
    )
}

function Server() {
    const { enqueueSnackbar, closeSnackbar } = useSnackbar();
    const theme = useTheme();
    const fullScreen = useMediaQuery(theme.breakpoints.down('sm'));
    const [open, setOpen] = React.useState(false);
    const [sampleHidden, setSampleHidden] = React.useState(true)
    const [servers, setServers] = React.useState([]);
    const [groups, setGroups] = React.useState([]);
    const [showConnTest, setShowConnTest] = React.useState(false);
    const [inValid, setInValid] = React.useState({});

    // new
    const [name, setName] = React.useState("");
    const [selectedGroup, setSelectedGroup] = React.useState([]);
    const [ip, setIp] = React.useState("");
    const [port, setPort] = React.useState("22");
    const [user, setUser] = React.useState("");
    const [password, setPassword] = React.useState("");

    React.useEffect(() => {
        fetch('/api/settings/server')
            .then(res => res.json())
            .then(body => {
                if (body['status'] === 'success') {
                    setServers(body['servers'])
                } else {
                    enqueueSnackbar(body['message'], {variant: "error"});
                }
            }).catch(error => enqueueSnackbar(error, {variant: "error"}))

        fetch('/api/groups')
            .then(res => res.json())
            .then(body => {
                if (body['status'] === 'success') {
                    setGroups(body['groups'])
                } else {
                    enqueueSnackbar(body['message'], {variant: "error"});
                }
            })
        return () => {
            setServers([])
            setGroups([])
        }
    }, [])

    const handleClickOpen = () => {
        setName('')
        setSelectedGroup([])
        setIp('')
        setPort('22')
        setUser('')
        setPassword('')
        setOpen(true);
    };

    const handleClose = () => {
        setOpen(false);
    };

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
                                />
                                <Button style={{height: '40px'}} variant={"outlined"} color={"default"}>검색</Button>
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
                                <TableCell>계정</TableCell>
                                <TableCell>할당그룹</TableCell>
                                <TableCell>할당서비스</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>

                            <TableRow>
                                <TableCell>1</TableCell>
                                <TableCell><Link href={`/settings/server/1`}>elk-dev1</Link></TableCell>
                                <TableCell>119.205.194.121</TableCell>
                                <TableCell>22</TableCell>
                                <TableCell>danawa</TableCell>
                                <TableCell>1</TableCell>
                                <TableCell>0</TableCell>
                            </TableRow>
                            {/*TODO 주석해제.*/}
                            {/*{*/}
                            {/*    servers.length === 0 ?*/}
                            {/*        <TableRow>*/}
                            {/*            <TableCell align={"center"} colSpan={"7"}>등록된 서버가 없습니다.</TableCell>*/}
                            {/*        </TableRow>*/}
                            {/*        :*/}
                            {/*        servers.map((server, index) => {*/}
                            {/*            return (*/}
                            {/*                <TableRow>*/}
                            {/*                    <TableCell>{index}</TableCell>*/}
                            {/*                    <TableCell><Link href={`/settings/server/${server['id']}`}>{server['name']}</Link></TableCell>*/}
                            {/*                    <TableCell>{server['ip']}</TableCell>*/}
                            {/*                    <TableCell>{server['port']}</TableCell>*/}
                            {/*                    <TableCell>{server['user']}</TableCell>*/}
                            {/*                    <TableCell>{server['group_server_count']}</TableCell>*/}
                            {/*                    <TableCell>{server['service_count']}</TableCell>*/}
                            {/*                </TableRow>*/}
                            {/*            )*/}
                            {/*        })*/}
                            {/*}*/}
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
                                    options={groups.map(group => ({title: group['name']}))}
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
                                           value={port}
                                           onChange={event => setPort(event.target.value)}
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
                                />
                            </Grid>
                        </Grid>
                    </Box>


                    <Box style={{display: showConnTest ? 'block' : 'none'}} color={inValid['connTest']||false ? 'error.main' : 'success.main'} align="center">
                        {inValid['connTest']||''}
                    </Box>

                </DialogContent>
                <DialogActions>
                    <Grid container>
                        <Grid item xs={4}>
                            <Button variant={"outlined"} color="secondary">
                                연결테스트
                            </Button>
                        </Grid>
                        <Grid item xs={8}>
                            <Box align={"right"}>
                                <Button style={{marginLeft: "2px", marginRight: "2px"}} autoFocus variant={"outlined"} onClick={handleClose} color="primary">
                                    추가
                                </Button>
                                <Button style={{marginLeft: "2px", marginRight: "2px"}} variant={"outlined"} onClick={handleClose} color="default">
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

function User() {
    const [checked, setChecked] = React.useState(false);
    const [openList, setOpenList] = React.useState({});
    const handleChange = () => {
        setChecked((prev) => !prev);
    };


    const users = [
        {name: '홍길동', id: 'hong@danawa.com', createDate: '2020-09-11', groups: [ {id: '1', name: 'es1'}, {id: '2', name: 'es2'}, {id: '3', name: 'es3'} ]},
        {name: '통키', id: 'hong@danawa.com', createDate: '2010-06-01', groups: [ {id: '1', name: 'kube1'}, {id: '2', name: 'kube2'}, {id: '3', name: 'es1'} ]},
    ]

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
                                />
                                <Button style={{height: '40px'}} variant={"outlined"} color={"default"}>검색</Button>
                            </Grid>
                            <Grid item xs={4}>
                            </Grid>
                        </Grid>
                    </Box>

                    <Table my={2}>
                        <TableHead>
                            <TableRow>
                                <TableCell>#</TableCell>
                                <TableCell>이름</TableCell>
                                <TableCell>아이디</TableCell>
                                <TableCell>가입일</TableCell>
                                <TableCell>삭제</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>

                            {
                                users.map((user, no) => {
                                    return (
                                        <React.Fragment key={no}>
                                            <TableRow >
                                                <TableCell style={{borderBottom: openList[no] ? "0px" : "1px"}}
                                                           onClick={() => {

                                                               console.log(openList[no]);
                                                           }}
                                                >{no + 1}</TableCell>
                                                <TableCell style={{borderBottom: openList[no] ? "1px" : "0px"}}>{user.name}</TableCell>
                                                <TableCell style={{borderBottom: openList[no] ? "1px" : "0px"}}>{user.id}</TableCell>
                                                <TableCell style={{borderBottom: openList[no] ? "1px" : "0px"}}>{user.createDate}</TableCell>
                                                <TableCell style={{borderBottom: openList[no] ? "1px" : "0px"}}>
                                                    <Button variant={"contained"} style={{color: "white", backgroundColor: "red"}}>삭제</Button>
                                                </TableCell>
                                            </TableRow>
                                            <TableRow>
                                                <TableCell colSpan={"5"}>

                                                    <Grid container>
                                                        <Grid item xs={1}>
                                                            <Box>
                                                                그룹
                                                            </Box>
                                                        </Grid>
                                                        <Grid item xs={11}>
                                                            <Table style={{paddingTop: "0px"}}>
                                                                <TableBody>
                                                                    <TableRow>
                                                                        <TableCell style={{paddingTop: "2px", paddingBottom: "2px"}}><Link href="/groups/1">ES1</Link></TableCell>
                                                                        <TableCell style={{paddingTop: "2px", paddingBottom: "2px"}}><Link href="/groups/1">KUBE1</Link></TableCell>
                                                                        <TableCell style={{paddingTop: "2px", paddingBottom: "2px"}}><Link href="/groups/1">ES2</Link></TableCell>
                                                                        <TableCell style={{paddingTop: "2px", paddingBottom: "2px"}}><Link href="/groups/1">KUBE2</Link></TableCell>
                                                                    </TableRow>
                                                                    <TableRow>
                                                                        <TableCell style={{paddingTop: "2px", paddingBottom: "2px"}}><Link href="/groups/1">ES3</Link></TableCell>
                                                                        <TableCell style={{paddingTop: "2px", paddingBottom: "2px"}}><Link href="/groups/1">KUBE4</Link></TableCell>
                                                                        <TableCell style={{paddingTop: "2px", paddingBottom: "2px"}}><Link href="/groups/1">ES5</Link></TableCell>
                                                                        <TableCell style={{paddingTop: "2px", paddingBottom: "2px"}}><Link href="/groups/1">KUBE6</Link></TableCell>
                                                                    </TableRow>
                                                                </TableBody>
                                                            </Table>
                                                        </Grid>
                                                    </Grid>
                                                </TableCell>
                                            </TableRow>

                                        </React.Fragment>
                                    )
                                })
                            }
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </React.Fragment>
    )
}

function GroupDetail() {
    const classes = useStyles();
    const [tabIndex, setTabIndex] = React.useState(0);
    const [editOpen, setEditOpen] = React.useState(false);
    const theme = useTheme();
    const fullScreen = useMediaQuery(theme.breakpoints.down('xs'));

    return (
        <Box className={classes.root}>
            <CssBaseline />
            <Header  active={2} />
            <Container maxWidth={"xl"} >
                <br/>
                <Box>
                    <Typography variant="h4" gutterBottom>
                        설정
                    </Typography>
                </Box>

                <Box my={6}>
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
                            <Tab label="서비스" {...a11yProps(0)} />
                            <Tab label="서버" {...a11yProps(1)} />
                            <Tab label="사용자" {...a11yProps(2)} />
                        </Tabs>
                    </AppBar>
                    <TabPanel value={tabIndex} index={0}>
                        <Service></Service>
                    </TabPanel>
                    <TabPanel value={tabIndex} index={1}>
                        <Server></Server>
                    </TabPanel>
                    <TabPanel value={tabIndex} index={2}>
                        <User></User>
                    </TabPanel>
                </Box>
            </Container>


            <Dialog
                fullWidth={true}
                fullScreen={fullScreen}
                open={editOpen}
                onClose={() => setEditOpen(false)}
            >
                <DialogTitle>
                    그룹수정
                </DialogTitle>
                <DialogContent>
                    <Box my={3}>
                        <Grid container>
                            <Grid item xs={4}>
                                이름
                            </Grid>
                            <Grid item xs={8}>
                                <TextField fullWidth={true}
                                           label={""}
                                           value={"sample"}
                                           required={true}

                                />
                            </Grid>
                        </Grid>
                    </Box>
                    <Box my={3}>
                        <Grid container >
                            <Grid item xs={4}>
                                설명
                            </Grid>
                            <Grid item xs={8}>
                                <TextareaAutosize style={{width: '100%', minHeight: "50px"}} >설명 도커와 서버기반 하이브리드 PC 웹서버입니다.</TextareaAutosize>
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
                                <Button autoFocus variant={"outlined"} onClick={() => setEditOpen(false)} color="primary">
                                    저장
                                </Button>
                                <Button style={{marginLeft: "5px"}} variant={"outlined"} onClick={() => setEditOpen(false)} color="default">
                                    닫기
                                </Button>
                            </Box>
                        </Grid>
                    </Grid>
                </DialogActions>
            </Dialog>
        </Box>
    );
}

export default GroupDetail