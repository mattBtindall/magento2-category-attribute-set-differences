const https = require('https')
const keys = require('./keys')
const Magento2Api = require('magento2-api-wrapper')
const attributeSetIds = {
    importAll: 31,
    default: 4
}
const ATTRIBUTES_TO_REMOVE = [
    'import_id', 'import_time'
]

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
    attributeSetIds,
    ATTRIBUTES_TO_REMOVE
}