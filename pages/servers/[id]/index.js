import React from 'react';
import Container from '@material-ui/core/Container';
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';
import Header from "../../../components/Header";
import {Box, TextareaAutosize, Tooltip} from "@material-ui/core";
import CssBaseline from "@material-ui/core/CssBaseline";
import {makeStyles} from '@material-ui/core/styles';
import Button from '@material-ui/core/Button';
import Link from "@material-ui/core/Link";
import Divider from "@material-ui/core/Divider";
import ButtonGroup from '@material-ui/core/ButtonGroup';
import fetch from "isomorphic-unfetch";
import {useRouter} from "next/router";
import ServerTerminal from "./terminal";

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

function ServerDetail() {
    const classes = useStyles();
    const router = useRouter();
    const [server, setServer] = React.useState({})
    const [cmdName, setCmdName] = React.useState("위 버튼을 눌러 조회하세요.")
    const [cmdResult, setCmdResult] = React.useState("")

    React.useEffect(() => {
        init()

    }, [])

    const init = () => {
        fetch(`/api${location.pathname}`)
            .then(res => res.json())
            .then(body => {
                if (body['status'] === 'success') {
                    setServer(body['server'])
                }
            })
    }

    const execCmd = (cmd, name) => {
        setCmdResult("")
        setCmdName("조회 중입니다.")

        fetch(`/api${location.pathname}/action?type=exec`, {
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
        <Box className={classes.root}>
            <CssBaseline />
            <Header />
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
                                {/*<Button variant={"outlined"} onClick={() => router.back()}>뒤로</Button>*/}
                            </Box>
                        </Grid>
                    </Grid>
                </Box>

                <ShowField label={"이름"} val={server['name']} />

                {/*<ShowField label={"그룹"} val={"ES검색그룹"} />*/}

                <ShowField label={"아이피"} val={server['ip']} />

                <ShowField label={"포트"} val={server['port']} />

                <ShowField label={"계정"} val={server['user']} />

                <Box my={3}>
                    <Divider />
                </Box>

                <Box my={3}>
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
                                {/*<Tooltip title="who">*/}
                                {/*    <Button onClick={() => execCmd("who", "사용자 조회")}*/}
                                {/*    >사용자 조회</Button>*/}
                                {/*</Tooltip>*/}
                            </ButtonGroup>
                        </Grid>
                        <Grid item xs={12} sm={4}>
                            <Box align={"right"}>
                                <Button variant={"outlined"}
                                        color={"primary"}
                                        target="_blank"
                                        href={`/servers/${server['id']}/terminal`}
                                >터미널 열기</Button>
                            </Box>
                        </Grid>
                    </Grid>
                </Box>

                <Box my={3}>
                    <TextareaAutosize defaultValue="위 버튼을 누르면 결과를 즉시 확인할 수 있습니다."
                                      readOnly={true}
                                      style={{
                                          width: '100%',
                                          backgroundColor: "black",
                                          color: "white",
                                          padding: '10px',
                                          fontSize: "12pt",
                                          overflow: 'auto',
                                      }}
                                      value={cmdResult || cmdName}
                    />

                {/*    width: '100%',
                                          height: "500px",
                                          backgroundColor: "black",
                                          color: "white",
                                          padding: '10px',
                                          overflow: "scroll"*/}
                </Box>
            </Container>
        </Box>
    );
}

export default ServerDetail;