const { getAttributeSetGroupId, getAttributeSetId, getCategoryId, getCategoryImportAllProducts, getDifferentAttributeCodes } = require('./helpers/getHelpers')
const { addAttributesToSet, updateProductAttributeSet, createNewAttributeSet } = require('./helpers/setHelpers')
const { attributeSetIds } = require('./global')
const { randomTest } = require('./testing')

async function addAttributes(attributeSet,  attributeGroup, category, sortOrder = 500) {
    let attributeSetId = typeof attributeSet === 'string' ? await getAttributeSetId(attributeSet) : attributeSet
    attributeSetId = attributeSetId ? attributeSetId : await createNewAttributeSet(attributeSet, attributeSetIds.default)
    const attributeGroupId = typeof attributeGroup === 'string' ? await getAttributeSetGroupId(attributeSetId, attributeGroup) : attributeGroup
    const categoryId = typeof category === 'string' ? await getCategoryId(category) : category

    // gets attribute codes that are missing from the attribute set and then adds them to the set
    let attributeCodes = await getDifferentAttributeCodes(attributeSetId, categoryId, attributeSetIds.importAll)
    console.log(attributeCodes)
    console.log(`Codes length: ${attributeCodes.length}`)
    await addAttributesToSet(attributeSetId, attributeGroupId, attributeCodes, sortOrder)

    // adds the products that are in the importAll attributeSet to the attribute set
    const importAllProducts = await getCategoryImportAllProducts(categoryId, attributeSetIds.importAll)
    console.log(`Number of products to update: ${importAllProducts.length}`)
    for (const product of importAllProducts) {
        await updateProductAttributeSet(product.sku, attributeSetId)
    }

    // tests results
    randomTest(importAllProducts)
        .then(data => console.log(data))
}
// addAttributes('Bins Specifications', 'Attributes', 'Wheelie Bins ') // 100 products
// addAttributes('Benches and Picnic Tables', 'Attributes', 'Seating') // also need to change name of set to 'Seating, Benches and Picnic Tables'
// addAttributes('Tank Specification', 'Attributes', 'Cold Water Tanks')
// addAttributes('Tank Specification', 'Attributes', 'Open Top Water Tanks')
// addAttributes('Tank Specification', 'Attributes', 'Water Tanks')
// addAttributes('Bins Specifications', 'Attributes', 'Litter & Waste Bins') // 5413
// addAttributes('Bins Specifications', 'Attributes', 'Recycling Bins ') // 7246
// addAttributes('Bins Specifications', 'Attributes', 'Clinical Waste Bins') // 204
// addAttributes('Belt & Rope Barriers' ,'Attributes', 'Queue Management') // a lot of these are in the infection control category so if you run that code first these won't be added to queue management
// addAttributes('Infection Control & Social Distancing' ,'Attributes', 'Infection Control & Social Distancing') //
// addAttributes('Equestrian' ,'Attributes', 'Equestrian') //
// addAttributes('Trucks & Trolleys' ,'Attributes', 'Trucks and Trolleys') // pallet trucks here will get added to this becuase they aren't in their own sets, need to avoid this
    // .then(data => console.log(data))

// to do
// remove unused attributes from set
// output the results to a json file named the unix time
// in this, list the attribute set that products were moved to
// if the attribute set is new
// maybe add in a check to see if there are in a certain category, if they are then don't include these products