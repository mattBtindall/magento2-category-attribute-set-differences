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

module.exports = {
    getWithFilter,
    getAttributeSetGroupId,
    getAttributeSetId
}