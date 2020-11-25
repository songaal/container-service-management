import React from 'react';
import Container from '@material-ui/core/Container';
import Box from '@material-ui/core/Grid';
import {makeStyles} from "@material-ui/core/styles";
import CssBaseline from "@material-ui/core/CssBaseline";
import fetch from "isomorphic-unfetch";
import {withSession} from "next-session";

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

function Page() {
    const classes = useStyles();
    return (
        <Box className={classes.root}>

        </Box>
    );
}
Page.getInitialProps = async (ctx) => {
    if (ctx.req.session.auth) {
        ctx.res.writeHead(301, {
            Location: '/home'
        });
    } else {
        ctx.res.writeHead(301, {
            Location: '/sign-in'
        });

    }
    ctx.res.end();
    return {}
}


export default withSession(Page);