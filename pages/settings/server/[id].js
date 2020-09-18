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
                <Grid item xs={3} sm={3}>
                    <Box align={"right"} className={classes.label}>{ label }</Box>
                </Grid>
                <Grid item xs={9} sm={9}>
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

function SystemStatus() {
    const classes = useStyles();
    return (
        <Card>
            <CardContent>
                <Box my={1}>
                    <Grid container>
                        <Grid item xs={12} sm={8}>
                            <ButtonGroup color="primary">
                                <Tooltip title="top -b -n 1">
                                    <Button >TOP 조회</Button>
                                </Tooltip>
                                <Tooltip title="ps -xfl">
                                    <Button>PS 조회</Button>
                                </Tooltip>
                                <Tooltip title="netstat -tnlp">
                                    <Button>NetStat 조회</Button>
                                </Tooltip>
                            </ButtonGroup>
                        </Grid>
                        <Grid item xs={12} sm={4}>
                            <Box align={"right"}>
                                <Button variant={"outlined"}
                                        color={"primary"}
                                        onClick={event => {}}
                                >터미널 열기</Button>
                            </Box>
                        </Grid>
                    </Grid>
                </Box>

                <Box my={3}>
                    TOP 조회 결과
                    <TextareaAutosize defaultValue="위 버튼을 누르면 결과를 즉시 확인할 수 있습니다."
                                      readOnly={true}
                                      style={{
                                          width: '100%',
                                          height: "500px",
                                          backgroundColor: "black",
                                          color: "white",
                                          padding: '10px',
                                          overflow: "scroll"
                                      }}
                                      value={"top - 10:36:32 up 238 days, 18:33,  1 user,  load average: 2.13, 2.10, 2.14\n" +
                                      "Tasks: 407 total,   1 running, 405 sleeping,   0 stopped,   1 zombie\n" +
                                      "%Cpu(s):  0.2 us,  0.5 sy,  0.0 ni, 95.0 id,  4.2 wa,  0.0 hi,  0.0 si,  0.0 st\n" +
                                      "KiB Mem : 98992608 total,   395872 free, 25096172 used, 73500568 buff/cache\n" +
                                      "KiB Swap:        0 total,        0 free,        0 used. 68981496 avail Mem\n" +
                                      "\n" +
                                      "  PID USER      PR  NI    VIRT    RES    SHR S  %CPU %MEM     TIME+ COMMAND\n" +
                                      "14474 danawa    20   0  164368   2464   1560 R   6.2  0.0   0:00.01 top\n" +
                                      "18879 root      20   0 3104796 117704   9204 S   6.2  0.1   5335:59 dockerd\n" +
                                      "20762 root      20   0   10.1g  57836   8772 S   6.2  0.1   2340:31 etcd\n" +
                                      "20784 root      20   0  504788 278156  19288 S   6.2  0.3   5745:45 kube-apiserver\n" +
                                      "    1 root      20   0  193228   5988   2396 S   0.0  0.0   1266:58 systemd\n" +
                                      "    2 root      20   0       0      0      0 S   0.0  0.0   0:13.77 kthreadd\n" +
                                      "    4 root       0 -20       0      0      0 S   0.0  0.0   0:00.00 kworker/0:0H\n" +
                                      "    6 root      20   0       0      0      0 S   0.0  0.0   4:58.81 ksoftirqd/0\n" +
                                      "    7 root      rt   0       0      0      0 S   0.0  0.0   0:55.47 migration/0\n" +
                                      "    8 root      20   0       0      0      0 S   0.0  0.0   0:00.00 rcu_bh\n" +
                                      "    9 root      20   0       0      0      0 S   0.0  0.0 619:09.72 rcu_sched\n" +
                                      "   10 root       0 -20       0      0      0 S   0.0  0.0   0:00.00 lru-add-drain\n" +
                                      "   11 root      rt   0       0      0      0 S   0.0  0.0   1:07.04 watchdog/0\n" +
                                      "   12 root      rt   0       0      0      0 S   0.0  0.0   1:05.30 watchdog/1\n" +
                                      "   13 root      rt   0       0      0      0 S   0.0  0.0   0:48.19 migration/1\n" +
                                      "   14 root      20   0       0      0      0 S   0.0  0.0   3:02.72 ksoftirqd/1\n" +
                                      "   16 root       0 -20       0      0      0 S   0.0  0.0   0:00.00 kworker/1:0H"}
                    />
                </Box>
            </CardContent>
        </Card>
    )
}
const top100Films = [
    { title: 'ES검색' },
    { title: '쿠버1'},
    { title: '쿠버2'},
    { title: '쿠버3'},
    { title: '쿠버4'},
];
function AdminGroup() {
    const classes = useStyles();
    return (
        <React.Fragment>
            <Card>
                <CardContent>
                    <Box my={2}>
                        <Autocomplete
                            multiple
                            size="small"
                            options={top100Films}
                            disableCloseOnSelect
                            getOptionLabel={(option) => option.title}
                            renderOption={(option, { selected }) => (
                                <React.Fragment>
                                    <Checkbox
                                        icon={icon}
                                        checkedIcon={checkedIcon}
                                        style={{ marginRight: 8 }}
                                        checked={selected}
                                    />
                                    {option.title}
                                </React.Fragment>
                            )}
                            style={{display: "inline"}}
                            renderInput={(params) => (
                                <TextField {...params} variant="outlined" label="그룹 추가" placeholder="" style={{minWidth: 300}} />
                            )}
                        />
                        <Button variant={"outlined"} color={"primary"} style={{height: '40px'}}>추가</Button>
                    </Box>

                    <Box style={{minHeight: '300px'}}>
                        <Table my={2}>
                            <TableHead>
                                <TableRow>
                                    <TableCell>#</TableCell>
                                    <TableCell>그룹</TableCell>
                                    <TableCell>할당된 서비스</TableCell>
                                    <TableCell>제거</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                <TableRow>
                                    <TableCell>1</TableCell>
                                    <TableCell>
                                        <Link href={"/groups/1"}>ES 검색</Link>
                                    </TableCell>
                                    <TableCell>3</TableCell>
                                    <TableCell>
                                        <Button style={{color: "white", backgroundColor: "red"}} variant={"contained"}>제거</Button>
                                    </TableCell>
                                </TableRow>
                                <TableRow>
                                    <TableCell>2</TableCell>
                                    <TableCell>
                                        <Link href={"/groups/1"}>ES 검색</Link>
                                    </TableCell>
                                    <TableCell>2</TableCell>
                                    <TableCell>
                                        <Button style={{color: "white", backgroundColor: "red"}} variant={"contained"}>제거</Button>
                                    </TableCell>
                                </TableRow>
                                <TableRow>
                                    <TableCell>3</TableCell>
                                    <TableCell>
                                        <Link href={"/groups/1"}>쿠버 테스트</Link>
                                    </TableCell>
                                    <TableCell>9</TableCell>
                                    <TableCell>
                                        <Button style={{color: "white", backgroundColor: "red"}} variant={"contained"}>제거</Button>
                                    </TableCell>
                                </TableRow>
                            </TableBody>
                        </Table>
                    </Box>

                </CardContent>
            </Card>
        </React.Fragment>
    )
}

function AdminServerDetail() {
    const classes = useStyles();
    const [open, setOpen] = React.useState(false);
    const theme = useTheme();
    const fullScreen = useMediaQuery(theme.breakpoints.down('xs'));
    const [tabIndex, setTabIndex] = React.useState(0);

    const handleClickOpen = () => {
        setOpen(true);
    };

    const handleClose = () => {
        setOpen(false);
    };

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
                                    서버 조회
                                </Typography>
                            </Box>
                        </Grid>
                        <Grid item xs={6}>
                            <Box align={"right"}>
                                <Button variant={"outlined"} onClick={() => history.go(-1)}>뒤로</Button>
                            </Box>
                        </Grid>
                    </Grid>
                </Box>

                <ShowField label={"이름"} val={"esapi1"} />

                <ShowField label={"아이피"} val={"119.205.194.131"} />

                <ShowField label={"포트"} val={"22"} />

                <ShowField label={"계정"} val={"danawa"} />

                <Box my={3}>
                    <Grid container>
                        <Grid item xs={3} sm={3}>
                            <Box align={"right"} className={classes.label}>비밀번호</Box>
                        </Grid>
                        <Grid item xs={9} sm={9}>
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
                        <SystemStatus />
                    </TabPanel>
                    <TabPanel value={tabIndex} index={1}>
                        <AdminGroup />
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
                                    현재 비밀번호
                                </Grid>
                                <Grid item xs={8}>
                                    <TextField fullWidth={true}
                                               label={""}
                                               required={true}
                                    />
                                </Grid>
                            </Grid>
                        </Box>
                        <Box my={3}>
                            <Grid container>
                                <Grid item xs={4}>
                                    신규 비밀번호
                                </Grid>
                                <Grid item xs={8}>
                                    <TextField fullWidth={true}
                                               label={""}
                                               required={true}
                                    />
                                </Grid>
                            </Grid>
                        </Box>
                    </DialogContent>
                    <DialogActions>
                        <Grid container>
                            <Grid item xs={4}>
                                <Button autoFocus variant={"outlined"} onClick={handleClose} color="primary">
                                    연결테스트
                                </Button>
                            </Grid>
                            <Grid item xs={8}>
                                <Box align={"right"}>
                                    <Button style={{marginLeft: '2px', marginRight: '2px'}} autoFocus variant={"outlined"} onClick={handleClose} color="primary">
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
            </Container>
        </Box>
    );
}

export default AdminServerDetail;