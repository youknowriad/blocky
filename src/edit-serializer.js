const { omit } = require("lodash");
const {
  inline: inlineAttributeHandlers,
  type: typeAttributeHandlers,
} = require("./attribute-handlers");
const { serializeChildren, serializeAttributes } = require("./serializer");
const {
  extractBlockAttributesFromElement,
} = require("./block-attributes-resolver");

function serializeElement(element, isTopLevel = false) {
  const elementName = element.name;

  const attributeHandler = inlineAttributeHandlers.find(
    (handler) => handler.name === elementName
  );
  if (attributeHandler) {
    return attributeHandler.edit(element, isTopLevel);
  }

  const childrenStr = serializeChildren(element.children, serializeElement);
  let attributesStr = serializeAttributes(element.attributes);

  if (isTopLevel) {
    attributesStr = attributesStr = "null"
      ? "wp.blockEditor.useBlockProps()"
      : `wp.blockEditor.useBlockProps(${attributesStr})`;
  }

  return `wp.element.createElement( "${elementName}" , ${attributesStr}, ${childrenStr} )`;
}

function serializeInspectorControls(nonInlineAttributes) {
  return Object.entries(nonInlineAttributes)
    .map(([name, attribute]) => {
      const attributeHandler = typeAttributeHandlers.find(
        (handler) => handler.type === attribute.type
      );
      return attributeHandler.edit(name, attribute);
    })
    .join(",");
}

module.exports = function (blockAST) {
  const blockAttributes = extractBlockAttributesFromElement(blockAST.root);
  const nonInlineAttributes = omit(blockAST.attributes, blockAttributes.inline);
  const inspectorControls = serializeInspectorControls(nonInlineAttributes);
  const root = serializeElement(blockAST.root, true);

  const returnStmt = inspectorControls
    ? `wp.element.createElement( wp.element.Fragment, null, ${root}, ${inspectorControls} )`
    : root;

  return `function ( { attributes, setAttributes } ) { 
    return ${returnStmt};
}`;
};
