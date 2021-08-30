module.exports = {
    name: 'wp.plain',

    save( ctx, isTopLevel ) {
        const tagNameAttribute = ctx.attribute.find( attributeCtx => attributeCtx.children.Name[0].image === 'tagName')?.children;
        let tagName;
        if (tagNameAttribute.STRING) {
            tagName = tagNameAttribute.STRING[0].image;
        } else if (tagNameAttribute.Name?.[1]?.image) {
            tagName = `attributes.${tagNameAttribute.Name[1].image}`;
        } else {
            throw "Invalid attribute";
        }

        const contentAttributeCtx = ctx.attribute.find( attributeCtx => attributeCtx.children.Name[0].image === 'value')?.children;
        const contentAttributeName = `${contentAttributeCtx.Name[1].image}`;
        
        // TODO: Inject extra attributes

        const attributesStr = isTopLevel ? 'wp.blockEditor.useBlockProps.save()' : 'null';
        return `wp.element.createElement( ${tagName}, ${attributesStr}, wp.element.createElement(wp.element.RawHTML, null, attributes.${contentAttributeName} ) )`;
    },

    edit( ctx, isTopLevel ) {
        const tagNameAttribute = ctx.attribute.find( attributeCtx => attributeCtx.children.Name[0].image === 'tagName')?.children;
        let tagName;
        if (tagNameAttribute.STRING) {
            tagName = tagNameAttribute.STRING[0].image;
        } else if (tagNameAttribute.Name?.[1]?.image) {
            tagName = `attributes.${tagNameAttribute.Name[1].image}`;
        } else {
            throw "Invalid attribute";
        }

        const contentAttributeCtx = ctx.attribute.find( attributeCtx => attributeCtx.children.Name[0].image === 'value')?.children;
        const contentAttributeName = contentAttributeCtx.Name[1].image;
        
        // TODO: Inject extra attributes

        let attributesStr = `{ __experimentalVersion: 2, value: attributes.${contentAttributeName}, onChange: newValue => setAttributes( { ${contentAttributeName}: newValue } ) }`;
        attributesStr = isTopLevel ? `Object.assign( {}, wp.blockEditor.useBlockProps(), ${attributesStr} )` : attributesStr;
        return `wp.element.createElement( wp.blockEditor.PlainText, ${attributesStr} )`;
    }
}