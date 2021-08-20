import React from 'react';
import {Box} from "@material-ui/core";

function ServerTerminal({webSshHost}) {
    const [server, setServer] = React.useState({})

    React.useEffect(() => {
        const url = "/api" + location.pathname.replace("/expTerminal", "")
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
        <div>            
            <Box style={{width: "30%", height: "100vh", float: "left"}}>
                <iframe src={`/servers/${server['id']}/explorer`}
                        style={{
                            display: "flex",
                            flexDirection: "column",
                            position: "absolute",
                            width: "30%",
                            height: "100%"
                        }}>
                </iframe>
            </Box>
            <Box style={{width: "70%", height: "100vh", backgroundColor: "black", float: "left"}}>
                <iframe src={`${webSshHost}?hostname=${server['ip']}&port=${server['port']||22}&username=${server['user']||'root'}&password=${server['password'].replace("==","")}`}
                            style={{
                                display: "flex",
                                flexDirection: "column",
                                position: "absolute",
                                width: "70%",
                                height: "100%"
                }}/>
            </Box>
        </div>
    );
}

ServerTerminal.getInitialProps = async (ctx) => {
    return {
        webSshHost: "http://localhost:8080/" || "/"
    }
}

export default ServerTerminal;