const { CstParser } = require("chevrotain");
const { tokensDictionary: t } = require("./lexer");
class Xml_parser extends CstParser {
  constructor() {
    super(t, { nodeLocationTracking: "full" });

    const $ = this;

    $.RULE("document", () => {
      $.SUBRULE($.element);
    });

    $.RULE("content", () => {
      $.MANY(() => {
        $.SUBRULE($.elementContent);
      });
    });

    $.RULE("elementContent", () => {
      $.OR([
        { ALT: () => $.SUBRULE($.element) },
        { ALT: () => $.SUBRULE($.chardata) },
      ]);
    });

    $.RULE("element", () => {
      $.CONSUME(t.OPEN);
      $.CONSUME(t.Name);
      $.MANY(() => {
        $.SUBRULE($.attribute);
      });

      $.OR([
        {
          ALT: () => {
            $.CONSUME(t.CLOSE, { LABEL: "START_CLOSE" });
            $.SUBRULE($.content);
            $.CONSUME(t.SLASH_OPEN);
            $.CONSUME2(t.Name, { LABEL: "END_NAME" });
            $.CONSUME2(t.CLOSE, { LABEL: "END" });
          },
        },
        {
          ALT: () => {
            $.CONSUME(t.SLASH_CLOSE);
          },
        },
      ]);
    });

    $.RULE("attribute", () => {
      $.CONSUME(t.Name);
      $.CONSUME(t.EQUALS);
      $.OR([
        { ALT: () => $.CONSUME(t.STRING) },
        { ALT: () => {
          $.CONSUME(t.OPEN_DYNAMIC_VALUE);
          $.CONSUME2(t.Name);
          $.CONSUME(t.CLOSE_DYNAMIC_VALUE);
        } },
      ]);
    });

    $.RULE("chardata", () => {
      $.OR([
        { ALT: () => $.CONSUME(t.TEXT) },
        { ALT: () => $.CONSUME(t.SEA_WS) },
      ]);
    });

    this.performSelfAnalysis();
  }
}

// Re-use the same parser instance
const parser = new Xml_parser();

module.exports = {
  parser,
};
