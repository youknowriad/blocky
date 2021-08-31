const { parser } = require("./parser");

const BaseBlockyVisitorWithDefaults =
  parser.getBaseCstVisitorConstructorWithDefaults();

class Visitor extends BaseBlockyVisitorWithDefaults {
  constructor() {
    super();
    this.validateVisitor();
  }

  document(ctx) {
    return this.visit( ctx.element[0] );
  }

  element(ctx) {
    const name = ctx.Name[0].image;

    let children = [];
    if (ctx.content?.[0]) {
      children = ctx.content[0].children.elementContent
        .map((child) => {
          return this.visit(child);
        })
        .filter((child) => !!child);
    }

    let attributes = [];
    if (ctx.attribute) {
      attributes = ctx.attribute
        .map((attribute) => this.visit(attribute))
        .filter((attr) => !!attr);
    }

    return {
        type: 'element',
        name,
        children,
        attributes,
    }
  }

  attribute(ctx) {
    if (ctx.STRING) {
        return {
            type: 'static',
            name: ctx.Name[0].image,
            value: ctx.STRING[0].image.substr(1, ctx.STRING[0].image.length - 2).replace(/\\"/g, '"'),
        };
    } else if (ctx.Name?.[1]?.image) {
        return {
            type: 'blockAttribute',
            name: ctx.Name[0].image,
            value: ctx.Name[1].image
        };
    }
  }

  elementContent(ctx) {
    if (ctx?.element?.[0]) {
      return this.visit(ctx.element[0]);
    } else if (ctx?.chardata?.[0]) {
      return this.visit(ctx.chardata[0]);
    } else if (ctx?.attributeContent?.[0]) {
      return this.visit(ctx?.attributeContent[0])
    }

    throw "Unknown element type";
  }

  chardata(ctx) {
    if (ctx.TEXT?.[0]) {
        return {
            type: 'text',
            content: ctx.TEXT[0].image
        };
    }

    return null;
  }

  attributeContent(ctx) {
    return {
      type: 'attributeContent',
      name: ctx.Name[0].image,
    }
  }
}

module.exports = {
  visitor: new Visitor(),
};
