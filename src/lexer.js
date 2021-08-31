const { createToken: createTokenOrg, Lexer } = require("chevrotain");

// A little mini DSL for easier lexer definition.
const fragments = {};
const f = fragments;

function FRAGMENT(name, def) {
  fragments[name] = typeof def === "string" ? def : def.source;
}

function makePattern(strings, ...args) {
  let combined = "";
  for (let i = 0; i < strings.length; i++) {
    combined += strings[i];
    if (i < args.length) {
      let pattern = args[i];
      // if a TokenType was passed
      if (args[i].PATTERN) {
        pattern = args[i].PATTERN;
      }
      const patternSource =
        typeof pattern === "string" ? pattern : pattern.source;
      // By wrapping in a RegExp (none) capturing group
      // We enabled the safe usage of qualifiers and assertions.
      combined += `(?:${patternSource})`;
    }
  }
  return new RegExp(combined);
}

const tokensArray = [];
const tokensDictionary = {};

function createToken(options) {
  const newTokenType = createTokenOrg(options);
  tokensArray.push(newTokenType);
  tokensDictionary[options.name] = newTokenType;
  return newTokenType;
}

FRAGMENT(
  "NameStartChar",
  "([a-zA-Z]|\\u2070-\\u218F|\\u2C00-\\u2FEF|\\u3001-\\uD7FF|\\uF900-\\uFDCF|\\uFDF0-\\uFFFD)"
);

FRAGMENT(
  "NameChar",
  makePattern`${f.NameStartChar}|-|_|\\.|\\d|\\u00B7||[\\u0300-\\u036F]|[\\u203F-\\u2040]`
);
FRAGMENT("Name", makePattern`${f.NameStartChar}(${f.NameChar})*`);

const SEA_WS = createToken({
  name: "SEA_WS",
  pattern: /( |\t|\n|\r\n)+/,
});

const SLASH_OPEN = createToken({
  name: "SLASH_OPEN",
  pattern: /<\//,
  push_mode: "INSIDE",
});

const OPEN = createToken({ name: "OPEN", pattern: /</, push_mode: "INSIDE" });

const TEXT = createToken({ name: "TEXT", pattern: /[^<&{]+/ });

const CLOSE = createToken({ name: "CLOSE", pattern: />/, pop_mode: true });

const SLASH_CLOSE = createToken({
  name: "SLASH_CLOSE",
  pattern: /\/>/,
  pop_mode: true,
});

const SLASH = createToken({ name: "SLASH", pattern: /\// });

const STRING = createToken({
  name: "STRING",
  pattern: /"[^<"]*"|'[^<']*'/,
});

const EQUALS = createToken({ name: "EQUALS", pattern: /=/ });

const Name = createToken({ name: "Name", pattern: makePattern`${f.Name}` });

const OPEN_DYNAMIC_VALUE = createToken({
  name: "OPEN_DYNAMIC_VALUE",
  pattern: /{/,
});
const CLOSE_DYNAMIC_VALUE = createToken({
  name: "CLOSE_DYNAMIC_VALUE",
  pattern: /}/,
});

const OPEN_DYNAMIC_CONTENT = createToken({
  name: "OPEN_DYNAMIC_CONTENT",
  pattern: /{{/,
  push_mode: "INSIDE_CONTENT",
});
const CLOSE_DYNAMIC_CONTENT = createToken({
  name: "CLOSE_DYNAMIC_CONTENT",
  pattern: /}}/,
  pop_mode: true,
});

const xmlLexerDefinition = {
  defaultMode: "OUTSIDE",

  modes: {
    OUTSIDE: [
      SEA_WS,
      OPEN_DYNAMIC_CONTENT,
      SLASH_OPEN,
      OPEN,
      TEXT,
    ],
    INSIDE: [
      CLOSE,
      SLASH_CLOSE,
      SLASH,
      EQUALS,
      STRING,
      Name,
      OPEN_DYNAMIC_VALUE,
      CLOSE_DYNAMIC_VALUE,
    ],
    INSIDE_CONTENT: [
      CLOSE_DYNAMIC_CONTENT,
      Name,
    ]
  },
};

const lexer = new Lexer(xmlLexerDefinition, {
  // Reducing the amount of position tracking can provide a small performance boost (<10%)
  // Likely best to keep the full info for better error position reporting and
  // to expose "fuller" ITokens from the Lexer.
  positionTracking: "full",
  ensureOptimizations: false,
});

module.exports = {
  lexer,
  tokensDictionary,
};
