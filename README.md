# MetalSmith Phantom

A [Metalsmith](http://www.metalsmith.io/) plugin that will render frontend app html into a [phantomjs](http://phantomjs.org/) browser and create static pages from it.

> Your javascript will need to know how to handle these two states. I don't supply that

This helps with issues of Google indexing frontend Javascript project. 

## Setup 

First off you need a Metalsmith project. The install `metalsmith-phantom` into your project. 

	npm install metalsmith-phantom -S

Next config the plugin to create the pages you would like.

```javascript
var 
  MetalSmith = require('metalsmith'),
  phantom = require('./plugins/phantom')

MetalSmith()
  .use(
    phantom({ 
      'foo/bar/index.html' : { // path to save at
        path: 'index.html', // path to hit with server relative to build dir
        query: { // query string on path
          foo: 'bar'
        }
      },
      port: 5000, // this is port the static server will start on
      timeout: 5000  // wait 5000ms before timingout 
    })
  )
  .build(function(err){
    if(err) throw err;
  });
```

## Signaling From Frontend

Right now, the best way to let PhantomJS know that your app is all rendered is to console log 'PageRendered'. eg.

```javascript
console.log('PageRendered')
```
More options hopefully will be available.
