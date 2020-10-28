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

const useStyles = makeStyles( theme => ({
    root: {
        flexGrow: 1,
        width: '100%',
        backgroundColor: theme.palette.background.paper,
    }
}));

function SettingsUser() {
    const classes = useStyles();
    const theme = useTheme();
    const fullScreen = useMediaQuery(theme.breakpoints.down('xs'));
    const [checked, setChecked] = React.useState(false);
    const [openList, setOpenList] = React.useState({});
    const handleChange = () => {
        setChecked((prev) => !prev);
    };


    const users = [
        {name: '홍길동', id: 'hong@danawa.com', createDate: '2020-09-11', groups: [ {id: '1', name: 'es1'}, {id: '2', name: 'es2'}, {id: '3', name: 'es3'} ]},
        {name: '통키', id: 'hong@danawa.com', createDate: '2010-06-01', groups: [ {id: '1', name: 'kube1'}, {id: '2', name: 'kube2'}, {id: '3', name: 'es1'} ]},
    ]

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
                                <TableCell>이름</TableCell>
                                <TableCell>아이디</TableCell>
                                <TableCell>가입일</TableCell>
                                <TableCell>삭제</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>

                            {
                                users.map((user, no) => {
                                    return (
                                        <React.Fragment key={no}>
                                            <TableRow >
                                                <TableCell style={{borderBottom: openList[no] ? "0px" : "1px"}}
                                                           onClick={() => {

                                                               console.log(openList[no]);
                                                           }}
                                                >{no + 1}</TableCell>
                                                <TableCell style={{borderBottom: openList[no] ? "1px" : "0px"}}>{user.name}</TableCell>
                                                <TableCell style={{borderBottom: openList[no] ? "1px" : "0px"}}>{user.id}</TableCell>
                                                <TableCell style={{borderBottom: openList[no] ? "1px" : "0px"}}>{user.createDate}</TableCell>
                                                <TableCell style={{borderBottom: openList[no] ? "1px" : "0px"}}>
                                                    <Button variant={"contained"} style={{color: "white", backgroundColor: "red"}}>삭제</Button>
                                                </TableCell>
                                            </TableRow>
                                            <TableRow>
                                                <TableCell colSpan={"5"}>

                                                    <Grid container>
                                                        <Grid item xs={1}>
                                                            <Box>
                                                                그룹
                                                            </Box>
                                                        </Grid>
                                                        <Grid item xs={11}>
                                                            <Table style={{paddingTop: "0px"}}>
                                                                <TableBody>
                                                                    <TableRow>
                                                                        <TableCell style={{paddingTop: "2px", paddingBottom: "2px"}}><Link href="/groups/1">ES1</Link></TableCell>
                                                                        <TableCell style={{paddingTop: "2px", paddingBottom: "2px"}}><Link href="/groups/1">KUBE1</Link></TableCell>
                                                                        <TableCell style={{paddingTop: "2px", paddingBottom: "2px"}}><Link href="/groups/1">ES2</Link></TableCell>
                                                                        <TableCell style={{paddingTop: "2px", paddingBottom: "2px"}}><Link href="/groups/1">KUBE2</Link></TableCell>
                                                                    </TableRow>
                                                                    <TableRow>
                                                                        <TableCell style={{paddingTop: "2px", paddingBottom: "2px"}}><Link href="/groups/1">ES3</Link></TableCell>
                                                                        <TableCell style={{paddingTop: "2px", paddingBottom: "2px"}}><Link href="/groups/1">KUBE4</Link></TableCell>
                                                                        <TableCell style={{paddingTop: "2px", paddingBottom: "2px"}}><Link href="/groups/1">ES5</Link></TableCell>
                                                                        <TableCell style={{paddingTop: "2px", paddingBottom: "2px"}}><Link href="/groups/1">KUBE6</Link></TableCell>
                                                                    </TableRow>
                                                                </TableBody>
                                                            </Table>
                                                        </Grid>
                                                    </Grid>
                                                </TableCell>
                                            </TableRow>

                                        </React.Fragment>
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
export default SettingsUser;