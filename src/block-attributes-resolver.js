const { extractBlockAttributesFromElementAttributes } = require("./serializer");
const { inline: inlineAttributeHandlers } = require("./attribute-handlers");

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
    } else if (child.type === "attributeContent") {
      blockAttributes.read.push(child.name);
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

module.exports = {
  extractBlockAttributesFromChildren,
  extractBlockAttributesFromElement,
};
