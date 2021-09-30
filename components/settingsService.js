import React from "react";
import {
    Box,
    Card,
    CardContent,
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableRow,
    TextField,
    useTheme
} from "@material-ui/core";
import Grid from "@material-ui/core/Grid";
import Button from "@material-ui/core/Button";
import Link from "@material-ui/core/Link";
import useMediaQuery from "@material-ui/core/useMediaQuery/useMediaQuery";
import {makeStyles} from "@material-ui/core/styles";
import fetch from "isomorphic-unfetch";
import {useSnackbar} from "notistack";

const useStyles = makeStyles( theme => ({
    root: {
        flexGrow: 1,
        width: '100%',
        backgroundColor: theme.palette.background.paper,
    }
}));

function SettingsService() {
    const classes = useStyles();
    const { enqueueSnackbar, closeSnackbar } = useSnackbar();
    const theme = useTheme();
    const fullScreen = useMediaQuery(theme.breakpoints.down('sm'));
    const [services, setServices] = React.useState([])
    const [keyword, setKeyword] = React.useState("")
    const [tmpKeyword, setTmpKeyword] = React.useState("")

    React.useEffect(() => {
        init()
    }, [])

    const init = () => {
        fetch('/api/settings/services')
            .then(res => res.json())
            .then(body => {
                if (body['status'] === 'success') {
                    setServices(body['services'])
                }
            })
    }

    const handleSearch = () => {
        setKeyword(tmpKeyword)
    }

    const viewServices = (services||[]).filter(service => {
        return ((service['group']||{})['name']||"").includes(keyword)
            || (service['name']||"").includes(keyword)
            || (service['server_name']||"").includes(keyword)
            || (service['type'] === 'container' ? "컨테이너" : service['type'] === 'process' ? "프로세스" : service['type']).includes(keyword)
    })

    return (
        <React.Fragment>
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
                                <Button style={{height: '40px',  marginLeft: '5px'}} variant={"outlined"} color={"default"}
                                        onClick={handleSearch}
                                >
                                    검색
                                </Button>
                            </Grid>
                            <Grid item xs={4}>
                            </Grid>
                        </Grid>
                    </Box>

                    <Table my={2}>
                        <TableHead>
                            <TableRow>
                                <TableCell>#</TableCell>
                                <TableCell>그룹</TableCell>
                                <TableCell>서비스</TableCell>
                                <TableCell>서버</TableCell>
                                <TableCell>타입</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {
                                viewServices.length === 0 ?
                                    <TableRow>
                                        <TableCell colSpan={5} style={{textAlign: "center"}}>등록된 서비스가 업습니다.</TableCell>
                                    </TableRow>
                                    :
                                    viewServices.map((service, index) => {
                                        return (
                                            <TableRow key={index}>
                                                <TableCell>{index + 1}</TableCell>
                                                <TableCell><Link href={`/groups/${service['groupId']}`}>{service['group']['name']||''}</Link></TableCell>
                                                <TableCell><Link href={`/groups/${service['groupId']}/services/${service['id']}`}>{service['name']||''}</Link></TableCell>
                                                <TableCell><Link href={`/servers/${service['serverId']}`}>{service['server_name']||''}</Link></TableCell>
                                                <TableCell>{service['type'] === 'container' ? "컨테이너" : "프로세스"}</TableCell>
                                            </TableRow>
                                        )
                                    })
                            }
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </React.Fragment>
    )
}

export default SettingsService;