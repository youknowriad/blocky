module.exports = {
  type: "string",

  edit(attributeName, attributeSchema) {
    return `wp.element.createElement( 
          wp.blockEditor.InspectorControls, 
          null,
          wp.element.createElement( wp.components.PanelBody, null, 
              wp.element.createElement(
                  wp.components.TextControl,
                  {
                      label: "${(
                        attributeSchema?.label ?? attributeName
                      ).replace(/"/g, '\\"')}",
                      help: ${
                        attributeSchema?.help
                          ? '"' +
                            attributeSchema?.help.replace(/"/g, '\\"') +
                            '"'
                          : "undefined"
                      },
                      value: attributes.${attributeName} || '',
                      onChange: newValue => setAttributes( { ${attributeName}: newValue } ),
                  }
              )
          )
      )`;
  },

  dependencies: ["wp-element", "wp-block-editor", "wp-components"],
};
