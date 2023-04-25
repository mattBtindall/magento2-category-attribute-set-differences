const { admin, attributeSetIds } = require('../global')
const { getAttributeCodesFromProducts, getCategoryId, getAttributeSetGroupId, getCategoryImportAllProducts } = require('./getHelpers')

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

async function updateImportAllProductsAttributeSet(categoryId, importAllId, attributeSetId) {
    const importAllProducts = await getCategoryImportAllProducts(categoryId, importAllId)
    const receipt = []
    for (const product of importAllProducts) {
        console.log(product.sku)
        receipt.push(await updateProductAttributeSet(product.sku, attributeSetId))
    }
        return receipt
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
async function createNewAttributeSet(name, category, attributeGroup, importAllId, defaultAttributeSet) {
    const { attribute_set_id: attributeSetId } = await admin.post('products/attribute-sets', {
        'attributeSet': {
            'attribute_set_name': name,
            'sort_order': 0
        },
        'skeletonId': defaultAttributeSet
    })

    if (!attributeSetId) {
        return new Error('Failed to create attribute set')
    }

    const receipt = []
    const categoryId = typeof category === 'string' ? await getCategoryId(category) : category
    const attributeGroupId = typeof attributeGroup === 'string' ? await getAttributeSetGroupId(attributeSetId, attributeGroup) : attributeGroup
    const attrbiuteCodes = await getAttributeCodesFromProducts(categoryId, importAllId)

    for (const code of attrbiuteCodes) {
        receipt.push(await admin.post('products/attribute-sets/attributes', {
            "attributeSetId": attributeSetId,
            "attributeGroupId": attributeGroupId,
            "attributeCode":  code,
            "sortOrder": 0
        }))
    }
    return attributeSetId
}
// const attributeSetId = await createNewAttributeSet('Infection Control & Social Distancing', 'Infection Control & Social Distancing', 'Attributes', attributeSetIds.importAll, attributeSetIds.default)

module.exports = {
    addAttributesToSet,
    updateProductAttributeSet,
    removeAttributes,
    updateImportAllProductsAttributeSet
}