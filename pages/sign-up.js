import React from 'react';
import Router from "next/router";
import Avatar from '@material-ui/core/Avatar';
import Button from '@material-ui/core/Button';
import CssBaseline from '@material-ui/core/CssBaseline';
import TextField from '@material-ui/core/TextField';
import Link from '@material-ui/core/Link';
import Grid from '@material-ui/core/Grid';
import Box from '@material-ui/core/Box';
import LockOutlinedIcon from '@material-ui/icons/LockOutlined';
import Typography from '@material-ui/core/Typography';
import {makeStyles} from '@material-ui/core/styles';
import Container from '@material-ui/core/Container';
import Backdrop from '@material-ui/core/Backdrop';
import CircularProgress from '@material-ui/core/CircularProgress';
import { SnackbarProvider, useSnackbar } from 'notistack';
import fetch from "isomorphic-unfetch";

const useStyles = makeStyles((theme) => ({
    paper: {
        marginTop: theme.spacing(8),
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
    },
    avatar: {
        margin: theme.spacing(1),
        backgroundColor: theme.palette.secondary.main,
    },
    form: {
        width: '100%', // Fix IE 11 issue.
        marginTop: theme.spacing(3),
    },
    submit: {
        margin: theme.spacing(3, 0, 2),
    },
    backdrop: {
        zIndex: theme.zIndex.drawer + 1,
        color: '#fff',
    },
}));

function Page() {
    const { enqueueSnackbar, closeSnackbar } = useSnackbar();
    const classes = useStyles();
    const [open, setOpen] = React.useState(false);
    const [userId, setUserId] = React.useState("")
    const [name, setName] = React.useState("")
    const [password, setPassword] = React.useState("")
    const [passwordConfirm, setPasswordConfirm] = React.useState("")
    const [invalid,setInvalid] = React.useState({})
    const [loginCheck, setLoginCheck] = React.useState(false);

    React.useEffect(() => {
        fetch(`/api/auth/validate`)
            .then(res => res.json())
            .then(body => {
                if(body['status'] === "success") {
                    Router.replace("/home")
                } else {
                    setLoginCheck(true)
                }
            })
    }, [])

    async function handleUserAdd() {
        let check = {}
        if (!/^[a-zA-Z가-힣]+$/.test(name)) {
            check['name'] = "이름은 한글/영어만 가능합니다.";
        }
        if (!/^([\w-]+(?:\.[\w-]+)*)@((?:[\w-]+\.)*\w[\w-]{0,66})\.([a-z]{2,6}(?:\.[a-z]{2})?)$/gi.test(userId)) {
            // enqueueSnackbar('아이디는 이메일 형싱입니다.', { variant: "warning" });
            check['userId'] = "이메일 형식으로 입력하세요.";
        }
        if (password.length < 4) {
            check['password'] = "비밀번호는 4자 이싱 입력하세요.";
        }
        if (password !== passwordConfirm) {
            check['passwordConfirm'] = "비밀번호가 일치하지 않습니다.";
        }

        setInvalid(check);
        if (Object.keys(check).length !== 0) {
            return false;
        }

        setOpen(true)
        try {
            const res = await fetch("/api/users", {
                method: "post",
                body: JSON.stringify({userId, name, password})
            })
            const body = await res.json()
            if (body['status'] === "success") {
                enqueueSnackbar('회원가입이 완료되었습니다.', { variant: "success" });
                Router.push("/sign-in")
            } else {
                enqueueSnackbar(body['message'], { variant: "error" });
            }
        } catch (err) {
            enqueueSnackbar('회원가입 실패하였습니다.', { variant: "error" });
        }
        setOpen(false)
    }

    if (!loginCheck) {
        return null;
    }

    return (
        <Container component="main" maxWidth="xs">
            <CssBaseline />
            <div className={classes.paper}>
                <Avatar className={classes.avatar}>
                    <LockOutlinedIcon />
                </Avatar>
                <Typography component="h1" variant="h5">
                    회원가입
                </Typography>

                <form className={classes.form} noValidate>
                    <Grid container spacing={2}>
                        <Grid item xs={12}>
                            <TextField
                                variant="outlined"
                                required
                                fullWidth
                                label="이름"
                                value={name}
                                onChange={event => setName(event.target.value)}
                                helperText={invalid['name']}
                                error={invalid['name']}
                            />
                        </Grid>

                        <Grid item xs={12}>
                            <TextField
                                variant="outlined"
                                required
                                fullWidth
                                label="아이디"
                                name="email"
                                autoComplete="email"
                                placeholder={"admin@example.com"}
                                value={userId}
                                onChange={event => setUserId(event.target.value)}
                                helperText={invalid['userId']}
                                error={invalid['userId']}
                            />
                        </Grid>

                        <Grid item xs={12}>
                            <TextField
                                variant="outlined"
                                required
                                fullWidth
                                label="비밀번호"
                                type="password"
                                autoComplete="current-password"
                                value={password}
                                onChange={event => setPassword(event.target.value)}
                                helperText={invalid['password']}
                                error={invalid['password']}
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <TextField
                                variant="outlined"
                                required
                                fullWidth
                                label="비밀번호 확인"
                                type="password"
                                autoComplete="current-password"
                                value={passwordConfirm}
                                onChange={event => setPasswordConfirm(event.target.value)}
                                helperText={invalid['passwordConfirm']}
                                error={invalid['passwordConfirm']}
                            />
                        </Grid>
                    </Grid>
                    <Button
                        fullWidth
                        variant="contained"
                        color="primary"
                        className={classes.submit}
                        onClick={handleUserAdd}
                    >
                        가입하기
                    </Button>
                    <Grid container justify="flex-end">
                        <Grid item>
                            <Link href="/sign-in" variant="body2">
                                로그인 이동
                            </Link>
                        </Grid>
                    </Grid>
                </form>
            </div>
            <Box mt={5}>

            </Box>
            <Backdrop className={classes.backdrop} open={open}>
                <CircularProgress color="inherit" />
            </Backdrop>

        </Container>
    );
}

Page.getInitialProps = async (ctx) => {
    // const res = await fetch('https://api.github.com/repos/vercel/next.js')
    // const json = await res.json()
    // return { stars: json.stargazers_count }
    return {
        test: "123123"
    }
}


export default Page