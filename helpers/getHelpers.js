const admin = require('../global')

/**
 * simple wrapper around the magento2api get method
 * @param {String} endpoint - endpoint that gets concatenated onto url
 * @param {Array} filters - containing filters see - https://devdocs.magento.com/guides/v2.3/rest/performing-searches.html
 * @returns {Promise} - containing fetched data
 */
function getWithFilter(endpoint, filters) {
    return admin.get(endpoint, {
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
 * gets the attribute set id by name
 * @param {String} attributeSetName - name of attribute set
 * @returns {Number} attribute set id
 */
async function getAttributeSetId(attributeSetName) {
    const attributeSet = await getWithFilter('products/attribute-sets/sets/list', [
        {'field': 'attribute_set_name', 'value': attributeSetName, 'condition_type': 'eq'}
    ])
    return attributeSet.items[0].attribute_set_id
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
 * get all the products from the specified category that are in the import all attribute set
 * @param {Number} categoryId - category id
 * @param {Number} importAllId - import all attribute set id
 * @returns {Array} products
 */
async function getCategoryImportAllProducts(categoryId, importAllId) {
    const products = await getWithFilter('products', [
        { 'field': 'attribute_set_id', 'value': importAllId, 'condition_type': 'eq' },
        { 'field': 'category_id', 'value':  categoryId, 'condition_type': 'eq'}
    ])
    return products.items
}

module.exports = {
    getWithFilter,
    getAttributeSetGroupId,
    getAttributeSetId,
    getCategoryId,
    getCategoryImportAllProducts
}