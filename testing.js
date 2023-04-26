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

/**
 * compares two products, placing extra detail on 'custom_attributes'
 * @param {String} sku - product sku
 * @returns {String|Array} if no differences - a string contianing the product sku or returns the attributes that are different
 */
async function testProduct(sku) {
    // ignore extension_attributes - these aren't relevant and the ids in here change which isn't an issue, tier_prices includes an extension_attributes property
    const attributesToIgnore = ['attribute_set_id', 'updated_at', 'custom_attributes', 'extension_attributes', 'tier_prices']
    const differences = { sku }
    const encodedSku = encodeURIComponent(sku)
    const localProduct = await admin.get(`products/${encodedSku}`)
    const liveProduct = await liveAdmin.get(`products/${(encodedSku)}`)

    differences.attributes = compareAttributes(liveProduct, localProduct, attributesToIgnore)
    differences.customAttribures = compareObjectAttributes(liveProduct, localProduct, 'custom_attributes')
    differences.customAttribures = differences.customAttribures.filter(attribute => ATTRIBUTES_TO_REMOVE.includes(attribute))
    return !differences.attributes.length && !differences.customAttribures.length ? `${sku}: No errors` : differences
}

/**
 * randomly tests a number of products
 * @param {Array.<object>} products - magento products
 * @returns {Array} differences
 */
async function randomTests(products) {
    const numberOfTests = 10
    const randomNumbers = []
    const results = []
    for (let i = 0; i < numberOfTests; i++) {
        randomNumbers.push(generateRandomNum(0, products.length))
    }

    for (const index of randomNumbers) {
        results.push(await testProduct(products[index].sku))
    }
    return results
}

module.exports = {
    randomTests
}
