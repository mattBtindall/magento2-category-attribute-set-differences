const IMPORT_ALL_ID = 31
const admin = require('./global')
const { getWithFilter } = require('./helpers/getHelpers')

/**
 * gets all attribute codes of an attribute set
 * @param {Number} attributeSetId - the id of the attribute set
 * @returns {Promise} - argument contains attribute codes
 */
async function getAttributesFromSet(attributeSetId) {
    const attributeCodes = []
    const attributeSetAttributes = await admin.get(`products/attribute-sets/${attributeSetId}/attributes`)
    attributeSetAttributes.forEach(attribute => attributeCodes.push(attribute.attribute_code))
    return attributeCodes
}

/**
 * gets attribute codes from products that are part of the importAll attribute set from the specified category
 * @param {*} categoryId - magento category id
 * @returns {Promise} - containing array of attribute codes
 */
async function getAttributeCodesFromProducts(categoryId) {
    const attributeCodes = [];
    const products = await getWithFilter('products', [
        { 'field': 'attribute_set_id', 'value': IMPORT_ALL_ID, 'condition_type': 'eq' },
        { 'field': 'category_id', 'value':  categoryId, 'condition_type': 'eq'}
    ])

    for (const product of products.items) {
        const attributes = await getWithFilter(`products/${product.sku}`)
        attributes.custom_attributes.forEach(attribute => {
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
