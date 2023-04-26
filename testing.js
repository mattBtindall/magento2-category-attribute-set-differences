const { admin, ATTRIBUTES_TO_REMOVE, generateRandomNum } = require('./global')
const Magento2Api = require('magento2-api-wrapper')
const keys = require('./keys')
const https = require('https')

const liveAdmin = new Magento2Api({
    api: {
        url: 'https://magento-admin.kingfisherdirect.co.uk',
        consumerKey: keys.live.consumerKey,
        consumerSecret: keys.live.consumerSecret,
        accessToken: keys.live.accessToken,
        tokenSecret: keys.live.tokenSecret
    },
    axios: {
        httpsAgent: new https.Agent({
            rejectUnauthorized: false
        })
    }
})

/**
 * compares two products and returns the key (attribute_code) if the values are different
 * @param {Object} liveProduct - magento product
 * @param {Object} localProduct- magento product
 * @param {Array.<string>} attributesToIgnore - attribute codes that aren't tested
 * @returns {Array} containing attributes that are different
 */
function compareAttributes(liveProduct, localProduct, attributesToIgnore) {
    const differences = []
    for (const key in localProduct) {
        if (attributesToIgnore.includes(key)) continue
        let localAttribute = localProduct[key]
        let liveAttribute = liveProduct[key]

        if (typeof localProduct[key] === 'object') {
            localAttribute = JSON.stringify(localProduct[key])
            liveAttribute = JSON.stringify(liveProduct[key])
        }

        if (localAttribute !== liveAttribute) differences.push(key)
    }
    return differences
}

/**
 * get the differences between attributes that are objects
 * @param {Object} liveProduct - magento product
 * @param {Object} localProduct - magento product
 * @returns {Array.<Object>} objects contain attribute code and value of the missing attribute
 */
function compareObjectAttributes(liveProduct, localProduct, attribute) {
    return liveProduct[attribute].filter(liveAttribute => {
        for (const localAttribute of localProduct[attribute]) {
            if (JSON.stringify(liveAttribute) === JSON.stringify(localAttribute))
                return false
        }
        return true
    })
}