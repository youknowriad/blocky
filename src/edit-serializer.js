const attributesHandler = require('./attribute-handlers');
const { serializeChildren, serializeAttributes } = require('./serializer');

function serializeElement( element, isTopLevel = false ) {
    const elementName = element.name;

    const attributeHandler = attributesHandler.find(handler => handler.name === elementName);
    if ( attributeHandler ) {
      return attributeHandler.edit(element, isTopLevel);
    }

    const childrenStr = serializeChildren( element.children, serializeElement );
    let attributesStr = serializeAttributes( element.attributes );

    if (isTopLevel) {
      attributesStr = attributesStr = "null"
        ? "wp.blockEditor.useBlockProps()"
        : `wp.blockEditor.useBlockProps(${attributesStr})`;
    }

    return `wp.element.createElement( "${elementName}" , ${attributesStr}, ${childrenStr} )`;

}

module.exports = function( blockCst ) {
    return `function ( { attributes, setAttributes } ) { 
    return ${serializeElement(blockCst, true)};
}`;
}