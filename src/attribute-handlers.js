const plain = require( './attributes/plain');
const rich = require( './attributes/rich');
const number = require( './attributes/number' );
const string = require( './attributes/string' );
const boolean = require( './attributes/boolean' );

const attributeHandlers = {
    inline: [
        plain,
        rich
    ],

    type: [
        number,
        string,
        boolean
    ]
};

module.exports = attributeHandlers;
