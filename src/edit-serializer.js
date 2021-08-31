const { omit } = require("lodash");
const {
  inline: inlineAttributeHandlers,
  type: typeAttributeHandlers,
} = require("./attribute-handlers");
const {
  serializeChildren,
  serializeAttributes,
  extractBlockAttributesFromElementAttributes,
} = require("./serializer");

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

function extractBlockAttributesFromChildren(children) {
  const blockAttributes = {
    inline: [],
    read: [],
  };
  children.forEach((child) => {
    if (child.type === "element") {
      const childBlockAttributes = extractBlockAttributesFromElement(child);
      blockAttributes.inline = blockAttributes.inline.concat(
        childBlockAttributes.inline
      );
      blockAttributes.read = blockAttributes.read.concat(
        childBlockAttributes.read
      );
    }
  });
  return blockAttributes;
}

function extractBlockAttributesFromElement(element) {
  const attributeHandler = inlineAttributeHandlers.find(
    (handler) => handler.name === element.name
  );
  if (attributeHandler) {
    return attributeHandler.extractAttributes(element);
  }

  const currentBlockAttributes = extractBlockAttributesFromElementAttributes(
    element.attributes
  );
  const childrenBlockAttributes = extractBlockAttributesFromChildren(
    element.children
  );
  return {
    inline: currentBlockAttributes.inline.concat(
      childrenBlockAttributes.inline
    ),
    read: currentBlockAttributes.read.concat(childrenBlockAttributes.read),
  };
}

module.exports = function (blockCst) {
  const blockAttributes = extractBlockAttributesFromElement(blockCst.root);
  const nonInlineAttributes = omit(blockCst.attributes, blockAttributes.inline);
  const inspectorControls = serializeInspectorControls(nonInlineAttributes);
  const root = serializeElement(blockCst.root, true);

  const returnStmt = inspectorControls
    ? `wp.element.createElement( wp.element.Fragment, null, ${root}, ${inspectorControls} )`
    : root;

  return `function ( { attributes, setAttributes } ) { 
    return ${returnStmt};
}`;
};
