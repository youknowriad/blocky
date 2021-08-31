module.exports = {
  type: "number",

  edit(attributeName, attributeSchema) {
    return `wp.element.createElement( 
        wp.blockEditor.InspectorControls, 
        null,
        wp.element.createElement( wp.components.PanelBody, null, 
            wp.element.createElement(
                wp.components.__experimentalNumberControl,
                {
                    label: "${(attributeSchema?.label ?? attributeName).replace(
                      /"/g,
                      '\\"'
                    )}",
                    value: attributes.${attributeName} || '',
                    onChange: newValue => setAttributes( { ${attributeName}: parseInt( newValue, 10 ) } ),
                }
            )
        )
    )`;
  },

  dependencies: [ 'wp-element', 'wp-block-editor', 'wp-components' ],
};
