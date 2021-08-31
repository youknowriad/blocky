const { omit } = require("lodash");
const {
  inline: inlineAttributeHandlers,
  type: typeAttributeHandlers,
} = require("./attribute-handlers");
const {
  extractBlockAttributesFromElement,
} = require("./block-attributes-resolver");

function resolveElementDependencies(element) {
  const attributeHandler = inlineAttributeHandlers.find(
    (handler) => handler.name === element.name
  );
  if (attributeHandler) {
    return attributeHandler.dependencies;
  }

  const baseDependencies = new Set();
  element.children.forEach((child) => {
    if (child.type === "element") {
      resolveElementDependencies(child).forEach((dep) =>
        baseDependencies.add(dep)
      );
    }
  });

  return Array.from(baseDependencies);
}

function resolveBlockAttributesDependencies(nonInlineAttributes) {
  const baseDependencies = new Set();
  Object.entries(nonInlineAttributes).forEach(([, attribute]) => {
    const attributeHandler = typeAttributeHandlers.find(
      (handler) => handler.type === attribute.type
    );
    attributeHandler.dependencies.forEach((dep) => baseDependencies.add(dep));
  });

  return Array.from(baseDependencies);
}

function resolveDependencies(blockAST) {
  const baseDependencies = new Set([
    "wp-element",
    "wp-blocks",
    "wp-block-editor",
  ]);

  const elementDependencies = resolveElementDependencies(blockAST.root);
  elementDependencies.forEach((dependency) => baseDependencies.add(dependency));

  const blockAttributes = extractBlockAttributesFromElement(blockAST.root);
  const nonInlineAttributes = omit(blockAST.attributes, blockAttributes.inline);
  const nonInlineAttributeDependencies =
    resolveBlockAttributesDependencies(nonInlineAttributes);
  nonInlineAttributeDependencies.forEach((dependency) =>
    baseDependencies.add(dependency)
  );

  return Array.from(baseDependencies);
}

module.exports = resolveDependencies;
