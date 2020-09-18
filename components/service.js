import React from 'react';
import Link from '@material-ui/core/Link';
import Grid from '@material-ui/core/Grid';
import {Box, Card, CardContent, Table, TableBody, TableCell, TableHead, TableRow, TextField} from "@material-ui/core";
import {makeStyles} from '@material-ui/core/styles';
import Button from '@material-ui/core/Button';
import { SnackbarProvider, useSnackbar } from 'notistack';
import fetch from "isomorphic-unfetch";
import Router from "next/router";

const useStyles = makeStyles( theme => ({
    root: {
        flexGrow: 1,
        width: '100%',
        backgroundColor: theme.palette.background.paper,
    }
}));

function Service() {
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
                                <Box align={"right"}>
                                    <Button onClick={() => Router.push('/services')} size={"small"} variant={"outlined"} color={"primary"}>서비스 추가</Button>
                                </Box>
                            </Grid>
                        </Grid>


                    </Box>

                    <Table my={2}>
                        <TableHead>
                            <TableRow>
                                <TableCell>#</TableCell>
                                <TableCell>서비스명</TableCell>
                                <TableCell>서버</TableCell>
                                <TableCell>타입</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            <TableRow>
                                <TableCell>1</TableCell>
                                <TableCell>
                                    <Link href={"/services/1"}>ES 검색</Link>
                                </TableCell>
                                <TableCell>elk1-dev</TableCell>
                                <TableCell>프로세스</TableCell>
                            </TableRow>
                            <TableRow>
                                <TableCell>2</TableCell>
                                <TableCell>
                                    <Link href={"/services/1"}>ES 검색</Link>
                                </TableCell>
                                <TableCell>elk2-dev</TableCell>
                                <TableCell>컨테이너</TableCell>
                            </TableRow>
                            <TableRow>
                                <TableCell>3</TableCell>
                                <TableCell>
                                    <Link href={"/services/1"}>쿠버 테스트</Link>
                                </TableCell>
                                <TableCell>elk2-dev</TableCell>
                                <TableCell>컨테이너</TableCell>
                            </TableRow>
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </Box>
    );
}

export default Service;