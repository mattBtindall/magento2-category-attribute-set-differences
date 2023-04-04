const Magento2Api = require('magento2-api-wrapper')
const keys = require('./keys')
const https = require('https')
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

function getWithFilter(endpoint, filters) {
    return admin.get(endpoint, {
        params: {
            searchCriteria: {
            'filter_groups': [
                    {
                        'filters': filters
                    }
                ]
            }
        }
    })
}

