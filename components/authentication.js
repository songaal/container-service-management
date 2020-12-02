import React from 'react';
import Link from '@material-ui/core/Link';
import Grid from '@material-ui/core/Grid';
import {Box, TextField, Card, CardContent, Table, TableHead, TableBody, TableRow, TableCell} from "@material-ui/core";
import {makeStyles} from '@material-ui/core/styles';
import Button from '@material-ui/core/Button';
import Checkbox from '@material-ui/core/Checkbox';
import Autocomplete from '@material-ui/lab/Autocomplete';
import CheckBoxOutlineBlankIcon from '@material-ui/icons/CheckBoxOutlineBlank';
import CheckBoxIcon from '@material-ui/icons/CheckBox';
import fetch from "isomorphic-unfetch"
import {useSnackbar} from "notistack";

const icon = <CheckBoxOutlineBlankIcon fontSize="small" />;
const checkedIcon = <CheckBoxIcon fontSize="small" />;

const useStyles = makeStyles( theme => ({
    root: {
        flexGrow: 1,
        width: '100%',
        backgroundColor: theme.palette.background.paper,
    }
}));


// const top100Films = [
//     { title: 'The Shawshank Redemption', year: 1994 },
//
// ];

function Authentication() {
    const classes = useStyles();
    const { enqueueSnackbar, closeSnackbar } = useSnackbar();
    const [users, setUsers] = React.useState([]);
    const [groupAuthList, setGroupAuthList] = React.useState([]);
    const [selectedUserList, setSelectedUserList] = React.useState([]);

    React.useEffect(() => {
        init()
    }, [])

    const init = () => {
        fetch(`/api${location.pathname}/users`)
            .then(res => res.json())
            .then(body => {
                if (body['status'] === 'success') {
                    setUsers(body['users']);
                    setGroupAuthList(body['groupAuthList']);
                } else {
                    enqueueSnackbar(body['message'], {variant: "error"})
                }
            })
    }

    const handleAddUserList = () => {
        if (selectedUserList.length === 0) {
            return false
        }
        let userMap = {}
        for (let i = 0; i < selectedUserList.length; i++) {
            userMap[selectedUserList[i]['id']] = selectedUserList[i]
        }

        fetch(`/api${location.pathname}/users`, {
            method: "POST",
            body: JSON.stringify({ userIds: Object.keys(userMap)})
        })
            .then(res => res.json())
            .then(body => {
                if (body['status'] === 'success') {
                    init()
                    enqueueSnackbar("권한을 추가하였습니다.", {variant: "success"})
                } else {
                    enqueueSnackbar(body['message'], {variant: "error"})
                }
            })
    }

    const handleRemoveUser = (user) => {
        fetch(`/api${location.pathname}/users`, {
            method: "DELETE",
            body: JSON.stringify({
                userIds: [user['id']]
            })
        })
            .then(res => res.json())
            .then(body => {
                if (body['status'] === 'success') {
                    init()
                    enqueueSnackbar("권한을 제거 하였습니다.", {variant: "success"})
                } else {
                    enqueueSnackbar(body['message'], {variant: "error"})
                }
            })
    }

    const usersOptions = users.filter(user => !groupAuthList.find(groupAuth => String(groupAuth['userId']) === String(user['id'])))

    return (
        <div className={classes.root}>

            <Card>
                <CardContent>
                    <Box my={2}>
                        <Autocomplete
                            multiple
                            size="small"
                            options={usersOptions}
                            disableCloseOnSelect
                            getOptionLabel={(option) => option.name + "(" + option.userId + ")"}
                            renderOption={(option, { selected }) => (
                                <React.Fragment>
                                    <Checkbox
                                        icon={icon}
                                        checkedIcon={checkedIcon}
                                        style={{ marginRight: 8 }}
                                        checked={selected}
                                    />
                                    {option.name}({option.userId})
                                </React.Fragment>
                            )}
                            style={{display: "inline"}}
                            renderInput={(params) => (
                                <TextField {...params} variant="outlined" label="권한 부여" placeholder="" style={{minWidth: 300}} />
                            )}
                            onChange={(event, data) => setSelectedUserList(data)}
                            onKeyUp={event => event.keyCode === 13 ? handleAddUserList() : null}
                        />
                        <Button variant={"outlined"} color={"primary"} style={{height: '40px'}} onClick={handleAddUserList}>추가</Button>
                    </Box>

                    <Table my={2}>
                        <TableHead>
                            <TableRow>
                                <TableCell>#</TableCell>
                                <TableCell>이름</TableCell>
                                <TableCell>아이디</TableCell>
                                <TableCell>권한제거</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {
                                groupAuthList.length === 0 ?
                                    <TableRow>
                                        <TableCell colSpan={4} align={"center"}>사용자가 없습니다.</TableCell>
                                    </TableRow>
                                    :
                                    groupAuthList.map((groupAuth, index) => {
                                        const user = users.find(user => String(user['id']) === String(groupAuth['userId']))
                                        if (typeof user !== 'object') {
                                            return null
                                        }
                                        return (
                                            <TableRow>
                                                <TableCell>{index + 1}</TableCell>
                                                <TableCell>{user['name']}</TableCell>
                                                <TableCell>{user['userId']}</TableCell>
                                                <TableCell>
                                                    <Button variant={"contained"}
                                                            color={"secondary"}
                                                            onClick={() => handleRemoveUser(user)}
                                                    >제거</Button>
                                                </TableCell>
                                            </TableRow>
                                        )
                                    })
                            }
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

        </div>
    );
}

export default Authentication;