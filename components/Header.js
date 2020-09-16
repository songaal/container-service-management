import React from 'react';
import AppBar from '@material-ui/core/AppBar';
import Button from '@material-ui/core/Button';
import CssBaseline from '@material-ui/core/CssBaseline';
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';
import Link from '@material-ui/core/Link';
import {makeStyles} from '@material-ui/core/styles';
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';
import Box from '@material-ui/core/Box';
import Grid from '@material-ui/core/Grid';
import fetch from "isomorphic-unfetch";
import Router from "next/router";

const useStyles = makeStyles((theme) => ({
    appBar: {
        borderBottom: `1px solid ${theme.palette.divider}`,
    },
    toolbar: {
        flexWrap: 'wrap'
    },
    // toolbarTitle: {
    //     flexGrow: 1,
    // },
    link: {
        margin: theme.spacing(1, 1.5),
    },
    heroContent: {
        padding: theme.spacing(8, 0, 6),
    },
    cardHeader: {
        backgroundColor:
            theme.palette.type === 'light' ? theme.palette.grey[200] : theme.palette.grey[700],
    },
    active: {
        margin: theme.spacing(1, 1.5),
        borderBottom: "2px solid",
        paddingBottom: "2px"
    }
}));

export default function Header({active}) {
    const classes = useStyles();
    const [anchorEl, setAnchorEl] = React.useState(null);
    const [user, setUser] = React.useState({});

    React.useEffect(function() {
        fetch(`/api/auth/validate`)
            .then(res => res.json())
            .then(body => {
                if (body.status !== 'success') {
                    Router.push("/sign-in")
                } else {
                    setUser(body['user'])
                    if ((!body['user']['admin']) && location.pathname.startsWith("/settings")) {
                        // 관리자 아닐겨우
                        Router.push("/home")
                    }
                }
            })
    }, [])

    const handleClick = (event) => {
        setAnchorEl(event.currentTarget);
    };

    const handleClose = () => {
        setAnchorEl(null);
    };

    const logout = async () => {
        await fetch(`/api/auth/logout`)
        await Router.replace("/sign-in")
    }

    const display = user['admin'] === true ? 'inline' : 'none'

    return (
        <React.Fragment>
            <CssBaseline/>
            <AppBar position="static"  color="default" elevation={0} className={classes.appBar}>
                <Toolbar className={classes.toolbar}>
                    <Grid container>
                        <Grid item xs={9}>
                            <Typography variant="h6" color="inherit" style={{display: "inline"}} noWrap className={classes.toolbarTitle}>
                                운영관리
                            </Typography>
                            <nav style={{display: "inline", marginLeft: '20px'}}>
                                <Link underline={'none'} variant="button" color="textPrimary" href="/home" className={ active === 0 ? classes.active : classes.link}>
                                    홈
                                </Link>
                                <Link underline={'none'} variant="button" color="textPrimary" href="/groups" className={ active === 1 ? classes.active : classes.link}>
                                    그룹
                                </Link>
                                <Link style={{display}} underline={'none'} variant="button" color="textPrimary" href="/settings" className={ active === 2 ? classes.active : classes.link}>
                                    설정
                                </Link>
                            </nav>
                        </Grid>
                        <Grid item  xs={3}>
                            <Box align="right">
                                <Button onClick={handleClick}>
                                    {user['name']||""}
                                </Button>
                                <Menu
                                    anchorEl={anchorEl}
                                    keepMounted
                                    open={Boolean(anchorEl)}
                                    onClose={handleClose}
                                >
                                    <MenuItem  onClick={() => {location.href="/my"}}>개인정보</MenuItem>
                                    <MenuItem onClick={logout}>로그아웃</MenuItem>
                                </Menu>
                            </Box>
                        </Grid>
                    </Grid>





                    {/*<Button href="#" color="primary" variant="outlined" className={classes.link}>*/}
                    {/*  Login*/}
                    {/*</Button>*/}
                </Toolbar>
            </AppBar>
        </React.Fragment>

    )
}