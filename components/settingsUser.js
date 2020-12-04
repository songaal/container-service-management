import React from "react";
import {
    Box,
    Card,
    CardContent,
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableRow, TextareaAutosize,
    TextField,
    useTheme,
    FormControlLabel,
    Switch
} from "@material-ui/core";
import Grid from "@material-ui/core/Grid";
import Button from "@material-ui/core/Button";
import Link from "@material-ui/core/Link";
import {makeStyles} from "@material-ui/core/styles";
import useMediaQuery from "@material-ui/core/useMediaQuery/useMediaQuery";
import fetch from "isomorphic-unfetch";
import {useSnackbar} from "notistack";
import DialogTitle from "@material-ui/core/DialogTitle";
import DialogContent from "@material-ui/core/DialogContent";
import DialogActions from "@material-ui/core/DialogActions";
import Dialog from "@material-ui/core/Dialog";

const useStyles = makeStyles( theme => ({
    root: {
        flexGrow: 1,
        width: '100%',
        backgroundColor: theme.palette.background.paper,
    }
}));

// const users = [
//     {name: '홍길동', id: 'hong@danawa.com', createDate: '2020-09-11', groups: [ {id: '1', name: 'es1'}, {id: '2', name: 'es2'}, {id: '3', name: 'es3'} ]},
//     {name: '통키', id: 'hong@danawa.com', createDate: '2010-06-01', groups: [ {id: '1', name: 'kube1'}, {id: '2', name: 'kube2'}, {id: '3', name: 'es1'} ]},
// ]

function SettingsUser() {
    const classes = useStyles();
    const theme = useTheme();
    const { enqueueSnackbar, closeSnackbar } = useSnackbar();
    const fullScreen = useMediaQuery(theme.breakpoints.down('xs'));
    const [groupOpenMap, setGroupOpenMap] = React.useState({});
    const [groups, setGroups] = React.useState([])
    const [users, setUsers] = React.useState([])
    const [keyword, setKeyword] = React.useState("")
    const [tmpKeyword, setTmpKeyword] = React.useState("")
    const [selectedUser, setSelectedUser] = React.useState({})
    const [open, setOpen] = React.useState(false);
    const [editAdmin, setEditAdmin] = React.useState({});

    React.useEffect(() => {
        init()
    }, [])

    const init = () => {
        setGroupOpenMap({})

        fetch('/api/groups')
            .then(res => res.json())
            .then(body => {
                if (body['status'] === 'success') {
                    setGroups(body['groups'])
                }
            })
        fetch('/api/settings/users')
            .then(res => res.json())
            .then(body => {
                if (body['status'] === 'success') {
                    setUsers(body['users'])
                }
            })
    }

    const handleGroupOpen = (no) => {
        setGroupOpenMap({
            ...groupOpenMap,
            [no]: !groupOpenMap[no]
        })
    }
    const handleRemoveUser = () => {
        fetch(`/api/settings/users/${selectedUser['id']}`, {
            method: "DELETE"
        })
            .then(res => res.json())
            .then(body => {
                if (body['status'] === 'success') {
                    init()
                    setOpen(false)
                    enqueueSnackbar("사용자를 삭제하였습니다.", {variant: "success"})
                } else {
                    enqueueSnackbar("사용자 삭제를 실패하였습니다.", {variant: "error"})
                }
            })
    }
    const handleSearch = () => {
        setKeyword(tmpKeyword)
    }

    const handleEditAdmin = (event, userId, flag) => {
        fetch(`/api/settings/users/${userId}`, {
            method: "PUT",
            body: JSON.stringify({
                admin: flag
            })
        })
            .then(res => res.json())
            .then(body => {
                if (body['status'] === 'success') {
                    setEditAdmin({
                        ...editAdmin,
                        [userId]: flag
                    })
                    enqueueSnackbar("사용자 정보를 수정하였습니다.", {variant: "success"})
                } else {
                    enqueueSnackbar("사용자 정보 수정을 실패하였습니다.", {variant: "error"})
                }
            })
    }

    const handleResetPassword = (userId) => {
        fetch(`/api/users/${userId}/action?type=resetPassword`, {
            method: "PUT",
        })
            .then(res => res.json())
            .then(body => {
                if (body['status'] === 'success') {
                    enqueueSnackbar("비밀번호 초기화 메일을 전송하였습니다.", {variant: "success"})
                } else {
                    enqueueSnackbar("비밀번호 초기화 메일 전송 실패하였습니다.", {variant: "error"})
                }
            })
    }
    const viewUsers = users.filter(user => {
        return user['name'].includes(keyword) || user['userId'].includes(keyword)
    }).map(user => {
        return {
            ...user,
            admin: editAdmin[user['id']] !== undefined ? editAdmin[user['id']] : user['admin']
        }
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
                                           onKeyUp={event => event.keyCode === 13 ? handleSearch(): null}
                                />
                                <Button style={{height: '40px'}}
                                        variant={"outlined"}
                                        color={"default"}
                                        onClick={handleSearch}
                                >검색</Button>
                            </Grid>
                            <Grid item xs={4}>
                            </Grid>
                        </Grid>
                    </Box>

                    <Table my={2}>
                        <TableHead>
                            <TableRow>
                                <TableCell align={"center"}>#</TableCell>
                                <TableCell align={"center"}>이름</TableCell>
                                <TableCell align={"center"}>아이디</TableCell>
                                <TableCell align={"center"}>가입일</TableCell>
                                <TableCell align={"center"}>그룹 수</TableCell>
                                <TableCell align={"center"}>어드민</TableCell>
                                <TableCell align={"center"}>비밀번호 초기화</TableCell>
                                <TableCell align={"center"}>삭제</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>

                            {
                                viewUsers.length === 0 ?
                                    <TableRow>
                                        <TableCell colSpan={8} style={{textAlign: "center"}}>
                                            조회된 사용자가 없습니다.
                                        </TableCell>
                                    </TableRow>
                                    :
                                    viewUsers.map((user, no) => {
                                        const groupAuthList = user['group_auths']||[]
                                        return (
                                            <React.Fragment key={no}>
                                                <TableRow style={{cursor: "pointer"}}>
                                                    <TableCell style={{textAlign: "center", borderBottom: groupOpenMap[no] ? "0px" : "1px"}}
                                                               onClick={() => {handleGroupOpen(no)}}
                                                    >
                                                        {no + 1}
                                                    </TableCell>
                                                    <TableCell style={{textAlign: "center", borderBottom: groupOpenMap[no] ? "1px" : "0px"}}
                                                               onClick={() => {handleGroupOpen(no)}}
                                                    >
                                                        {user.name}
                                                    </TableCell>
                                                    <TableCell style={{textAlign: "center", borderBottom: groupOpenMap[no] ? "1px" : "0px"}}
                                                               onClick={() => {handleGroupOpen(no)}}
                                                    >
                                                        {user.userId}
                                                    </TableCell>
                                                    <TableCell style={{textAlign: "center", borderBottom: groupOpenMap[no] ? "1px" : "0px"}}
                                                               onClick={() => {handleGroupOpen(no)}}
                                                    >
                                                        {user.createdAt}
                                                    </TableCell>
                                                    <TableCell style={{textAlign: "center", borderBottom: groupOpenMap[no] ? "1px" : "0px"}}
                                                               onClick={() => {handleGroupOpen(no)}}
                                                    >
                                                        {groupAuthList.length}
                                                    </TableCell>
                                                    <TableCell style={{textAlign: "center", borderBottom: groupOpenMap[no] ? "1px" : "0px"}}>
                                                        <Switch checked={user.admin}
                                                                onChange={event => handleEditAdmin(event, user['id'], event.target.checked)}
                                                        />
                                                    </TableCell>
                                                    <TableCell style={{textAlign: "center", borderBottom: groupOpenMap[no] ? "1px" : "0px"}}
                                                    >
                                                        <Button variant={"contained"}
                                                                style={{color: "white", backgroundColor: "orange"}}
                                                                onClick={() => {handleResetPassword(user['userId'])}}
                                                        >
                                                            초기화
                                                        </Button>
                                                    </TableCell>
                                                    <TableCell style={{textAlign: "center", borderBottom: groupOpenMap[no] ? "1px" : "0px"}}
                                                    >
                                                        <Button variant={"contained"}
                                                                style={{color: "white", backgroundColor: "red"}}
                                                                onClick={() => {setSelectedUser(user); setOpen(true)}}
                                                        >
                                                            삭제
                                                        </Button>
                                                    </TableCell>
                                                </TableRow>
                                                <TableRow style={{display: groupOpenMap[no] ? "table-row" : "none"}}>
                                                    <TableCell colSpan={"8"}>
                                                        <Grid container style={{border: "1px solid silver", paddingTop: "20px", paddingBottom: "20px"}}>
                                                            <Grid item xs={1} style={{verticalAlign: "middle", margin: "auto"}}>
                                                                <Box style={{fontSize: "16pt", textAlign: "center"}}> 그룹 </Box>
                                                            </Grid>
                                                            <Grid item xs={11}>
                                                                <Table style={{paddingTop: "0px"}}>
                                                                    <TableBody>
                                                                        <TableRow>
                                                                        {
                                                                            groupAuthList.map((ga, gaIndex) => {
                                                                                const group = groups.find(g => String(g['id']) === String(ga['groupId']))
                                                                                if (!group) {
                                                                                    return null
                                                                                } else if (groupAuthList.length - 1 !== gaIndex) {
                                                                                    return (
                                                                                        <TableCell style={{border: 0, paddingTop: "2px", paddingBottom: "2px", fontSize: "14pt"}}>
                                                                                            <Button href={`/groups/${group['id']}`} variant={"contained"}>
                                                                                                {group['name']}
                                                                                            </Button>
                                                                                            {/*<Link href={}></Link>*/}
                                                                                        </TableCell>
                                                                                    )
                                                                                } else {
                                                                                    const blankCellSize = 5 - (groupAuthList.length%5)
                                                                                    let tags = [
                                                                                        <TableCell style={{border: 0, paddingTop: "2px", paddingBottom: "2px", fontSize: "14pt"}}>
                                                                                            <Button href={`/groups/${group['id']}`} variant={"contained"}>
                                                                                                {group['name']}
                                                                                            </Button>
                                                                                            {/*<Link href={`/groups/${group['id']}`}>{group['name']}</Link>*/}
                                                                                        </TableCell>
                                                                                    ]
                                                                                    for (let i = 0; i < blankCellSize; i++) {
                                                                                        tags.push(<TableCell style={{border: 0, paddingTop: "2px", paddingBottom: "2px"}}> </TableCell>)
                                                                                    }
                                                                                    return tags
                                                                                }
                                                                            })
                                                                        }
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


            <Dialog
                fullWidth={true}
                fullScreen={fullScreen}
                open={open}
                onClose={() => setOpen(false)}
            >
                <DialogTitle>
                    사용자 삭제
                </DialogTitle>
                <DialogContent>
                    <Box>
                        [{selectedUser['userId']}] 사용자를 삭제하시겠습니까?
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button autoFocus variant={"outlined"} onClick={handleRemoveUser} color="secondary">
                        삭제
                    </Button>
                    <Button variant={"outlined"} onClick={() => setOpen(false)} color="default">
                        닫기
                    </Button>
                </DialogActions>
            </Dialog>
        </React.Fragment>
    )
}
export default SettingsUser;