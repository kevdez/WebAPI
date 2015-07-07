var config = {
    sql : {
        user: 'sa',
        password: 'flattire',
        server: '192.168.100.13',
        database: 'RDSWebService',
        stream: true
    },
    auth : {
        user: 'burnrubber',
        password: 'flattire77'
    }
};

config.port = process.env.PORT || 8080;


module.exports = config;