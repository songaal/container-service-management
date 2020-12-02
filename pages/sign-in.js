import React from 'react';
import Avatar from '@material-ui/core/Avatar';
import Button from '@material-ui/core/Button';
import CssBaseline from '@material-ui/core/CssBaseline';
import TextField from '@material-ui/core/TextField';
import Link from '@material-ui/core/Link';
import Paper from '@material-ui/core/Paper';
import Box from '@material-ui/core/Box';
import Grid from '@material-ui/core/Grid';
import LockOutlinedIcon from '@material-ui/icons/LockOutlined';
import Typography from '@material-ui/core/Typography';
import {makeStyles} from '@material-ui/core/styles';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';
import useMediaQuery from '@material-ui/core/useMediaQuery';
import { useTheme } from '@material-ui/core/styles';
import {useSnackbar} from "notistack";
import fetch from "isomorphic-unfetch";
import {useRouter} from "next/router";


const useStyles = makeStyles((theme) => ({
    root: {
        height: '100vh',
    },
    image: {
        // backgroundImage: 'url(https://source.unsplash.com/random)',
        backgroundImage: 'url(https://images.unsplash.com/photo-1425321505542-00715f6a9c28?ixlib=rb-1.2.1&q=80&fm=jpg&crop=entropy&cs=tinysrgb&w=1080&fit=max&ixid=eyJhcHBfaWQiOjF9)',
        backgroundRepeat: 'no-repeat',
        backgroundColor:
            theme.palette.type === 'light' ? theme.palette.grey[50] : theme.palette.grey[900],
        backgroundSize: 'cover',
        backgroundPosition: 'center',
    },
    paper: {
        margin: theme.spacing(8, 4),
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
        marginTop: theme.spacing(1),
    },
    submit: {
        margin: theme.spacing(3, 0, 2),
    },
}));

function Page() {
    const router = useRouter()
    const classes = useStyles();
    const theme = useTheme();
    const fullScreen = useMediaQuery(theme.breakpoints.down('xs'));
    const { enqueueSnackbar, closeSnackbar } = useSnackbar();
    const [open, setOpen] = React.useState(false);
    const [resetEmail, setResetEmail] = React.useState("");
    const [invalid, setInvalid] = React.useState({});
    const [disabled, setDisabled] = React.useState({});
    const [userId, setUserId] = React.useState("");
    const [password, setPassword] = React.useState("");
    const [loginCheck, setLoginCheck] = React.useState(false);

    React.useEffect(() => {
        fetch(`/api/auth/validate`)
            .then(res => res.json())
            .then(body => {
                if(body.status === "success") {
                    router.replace("/home")
                } else {
                    setLoginCheck(true)
                }
            })
    }, [])


    function handleClickOpen() {
        setInvalid({})
        setResetEmail("")
        setOpen(true);
    }

    function handleClose() {
        setInvalid({})
        setResetEmail("")
        setOpen(false);
    }

    async function processRestPassword() {
        let check = {}
        if (!/^([\w-]+(?:\.[\w-]+)*)@((?:[\w-]+\.)*\w[\w-]{0,66})\.([a-z]{2,6}(?:\.[a-z]{2})?)$/gi.test(resetEmail)) {
            // enqueueSnackbar('아이디는 이메일 형싱입니다.', { variant: "warning" });
            check['resetPassword'] = "이메일 형식으로 입력하세요.";
        }
        if (Object.keys(check).length > 0) {
            setInvalid(check)
            return false
        }
        setDisabled['resetPassword'] = true;
        try {
            const res = await fetch(`/api/users/${resetEmail}/action?type=resetPassword`, {
                method: "PUT"
            })
            if(res.ok) {
                enqueueSnackbar('이메일을 확인하세요.', { variant: "info" });
                handleClose()
            } else {
                enqueueSnackbar('이메일 전송을 실패하였습니다. ', { variant: "error" });
            }
        } catch (err) {
            enqueueSnackbar('비밀번호 초기화 실패하였습니다.', { variant: "error" });
        } finally {
            delete setDisabled['resetPassword'];
        }
    }

    async function processLogin() {
        setInvalid({})
        let check = {}
        if (!/^([\w-]+(?:\.[\w-]+)*)@((?:[\w-]+\.)*\w[\w-]{0,66})\.([a-z]{2,6}(?:\.[a-z]{2})?)$/gi.test(userId)) {
            check['userId'] = "이메일 형식으로 입력하세요.";
        }
        if (password.length < 4) {
            check['password'] = "비밀번호가 잘못되었습니다.";
        }
        if (Object.keys(check).length > 0) {
            setInvalid(check)
            return false
        }

        setDisabled['login'] = true;
        try {
            const res = await fetch(`/api/auth/login`, {
                method: "POST",
                body: JSON.stringify({userId, password})
            })
            const body = await res.json()
            if(res.ok && body['status'] === 'success') {
                await router.replace("/home")
            } else {
                enqueueSnackbar('등록된 사용자가 없습니다.', { variant: "error" });
            }
        } catch (err) {
            enqueueSnackbar('로그인 요청이 실패 하였습니다.', { variant: "error" });
        } finally {
            setDisabled['login'] = false;
        }
    }

    if (!loginCheck) {
        return null;
    }

    return (
        <Grid container component="main" className={classes.root}>
            <CssBaseline />
            <Grid item xs={false} sm={4} md={7} className={classes.image} />
            <Grid item xs={12} sm={8} md={5} component={Paper} elevation={6} square>
                <div className={classes.paper}>
                    <Avatar className={classes.avatar}>
                        <LockOutlinedIcon />
                    </Avatar>
                    <Typography component="h1" variant="h5">
                        서비스 운영플랫폼
                    </Typography>
                    <form className={classes.form}>
                        <TextField
                            variant="outlined"
                            margin="normal"
                            required
                            fullWidth
                            label="아이디"
                            autoComplete="email"
                            value={userId}
                            onChange={event => setUserId(event.target.value)}
                            autoFocus
                            error={invalid['userId']}
                            helperText={invalid['userId']}
                            onKeyUp={event => event.key === "Enter" ? processLogin() : null}
                        />
                        <TextField
                            variant="outlined"
                            margin="normal"
                            required
                            fullWidth
                            label="비밀번호"
                            type="password"
                            autoComplete="current-password"
                            value={password}
                            onChange={event => setPassword(event.target.value)}
                            error={invalid['password']}
                            helperText={invalid['password']}
                            onKeyUp={event => event.key === "Enter" ? processLogin() : null}
                        />

                        <Button
                            fullWidth
                            variant="contained"
                            color="primary"
                            className={classes.submit}
                            onClick={processLogin}
                            disabled={disabled['login']}
                        >
                            로그인
                        </Button>

                        <Grid container>
                            <Grid item xs>
                                <Link href="#" onClick={handleClickOpen} variant="body2">
                                    비밀번호 초기화
                                </Link>
                            </Grid>
                            <Grid item>
                                <Link href="/sign-up" variant="body2">
                                    회원가입
                                </Link>
                            </Grid>
                        </Grid>
                        <Box mt={5}>

                        </Box>
                    </form>
                </div>
            </Grid>

            <Dialog
                fullWidth={true}
                fullScreen={fullScreen}
                open={open}
                onClose={handleClose}
            >
                <DialogTitle>
                    비밀번호 초기화
                </DialogTitle>
                <DialogContent>
                    <TextField fullWidth={true}
                               label={"Email"}
                               required={true}
                               value={resetEmail}
                               onChange={event => setResetEmail(event.target.value)}
                               error={invalid['resetPassword']}
                               helperText={invalid['resetPassword']}
                    />
                    <Box mt={2}>
                        <Typography variant={"body2"} color={"textPrimary"} >
                            이메일로 임시 비밀번호가 발송됩니다.
                        </Typography>
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button autoFocus
                            variant={"outlined"}
                            onClick={processRestPassword}
                            color="primary"
                            disabled={disabled['resetPassword']}
                    >
                        초기화
                    </Button>
                    <Button variant={"outlined"} onClick={handleClose} color="default">
                        닫기
                    </Button>
                </DialogActions>
            </Dialog>

        </Grid>
    );
}

// Page.getInitialProps = async (ctx) => {
//     return {
//         test: "123123"
//     }
// }


export default Page