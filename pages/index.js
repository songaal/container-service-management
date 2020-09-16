import React from 'react';
import Container from '@material-ui/core/Container';
import Box from '@material-ui/core/Grid';
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

function Index() {

    const classes = useStyles();
    return (
        <Box className={classes.root}>
            <CssBaseline />

            <Container maxWidth={"xl"} >
                INDEX
            </Container>
        </Box>
    );
}
Index.getInitialProps = async (ctx) => {


    return {}
}



export default Index;