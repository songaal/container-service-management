import React from 'react';
import Container from '@material-ui/core/Container';
import Header from '../components/Header'
import {
    Box,
    CardContent,
    Grid,
    Table,
    Divider,
    TableBody,
    TableCell,
    TableHead,
    TableRow, TextField,Button
} from "@material-ui/core";
import Card from "@material-ui/core/Card";
import {makeStyles} from '@material-ui/core/styles';
import Typography from "@material-ui/core/Typography";
import Link from "../components/Link"

const useStyles = makeStyles({
    table: {
        minWidth: 650,
    },
});

function createData(name, calories, fat, carbs, protein) {
    return { name, calories, fat, carbs, protein };
}

const rows = [
    createData('1', "ES검색", "esapi1", "119.205.194.121"),
    createData('2', "ES검색", "esapi2", "119.205.194.122"),
    createData('3', "쿠버개발", "kube1", "119.205.194.98"),
    createData('4', "쿠버개발", "kube2", "119.205.194.99")
];

export default function Index() {
    const classes = useStyles();
    return (
        <React.Fragment>
            <Header />
            <Container maxWidth={"lg"}>
                <Box my={5}>
                    <Typography variant="h4" component="h1" gutterBottom>
                        서버
                    </Typography>
                </Box>

                <Card>
                    <CardContent>
                        <Grid container>
                            <Grid item xs="6">
                                <TextField autoFocus placeholder="검색" />
                                <Button size={"small"} variant={"outlined"} color={"primary"}>조회</Button>
                            </Grid>
                            <Grid item xs="6">
                                <Box align={"right"}>
                                    <Button variant={"outlined"} color={"primary"}>서버 추가</Button>
                                </Box>
                            </Grid>
                        </Grid>

                        <Divider style={{marginTop: "10px", marginBottom: "10px"}} />

                        <Table className={classes.table} >
                            <TableHead>
                                <TableRow>
                                    <TableCell>#</TableCell>
                                    <TableCell>그룹</TableCell>
                                    <TableCell>호스트</TableCell>
                                    <TableCell>IP주소</TableCell>
                                    <TableCell>SSH 접속</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {rows.map((row) => (
                                    <TableRow key={row.name}>
                                        <TableCell component="th" scope="row">
                                            {row.name}
                                        </TableCell>
                                        <TableCell>{row.calories}</TableCell>
                                        <TableCell>{row.fat}</TableCell>
                                        <TableCell>{row.carbs}</TableCell>
                                        <TableCell>
                                            <Link href={"#"}>열기</Link>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>


            </Container>
        </React.Fragment>
    );
}
