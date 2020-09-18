import React from 'react';
import Link from '@material-ui/core/Link';
import Grid from '@material-ui/core/Grid';
import {Box, Card, CardContent, Table, TableBody, TableCell, TableHead, TableRow, TextField} from "@material-ui/core";
import {makeStyles} from '@material-ui/core/styles';
import Button from '@material-ui/core/Button';

const useStyles = makeStyles( theme => ({
    root: {
        flexGrow: 1,
        width: '100%',
        backgroundColor: theme.palette.background.paper,
    }
}));

function Server() {
    const classes = useStyles();

    return (
        <Box className={classes.root}>
            <Card>
                <CardContent>

                    <Box my={2}>
                        <Grid container>
                            <Grid item xs={8}>
                                <TextField variant={"outlined"}
                                           color={"primary"}
                                           size={"small"}
                                           placeholder="검색"
                                />
                                <Button style={{height: '40px'}} variant={"outlined"} color={"default"}>검색</Button>
                            </Grid>
                            <Grid item xs={4}>
                            </Grid>
                        </Grid>
                    </Box>

                    <Table my={2}>
                        <TableHead>
                            <TableRow>
                                <TableCell>#</TableCell>
                                <TableCell>서버</TableCell>
                                <TableCell>아이피</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            <TableRow>
                                <TableCell>1</TableCell>
                                <TableCell>
                                    <Link href={"/server/1"}>elk1-dev</Link>
                                </TableCell>
                                <TableCell>119.205.194.121</TableCell>
                            </TableRow>
                            <TableRow>
                                <TableCell>2</TableCell>
                                <TableCell>
                                    <Link href={"/server/1"}>elk2-dev</Link>
                                </TableCell>
                                <TableCell>119.205.194.122</TableCell>
                            </TableRow>
                            <TableRow>
                                <TableCell>3</TableCell>
                                <TableCell>
                                    <Link href={"/server/1"}>kube1</Link>
                                </TableCell>
                                <TableCell>
                                    119.205.194.98
                                </TableCell>
                            </TableRow>
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </Box>
    );
}

export default Server;