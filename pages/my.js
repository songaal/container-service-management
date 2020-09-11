import React from 'react';
import Container from '@material-ui/core/Container';
import Header from "../components/Header";
import styled from "styled-components";
import {
    Box,
    Button,
    Card as MuiCard,
    CardContent,
    Divider as MuiDivider,
    Grid as MuiGrid,
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
import GridList from '@material-ui/core/GridList';
import GridListTile from '@material-ui/core/GridListTile';

const Card = styled(MuiCard)(spacing);
const Divider = styled(MuiDivider)(spacing);
const Grid = styled(MuiGrid)(spacing);

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
    const [ password, setPassword ] = React.useState("")
    const [ updatePassword, setUpdatePassword ] = React.useState("")
    const [ updatePasswordConfirm, setUpdatePasswordConfirm ] = React.useState("")
    const [ inValid, setInValid] = React.useState(false)

    function handleChangePassword() {
        // if (updatePassword !== updatePasswordConfirm) {
        //     setInValid(true)
        //     return
        // }
        //
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
                        <Grid container mt={4}>
                            <Grid item xs={3}>
                                <Box mt={2} align={"center"}>
                                    이메일
                                </Box>
                            </Grid>
                            <Grid item xs={9}>
                                <Box mt={1}>
                                    <TextField value={"hong@danawa.com"} disabled fullWidth/>
                                </Box>
                            </Grid>
                        </Grid>
                        <Grid container mt={4}>
                            <Grid item xs={3}>
                                <Box mt={2} align={"center"}>
                                    이름
                                </Box>
                            </Grid>
                            <Grid item xs={9}>
                                <Box mt={1}>
                                    <TextField value={'홍길동'} disabled fullWidth/>
                                </Box>
                            </Grid>
                        </Grid>

                        <Grid container mt={4}>
                            <Grid item xs={3}>
                                <Box mt={2} align={"center"}>
                                    그룹
                                </Box>
                            </Grid>
                            <Grid item xs={9}>
                                <Box>
                                    <Table>
                                        <TableBody>
                                            <TableRow>
                                                <TableCell>
                                                    <Link href="#">ES검색</Link>
                                                </TableCell>
                                                <TableCell>
                                                    <Link href="#">k8s</Link>
                                                </TableCell>
                                                <TableCell>
                                                    <Link href="#">web</Link>
                                                </TableCell>
                                                <TableCell>
                                                    <Link href="#">tomcat</Link>
                                                </TableCell>
                                            </TableRow>
                                            <TableRow>
                                                <TableCell>
                                                    <Link href="#">php-web</Link>
                                                </TableCell>
                                                <TableCell>
                                                    <Link href="#">dev-web</Link>
                                                </TableCell>
                                                <TableCell>
                                                    <Link href="#"></Link>
                                                </TableCell>
                                                <TableCell>
                                                    <Link href="#"></Link>
                                                </TableCell>
                                            </TableRow>
                                        </TableBody>
                                    </Table>
                                </Box>
                            </Grid>
                        </Grid>

                        <Divider mt={5}/>

                        <Grid container mt={3}>
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
                                    />
                                </Box>
                            </Grid>
                        </Grid>

                        <Grid container mt={4}>
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
                                               error={inValid}
                                    />
                                </Box>
                            </Grid>
                        </Grid>

                        <Grid container mt={4}>
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
                                               error={inValid}
                                    />
                                </Box>
                            </Grid>
                        </Grid>

                        <Box align={"right"} mt={5}>
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