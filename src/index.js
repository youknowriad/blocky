#!/usr/bin/env node

const path = require("path");
const fs = require("fs");
const lodash = require("lodash");
const { lexer } = require("./lexer");
const { parser } = require("./parser");
const { visitor } = require("./visitor");
const serializeSave = require("./save-serializer");
const serializeEdit = require("./edit-serializer");
const resolveDependencies = require("./dependencies-resolver");

const yargs = require("yargs/yargs");
const { hideBin } = require("yargs/helpers");

yargs(hideBin(process.argv)).command(
  "build [block]",
  "Builds a block",
  (yargs) => {
    return yargs.positional("out-dir", {
      describe: "Output directory",
      default: "dist",
    });
  },
  (argv) => {
    console.log("📣 Let's build blocks");
    const sourceFile = path.resolve(argv.block);
    const inputText = fs.readFileSync(sourceFile, "utf-8");
    const source = JSON.parse(inputText);

    // Parsing the block template
    const lexingResult = lexer.tokenize(source.view);
    parser.input = lexingResult.tokens;
    const rawAst = parser.document();
    const blockAst = {
      root: visitor.visit(rawAst),
      attributes: source.attributes,
    };
    if (parser.errors.length > 0) {
      throw new Error("sad sad panda, Parsing errors detected");
    }

    // Prepare output directory
    const outDir = path.resolve(argv.outDir);
    if (!fs.existsSync(outDir)) {
      fs.mkdirSync(outDir);
    }
    const blockOutDirectory = path.resolve(
      outDir,
      source.name.replace(/\//g, "-")
    );
    if (!fs.existsSync(blockOutDirectory)) {
      fs.mkdirSync(blockOutDirectory);
    }

    // Creating the index.php file
    const blockPhpTemplateFile = path.resolve(__dirname, "block.php");
    const blockPhpTemplate = fs.readFileSync(blockPhpTemplateFile, "utf-8");
    const blockPhpFile = blockPhpTemplate.replace(
      /\{block_name\}/g,
      lodash.snakeCase(source.name)
    );
    fs.writeFileSync(
      path.resolve(blockOutDirectory, "index.php"),
      blockPhpFile
    );

    // Creating the block.json file
    const blockJson = {
      apiVersion: 2,
      version: source.version || "0.1.0",
      attributes: source.attributes || {}, // TODO: Add attributes validation and parsing information extracted from view.
      name: source.name,
      title: source.title ?? source.name,
      category: source.category ?? "common",
      icon: source.icon ?? "smiley",
      supports: source.supports ?? {},
      description: source.description ?? "No description",
      editorScript: "file:./editor.js",
    };
    fs.writeFileSync(
      path.resolve(blockOutDirectory, "block.json"),
      JSON.stringify(blockJson, null, 2)
    );

    // Creating editor.js file
    const saveFunction = serializeSave(blockAst);
    const editFunction = serializeEdit(blockAst);
    const editorJsFile = `wp.blocks.registerBlockType( "${source.name}", { save: ${saveFunction}, edit: ${editFunction} } );`;
    fs.writeFileSync(
      path.resolve(blockOutDirectory, "editor.js"),
      editorJsFile
    );

    // Creating editor.asset.php file
    const assetsTemplateFile = path.resolve(__dirname, "assets.php");
    const assetsTemplateContent = fs.readFileSync(assetsTemplateFile, "utf-8");
    const dependenciesStr = resolveDependencies(blockAst)
      .map((dep) => `"${dep}"`)
      .join(", ");
    const assetsFile = assetsTemplateContent
      .replace(/\{dependencies\}/g, dependenciesStr)
      .replace(/\{version\}/g, blockJson.version);
    fs.writeFileSync(
      path.resolve(blockOutDirectory, "editor.asset.php"),
      assetsFile
    );
  }
).argv;
