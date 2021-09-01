const { inline: inlineAttributeHandlers } = require("./attribute-handlers");
const { serializeChildren, serializeAttributes } = require("./serializer");

function serializeElement(element, isTopLevel = false) {
  const elementName = element.name;

  const attributeHandler = inlineAttributeHandlers.find(
    (handler) => handler.name === elementName
  );
  if (attributeHandler) {
    return attributeHandler.save(element, isTopLevel);
  }

  const childrenStr = serializeChildren(element.children, serializeElement);
  let attributesStr = serializeAttributes(element.attributes);

  if (isTopLevel) {
    attributesStr = attributesStr === "null"
      ? "wp.blockEditor.useBlockProps.save()"
      : `wp.blockEditor.useBlockProps.save( ${attributesStr} )`;
  }

  return `wp.element.createElement( "${elementName}", ${attributesStr}, ${childrenStr} )`;
}

module.exports = function (blockAST) {
  return `function ( { attributes } ) { 
    return ${serializeElement(blockAST.root, true)};
}`;
};
