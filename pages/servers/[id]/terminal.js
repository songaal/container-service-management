import React from 'react';
import {Box} from "@material-ui/core";

function ServerTerminal({webSshHost}) {
    const [server, setServer] = React.useState({})
    const [isReady, setReady] = React.useState(false)

    React.useEffect(() => {
        const url = "/api" + location.pathname.replace("/terminal", "")
        fetch(url)
            .then(res => res.json())
            .then(body => {
                setReady(true)
                setServer(body['server'])
            })
    }, [])

    if (!isReady) {
        return (
            <Box>
                잠시만 기다려 주세요...
            </Box>
        )
    }
    return (
        <Box>
            <iframe src={`${webSshHost}?hostname=${server['ip']}&port=${server['port']}&username=${server['user']}&password=${server['password']}`}
                    style={{
                        display: "flex",
                        flexDirection: "column",
                        position: "absolute",
                        width: "100%",
                        height: "100%"
                    }}
            >
            </iframe>
        </Box>
    );
}

ServerTerminal.getInitialProps = async (ctx) => {
    return {
        webSshHost: process.env.webssh_host || "/"
    }
}

export default ServerTerminal;