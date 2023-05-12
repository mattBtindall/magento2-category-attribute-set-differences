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
const generateRandomNumber = (max, min = 0) => Math.floor(Math.random() * (max - min + 1)) + min;

/**
 * generates the specified number of random numbers that are in a range, each number is unique
 * @param {Number} maxNumber - the maximum any of the random numbers could be e.g. 50 will generate a random number between 0 and 50
 * @param {Number} length - the number of random numbers
 * @returns {Array.<number>} the random numbers
 */
function generateUniqueRandomNumbers(maxNumber, length) {
    if (!maxNumber || !length) return
    if (length > maxNumber) { // length > maxNumber then infinite loop
        length = maxNumber
    }
    const randomNumbers = []

    while (randomNumbers.length !== length) {
        let randomNumber = generateRandomNumber(maxNumber)
        if (!randomNumbers.includes(randomNumber)) randomNumbers.push(randomNumber)
    }
    return randomNumbers
}

const localAdmin = new Magento2Api({
    api: {
        // url: 'https://localhost',
        url: 'https://magento-admin.kingfisherdirect.co.uk',
        consumerKey: keys.local.consumerKey,
        consumerSecret: keys.local.consumerSecret,
        accessToken: keys.local.accessToken,
        tokenSecret: keys.local.tokenSecret
    },
    axios: {
        httpsAgent: new https.Agent({
            rejectUnauthorized: false
        })
    }
})

module.exports = {
    localAdmin,
    attributeSetIds,
    ATTRIBUTES_TO_REMOVE,
    generateUniqueRandomNumbers
}