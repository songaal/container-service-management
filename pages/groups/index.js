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

const useStyles = makeStyles( theme => ({
    root: {
        flexGrow: 1,
        width: '100%',
        backgroundColor: theme.palette.background.paper,
    }
}));


function Groups() {
    const classes = useStyles();
    const [open, setOpen] = React.useState(false);
    const theme = useTheme();
    const fullScreen = useMediaQuery(theme.breakpoints.down('xs'));

    const handleClickOpen = () => {
        setOpen(true);
    };

    const handleClose = () => {
        setOpen(false);
    };

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
                        />
                        <Button style={{height: '40px'}} variant={"outlined"} color={"default"}>검색</Button>
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
                            <TableRow>
                                <TableCell>1</TableCell>
                                <TableCell><Link href={"#"}>DSearch 그룹</Link></TableCell>
                                <TableCell>2</TableCell>
                                <TableCell>10</TableCell>
                                <TableCell>20 명</TableCell>
                            </TableRow>
                            <TableRow>
                                <TableCell>2</TableCell>
                                <TableCell><Link href={"#"}>ES검색</Link></TableCell>
                                <TableCell>4</TableCell>
                                <TableCell>22</TableCell>
                                <TableCell>2 명</TableCell>
                            </TableRow>
                            <TableRow>
                                <TableCell>3</TableCell>
                                <TableCell><Link href={"#"}>K8S 그룹</Link></TableCell>
                                <TableCell>8</TableCell>
                                <TableCell>33</TableCell>
                                <TableCell>80 명</TableCell>
                            </TableRow>
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
                                    <TextareaAutosize style={{width: '100%', minHeight: "50px"}} />
                                </Grid>
                            </Grid>
                        </Box>
                    </DialogContent>
                    <DialogActions>
                        <Button autoFocus variant={"outlined"} onClick={handleClose} color="primary">
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