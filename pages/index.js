import React from 'react';
import Container from '@material-ui/core/Container';
import Link from '@material-ui/core/Link';
import Grid from '@material-ui/core/Grid';
import Box from '@material-ui/core/Grid';
import Header from "../components/Header";
import {makeStyles} from "@material-ui/core/styles";
import CssBaseline from "@material-ui/core/CssBaseline";

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
        <Box className={classes.root}>
            <CssBaseline />
            <Header  active={0} />

            <Container maxWidth={"xl"} >

                HOME
            </Container>
        </Box>
    );
}

export default Home