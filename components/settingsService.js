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

function SettingsService() {
    const classes = useStyles();
    const theme = useTheme();
    const fullScreen = useMediaQuery(theme.breakpoints.down('xs'));

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
                                <TableCell>그룹</TableCell>
                                <TableCell>서비스</TableCell>
                                <TableCell>서버</TableCell>
                                <TableCell>타입</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            <TableRow>
                                <TableCell>1</TableCell>
                                <TableCell><Link href={"/groups/1"}>검색</Link></TableCell>
                                <TableCell><Link href={"/groups/1/services/1"}>엘라스틱서치</Link></TableCell>
                                <TableCell><Link href={"/server/1"}>elk1-dev</Link></TableCell>
                                <TableCell>프로세스</TableCell>
                            </TableRow>
                            <TableRow>
                                <TableCell>2</TableCell>
                                <TableCell><Link href={"/groups/1"}>검색</Link></TableCell>
                                <TableCell><Link href={"/groups/1/services/1"}>데이터</Link></TableCell>
                                <TableCell><Link href={"/server/1"}>elk2-dev</Link></TableCell>
                                <TableCell>프로세스</TableCell>
                            </TableRow>
                            <TableRow>
                                <TableCell>3</TableCell>
                                <TableCell><Link href={"/groups/1"}>ES검색</Link></TableCell>
                                <TableCell><Link href={"/groups/1/services/1"}>elasticsearch</Link></TableCell>
                                <TableCell><Link href={"/server/1"}>elk1-prod</Link></TableCell>
                                <TableCell>컨테이너</TableCell>
                            </TableRow>
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </React.Fragment>
    )
}

export default SettingsService;