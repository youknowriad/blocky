#!/usr/bin/env node

const path = require("path");
const fs = require("fs");
const { lexer } = require("./lexer");
const { parser } = require("./parser");
const { visitor } = require("./save-visitor");


const yargs = require('yargs/yargs')
const { hideBin } = require('yargs/helpers')

yargs(hideBin(process.argv))
  .command('build [block]', 'Builds a block', (yargs) => {
    return yargs
      .positional('out-dir', {
        describe: 'Output directory',
        default: 'dist'
      })
  }, (argv) => {
    console.log("📣 Let's build blocks");
    const sourceFile = path.resolve(argv.block);
    const inputText = fs.readFileSync(sourceFile, "utf-8");
    const source = JSON.parse( inputText );
    
    // Prepare output directory
    const outDir = path.resolve( argv.outDir );
    if ( !fs.existsSync( outDir ) ) {
      fs.mkdirSync( outDir );
    }
    const blockOutDirectory = path.resolve( outDir, source.name.replace(/\//g, '-') );
    if (!fs.existsSync(blockOutDirectory)) {
      fs.mkdirSync(blockOutDirectory);
    }
    
    // Creating the block.json file
    const blockJson = {
      name: source.name,
      title: source.title ?? source.name,
      description: source.description ?? "No description",
    };
    fs.writeFileSync( path.resolve( blockOutDirectory, 'block.json' ), JSON.stringify( blockJson, null, 2 ) );

    // Parsing the view
    const lexingResult = lexer.tokenize(source.view);
    parser.input = lexingResult.tokens;
    const cst = parser.document();
    if (parser.errors.length > 0) {
      throw new Error("sad sad panda, Parsing errors detected");
    }
    const saveFunction = visitor.visit(cst);
    const editorJsFile = `wp.blocks.registerBlockType( { name: "${source.name }", save: ${saveFunction} } );`
    fs.writeFileSync( path.resolve( blockOutDirectory, 'editor.js' ), editorJsFile );
  })
  .argv
