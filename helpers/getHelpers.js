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
 * gets all attribute codes of an attribute set
 * @param {Number} attributeSetId - the id of the attribute set
 * @returns {Promise} - argument contains attribute codes
 */
async function getAttributesFromSet(attributeSetId) {
    const attributeSetAttributes = await localAdmin.get(`products/attribute-sets/${attributeSetId}/attributes`)
    return attributeSetAttributes.map(attribute => attribute.attribute_code)
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
 * gets attribute codes from products that are part of the specified (tends to be importAll and defualt) attribute set from the specified category
 * @param {Number} categoryId - magento category id
 * @param {Object} attributeSetIds - attribute set ids with name e.g. {default: 4, importAll: 31}
 * @returns {Promise} - containing array of attribute codes
 */
async function getAttributeCodesFromProducts(categoryId, attribueSetIds) {
    const attributeCodes = []
    const products = await getCategoryAttributeSetsProducts(categoryId, attribueSetIds)

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
 * @param {Number} categoryId - category id
 * @returns {Promise} containing an array of the differing attribute codes
 */
async function getDifferentAttributeCodes(attribueSetId, categoryId, baseAttributeSetIds) {
    if (!attribueSetId || !categoryId || !baseAttributeSetIds) return
    const attributeSetCodes = await getAttributesFromSet(attribueSetId)
    const categoryAttributeCodes = await getAttributeCodesFromProducts(categoryId, baseAttributeSetIds)
    return categoryAttributeCodes.filter(attributeCode => !attributeSetCodes.includes(attributeCode))
}

module.exports = {
    getWithFilter,
    getAttributeSetGroupId,
    getAttributeSetId,
    getCategoryId,
    getCategoryAttributeSetsProducts,
    getAttributeCodesFromProducts,
    getAttributesFromSet,
    getDifferentAttributeCodes
}