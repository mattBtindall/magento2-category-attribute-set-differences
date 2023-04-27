const { getAttributeSetGroupId, getAttributeSetId, getCategoryId, getCategoryAttributeSetsProducts, getDifferentAttributeCodes } = require('./helpers/getHelpers')
const { addAttributesToSet, updateProductAttributeSet, createNewAttributeSet } = require('./helpers/setHelpers')
const { attributeSetIds } = require('./global')
const { randomProductTests } = require('./testing')

async function addAttributes(attributeSet,  attributeGroup, category, sortOrder = 500) {
    let attributeSetId = typeof attributeSet === 'string' ? await getAttributeSetId(attributeSet) : attributeSet
    attributeSetId = attributeSetId ? attributeSetId : await createNewAttributeSet(attributeSet, attributeSetIds.default)
    const attributeGroupId = typeof attributeGroup === 'string' ? await getAttributeSetGroupId(attributeSetId, attributeGroup) : attributeGroup
    const categoryId = typeof category === 'string' ? await getCategoryId(category) : category

    // gets attribute codes that are missing from the attribute set and then adds them to the set
    let attributeCodes = await getDifferentAttributeCodes(attributeSetId, categoryId, attributeSetIds)
    console.log(attributeCodes)
    console.log(`Codes length: ${attributeCodes.length}`)
    await addAttributesToSet(attributeSetId, attributeGroupId, attributeCodes, sortOrder)

    // adds the products that are in the importAll attributeSet to the attribute set
    const importAllProducts = await getCategoryAttributeSetsProducts(categoryId, attributeSetIds)
    console.log(`Number of products: ${importAllProducts.length}`)
    for (const product of importAllProducts) {
        await updateProductAttributeSet(product.sku, attributeSetId)
    }

    // // tests results
    randomProductTests(importAllProducts)
        .then(data => console.log(data))
}
// addAttributes('Bins Specifications', 'Attributes', 'Wheelie Bins ') // 800 products # DONE
// addAttributes('Benches and Picnic Tables', 'Attributes', 'Seating') // 1000 products also need to change name of set to 'Seating, Benches and Picnic Tables' # DONE
// addAttributes('Tank Specification', 'Attributes', 'Open Top Water Tanks') // 354 products # DONE
// addAttributes('Tank Specification', 'Attributes', 'Water Tanks') // 79 products # DONE
addAttributes('Bins Specifications', 'Attributes', 'Litter & Waste Bins') // 5522
// addAttributes('Bins Specifications', 'Attributes', 'Recycling Bins ') // 7246
// addAttributes('Bins Specifications', 'Attributes', 'Clinical Waste Bins') // 204
// addAttributes('Belt & Rope Barriers' ,'Attributes', 'Queue Management') // a lot of these are in the infection control category so if you run that code first these won't be added to queue management
// addAttributes('Infection Control & Social Distancing' ,'Attributes', 'Infection Control & Social Distancing') //
// addAttributes('Equestrian' ,'Attributes', 'Equestrian') //
// addAttributes('Trucks & Trolleys' ,'Attributes', 'Trucks and Trolleys') // pallet trucks here will get added to this becuase they aren't in their own sets, need to avoid this
// addAttributes('Spill Kits & Containment' ,'Attributes', 'Spill Kits & Containment') // pallet trucks here will get added to this becuase they aren't in their own sets, need to avoid this
    // .then(data => console.log(data))

// to do
// instead of only targetting importAll attribute set also target the default attribute set
// remove unused attributes from set
// output the results to a json file named the unix time
// in this, list the attribute set that products were moved to
// if the attribute set is new
// maybe add in a check to see if there are in a certain category, if they are then don't include these products