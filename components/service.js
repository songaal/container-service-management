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
    const { enqueueSnackbar, closeSnackbar } = useSnackbar();
    const classes = useStyles();
    const [services, setServices] = React.useState([])
    const [keyword, setKeyword] = React.useState("")
    const [tmpKeyword, setTmpKeyword] = React.useState("")

    React.useEffect(() => {
        init()
    }, [])

    const init = () => {
        fetch(`/api${location.pathname}/services`)
            .then(res => res.json())
            .then(body => {
                if (body['status'] === 'error') {
                    console.error(body)
                    enqueueSnackbar('조회 중 에러가 발생하였습니다.', {
                        variant: "error"
                    });
                } else {
                    setServices(body['services'])
                }
            })
    }

    const handleSearch = () => {
        setKeyword(tmpKeyword)
    }

    const viewServices = (services||[]).filter(server => {
        return server['name'].includes(keyword) || server['server_name'].includes(keyword)
    })

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
                                           value={tmpKeyword}
                                           onChange={event => setTmpKeyword(event.target.value)}
                                           onKeyUp={event => event.keyCode === 13 ? handleSearch() : null}

                                />
                                <Button style={{height: '40px'}} variant={"outlined"} color={"default"} onClick={handleSearch}>검색</Button>
                            </Grid>
                            <Grid item xs={4}>
                                <Box align={"right"}>
                                    <Button onClick={() => Router.push(location.pathname + '/services')} size={"small"} variant={"outlined"} color={"primary"}>서비스 추가</Button>
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
                            {
                                viewServices.length === 0 ?
                                    <TableRow>
                                        <TableCell colSpan={4} align={"center"}>등록된 서비스가 없습니다.</TableCell>
                                    </TableRow>
                                    :
                                    viewServices.map((service, index) => {
                                        return (
                                            <TableRow>
                                                <TableCell>{index + 1}</TableCell>
                                                <TableCell>
                                                    <Link href={"#none"} onClick={() => Router.push(`${location.pathname}/services/${service['id']}`)}>{service['name']}</Link>
                                                </TableCell>
                                                <TableCell>{service['server_name']}</TableCell>
                                                <TableCell>{service['type'] === 'container' ? '컨테이너' : service['type'] === 'process' ? '프로세스' : service['type']}</TableCell>
                                            </TableRow>
                                        )
                                    })
                            }
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </Box>
    );
}

export default Service;