import React from 'react';
import Container from '@material-ui/core/Container';
import Link from '@material-ui/core/Link';
import Box from '@material-ui/core/Grid';
import Header from "../components/Header";
import {makeStyles} from "@material-ui/core/styles";
import CssBaseline from "@material-ui/core/CssBaseline";
import {
    Grid,
    Typography,
    Card ,
    CardContent,
} from '@material-ui/core';
import styled from "styled-components";
import {spacing} from "@material-ui/system";
import StarIcon from '@material-ui/icons/Star';
import StarBorderIcon from '@material-ui/icons/StarBorder';
import StarOutlineIcon from '@material-ui/icons/StarOutlined';


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
        marginTop: 10
    }
}));





function Home() {

    const classes = useStyles();
    return (
        <Grid className={classes.root}>
            <CssBaseline />
            <Header  active={0} />
            <Container maxWidth={"xl"} >
                <br/>
                <Card>
                    <CardContent>
                        <Grid container mt={1}>
                            <Grid item xs={6} md={3}>
                                <Box style={{fontSize: "1.1rem"}}>
                                    그룹: 1
                                </Box>
                            </Grid>
                            <Grid item xs={6} md={3}>
                                <Box style={{fontSize: "1.1rem"}}>
                                    서비스: 20
                                </Box>
                            </Grid>
                            <Grid item xs={6} md={3}>
                                <Box style={{fontSize: "1.1rem"}}>
                                    서버: 3
                                </Box>
                            </Grid>
                            <Grid item xs={6} md={3}>
                                <Box style={{fontSize: "1.1rem"}}>
                                    사용자: 33
                                </Box>
                            </Grid>
                        </Grid>
                    </CardContent>
                </Card>

                <br/>

                <Grid container>

                    <Grid item xs={12} md={6} xl={4} style={{padding: "5px"}}>
                        <Card>
                            <CardContent mt={2} style={{maxHeight: "170px"}}>
                                <Grid container>
                                    <Grid item xs={8}>
                                        <Link href="/groups/1">
                                            <Typography component={"h6"} style={{fontWeight: "bold"}}>
                                                웹프론트
                                            </Typography>
                                        </Link>
                                    </Grid>
                                    <Grid item xs={4} align={"right"} >
                                        <Link href={"#"} color="secondary">
                                            <StarIcon style={{color: "#ffeb3b"}} />
                                            {/*<StarBorderIcon style={{color: "#000"}} />*/}
                                        </Link>
                                    </Grid>
                                </Grid>
                                <p style={{textOverflow: "ellipsis", overflow: "hidden", whiteSpace: "nowrap"}}>
                                    도커와 서버기반 하이브리드 PC윕서버입니다.도커와 서버기반 하이브리드 PC윕서버입니다.도커와 서버기반 하이브리드 PC윕서버입니다.도커와 서버기반 하이브리드 PC윕서버입니다.도커와 서버기반 하이브리드 PC윕서버입니다.도커와 서버기반 하이브리드 PC윕서버입니다.도커와 서버기반 하이브리드 PC윕서버입니다.도커와 서버기반 하이브리드 PC윕서버입니다.도커와 서버기반 하이브리드 PC윕서버입니다.도커와 서버기반 하이브리드 PC윕서버입니다.도커와 서버기반 하이브리드 PC윕서버입니다.도커와 서버기반 하이브리드 PC윕서버입니다.도커와 서버기반 하이브리드 PC윕서버입니다.
                                </p>
                                <Grid container align={"center"}>
                                    <Grid item xs={6} mt={1}>
                                        <Link href={"/groups/1#0"}>서비스 6</Link>
                                    </Grid>
                                    <Grid item xs={6} mt={1}>
                                        <Link href={"/groups/1#1"}>서버 6</Link>
                                    </Grid>
                                    <Grid item xs={6} mt={1}>
                                        <Link href={"/groups/1#2"}>사용자 6</Link>
                                    </Grid>
                                    <Grid item xs={6} mt={1}>

                                    </Grid>
                                </Grid>
                            </CardContent>
                        </Card>
                    </Grid>


                    <Grid item xs={12} md={6} xl={4} style={{padding: "5px"}}>
                        <Card>
                            <CardContent mt={2} style={{maxHeight: "170px"}}>
                                <Grid container>
                                    <Grid item xs={8}>
                                        <Link href="/groups/1">
                                            <Typography component={"h6"} style={{fontWeight: "bold"}}>
                                                테스트 API
                                            </Typography>
                                        </Link>
                                    </Grid>
                                    <Grid item xs={4} align={"right"} >
                                        <Link href={"#"}>
                                            <StarIcon style={{color: "#ffeb3b"}} />
                                            {/*<StarBorderIcon style={{color: "#000"}} />*/}
                                        </Link>
                                    </Grid>
                                </Grid>
                                <p style={{textOverflow: "ellipsis", overflow: "hidden", whiteSpace: "nowrap"}}>
                                    API 테스트
                                </p>
                                <Grid container align={"center"}>
                                    <Grid item xs={6} mt={1}>
                                        <Link href={"/groups/1#0"}>서비스 6</Link>
                                    </Grid>
                                    <Grid item xs={6} mt={1}>
                                        <Link href={"/groups/1#1"}>서버 6</Link>
                                    </Grid>
                                    <Grid item xs={6} mt={1}>
                                        <Link href={"/groups/1#2"}>사용자 6</Link>
                                    </Grid>
                                    <Grid item xs={6} mt={1}>

                                    </Grid>
                                </Grid>
                            </CardContent>
                        </Card>
                    </Grid>

                    <br/>

                    <Grid item xs={12} md={6} xl={4} style={{padding: "5px"}}>
                        <Card>
                            <CardContent mt={2} style={{maxHeight: "170px"}}>
                                <Grid container>
                                    <Grid item xs={8}>
                                        <Link href="/groups/1">
                                            <Typography component={"h6"} style={{fontWeight: "bold"}}>
                                                인증 서버
                                            </Typography>
                                        </Link>
                                    </Grid>
                                    <Grid item xs={4} align={"right"} >
                                        <Link href={"#"}>
                                            {/*<StarIcon style={{color: "#ffeb3b"}} />*/}
                                            <StarBorderIcon style={{color: "#000"}} />
                                        </Link>
                                    </Grid>
                                </Grid>
                                <p style={{textOverflow: "ellipsis", overflow: "hidden", whiteSpace: "nowrap"}}>
                                    인증서버 관리
                                </p>
                                <Grid container align={"center"}>
                                    <Grid item xs={6} mt={1}>
                                        <Link href={"/groups/1#0"}>서비스 6</Link>
                                    </Grid>
                                    <Grid item xs={6} mt={1}>
                                        <Link href={"/groups/1#1"}>서버 6</Link>
                                    </Grid>
                                    <Grid item xs={6} mt={1}>
                                        <Link href={"/groups/1#2"}>사용자 6</Link>
                                    </Grid>
                                    <Grid item xs={6} mt={1}>

                                    </Grid>
                                </Grid>
                            </CardContent>
                        </Card>
                    </Grid>

                    <Grid item xs={12} md={6} xl={4} style={{padding: "5px"}}>
                        <Card>
                            <CardContent style={{maxHeight: "170px"}}>
                                <Grid container>
                                    <Grid item xs={8}>
                                        <Link href="/groups/1">
                                            <Typography component={"h6"} style={{fontWeight: "bold"}}>
                                                쿠버네티스 클러스터 - 1
                                            </Typography>
                                        </Link>
                                    </Grid>
                                    <Grid item xs={4} align={"right"} >
                                        <Link href={"#"}>
                                            {/*<StarIcon style={{color: "#ffeb3b"}} />*/}
                                            <StarBorderIcon style={{color: "#000"}} />
                                        </Link>
                                    </Grid>
                                </Grid>
                                <p style={{textOverflow: "ellipsis", overflow: "hidden", whiteSpace: "nowrap"}}>
                                    클러스터 관리 (1/2)
                                </p>
                                <Grid container align={"center"}>
                                    <Grid item xs={6} mt={1}>
                                        <Link href={"/groups/1#0"}>서비스 6</Link>
                                    </Grid>
                                    <Grid item xs={6} mt={1}>
                                        <Link href={"/groups/1#1"}>서버 6</Link>
                                    </Grid>
                                    <Grid item xs={6} mt={1}>
                                        <Link href={"/groups/1#2"}>사용자 6</Link>
                                    </Grid>
                                    <Grid item xs={6} mt={1}>

                                    </Grid>
                                </Grid>
                            </CardContent>
                        </Card>
                    </Grid>

                    <br />
                    <Grid item xs={12} md={6} xl={4} style={{padding: "5px"}}>
                        <Card>
                            <CardContent style={{maxHeight: "170px"}}>
                                <Grid container>
                                    <Grid item xs={8}>
                                        <Link href="/groups/1">
                                            <Typography component={"h6"} style={{fontWeight: "bold"}}>
                                                쿠버네티스 클러스터 - 2
                                            </Typography>
                                        </Link>
                                    </Grid>
                                    <Grid item xs={4} align={"right"} >
                                        <Link href={"#"}>
                                            {/*<StarIcon style={{color: "#ffeb3b"}} />*/}
                                            <StarBorderIcon style={{color: "#000"}} />
                                        </Link>
                                    </Grid>
                                </Grid>
                                <p style={{textOverflow: "ellipsis", overflow: "hidden", whiteSpace: "nowrap"}}>
                                    클러스터 관리 (2/2)
                                </p>
                                <Grid container align={"center"}>
                                    <Grid item xs={6} mt={1}>
                                        <Link href={"/groups/1#0"}>서비스 6</Link>
                                    </Grid>
                                    <Grid item xs={6} mt={1}>
                                        <Link href={"/groups/1#1"}>서버 6</Link>
                                    </Grid>
                                    <Grid item xs={6} mt={1}>
                                        <Link href={"/groups/1#2"}>사용자 6</Link>
                                    </Grid>
                                    <Grid item xs={6} mt={1}>

                                    </Grid>
                                </Grid>
                            </CardContent>
                        </Card>
                    </Grid>

                </Grid>

            </Container>
        </Grid>
    );
}

export default Home