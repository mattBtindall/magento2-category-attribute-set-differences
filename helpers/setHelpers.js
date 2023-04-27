const { attributeSetIds, localAdmin } = require('../global')
const { getAttributeCodesFromProducts, getCategoryId, getAttributeSetGroupId } = require('./getHelpers')

/**
 *
 * @param {Number} attributeSetId - attribute set id
 * @param {Number} attributeGroupId - attribute group id
 * @param {Array.<String>} attributeCodes - Array of attribute codes
 * @param {Number} sortOrder - sort order
 * @returns {Array.<Number>} the attribute ids that have been added to the set
 */
async function addAttributesToSet(attributeSetId, attributeGroupId, attributeCodes, sortOrder = 0) {
    const attributeIds = []
    for (const attributeCode of attributeCodes) {
        attributeIds.push(await localAdmin.post('products/attribute-sets/attributes', {
            attributeSetId,
            attributeGroupId,
            attributeCode,
            sortOrder
        }))
    }
    return attributeIds
}

/**
 * simple wrapper around the 'products/{sku}' endpoint
 * @param {Object} updates - attributes to update
 * @param {String} sku - product sku
 * @returns {Object} magento product
 */
async function updateProduct(sku, updates) {
    if (!updates.hasOwnProperty('sku')) { // sku is require with this endpoint
        updates.sku = sku
    }

    const data = {
        "product" : updates
    },
    config = {
        "storeCode": "all"
    }

    return localAdmin.put(`products/${encodeURIComponent(sku)}`, data, config)
}

/**
 * update a products attribute set
 * @param {String} sku - a products sku
 * @param {Number} attributeSetId - attribute set id
 * @returns {Array} updated product
 */
async function updateProductAttributeSet(sku, attributeSetId) {
    return updateProduct(sku, {
        "attribute_set_id": attributeSetId,
    })
}

/**
 * removes attributes from product
 * @param {String} sku - product sku
 * @param {Array.<String>} attributeCodes - attribute codes to remove from product
 * @returns {Object} magento product
 */
async function removeAttributes(sku, attributeCodes) {
    customAttributes = attributeCodes.map(attribute => {
        return {
            "attribute_code": attribute,
            "value": null
        }
    })

    return updateProduct(sku, {
        "custom_attributes": customAttributes
    })
}

/**
 * creates a new attribute set based on products from importAll attribute set from specified category
 * @param {String} name - name of the new attribute set
 * @param {String|Number} category - either the name of category or the category id
 * @param {String|Number} attributeGroup - either the name of group or the group id
 * @param {Number} importAllId - import all attribute set id
 * @param {Number} defaultAttributeSet - default attribute set id
 * @returns {Error|Number} throws error if attribute set cannot be create or attribute set id
 */
async function createNewAttributeSet(name, defaultAttributeSet) {
    console.log(`creating new attribute set called: ${name}`)
    const { attribute_set_id: attributeSetId } = await localAdmin.post('products/attribute-sets', {
        'attributeSet': {
            'attribute_set_name': name,
            'sort_order': 0
        },
        'skeletonId': defaultAttributeSet
    })

    if (!attributeSetId) {
        console.log('Failed to create new attribute set')
    }

    return attributeSetId
}
// const attributeSetId = await createNewAttributeSet('Infection Control & Social Distancing', 'Infection Control & Social Distancing', 'Attributes', attributeSetIds.importAll, attributeSetIds.default)

module.exports = {
    addAttributesToSet,
    updateProductAttributeSet,
    removeAttributes,
    createNewAttributeSet
}
