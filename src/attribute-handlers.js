const plain = require( './attributes/plain');
const rich = require( './attributes/rich');
const number = require( './attributes/number' );

const attributeHandlers = {
    inline: [
        plain,
        rich
    ],

    type: [
        number
    ]
};

module.exports = attributeHandlers;
