const { parser } = require("./parser");

const BaseBlockyVisitorWithDefaults =
  parser.getBaseCstVisitorConstructorWithDefaults();

class SaveVisitor extends BaseBlockyVisitorWithDefaults {
  constructor() {
    super();
    this.validateVisitor();
  }

  document(ctx) {
    return `function ( { attributes } ) { 
  return ${this.visit(ctx.element[0], true)};
}`;
  }

  element(ctx, isTopLevel) {
    const elementName = ctx.Name[0].image;
    let childrenStr = "undefined";
    if (ctx.content?.[0]) {
      const children = ctx.content[0].children.elementContent
        .map((child) => {
          return this.visit(child);
        })
        .filter((child) => !!child);

      if (children.length === 1) {
        childrenStr = children[0];
      } else if (children.length > 1) {
        childrenStr = `${children.join(",")}`;
      }
    }

    let attributesStr = "null";
    if (ctx.attribute) {
      const attributes = ctx.attribute
        .map((attribute) => this.visit(attribute))
        .filter((str) => !!str);
      attributesStr = attributes.length
        ? `{ ${attributes.join(",")} }`
        : "null";
    }

    if (isTopLevel) {
      attributesStr = attributesStr = "null"
        ? "wp.blockEditor.useBlockProps()"
        : `wp.blockEditor.useBlockProps(attributesStr)`;
    }

    return `wp.element.createElement( "${elementName}" , ${attributesStr}, ${childrenStr})`;
  }

  attribute(ctx) {
    if (ctx.STRING) {
      return `${ctx.Name[0].image}: ${ctx.STRING[0].image}`;
    } else if (ctx.Name?.[1]?.image) {
      return `${ctx.Name[0].image}: attributes.${ctx.Name[1].image}`;
    }
  }

  elementContent(ctx) {
    if (ctx?.element?.[0]) {
      return this.visit(ctx.element[0]);
    } else if (ctx?.chardata?.[0]) {
      return this.visit(ctx.chardata[0]);
    }

    throw "Unknown element type";
  }

  chardata(ctx) {
    if (ctx.TEXT?.[0]) {
      return `"${ctx.TEXT[0].image}"`;
    }

    return null;
  }
}

module.exports = {
  visitor: new SaveVisitor(),
};
