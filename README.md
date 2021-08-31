# Blocky

The fast way to create WordPress blocks. No more hard JavaScript files, or weird PHP registration. Just create a `block.json` file and generate your block code.

# Why?

The WordPress block API is very powerful, it's very flexible and allows any kind of block you can think about. That flexibility and power comes at the cost of simplicity. A higher level API could be built around it to achieve 80% of the use-cases and won't require any React or PHP expertise. Just define your block name, its markup, its attributes and be done with it.

# Usage

1- Create a block.json file like this:

```js
// example/rich.json
{
  //This is the block name.
  "name": "example/rich",

  // Define the attributes (or the editable properties of your blocks)
  // Only provide a type and a name.
  "attributes": {
    "content": {
      "type": "string"
    }
  },

   // You can use any core block supports.
  "supports": {
    "color": {
      "link": true
    },
    "typography": {
      "fontSize": true,
      "lineHeight": true
    }
  },

   // Define the template/view of your block.
   // This is a JSX like template that represents
   // both the frontend and the backend of the block.
   // You can use some helpers to annotate your template.
  "view": "<wp.rich value={content} tagName=\"div\" />"
}
```

2- Build your block `npm run cli build example/plain.json`

This will generate the PHP and JS code required to run your block.
It generates an `index.php` file as an entry point for your block.

3- Update your plugin's php file to require the generated block's `index.php` file.

```php
<?php

require_once( 'dist/example-plain/index.php' );
```

That's it, you've just build your first block with RichText editing. The good news is that all kind of blocks are written in the exact same way. No need to learn any advanced tools like React or WP internals.

# Roadmap

 - Support automatically generating block toolbar controls and inspector controls for extra attributes that are not inlined.
 - Support generating dynamic blocks.
 - Support loops and conditions (maybe using a mustache like syntax)?
 - Support custom helpers (like the built-in `wp.rich`, `wp.plain`).

# Vision

 - WordPress Core could potentially be updated to support this syntax built-in. The advantages there is that everything is declarative, the same block could be parsed and serialized in both client and server, providing a **Universal Block Defintion** independent of any runtime (JS, PHP...)
