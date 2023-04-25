const { getAttributeSetGroupId, getAttributeSetId, getCategoryId, getCategoryImportAllProducts, getDifferentAttributeCodes } = require('./helpers/getHelpers')
const { addAttributesToSet, updateProductAttributeSet } = require('./helpers/setHelpers')
const { attributeSetIds } = require('./global')

async function addAttributes(attributeSet,  attributeGroup, category, sortOrder = 500) {
    const attributeSetId = typeof attributeSet === 'string' ? await getAttributeSetId(attributeSet) : attributeSet
    const attributeGroupId = typeof attributeGroup === 'string' ? await getAttributeSetGroupId(attributeSetId, attributeGroup) : attributeGroup
    const categoryId = typeof category === 'string' ? await getCategoryId(category) : category

    let attributeCodes = await getDifferentAttributeCodes(attributeSetId, categoryId, attributeSetIds.importAll)
    console.log(attributeCodes)
    console.log(`Codes length: ${attributeCodes.length}`)
    await addAttributesToSet(attributeSetId, attributeGroupId, attributeCodes, sortOrder)

    const importAllProducts = await getCategoryImportAllProducts(categoryId, attributeSetIds.importAll)
    console.log(importAllProducts.length)
    for (const product of importAllProducts) {
        await updateProductAttributeSet(product.sku, attributeSetId)
    }
}
addAttributes('Bins Specifications', 'Attributes', 'Wheelie Bins ') // 100 products
// addAttributes('Benches and Picnic Tables', 'Attributes', 'Seating') // also need to change name of set to 'Seating, Benches and Picnic Tables'
// addAttributes('Tank Specification', 'Attributes', 'Cold Water Tanks')
// addAttributes('Tank Specification', 'Attributes', 'Open Top Water Tanks')
// addAttributes('Tank Specification', 'Attributes', 'Water Tanks')
// addAttributes('Bins Specifications', 'Attributes', 'Litter & Waste Bins') // 5413
// addAttributes('Bins Specifications', 'Attributes', 'Recycling Bins ') // 7246
// addAttributes('Bins Specifications', 'Attributes', 'Clinical Waste Bins') // 204
    // .then(data => console.log(data))
