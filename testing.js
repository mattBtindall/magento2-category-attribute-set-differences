const { ATTRIBUTES_TO_REMOVE, generateUniqueRandomNumbers, localAdmin, attributeSetIds } = require('./global')
const { getUnUsedAttributes, getWithFilter } = require('./helpers/getHelpers')
const Magento2Api = require('magento2-api-wrapper')
const keys = require('./keys')
const https = require('https')
const fs = require('fs')

const liveAdmin = new Magento2Api({
    api: {
        // url: 'https://magento-admin.kingfisherdirect.co.uk',
        url: 'https://localhost',
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
    const localProduct = await localAdmin.get(`products/${encodedSku}`)
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
async function randomProductTests(products) {
    const numberOfTests = 10
    const randomNumbers = generateUniqueRandomNumbers(products.length, numberOfTests)
    const results = []

    for (const index of randomNumbers) {
        results.push(await testProduct(products[index].sku))
    }
    return results
}

/**
 * test function outputs the number of un-used attributes from the specified file
 * @param {JSON} file - containing objects with a "attribute_set_name: value" key value pair e.g. {{ "attribute_set_name": "Benches and Picnic Tables" }, {"attribute_set_name": "Bins Specifications"}}
 * @return {void}
 */
async function checkAllAttributeSets(file) {
    const data = fs.readFileSync(file)
    const attributeSetNames = JSON.parse(data)
    for (const setName of attributeSetNames) {
        getUnUsedAttributes(setName.attribute_set_name)
    }
}
// checkAllAttributeSets('./all_attribute_sets.json')

/**
 * checks array for duplicates
 * @param {Array} arr -
 * @returns {Boolean} indicates whether array has duplicate values
 */
const hasDuplicates = (arr) => (new Set(arr).size) !== arr.length

/**
 * gets the items of an array that are duplicated
 * @param {Array} arr - array of values
 * @returns {Array} items that are duplicated
 */
function getDuplicates(arr) {
    const duplicates = new Set()
    arr.forEach(val => {
        if (arr.indexOf(val) !== arr.lastIndexOf(val)) {
            duplicates.add(val)
        }
    })
    return Array.from(duplicates)
}

/**
 * gets the total number of products in the attribute set
 * @param {Object} magentoAdmin - magento2-api-wrapper instance
 * @param {Number} attributeSetId - attribute set id
 * @returns {String} defining the number of products in the attribute set
 */
async function getNumberOfProductFromAttribueSet(magentoAdmin, attributeSetId) {
    // const products = await getWithFilter('products', [
    //     { 'field': 'attribute_set_id', 'value': attributeSetId, 'condition_type': 'eq' }
    // ])
    const products = await magentoAdmin.get('products', {
        params: {
            searchCriteria: {
            currentPage: 1,
            pageSize: 500,
            'filter_groups': [{'filters': [{ 'field': 'attribute_set_id', 'value': attributeSetId, 'condition_type': 'eq' }]}]
            }
        }
    })
    return `${attributeSetId}: ${products.total_count}`
}
// getNumberOfProductFromAttribueSet(localAdmin, attributeSetIds.default)
//     .then(data => console.log(data))

module.exports = {
    randomProductTests,
    liveAdmin
}
