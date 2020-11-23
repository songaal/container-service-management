import React from 'react';
import Container from '@material-ui/core/Container';
import Header from "../components/Header";
import styled from "styled-components";
import {
    Box,
    Button,
    Card as MuiCard,
    CardContent,
    Divider,
    Grid,
    TextField,
    Typography,
    Table,
    TableBody,
    TableHead,
    TableRow,
    TableCell
} from "@material-ui/core";
import Link from '@material-ui/core/Link';
import CssBaseline from "@material-ui/core/CssBaseline";
import {makeStyles} from '@material-ui/core/styles';
import {spacing} from "@material-ui/system";
import fetch from "isomorphic-unfetch";
import Router from "next/router";
import {useSnackbar} from "notistack";

const Card = styled(MuiCard)(spacing);
// const Divider = styled(MuiDivider)(spacing);

const useStyles = makeStyles( theme => ({
    root: {
        flexGrow: 1,
        width: '100%',
        backgroundColor: theme.palette.background.paper,
    },
    label: {
        marginTop: 2,
        marginBottom: 2,
        marginLeft: 10,
        marginRight: 10,
        whiteSpace: "nowrap"
    },
    value: {
        marginTop: 2,
        marginBottom: 2,
        marginLeft: 10,
        marginRight: 10,
        whiteSpace: "nowrap",
        display: "inline",
        // borderBottom: "1px solid silver",
    }
}));

function My() {
    const classes = useStyles();
    const { enqueueSnackbar, closeSnackbar } = useSnackbar();
    const [ password, setPassword ] = React.useState("")
    const [ updatePassword, setUpdatePassword ] = React.useState("")
    const [ updatePasswordConfirm, setUpdatePasswordConfirm ] = React.useState("")
    const [ inValid, setInValid] = React.useState(false)
    const [user, setUser] = React.useState({});
    const [groups, setGroups] = React.useState([]);

    React.useEffect(() => {
        fetchMyInfo()
    }, [])

    function fetchMyInfo() {
        fetch(`/api/auth/validate`)
            .then(res => res.json())
            .then(body => {
                if (body.status !== 'success') {
                    Router.push("/sign-in")
                } else {
                    setUser(body['user']);
                    setGroups(body['groups']);
                }
            })
            .catch(error => {
                console.error(error)
                enqueueSnackbar('조회 중 에러가 발생하였습니다.', {variant: "error"})
                setTimeout(fetchMyInfo, 2000)
            })
    }

    function handleChangePassword() {
        setInValid({})
        let check = {}
        if (password.trim().length < 4) {
            check['password'] = "비밀번호를 확인하세요. 최소 4자";
        }
        if (updatePassword.trim().length < 4) {
            check['updatePassword'] = "신규 비밀번호를 확인하세요. 최소 4자";
        }
        if (updatePassword !== updatePasswordConfirm) {
            check['updatePasswordConfirm'] = "비밀번호가 다릅니다."
        }
        
        if (Object.keys(check).length > 0) {
            setInValid(check)
            return false;
        }

        fetch(`/api/users/${user['id']}/action?type=updatePassword`, {
            method: "PUT",
            body: JSON.stringify({password, updatePassword})
        })
            .then(res => res.json())
            .then(body => {
                if (body.status === 'success') {
                    setPassword("");
                    setUpdatePassword("");
                    setUpdatePasswordConfirm("");
                    enqueueSnackbar('비밀번호가 변경되었습니다.', {variant: "success"})
                } else {
                    enqueueSnackbar(body.message, {variant: "error"})
                }
            })
            .catch(error => {
                console.error(error)
                enqueueSnackbar('조회 중 에러가 발생하였습니다.', {variant: "error"})
            })
    }

    let list = []
    for (let i = 0; i < Math.ceil(groups.length / 4); i++) {
        let s = i * 4;
        list.push(groups.slice(s, s + 4))
    }

    return (
        <Box className={classes.root}>
            <CssBaseline />
            <Header />
            {/*<Helmet title="ggg"/>*/}
            <Container maxWidth={"xl"} >
                <br/>
                <Typography variant="h4" gutterBottom display="inline">
                    정보수정
                </Typography>

                <br/><br/>

                <Card>
                    <CardContent>
                        <Grid container>
                            <Grid item xs={3}>
                                <Box mt={2} align={"center"}>
                                    이메일
                                </Box>
                            </Grid>
                            <Grid item xs={9}>
                                <Box mt={1}>
                                    <TextField value={user['userId']||""} disabled fullWidth />
                                </Box>
                            </Grid>
                        </Grid>
                        <br/>
                        <Grid container>
                            <Grid item xs={3}>
                                <Box mt={2} align={"center"}>
                                    이름
                                </Box>
                            </Grid>
                            <Grid item xs={9}>
                                <Box mt={1}>
                                    <TextField value={user['name']||""} disabled fullWidth />
                                </Box>
                            </Grid>
                        </Grid>
                        <br/>
                        <Grid container >
                            <Grid item xs={3}>
                                <Box mt={2} align={"center"}>
                                    그룹
                                </Box>
                            </Grid>
                            <Grid item xs={9}>
                                <Box>
                                    <Table>
                                        <TableBody>

                                            {
                                                list.map((data, index) => {
                                                    return (
                                                        <TableRow key={index}>
                                                            {
                                                                data.map(group => {
                                                                    return (
                                                                        <TableCell key={group['id']}>
                                                                            <Link href={"#none"} onClick={() => Router.push(`/groups/${group['id']}`)}>{group['name']||''}</Link>
                                                                        </TableCell>
                                                                    )
                                                                })
                                                            }
                                                        </TableRow>
                                                    )
                                                })
                                            }
                                        </TableBody>
                                    </Table>
                                </Box>
                            </Grid>
                        </Grid>
                        <br/>
                        <Divider />
                        <br/>
                        <Grid container >
                            <Grid item xs={3}>
                                <Box mt={2} align={"center"}>
                                    현재 비밀번호
                                </Box>
                            </Grid>
                            <Grid item xs={9}>
                                <Box mt={1}>
                                    <TextField fullWidth
                                               type={"password"}
                                               value={password}
                                               onChange={event => setPassword(event.target.value)}
                                               autoFocus
                                               error={inValid['password']}
                                               helperText={inValid['password']}
                                    />
                                </Box>
                            </Grid>
                        </Grid>
                        <br/>
                        <Grid container >
                            <Grid item xs={3}>
                                <Box mt={2} align={"center"}>
                                    비밀번호 변경
                                </Box>
                            </Grid>
                            <Grid item xs={9}>
                                <Box mt={1}>
                                    <TextField fullWidth
                                               type={"password"}
                                               value={updatePassword}
                                               onChange={event => setUpdatePassword(event.target.value)}
                                               error={inValid['updatePassword']}
                                               helperText={inValid['updatePassword']}
                                    />
                                </Box>
                            </Grid>
                        </Grid>
                        <br/>
                        <Grid container >
                            <Grid item xs={3}>
                                <Box mt={2} align={"center"}>
                                    비밀번호 변경 확인
                                </Box>
                            </Grid>
                            <Grid item xs={9}>
                                <Box mt={1}>
                                    <TextField fullWidth
                                               type={"password"}
                                               value={updatePasswordConfirm}
                                               onChange={event => setUpdatePasswordConfirm(event.target.value)}
                                               error={inValid['updatePasswordConfirm']}
                                               helperText={inValid['updatePasswordConfirm']}
                                    />
                                </Box>
                            </Grid>
                        </Grid>
                        <br/>
                        <Box align={"right"} >
                            <Button variant={"contained"}
                                    color={"secondary"}
                                    onClick={handleChangePassword}
                            >비밀번호 변경</Button>
                        </Box>

                    </CardContent>
                </Card>




            </Container>
        </Box>
    );
}

export default My;