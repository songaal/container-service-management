import React from 'react';
import PropTypes from 'prop-types';
import Container from '@material-ui/core/Container';
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';
import Header from "../../components/Header";
import {Box, TextareaAutosize, TextField, Tooltip, useTheme} from "@material-ui/core";
import CssBaseline from "@material-ui/core/CssBaseline";
import {makeStyles} from '@material-ui/core/styles';
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';
import AppBar from '@material-ui/core/AppBar';
import Button from '@material-ui/core/Button';
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';
import DialogTitle from "@material-ui/core/DialogTitle";
import DialogContent from "@material-ui/core/DialogContent";
import DialogActions from "@material-ui/core/DialogActions";
import Dialog from "@material-ui/core/Dialog";
import useMediaQuery from "@material-ui/core/useMediaQuery/useMediaQuery";
import ArrowDropDownIcon from '@material-ui/icons/ArrowDropDown';
import Link from "@material-ui/core/Link";
import Divider from "@material-ui/core/Divider";
import ButtonGroup from '@material-ui/core/ButtonGroup';
import { SnackbarProvider, useSnackbar } from 'notistack';
import fetch from "isomorphic-unfetch";
import {useRouter} from "next/router";

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

function ServerDetail() {
    const classes = useStyles();
    const router = useRouter();

    React.useEffect(() => {

        fetch(`/api${location.pathname}`)
            .then(res => res.json())
            .then(body => {
                console.log(body)
            })



    }, [])


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
                                <Button variant={"outlined"} onClick={() => history.go(-1)}>뒤로</Button>
                            </Box>
                        </Grid>
                    </Grid>
                </Box>

                <ShowField label={"이름"} val={"esapi1"} />

                <ShowField label={"그룹"} val={"ES검색그룹"} />

                <ShowField label={"아이피"} val={"119.205.194.131"} />

                <ShowField label={"포트"} val={"22"} />

                <ShowField label={"계정"} val={"danawa"} />

                <Box my={3}>
                    <Divider />
                </Box>


                <Typography variant={"h6"}>
                    시스템 조회
                </Typography>

                <Box my={3}>
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
                    <Box>TOP 조회 결과</Box>
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
                                      value={""}
                    />
                </Box>
            </Container>
        </Box>
    );
}

export default ServerDetail;