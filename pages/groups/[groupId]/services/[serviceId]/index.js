import React from 'react';
import Container from '@material-ui/core/Container';
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';
import Header from "../../../../../components/Header";
import {Box, MenuItem} from "@material-ui/core";
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
                            <Link href={url}>
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

function ServicesDetail() {
    const classes = useStyles();
    const router = useRouter()
    const [anchorEl, setAnchorEl] = React.useState(null);
    const [execEl, setExecEl] = React.useState(null);
    const [servers, setServers] = React.useState([])
    const [service, setService] = React.useState({})

    const { groupId, serviceId } = router.query

    React.useEffect(() => {
        init()
    }, [])

    const init = () => {
        fetch(`/api/groups/${groupId}/servers`)
            .then(res => res.json())
            .then(body => setServers(body['servers']))

        fetch(`/api/groups/${groupId}/services/${serviceId}`)
            .then(res => res.json())
            .then(body => {
                if (body['status'] === 'success') {
                    setService(body['service']);
                }
            })
    }


    const selectedServer = servers.find(server => String(server['id']) === service['serverId'])||{}

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
                                    <MenuItem onClick={() => Router.push(`${location.pathname}/edit`)}>

                                        서비스 수정</MenuItem>
                                    <MenuItem>서비스 삭제</MenuItem>
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

                        </Grid>
                    </Grid>
                </Box>

                <Box my={3}>
                    <Divider />
                </Box>

                {/*  컨테이너  */}
                <Box my={3}>
                    <Box align={"center"}>
                        <Grid container>
                            <Box clone  order={{xs: 2, md: 1}}>
                                <Grid item xs={12} sm={12} md={6}>
                                    <ShowField label={"상태"} val={"UP"} />

                                    <ShowField label={"업타임"} val={"233일 5시 30분"} />

                                    <ShowField label={"사용 CPU(%)"} val={"20"} />

                                    <ShowField label={"사용 MEM(%)"} val={"60"} />

                                    <ShowField label={"네트워크"} val={"overlay"} />

                                    <ShowField label={"이미지"} val={"apache-tomcat:8.5"} />

                                    <ShowField label={"포트1"} val={"8080:8080"} />

                                    <ShowField label={"포트2"} val={"80:80"} />
                                </Grid>
                            </Box>
                            <Box clone order={{xs: 1, md: 2}}>
                                <Grid item xs={12} sm={12} md={6}>
                                    <Box my={3}>
                                        <Grid container>
                                            <Grid item xs={3} sm={3}>
                                                <Box align={"right"} className={classes.label}> 실행 </Box>
                                            </Grid>
                                            {/*<Grid item xs={2} sm={3}>*/}
                                            {/*    <Typography className={classes.value}>*/}
                                            {/*        대기 중*/}
                                            {/*    </Typography>*/}
                                            {/*</Grid>*/}
                                            <Grid item xs={9} sm={9}>
                                                <Box>
                                                    <Button size={"small"} onClick={event => setExecEl(event.currentTarget)} variant={"outlined"} color={"primary"}>
                                                        실행 <ArrowDropDownIcon/>
                                                    </Button>
                                                    <Menu
                                                        style={{marginTop: "45px"}}
                                                        anchorEl={execEl}
                                                        open={Boolean(execEl)}
                                                        keepMounted
                                                        onClose={() => setExecEl(null)}
                                                    >
                                                        <MenuItem>시작</MenuItem>
                                                        <MenuItem>종료</MenuItem>
                                                        <MenuItem>업데이트후 재시작</MenuItem>
                                                    </Menu>
                                                </Box>
                                            </Grid>
                                        </Grid>
                                    </Box>

                                    <ShowField label={"로그"} val={"컨테이너 로그 열기"} url={"#"} />
                                </Grid>
                            </Box>
                        </Grid>
                    </Box>
                </Box>


                {/*  프로세스  */}
                <Box my={3}>
                    <Grid container>
                        <Grid item xs={6}>
                            {/*<ShowField label={"서비스타입"} val={"프로세스"} />*/}

                        </Grid>
                        <Grid item xs={6}>

                        </Grid>
                    </Grid>
                </Box>

            </Container>
        </Box>
    );
}

export default ServicesDetail;