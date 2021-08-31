const { serializeAttributeValue, extractBlockAttributesFromElementAttributes } = require('../serializer');

module.exports = {
    name: 'wp.plain',

    save( element, isTopLevel ) {
        const tagNameAttribute = element.attributes.find( attr => attr.name === 'tagName' );
        const tagNameString = serializeAttributeValue( tagNameAttribute );
        const valueAttributeAST = element.attributes.find( attr => attr.name === 'value' );
        
        // TODO: Inject extra attributes
        const attributesStr = isTopLevel ? 'wp.blockEditor.useBlockProps.save()' : 'null';
        return `wp.element.createElement( ${tagNameString}, ${attributesStr}, wp.element.createElement(wp.element.RawHTML, null, attributes.${valueAttributeAST.value} ) )`;
    },

    edit( element, isTopLevel ) {
        const tagNameAttribute = element.attributes.find( attr => attr.name === 'tagName' );
        const tagNameStr = serializeAttributeValue( tagNameAttribute );
        const valueAttributeAST = element.attributes.find( attr => attr.name === 'value' );
        
        // TODO: Inject extra attributes
        let attributesStr = `{ __experimentalVersion: 2, tagName: ${tagNameStr}, value: attributes.${valueAttributeAST.value}, onChange: newValue => setAttributes( { ${valueAttributeAST.value}: newValue } ) }`;
        attributesStr = isTopLevel ? `Object.assign( {}, wp.blockEditor.useBlockProps(), ${attributesStr} )` : attributesStr;
        return `wp.element.createElement( wp.blockEditor.PlainText, ${attributesStr} )`;
    },

    extractAttributes( element ) {
        const blockAttributes = extractBlockAttributesFromElementAttributes( element.attributes );
        const valueAttributeAST = element.attributes.find( attr => attr.name === 'value' );
        blockAttributes.inline.push( valueAttributeAST.value );

        return blockAttributes;
    },

    dependencies: [ 'wp-element', 'wp-block-editor' ],
}