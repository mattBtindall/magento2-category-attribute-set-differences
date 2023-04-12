const https = require('https')
const keys = require('./keys')
const Magento2Api = require('magento2-api-wrapper')
const IMPORT_ALL_ID = 31

const admin = new Magento2Api({
    api: {
        url: 'https://localhost',
        consumerKey: keys.consumerKey,
        consumerSecret: keys.consumerSecret,
        accessToken: keys.accessToken,
        tokenSecret: keys.tokenSecret
    },
    axios: {
        httpsAgent: new https.Agent({
            rejectUnauthorized: false
        })
    }
})

module.exports = {
    admin,
    IMPORT_ALL_ID
}