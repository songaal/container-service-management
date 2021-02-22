import React from 'react';
import Box from '@material-ui/core/Grid';
import {makeStyles} from "@material-ui/core/styles";
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
    let path = "/sign-in"
    if (ctx && ctx.res) {
        if (ctx.req.session && ctx.req.session.auth) {
            ctx.res.writeHead(301, {
                Location: '/home'
            });
            path = "/home"
        } else {
            ctx.res.writeHead(301, {
                Location: '/sign-in'
            });
        }
        ctx.res.end();
    }


    return {
        Location: path
    }
}


export default withSession(Page);