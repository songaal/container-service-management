import React from 'react';
import Container from '@material-ui/core/Container';
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';
import {Box, MenuItem, useTheme, CircularProgress, Card, CardContent } from "@material-ui/core";
import CssBaseline from "@material-ui/core/CssBaseline";
import {makeStyles} from '@material-ui/core/styles';
import Button from '@material-ui/core/Button';
import ArrowDropDownIcon from '@material-ui/icons/ArrowDropDown';
import Menu from "@material-ui/core/Menu";
import Divider from '@material-ui/core/Divider';
import Link from '@material-ui/core/Link';
import {useRouter} from "next/router"
import fetch from "isomorphic-unfetch"
import DialogTitle from "@material-ui/core/DialogTitle";
import DialogContent from "@material-ui/core/DialogContent";
import DialogActions from "@material-ui/core/DialogActions";
import Dialog from "@material-ui/core/Dialog";
import {useSnackbar} from "notistack";
import useMediaQuery from "@material-ui/core/useMediaQuery/useMediaQuery";


let fetchEventCode = null
function LogDetail() {
    const { enqueueSnackbar, closeSnackbar } = useSnackbar();
    const theme = useTheme();
    const fullScreen = useMediaQuery(theme.breakpoints.down('xs'));
    const router = useRouter()
    const [logs, setLogs] = React.useState([])
    const { serverId, groupId, serviceId, logId } = router.query

    React.useEffect(() => {
        init()
        return () => {
            if (!fetchEventCode) {
                clearTimeout(fetchEventCode)
            }
        }
    }, [])

    const init = () => {
        fetch(`/api/groups/${groupId}/services/${serviceId}/logs/${logId}?serverId=${serverId}`, {
            method: "POST"
        })
            .then(res => res.json())
            .then(body => {
                if (body['status'] === 'success') {
                    fetchLogs()
                }
            })
    }

    const fetchLogs = () => {
        fetch(`/api/groups/${groupId}/services/${serviceId}/logs/${logId}?serverId=${serverId}`, {
            method: "GET"
        })
            .then(res => res.json())
            .then(body => {
                if (body['status'] === 'success' && body['logs']) {
                    setLogs(body['logs'])
                }
            })
        fetchEventCode = setTimeout(() => {
            fetchLogs()
        }, 1000)
    }

    return (
        <Box style={{width: "100%", height: "100vh", backgroundColor: "black", color: "white", padding: "20px"}}>
            {logs.map((log, index) => {
                const key = new Buffer(log).toString('base64').replace("==", "").substring(0, 30)
                const str = new Buffer(log).toString()
                return (
                    <div key={key}>{str}</div>
                )
            })}
        </Box>
    );
}

export default LogDetail;