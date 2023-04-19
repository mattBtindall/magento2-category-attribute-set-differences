const { admin } = require('./global');

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
        attributeIds.push(await admin.post('products/attribute-sets/attributes', {
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

    return admin.put(`products/${encodeURIComponent(sku)}`, data, config)
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


module.exports = {
    addAttributesToSet,
    updateProductAttributeSet
}
