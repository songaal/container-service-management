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
    IconButton
} from '@material-ui/core';
import styled from "styled-components";
import {spacing} from "@material-ui/system";
import StarIcon from '@material-ui/icons/Star';
import StarBorderIcon from '@material-ui/icons/StarBorder';
import StarOutlineIcon from '@material-ui/icons/StarOutlined';
import fetch from "isomorphic-unfetch";
import {useRouter} from "next/router";
import {useSnackbar} from "notistack";

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
    const router = useRouter();
    const [system, setSystem] = React.useState({})
    const [groupAuthList, setGroupAuthList] = React.useState([])
    const [tmpFavorites, setTmpFavorites] = React.useState({})
    const { enqueueSnackbar, closeSnackbar } = useSnackbar();

    React.useEffect(() => {
        init()
    }, [])

    const init = () => {
        fetch(`/api/home`)
            .then(res => res.json())
            .then(body => {
                if (body['status'] === 'success') {
                    setSystem(body['stats']['system'])
                    setGroupAuthList(body['stats']['groupAuthList'])
                }
            })
    }

    const handleFavorites = (event, groupId, beforeFavorites, afterFavorites) => {
        event.preventDefault()
        event.stopPropagation()
        fetch(`/api/home`, {
            method: "PUT",
            body: JSON.stringify({
                groupId: groupId,
                favorites: afterFavorites
            })
        })
            .then(res => res.json())
            .then(body => {
                if (body['status'] === 'success') {
                    setTmpFavorites({
                        ...tmpFavorites,
                        [groupId]: afterFavorites
                    })
                    if (afterFavorites === "1") {
                        enqueueSnackbar("관심 그룹 등록하였습니다.", {variant: "success"})
                    } else {
                        enqueueSnackbar("관심 그룹 해제하였습니다.", {variant: "success"})
                    }
                } else {
                    enqueueSnackbar("관심 그룹 등록실패하였습니다.", {variant: "error"})
                }
            })
    }

    const viewGroupAuthList = groupAuthList.sort((g1, g2) => {
        return (g1['group']||{})['name']||'' - (g2['group']||{})['name']||''
    }).sort((g1, g2) => {
        return Number(g2['favorites']||'0') - Number(g1['favorites']||'0')
    }).map(groupAuth => {
        const groupId = groupAuth['groupId']
        if (tmpFavorites[groupId]) {
            return {
                ...groupAuth,
                favorites: tmpFavorites[groupId]
            }
        } else {
            return groupAuth
        }
    })

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
                                    그룹: {system['groupSize']||'0'}
                                </Box>
                            </Grid>
                            <Grid item xs={6} md={3}>
                                <Box style={{fontSize: "1.1rem"}}>
                                    서비스: {system['serviceSize']||'0'}
                                </Box>
                            </Grid>
                            <Grid item xs={6} md={3}>
                                <Box style={{fontSize: "1.1rem"}}>
                                    서버: {system['serverSize']||'0'}
                                </Box>
                            </Grid>
                            <Grid item xs={6} md={3}>
                                <Box style={{fontSize: "1.1rem"}}>
                                    사용자: {system['userSize']||'0'}
                                </Box>
                            </Grid>
                        </Grid>
                    </CardContent>
                </Card>

                <br/>

                <Grid container>

                    {
                        viewGroupAuthList.length === 0 ?
                            <Box style={{textAlign: "center"}}>
                                서비스가 없습니다.
                            </Box>
                            :
                            viewGroupAuthList.map((ga, index) => {
                                const group = ga['group']
                                return (
                                    <Grid key={index} item xs={12} md={6} xl={4} style={{padding: "5px"}}>
                                        <Card>
                                            <CardContent mt={2}
                                                         style={{maxHeight: "170px", cursor: "pointer"}}
                                                         onClick={() => router.push(`/groups/${group['id']}`)}
                                            >
                                                <Grid container>
                                                    <Grid item xs={8}>
                                                        <Typography component={"h6"} style={{fontWeight: "bold"}}>
                                                            {group['name']}
                                                        </Typography>
                                                    </Grid>
                                                    <Grid item xs={4} align={"right"} >
                                                        <IconButton onClick={event => handleFavorites(event, group['id'], ga['favorites'], ga['favorites'] === "1" ? "0" : "1")}>
                                                            <StarIcon style={{color: '#ffeb3b', display: ga['favorites'] === "1" ? "block" : "none"}} />
                                                            <StarBorderIcon style={{color: '#000', display: ga['favorites'] === "1" ? "none" : "block"}} />

                                                        </IconButton>
                                                    </Grid>
                                                </Grid>
                                                <p style={{textOverflow: "ellipsis", overflow: "hidden", whiteSpace: "nowrap", height: "20px"}}>
                                                    {group['description']}
                                                </p>
                                                <Grid container align={"center"}>
                                                    <Grid item xs={6} mt={1}>
                                                        서비스 {group['service_count']||0}
                                                    </Grid>
                                                    <Grid item xs={6} mt={1}>
                                                        서버 {group['server_count']||0}
                                                    </Grid>
                                                    <Grid item xs={6} mt={1}>
                                                        사용자 {group['user_count']||0}
                                                    </Grid>
                                                    <Grid item xs={6} mt={1}>

                                                    </Grid>
                                                </Grid>
                                            </CardContent>
                                        </Card>
                                    </Grid>
                                )
                            })
                    }
                </Grid>

            </Container>
        </Grid>
    );
}

export default Home