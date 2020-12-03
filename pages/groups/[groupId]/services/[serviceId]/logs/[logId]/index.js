import React from 'react';
import {Box, useTheme} from "@material-ui/core";
import {useRouter} from "next/router"
import fetch from "isomorphic-unfetch"
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
    const logRef = React.useRef(null)

    React.useEffect(() => {
        init()

        return () => {
            if (!fetchEventCode) {
                clearTimeout(fetchEventCode)
                fetchEventCode = null
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
                    setTimeout(()=>{
                        fetchLogs()
                    }, 2000)
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
        if (fetchEventCode !== null) {
            clearTimeout(fetchEventCode)
            fetchEventCode = null
        }
        fetchEventCode = setTimeout(() => {
            fetchLogs()
        }, 2000)
    }

    const viewLogs = logs.map(log => new Buffer(log).toString().replace("\n", "")).join("\n") + "\n\n\n\n"
    if (logRef.current) {
        const y = Math.floor(logRef.current.scrollHeight - logRef.current.scrollTop)
        if ( logRef.current.offsetHeight < y + 300 && logRef.current.offsetHeight > y - 300) {
            console.log("down", logs.length * 20,logRef.current.offsetHeight, Math.floor(logRef.current.scrollHeight - logRef.current.scrollTop))
            logRef.current.scrollTop = 99999999
        }
    }
    return (
        <Box style={{backgroundColor: "black", width: "100%", height: "100vh", overflow: "auto"}}>
            <textarea
                    ref={logRef}
                      style={{
                          backgroundColor: "black",
                          color: "white",
                          width: "100%",
                          height: '99%',
                          overflow: "auto",
                          border: '0px',
                          padding: '20px'
                      }}
                      value={viewLogs}
                      readOnly={true}
            />
        </Box>
    );
}

export default LogDetail;