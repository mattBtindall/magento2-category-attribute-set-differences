const getDifferentAttributeCodes = require('./getDifferentAttributes')
const { getAttributeSetGroupId, getAttributeSetId, getCategoryId } = require('./helpers/getHelpers')
const { addAttributesToSet } = require('./setAttributes')

async function addAttributes(attributeSet,  attributeGroup, category, sortOrder = 0) {
    const attributeSetId = typeof attributeSet === 'string' ? await getAttributeSetId(attributeSet) : attributeSet
    const attributeGroupId = typeof attributeGroup === 'string' ? await getAttributeSetGroupId(attributeSetId, attributeGroup) : attributeGroup
    const categoryId = typeof category === 'string' ? await getCategoryId(category) : category

    const attributeCodes = await getDifferentAttributeCodes(attributeSetId, categoryId)
    return addAttributesToSet(attributeSetId, attributeGroupId, attributeCodes)
}
addAttributes('Bins Specifications', 'General', 'Wheelie Bins ')
    .then(data => console.log(data))