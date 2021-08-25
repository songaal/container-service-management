import React from 'react';
import Container from '@material-ui/core/Container';
import Link from '@material-ui/core/Link';
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';
import Header from "../../components/Header";
import {
    Box,
    Button,
    Card,
    CardContent,
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableRow,
    TextareaAutosize,
    TextField,
    useTheme
} from "@material-ui/core";
import CssBaseline from "@material-ui/core/CssBaseline";
import DialogTitle from "@material-ui/core/DialogTitle";
import DialogContent from "@material-ui/core/DialogContent";
import DialogActions from "@material-ui/core/DialogActions";
import Dialog from "@material-ui/core/Dialog";
import useMediaQuery from "@material-ui/core/useMediaQuery/useMediaQuery";
import {makeStyles} from "@material-ui/core/styles";
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


function Groups() {
    const classes = useStyles();
    const theme = useTheme();
    const router = useRouter()
    const fullScreen = useMediaQuery(theme.breakpoints.down('xs'));
    const { enqueueSnackbar, closeSnackbar } = useSnackbar();
    const [open, setOpen] = React.useState(false);
    const [name, setName] = React.useState("");
    const [description, setDescription] = React.useState("");
    const [invalid, setInvalid] = React.useState({})
    const [groups, setGroups] = React.useState([])
    const [searchKeyword, setSearchKeyword] = React.useState("")
    const [inputSearchKeyword, setInputSearchKeyword] = React.useState("")

    React.useEffect(() => {
        fetchGroups()
    }, [])

    const handleClickOpen = () => {
        setName("")
        setDescription("")
        setInvalid({})
        setOpen(true);
    };

    const handleClose = () => {
        setName("")
        setDescription("")
        setInvalid({})
        setOpen(false);
    };

    const fetchGroups = () => {
        /// 그룹 전체 조회.
        fetch('/api/groups')
            .then(res => res.json())
            .then(body => {
                if (body['status'] === 'success') {
                    setGroups(body['groups'])
                } else {
                    enqueueSnackbar(body['message'], {variant: "error"})
                }
            })
    }

    const processNewGroup = async () => {
        let check = {}
        if (name.trim().length === 0) {
            check['name'] = "그룹명을 입력하세요.";
        }

        if (Object.keys(check).length > 0) {
            setInvalid(check);
            return false;
        }


        const res = await fetch('/api/groups', {
            method: "POST",
            body: JSON.stringify({name, description})
        })
        const body = await res.json();
        if (body['status'] === 'success') {
            handleClose();
            fetchGroups()
            enqueueSnackbar("그룹을 생성하였습니다.", {variant: "success"})
        } else {
            enqueueSnackbar(body['message'], {variant: "warning"})
        }
    }

    const list = groups.filter(group => searchKeyword.trim().length === 0 ? true : (group['name']||"").includes(searchKeyword))

    return (
        <div className={classes.root}>
            <CssBaseline />
            <Header active={1} />
            <Container maxWidth={"xl"}>
                <br/>
                <Box>
                    <Typography variant="h4" gutterBottom>
                        그룹
                    </Typography>
                </Box>

                <Grid container>
                    <Grid item xs={6}>
                        <TextField variant={"outlined"}
                                   color={"primary"}
                                   size={"small"}
                                   placeholder="검색"
                                   value={inputSearchKeyword}
                                   onChange={event => setInputSearchKeyword(event.target.value)}
                                   onKeyUp={event => event.key === "Enter" ? setSearchKeyword(inputSearchKeyword): null}
                        />
                        <Button style={{height: '40px'}}
                                variant={"outlined"}
                                color={"default"}
                                onClick={() => setSearchKeyword(inputSearchKeyword)}
                        >검색</Button>
                    </Grid>
                    <Grid item xs={6}>
                        <Box align={"right"}>
                            <Button size={"small"}
                                    variant={"contained"}
                                    color={"primary"}
                                    onClick={handleClickOpen}
                            >그룹추가</Button>
                        </Box>
                    </Grid>
                </Grid>
                <Box my={3}>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell>#</TableCell>
                                <TableCell>그룹</TableCell>
                                <TableCell>서버</TableCell>
                                <TableCell>서비스</TableCell>
                                <TableCell>사용자</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {
                                list.length === 0 ?
                                    (
                                        <TableRow>
                                            <TableCell colSpan={5} align={"center"}>결과없음.</TableCell>
                                        </TableRow>
                                    )
                                    :
                                    list.map((group, index) => {
                                        return (
                                            <TableRow key={group['name']}
                                                      onClick={() => {router.push(`/groups/${group['id']}`)}}
                                                      style={{cursor: "pointer"}}
                                            >
                                                <TableCell>{index + 1}</TableCell>
                                                <TableCell> {group['name']}</TableCell>
                                                <TableCell>{group['server_count']}</TableCell>
                                                <TableCell>{group['service_count']}</TableCell>
                                                <TableCell>{group['user_count']}</TableCell>
                                            </TableRow>
                                        )
                                    })}
                        </TableBody>
                    </Table>
                </Box>

                <Dialog
                    fullWidth={true}
                    fullScreen={fullScreen}
                    open={open}
                    onClose={handleClose}
                >
                    <DialogTitle>
                        그룹생성
                    </DialogTitle>
                    <DialogContent>
                        <Box my={3}>
                            <Grid container>
                                <Grid item xs={4}>
                                    이름
                                </Grid>
                                <Grid item xs={8}>
                                    <TextField fullWidth={true}
                                               label={""}
                                               required={true}
                                               value={name}
                                               onChange={event => setName(event.target.value)}
                                               error={Boolean(invalid['name'])}
                                               helperText={invalid['name']}
                                               autoFocus
                                    />
                                </Grid>
                            </Grid>
                        </Box>
                        <Box my={3}>
                            <Grid container >
                                <Grid item xs={4}>
                                    설명
                                </Grid>
                                <Grid item xs={8}>
                                    <TextareaAutosize style={{width: '100%', minHeight: "50px"}}
                                                      value={description}
                                                      onChange={event => setDescription(event.target.value)}
                                    />
                                </Grid>
                            </Grid>
                        </Box>
                    </DialogContent>
                    <DialogActions>
                        <Button autoFocus variant={"outlined"} onClick={processNewGroup} color="primary">
                            생성
                        </Button>
                        <Button variant={"outlined"} onClick={handleClose} color="default">
                            닫기
                        </Button>
                    </DialogActions>
                </Dialog>
            </Container>
        </div>
    );
}

export default Groups