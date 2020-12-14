import React from 'react';
import Link from '@material-ui/core/Link';
import Grid from '@material-ui/core/Grid';
import {
    Box,
    Card,
    CardContent,
    CircularProgress,
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableRow,
    TextField
} from "@material-ui/core";
import {makeStyles} from '@material-ui/core/styles';
import Button from '@material-ui/core/Button';
import { SnackbarProvider, useSnackbar } from 'notistack';
import fetch from "isomorphic-unfetch";
import {useRouter} from "next/router";

const useStyles = makeStyles( theme => ({
    root: {
        flexGrow: 1,
        width: '100%',
        backgroundColor: theme.palette.background.paper,
    }
}));

function Service() {
    const router = useRouter();
    const { enqueueSnackbar, closeSnackbar } = useSnackbar();
    const classes = useStyles();
    const [services, setServices] = React.useState([])
    const [keyword, setKeyword] = React.useState("")
    const [tmpKeyword, setTmpKeyword] = React.useState("")
    const [ready, setReady] = React.useState(true)

    React.useEffect(() => {
        init()
    }, [])

    const init = () => {
        fetch(`/api${location.pathname}/services`)
            .then(res => res.json())
            .then(body => {
                setReady(false)
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

    const viewServices = (services||{}).filter(server => {
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
                                    <Button onClick={() => router.push(location.pathname + '/services')} size={"small"} variant={"outlined"} color={"primary"}>서비스 추가</Button>
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
                                <TableCell>실행여부</TableCell>
                                <TableCell>CPU(%)</TableCell>
                                <TableCell>MEM(%)</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {
                                viewServices.length === 0 ?
                                    <TableRow>
                                        <TableCell colSpan={7} align={"center"}>
                                            <Box align={"center"}>
                                                <CircularProgress style={{display: ready ? "block" : "none"}}/>
                                            </Box>
                                            <Box style={{display: ready ? "none" : "block"}}> 등록된 서비스가 없습니다. </Box>
                                        </TableCell>
                                    </TableRow>
                                    :
                                    viewServices.map((service, index) => {
                                        const type = service['type']
                                        let runMessage = "종료"
                                        let cpuUsage = ""
                                        let memUsage = ""
                                        try {
                                            if (type === 'container') {
                                                const health = service['health']
                                                const allCount = health['serviceNames'].length
                                                const runCount = Object.keys(health['stats']).length
                                                if (runCount === allCount) {
                                                    runMessage = `실행 중`
                                                } else if (runCount < allCount) {
                                                    runMessage = `실행 중 (${runCount}/${allCount})`
                                                }

                                                let tmpCpuUsage = []
                                                let tmpMemUsage = []
                                                const keys = Object.keys(health['stats'])
                                                for (let i = 0; i < keys.length; i++) {
                                                    const stats = health['stats'][keys[i]]
                                                    let cpu_delta = stats['cpu_stats']['cpu_usage']['total_usage'] - stats['precpu_stats']['cpu_usage']['total_usage']
                                                    let system_cpu_delta = stats['cpu_stats']['system_cpu_usage'] - stats['precpu_stats']['system_cpu_usage']
                                                    let number_cpus = stats['cpu_stats']['online_cpus']
                                                    tmpCpuUsage.push(Number((cpu_delta / system_cpu_delta) * number_cpus * 100.0).toFixed(2))

                                                    let used_memory = stats['memory_stats']['usage'] - stats['memory_stats']['stats']['cache']
                                                    let available_memory = stats['memory_stats']['limit']
                                                    tmpMemUsage.push(Number(((used_memory / available_memory) * 100.0).toFixed(2)).toFixed(2))
                                                }
                                                cpuUsage = tmpCpuUsage.reduce((a, c) => a+c)
                                                memUsage = tmpMemUsage.reduce((a, c) => a+c)

                                            } else if (type === 'process') {
                                                const health = service['health']
                                                runMessage = health['running'] ? '실행 중' : "종료"
                                                cpuUsage = health['stats']['cpuUsage']
                                                memUsage = health['stats']['memUsage']
                                            }
                                        } catch(e) {
                                            runMessage = "조회 실패"
                                            console.log(e)
                                        }
                                        return (
                                            <TableRow key={index}
                                                      onClick={() => router.push(`${location.pathname}/services/${service['id']}`)}
                                                      style={{cursor: "pointer"}}
                                            >
                                                <TableCell>{index + 1}</TableCell>
                                                <TableCell>{service['name']}</TableCell>
                                                <TableCell>{service['server_name']}</TableCell>
                                                <TableCell>{service['type'] === 'container' ? '컨테이너' : service['type'] === 'process' ? '프로세스' : service['type']}</TableCell>
                                                <TableCell>{runMessage}</TableCell>
                                                <TableCell>{cpuUsage}</TableCell>
                                                <TableCell>{memUsage}</TableCell>
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