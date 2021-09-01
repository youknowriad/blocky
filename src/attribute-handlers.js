const plain = require( './attributes/plain');
const rich = require( './attributes/rich');
const number = require( './attributes/number' );
const string = require( './attributes/string' );

const attributeHandlers = {
    inline: [
        plain,
        rich
    ],

    type: [
        number,
        string
    ]
};

module.exports = attributeHandlers;
