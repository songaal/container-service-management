import React from 'react';
import Link from '@material-ui/core/Link';
import Grid from '@material-ui/core/Grid';
import {Box, Card, CardContent, Table, TableBody, TableCell, TableHead, TableRow, TextField} from "@material-ui/core";
import {makeStyles} from '@material-ui/core/styles';
import Button from '@material-ui/core/Button';
import fetch from "isomorphic-unfetch"
import { SnackbarProvider, useSnackbar } from 'notistack';
import {useRouter} from "next/router"

const useStyles = makeStyles( theme => ({
    root: {
        flexGrow: 1,
        width: '100%',
        backgroundColor: theme.palette.background.paper,
    }
}));

function Server() {
    const router = useRouter()
    const classes = useStyles();
    const { enqueueSnackbar, closeSnackbar } = useSnackbar();
    const [servers, setServers] = React.useState([]);
    const [tmpKeyword, setTmpKeyword] = React.useState("");
    const [keyword, setKeyword] = React.useState("");

    React.useEffect(() => {
        init()
    }, [])

    const init = () => {
        fetch(`/api${location.pathname}/servers`)
            .then(res => res.json())
            .then(body => {
                if (body['status'] === 'success') {
                    setServers(body['servers']);
                } else {
                    enqueueSnackbar(body['message'], {variant: "error"})
                }
            })
    }

    const handleKeywordSearch = () => {
        setKeyword(tmpKeyword)
    }

    let viewServers = []
    if (keyword.trim().length > 0) {
        viewServers = servers
            .filter(server =>
                server['name'].includes(keyword)
                || server['ip'].includes(keyword)
                || server['user'].includes(keyword)
            )
    } else {
        viewServers = servers
    }

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
                                           onKeyUp ={event=> event.keyCode === 13 ? handleKeywordSearch() : null}
                                />
                                <Button style={{height: '40px'}}
                                        variant={"outlined"}
                                        color={"default"}
                                        onClick={handleKeywordSearch}
                                >검색</Button>
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
                                <TableCell>계정</TableCell>
                                <TableCell>아이피</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>

                            {
                                viewServers.length === 0 ?
                                    <TableRow>
                                        <TableCell colSpan={4} align={"center"}>등록된 서버가 없습니다.</TableCell>
                                    </TableRow>
                                    :
                                    viewServers.map((server, index) => {
                                        return (
                                            <TableRow key={server['id']}>
                                                <TableCell>{index + 1}</TableCell>
                                                <TableCell>
                                                    <Link href={"#none"} onClick={() => router.push(`/servers/${server['id']}`)}>{server['name']}</Link>
                                                </TableCell>
                                                <TableCell>{server['user']}</TableCell>
                                                <TableCell>{server['ip']}</TableCell>
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

export default Server;