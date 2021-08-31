const {
  serializeAttributeValue,
  extractBlockAttributesFromElementAttributes,
} = require("../serializer");

module.exports = {
  name: "wp.rich",

  save(element, isTopLevel) {
    const tagNameAttribute = element.attributes.find(
      (attr) => attr.name === "tagName"
    );
    const tagNameStr = serializeAttributeValue(tagNameAttribute);
    const valueAttributeAST = element.attributes.find(
      (attr) => attr.name === "value"
    );

    // TODO: Inject extra attributes
    let attributesStr = `{ tagName: ${tagNameStr}, value: attributes.${valueAttributeAST.value} }`;
    attributesStr = isTopLevel
      ? `Object.assign( {}, wp.blockEditor.useBlockProps.save(), ${attributesStr} )`
      : attributesStr;
    return `wp.element.createElement( wp.blockEditor.RichText.Content, ${attributesStr} )`;
  },

  edit(element, isTopLevel) {
    const tagNameAttribute = element.attributes.find(
      (attr) => attr.name === "tagName"
    );
    const tagNameStr = serializeAttributeValue(tagNameAttribute);
    const valueAttributeAST = element.attributes.find(
      (attr) => attr.name === "value"
    );

    // TODO: Inject extra attributes
    let attributesStr = `{ tagName: ${tagNameStr}, value: attributes.${valueAttributeAST.value}, onChange: newValue => setAttributes( { ${valueAttributeAST.value}: newValue } ) }`;
    attributesStr = isTopLevel
      ? `Object.assign( {}, wp.blockEditor.useBlockProps(), ${attributesStr} )`
      : attributesStr;
    return `wp.element.createElement( wp.blockEditor.RichText, ${attributesStr} )`;
  },

  extractAttributes(element) {
    const blockAttributes =
      extractBlockAttributesFromElementAttributes(element.attributes);
    const valueAttributeAST = element.attributes.find(
      (attr) => attr.name === "value"
    );
    blockAttributes.inline.push(valueAttributeAST.value);

    return blockAttributes;
  },
};
