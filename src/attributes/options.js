module.exports = {
    type: "enum",
  
    edit(attributeName, attributeSchema) {
      return `( () => {
            const options = ${JSON.stringify(attributeSchema.options)}.map(option => ({
                key: option.key || option.value,
                value: option.value,
                name: option.label,
            }));
            const value = attributes.${attributeName};
            return wp.element.createElement( 
                wp.blockEditor.InspectorControls, 
                null,
                wp.element.createElement( wp.components.PanelBody, null, 
                    wp.element.createElement(
                        wp.components.CustomSelectControl,
                        {
                            value: options.find(option => option.value === value),
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
                            options: options,
                            onChange: ( { selectedItem: newValue } ) => {
                                setAttributes( { ${attributeName}: newValue.value } )
                            },
                        }
                    )
                )
            );
        } )()`;
    },
  
    dependencies: ["wp-element", "wp-block-editor", "wp-components"],
  };
  