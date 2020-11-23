import React from 'react';
import PropTypes from 'prop-types';
import Container from '@material-ui/core/Container';
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';
import Header from "../../components/Header";
import {Box, TextareaAutosize, TextField, useTheme,} from "@material-ui/core";
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
import SettingsServer from "../../components/settingsServer"
import SettingsService from "../../components/settingsService"
import SettingsUser from "../../components/settingsUser"


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


function Settings() {
    const classes = useStyles();
    const theme = useTheme();
    const fullScreen = useMediaQuery(theme.breakpoints.down('xs'));
    const [tabIndex, setTabIndex] = React.useState(0);
    const [editOpen, setEditOpen] = React.useState(false);


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
                        <SettingsService />
                    </TabPanel>
                    <TabPanel value={tabIndex} index={1}>
                        <SettingsServer />
                    </TabPanel>
                    <TabPanel value={tabIndex} index={2}>
                        <SettingsUser />
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

export default Settings