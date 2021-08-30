#!/usr/bin/env node

const path = require("path");
const fs = require("fs");
const lodash = require("lodash");
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

    // Creating the index.php file
    const blockPhpTemplateFile = path.resolve( __dirname, "block.php" );
    const blockPhpTemplate = fs.readFileSync( blockPhpTemplateFile, "utf-8" ); 
    const blockPhpFile = blockPhpTemplate.replace(/\{block_name\}/g, lodash.snakeCase( source.name ) );
    fs.writeFileSync( path.resolve( blockOutDirectory, "index.php" ), blockPhpFile );
    
    // Creating the block.json file
    const blockJson = {
      apiVersion: 2,
      version: source.version || "0.1.0",
      name: source.name,
      title: source.title ?? source.name,
      category: source.category ?? "common",
      icon: source.icon ?? "smiley",
      description: source.description ?? "No description",
      editorScript: 'file:./editor.js'
    };
    fs.writeFileSync( path.resolve( blockOutDirectory, 'block.json' ), JSON.stringify( blockJson, null, 2 ) );

    // Parsing the view and creating editor.js file
    const lexingResult = lexer.tokenize(source.view);
    parser.input = lexingResult.tokens;
    const cst = parser.document();
    if (parser.errors.length > 0) {
      throw new Error("sad sad panda, Parsing errors detected");
    }
    const saveFunction = visitor.visit(cst);
    const editorJsFile = `wp.blocks.registerBlockType( { name: "${source.name }", save: ${saveFunction} } );`
    fs.writeFileSync( path.resolve( blockOutDirectory, 'editor.js' ), editorJsFile );

    // Creating editor.asset.php file
    const assetsTemplateFile = path.resolve( __dirname, "assets.php" );
    const assetsTemplateContent = fs.readFileSync( assetsTemplateFile, "utf-8" ); 
    const assetsFile = assetsTemplateContent
      .replace(/\{dependencies\}/g, '"wp-blocks"' )
      .replace(/\{version\}/g, blockJson.version );
    fs.writeFileSync( path.resolve( blockOutDirectory, "editor.asset.php" ), assetsFile );
  })
  .argv
