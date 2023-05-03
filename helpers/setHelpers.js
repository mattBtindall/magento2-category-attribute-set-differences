const { localAdmin } = require('../global')

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
 * @param {String} sku - product sku
 * @param {Object} updates - attributes to update
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
 * @param {Number} defaultAttributeSet - default attribute set id
 * @returns {Number} throws error if attribute set cannot be create or attribute set id
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

async function removeAttributeFromSet(attributeCode, attributeSetId) {
    return localAdmin.delete(`products/attribute-sets/${attributeSetId}/attributes/${encodeURIComponent(attributeCode)}`)
}

async function test() {
    try {
        const data = await removeAttributeFromSet('base_colour', 41)
        console.log(data)
    } catch (e) {
        console.log(e.response.data)
    }
}
// test()

/**
 * removes attributes from an attribute set
 * @param {Array.<String>} attributeCodes - attribute codes
 * @param {Number} attributeSetId - attribute set id
 * @returns {void}
 */
async function removeAttributesFromSet(attributeCodes, attributeSetId) {
    for (const attrCode of attributeCodes) {
        try {
            const result = await removeAttributeFromSet(attrCode, attributeSetId)
            console.log(`${attrCode}: ${result}`)
        } catch (e) {
            console.log(attrCode)
            console.log(e.response.data)
        }
    }
}

module.exports = {
    addAttributesToSet,
    updateProductAttributeSet,
    removeAttributes,
    createNewAttributeSet,
    removeAttributesFromSet
}
