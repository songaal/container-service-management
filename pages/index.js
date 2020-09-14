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
Index.getInitialProps = async  (ctx) => {
    const { Users } = require("../models")

    // const {Sample} = require('../models');

    // user_id: DataTypes.STRING,
    //     name: DataTypes.STRING,
    //     password: DataTypes.STRING,
    //     admin: DataTypes.BOOLEAN,
    //     create_date: DataTypes.DATE

    const user = {name: "aaa", admin: true, password: "pass"};
    // console.log('1>>>', body, Sample)
    //
    const newUser = await Users.create(user);
    console.log('newUser >>>', newUser)
    //
    // let s = await Sample.findOne({where: {key: body['key']}});
    // console.log('>>>', s)
    //
    // await s.destroy();

    return {}
}



export default Index;