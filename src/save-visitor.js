const { parser } = require("./parser");

const BaseBlockyVisitorWithDefaults = parser.getBaseCstVisitorConstructorWithDefaults();

class SaveVisitor extends BaseBlockyVisitorWithDefaults {
  constructor() {
    super();
    this.validateVisitor();
  }

  document(ctx) {
    return `function ( { attributes } ) { 
  return ${ this.visit( ctx.element[ 0 ] ) };
}`
  }

  element(ctx) {
    const elementName = ctx.Name[ 0 ].image;
    let attributesStr = 'null';
    let childrenStr = 'undefined';
    if (ctx.content?.[ 0 ]) {
      const children = ctx.content[0].children.elementContent.map( child => {
        return this.visit( child );
      } ).filter( child => !! child );

      if ( children.length === 1 ) {
        childrenStr = children[ 0 ];
      } else if ( children.length > 1 ) {
        childrenStr = `${ children.join(',') }`;
      }
    }

    if (ctx.attribute) {
      const attributes = ctx.attribute.map( attribute => this.visit( attribute ) ).filter(str => !!str);
      attributesStr = attributes.length ? `{ ${ attributes.join(',') } }` : 'null';
    }

    return `wp.element.createElement( ${elementName} , ${attributesStr}, ${childrenStr})`;
  }

  attribute( ctx ) {
    return `${ctx.Name[0].image}: ${ctx.STRING[0].image}`;
  }

  elementContent(ctx) {
    if (ctx?.element?.[ 0 ]) {
      return this.visit( ctx.element[ 0 ] );
    } else if (ctx?.chardata?.[ 0 ]) {
      return this.visit( ctx.chardata[ 0 ] );
    }
    
    throw 'Unknown element type';
  }

  chardata(ctx) {
    if ( ctx.TEXT?.[0] ) {
      return `"${ctx.TEXT[0].image}"`;
    }

    return null;
  }
}

module.exports = {
  visitor: new SaveVisitor()
};
