import React from 'react';
import {Box} from "@material-ui/core";

function ServerTerminal({webSshHost}) {
    const [server, setServer] = React.useState({})

    React.useEffect(() => {
        const url = "/api" + location.pathname.replace("/terminal", "")
        fetch(url)
            .then(res => res.json())
            .then(body => {
                setServer(body['server'])
            })
    }, [])

    if (Object.keys(server).length < 3) {
        return null
    }
    return (
        <Box>
            <iframe src={`${webSshHost}?hostname=${server['ip']}&port=${server['port']||22}&username=${server['user']||'root'}&password=${server['password'].replace("==","")}`}
                         style={{
                             display: "flex",
                             flexDirection: "column",
                             position: "absolute",
                             width: "100%",
                             height: "100%"
            }}/>
        </Box>
    );
}

ServerTerminal.getInitialProps = async (ctx) => {
    return {
        webSshHost: process.env.webssh_host || "/"
    }
}

export default ServerTerminal;