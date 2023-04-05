const admin = require('./global');
const { getAttributeSetGroupId } = require('./getDifferentAttributes')



admin.put('products/attribute-sets/attributes', {
    params: {
        "attributeSetId": 41,
        "attributeGroupId": 0,
        "attributeCode": "quantity",
        "sortOrder": 0
    }
});
