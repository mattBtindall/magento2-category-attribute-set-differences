const { ATTRIBUTES_TO_REMOVE, localAdmin, attributeSetIds } = require('../global')

/**
 * simple wrapper around the magento2api get method
 * @param {String} endpoint - endpoint that gets concatenated onto url
 * @param {Array} filters - containing filters see - https://devdocs.magento.com/guides/v2.3/rest/performing-searches.html
 * @returns {Promise} - containing fetched data
 */
function getWithFilter(endpoint, filters) {
    return localAdmin.get(endpoint, {
        params: {
            searchCriteria: {
            'filter_groups': [
                    {
                        'filters': filters
                    }
                ]
            }
        }
    })
}

/**
 * gets all attribute codes of an attribute set with an option to get custom attributes only
 * @param {Number} attributeSetId - the id of the attribute set
 * @param {boolean} custom - deterimes whether to only get custom attributes
 * @returns {Promise} - argument contains attribute codes
 */
async function getAttributesFromSet(attributeSetId, custom = null) {
    let attributes = await localAdmin.get(`products/attribute-sets/${attributeSetId}/attributes`)
    attributes = custom ? attributes.filter(attr => attr.is_user_defined) : attributes
    return attributes.map(attr => attr.attribute_code)
}

/**
 * gets the attribute set id by name
 * @param {String} attributeSetName - name of attribute set
 * @returns {Number} attribute set id
 */
async function getAttributeSetId(attributeSetName) {
    const attributeSet = await getWithFilter('products/attribute-sets/sets/list', [
        {'field': 'attribute_set_name', 'value': attributeSetName, 'condition_type': 'eq'}
    ])
    return attributeSet.items.length ? attributeSet.items[0].attribute_set_id : null
}

/**
 * gets the attrbiute set group id from name
 * @param {Number} attribueSetId - attribute set id
 * @param {String} groupName - name of group e.g. 'General'
 * @returns {Promise} - containing {Number} id of group
 */
async function getAttributeSetGroupId(attribueSetId, groupName) {
    const groups = await getWithFilter('products/attribute-sets/groups/list', [
        {'field': 'attribute_set_id', 'value': attribueSetId, 'condition_type': 'eq'}
    ])
    return groups.items.filter(group => group.attribute_group_name === groupName)[0].attribute_group_id
}

/**
 * get the specified categories id
 * @param {String} categoryName - category name
 * @returns {Number} category id
 */
async function getCategoryId(categoryName) {
    const categories = await getWithFilter('categories/list', [
        {'field': 'name', 'value': categoryName, 'condition_type': 'eq'}
    ])
    // match the name exactly as similarly named categories are returned
    return categories.items.filter(category => category.name === categoryName)[0].id
}

/**
 * get all the products from the specified category that are in the specific attribute sets
 * @param {Number} categoryId - category id
 * @param {Object} attributeSetIds - attribute set ids with name e.g. {default: 4, importAll: 31}
 * @returns {Array} products
 */
async function getCategoryAttributeSetsProducts(categoryId, attributeSetIds) {
    let allProducts = []
    for (const attribueSetId of Object.values(attributeSetIds)) {
        const products = await getWithFilter('products', [
            { 'field': 'attribute_set_id', 'value': attribueSetId, 'condition_type': 'eq' },
            { 'field': 'category_id', 'value':  categoryId, 'condition_type': 'eq'}
        ])
        allProducts = allProducts.concat(products.items)
    }
    return allProducts
}

/**
 * gets attribute codes from products
 * @param {Array.<Object>} products - magento products
 * @returns {Promise} - containing array of attribute codes
 */
async function getAttributeCodesFromProducts(products) {
    const attributeCodes = []
    for (const product of products) {
        product.custom_attributes.forEach(attribute => {
            if (!attributeCodes.includes(attribute.attribute_code)
                && !ATTRIBUTES_TO_REMOVE.includes(attribute.attribute_code)
            ) {
                attributeCodes.push(attribute.attribute_code)
            }
        })
    }
    return attributeCodes
}

/**
 * gets the attribute codes that are missing from the attribute set
 * @param {Number} attribueSetId - attribute set id
 * @param {Array.<Object>} importAllProducts - magento products
 * @returns {Promise} containing an array of the differing attribute codes
 */
async function getDifferentAttributeCodes(attribueSetId, importAllProducts) {
    if (!attribueSetId) return
    const attributeSetCodes = await getAttributesFromSet(attribueSetId)
    const categoryAttributeCodes = await getAttributeCodesFromProducts(importAllProducts)
    return categoryAttributeCodes.filter(attributeCode => !attributeSetCodes.includes(attributeCode))
}

/**
 * gets the unused attributes from the specified attribute set
 * @param {String|Number} attributeSet - name of attribute set or the attribute set id
 * @return {Array.<string>} attribute codes
 */
async function getUnUsedAttributes(attributeSet) {
    let attributeSetId = typeof attributeSet === 'string' ? await getAttributeSetId(attributeSet) : attributeSet
    const { items: products} = await getWithFilter('products', [
        { 'field': 'attribute_set_id', 'value': attributeSetId, 'condition_type': 'eq' }
    ])
    let customAttributes = await getAttributesFromSet(attributeSetId, true)
    let unusedAttributes

    if (!products) return

    products.forEach(product => {
        const usedAttributes = product.custom_attributes.map(attr => attr.attribute_code)
        unusedAttributes = customAttributes.filter(attr => !usedAttributes.includes(attr))
    })

    console.log(attributeSet)
    console.log(`total custom attributes: ${customAttributes.length}`)
    console.log(`unused custom attributes: ${unusedAttributes ? unusedAttributes.length : 0}`)
    console.log('')

    return unusedAttributes
}

module.exports = {
    getWithFilter,
    getAttributeSetGroupId,
    getAttributeSetId,
    getCategoryId,
    getCategoryAttributeSetsProducts,
    getAttributeCodesFromProducts,
    getAttributesFromSet,
    getDifferentAttributeCodes,
    getUnUsedAttributes
}