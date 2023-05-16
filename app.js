const { getAttributeSetGroupId, getAttributeSetId, getCategoryId, getCategoryAttributeSetsProducts, getDifferentAttributeCodes, getWithFilter, getUnUsedAttributes } = require('./helpers/getHelpers')
const { addAttributesToSet, updateProductAttributeSet, createNewAttributeSet, removeAttributesFromSet } = require('./helpers/setHelpers')
const { attributeSetIds } = require('./global')
const { randomProductTests } = require('./testing')

async function addAttributes(attributeSet,  attributeGroup, category, sortOrder = 500) {
    let attributeSetId = typeof attributeSet === 'string' ? await getAttributeSetId(attributeSet) : attributeSet
    attributeSetId = attributeSetId ? attributeSetId : await createNewAttributeSet(attributeSet, attributeSetIds.default)
    const attributeGroupId = typeof attributeGroup === 'string' ? await getAttributeSetGroupId(attributeSetId, attributeGroup) : attributeGroup
    const categoryId = typeof category === 'string' ? await getCategoryId(category) : category

    const importAllProducts = await getCategoryAttributeSetsProducts(categoryId, attributeSetIds)
    console.log(`Number of products to move into attribute set: ${importAllProducts.length}`)

    // gets attribute codes that are missing from the attribute set and then adds them to the set
    let attributeCodes = await getDifferentAttributeCodes(attributeSetId, importAllProducts)
    console.log(`Attribute codes (${attributeCodes.length}) to add to set: ${attributeCodes}`)
    await addAttributesToSet(attributeSetId, attributeGroupId, attributeCodes, sortOrder)

    // adds the products that are in the importAll attributeSet to the attribute set
    for (const product of importAllProducts) {
        await updateProductAttributeSet(product.sku, attributeSetId)
    }

    const unusedAttributes = await getUnUsedAttributes(attributeSetId)
    removeAttributesFromSet(unusedAttributes, attributeSetId)

    // tests results
    randomProductTests(importAllProducts)
        .then(data => console.log(data))
}
// addAttributes('Bins Specifications', 'Attributes', 'Wheelie Bins ') // 800 products
// addAttributes('Benches and Picnic Tables', 'Attributes', 'Seating') // 1000 products also need to change name of set to 'Seating, Benches and Picnic Tables' # DONE
// addAttributes('Tank Specification', 'Attributes', 'Open Top Water Tanks') // 354 products
// addAttributes('Tank Specification', 'Attributes', 'Water Tanks') // 79 products # DONE
// addAttributes('Bins Specifications', 'Attributes', 'Litter & Waste Bins') // 5522
// addAttributes('Bins Specifications', 'Attributes', 'Recycling Bins ') // 7246
// addAttributes('Bins Specifications', 'Attributes', 'Clinical Waste Bins') // 205
// addAttributes('Belt & Rope Barriers' ,'Attributes', 'Queue Management') // a lot of these are in the infection control category so if you run that code first these won't be added to queue management
// addAttributes('Infection Control & Social Distancing' ,'Attributes', 'Infection Control & Social Distancing') //
// addAttributes('Equestrian' ,'Attributes', 'Equestrian') //
// addAttributes('Trucks & Trolleys' ,'Attributes', 'Trucks and Trolleys') // pallet trucks here will get added to this becuase they aren't in their own sets, need to avoid this
// addAttributes('Spill Kits & Containment' ,'Attributes', 'Spill Kits & Containment') // pallet trucks here will get added to this becuase they aren't in their own sets, need to avoid this
// addAttributes('Pallet Truck Specification', 'Attributes', 'Pallet Trucks')
// addAttributes('Mortar Tub Specification', 'Attributes', 'Mortar Tubs')
// addAttributes('Oil Tanks', 'Attributes', 'Oil Tanks')
// addAttributes('Grit Bin Specification', 'Attributes', 'Grit Bins')
// addAttributes('PPE', 'Attributes', 'PPE')
// addAttributes('Rubbish Chutes', 'Attributes', 'Rubbish & Rubble Chutes')

// to do
// addAttributes('Pump Specification', 'Attributes', 'Building & Construction Pumps')
// addAttributes('Barriers & Railings', 'Attributes', 'Safety Barriers')
// addAttributes('Mirrors', 'Attributes', 'Traffic & Safety Mirrors')
// addAttributes('Bins Specifications', 'Attributes', 'Park Litter Bins ')
// addAttributes('Bins Specifications', 'Attributes', 'Dog Waste Bins ')
// addAttributes('Bollard Specification', 'Attributes', 'Bollards')
// addAttributes('Cycle Storage & Security', 'Attributes', 'Cycle Storage and Security')
// addAttributes('Cycle Storage & Security', 'Attributes', 'Cycle Shelters')
// addAttributes('Signage', 'Attributes', 'Signage')
// addAttributes('Barriers & Railings', 'Attributes', 'Railings')
// addAttributes('Steps, Ladders & Platforms', 'Attributes', 'Steps & Ladders')
// addAttributes('Cabinets and Lockers', 'Attributes', 'Lockers')
// addAttributes('Shelving & Racking', 'Attributes', 'Shelving & Racking')
// addAttributes('Shelving & Racking', 'Attributes', 'Garage Shelving')
// addAttributes('Traffic Barriers', 'Attributes', 'Traffic Barriers')
// addAttributes('Aggregates', 'Attributes', 'Aggregates')
// addAttributes('Ground Protection and Matting Specification', 'Attributes', 'Anti Fatigue Mats & Matting')
// addAttributes('Ground Protection and Matting Specification', 'Attributes', 'Ground Protection Mats')
// addAttributes('Pump Specification', 'Attributes', 'Pumps')
// addAttributes('Impact Protection', 'Attributes', 'Impact Guards')
// addAttributes('Impact Protection', 'Attributes', 'Impact Protection')
// addAttributes('', 'Attributes', '')
