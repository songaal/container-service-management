import React from 'react';
import PropTypes from 'prop-types';
import Container from '@material-ui/core/Container';
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';
import Header from "../../components/Header";
import {Box, TextareaAutosize, TextField, useTheme} from "@material-ui/core";
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
import Service from "../../components/service";
import Authentication from "../../components/authentication";
import Server from "../../components/server";
import fetch from "isomorphic-unfetch"
import { SnackbarProvider, useSnackbar } from 'notistack';

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


function GroupDetail() {
    const classes = useStyles();
    const { enqueueSnackbar, closeSnackbar } = useSnackbar();
    const theme = useTheme();
    const [tabIndex, setTabIndex] = React.useState(0);
    const [editOpen, setEditOpen] = React.useState(false);
    const fullScreen = useMediaQuery(theme.breakpoints.down('xs'));
    const [anchorEl, setAnchorEl] = React.useState(null);
    const [group, setGroup] = React.useState({})

    React.useEffect(() => {
        location.pathname
        fetch("/api" + location.pathname)
            .then(res => res.json())
            .then(body => {
                if (body['status'] === 'success') {
                    setGroup(body['group'])
                } else {
                    enqueueSnackbar(body['message'], {variant: "error"})
                }
            })
    }, [])


    return (
        <Box className={classes.root}>
            <CssBaseline />
            <Header  active={1} />
            <Container maxWidth={"xl"} >
                <br/>
                <Grid container>
                    <Grid item xs={8}>
                        <Box>
                            <Typography variant="h4" gutterBottom>
                                {group['name'] || ""}
                            </Typography>
                        </Box>
                    </Grid>
                    <Grid item xs={4}>
                        <Box style={{textAlign: "right"}}>
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
                                <MenuItem onClick={() => setEditOpen(true)}>그룹 수정</MenuItem>
                                <MenuItem >그룹 삭제</MenuItem>
                            </Menu>
                        </Box>
                    </Grid>
                    <Grid item xs={12}>
                        <Box style={{maxHeight: "200px", overflow: "auto"}}>
                            <pre style={{fontSize: "1.1em"}}>
                                {group['description'] || ""}
                            </pre>
                        </Box>
                    </Grid>
                </Grid>

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
                            <Tab label="권한" {...a11yProps(2)} />
                        </Tabs>
                    </AppBar>
                    <TabPanel value={tabIndex} index={0}>
                        <Service />
                    </TabPanel>
                    <TabPanel value={tabIndex} index={1}>
                        <Server />
                    </TabPanel>
                    <TabPanel value={tabIndex} index={2}>
                        <Authentication />
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