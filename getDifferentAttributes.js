const admin = require('./global')
const IMPORT_ALL_ID = 31
const { getWithFilter, getCategoryImportAllProducts } = require('./helpers/getHelpers')

/**
 * gets all attribute codes of an attribute set
 * @param {Number} attributeSetId - the id of the attribute set
 * @returns {Promise} - argument contains attribute codes
 */
async function getAttributesFromSet(attributeSetId) {
    const attributeSetAttributes = await admin.get(`products/attribute-sets/${attributeSetId}/attributes`)
    return attributeSetAttributes.map(attribute => attribute.attribute_code)
}

/**
 * gets attribute codes from products that are part of the importAll attribute set from the specified category
 * @param {Number} categoryId - magento category id
 * @returns {Promise} - containing array of attribute codes
 */
async function getAttributeCodesFromProducts(categoryId) {
    const attributeCodes = []
    const products = await getCategoryImportAllProducts(categoryId, IMPORT_ALL_ID)

    for (const product of products) {
        product.custom_attributes.forEach(attribute => {
            if (!attributeCodes.includes(attribute.attribute_code)) attributeCodes.push(attribute.attribute_code);
        })
    }
    return attributeCodes;
}

/**
 * gets the attribute codes that are missing from the attribute set
 * @param {Number} attribueSetId - attribute set id
 * @param {Number} categoryId - category id
 * @returns {Promise} containing an array of the differing attribute codes
 */
async function getDifferentAttributeCodes(attribueSetId, categoryId) {
    const attributeSetCodes = await getAttributesFromSet(attribueSetId)
    const categoryAttributeCodes = await getAttributeCodesFromProducts(categoryId)
    return categoryAttributeCodes.filter(attributeCode => !attributeSetCodes.includes(attributeCode))
}

module.exports = getDifferentAttributeCodes
