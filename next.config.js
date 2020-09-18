module.exports = {
    distDir: 'dist',
    webpack: (config, {
        isServer
    }) => {
        // Fixes npm packages that depend on `fs, net, tls` module
        if (!isServer) {
            config.node = {
                fs: 'empty',
                net: 'empty',
                tls: 'empty',
                "fs-extra": 'empty'
            }
        }
        return config
    }
}

