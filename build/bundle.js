module.exports =
/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;
/******/
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			exports: {},
/******/ 			id: moduleId,
/******/ 			loaded: false
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/*!********************!*\
  !*** ./webtask.js ***!
  \********************/
/***/ function(module, exports, __webpack_require__) {

	const nconf = __webpack_require__(/*! nconf */ 2);
	var Webtask = __webpack_require__(/*! webtask-tools */ 3);
	
	// This is the entry-point for the Webpack build. We need to convert our module
	// (which is a simple Express server) into a Webtask-compatible function.
	module.exports = Webtask.fromExpress((req, res) => {
	  nconf
	    .defaults({
	      AUTH0_APIV2_TOKEN: req.webtaskContext.secrets.AUTH0_APIV2_TOKEN
	    });
	
	  // Start the server.
	  const app = __webpack_require__(/*! ./index */ 6)();
	  return app(req, res);
	});


/***/ },
/* 1 */,
/* 2 */
/*!************************!*\
  !*** external "nconf" ***!
  \************************/
/***/ function(module, exports) {

	module.exports = require("nconf");

/***/ },
/* 3 */
/*!**********************************!*\
  !*** ./~/webtask-tools/index.js ***!
  \**********************************/
/***/ function(module, exports, __webpack_require__) {

	exports.fromConnect = exports.fromExpress = fromConnect;
	exports.fromHapi = fromHapi;
	exports.fromServer = exports.fromRestify = fromServer;
	
	
	// API functions
	
	function fromConnect (connectFn) {
	    return function (context, req, res) {
	        var normalizeRouteRx = createRouteNormalizationRx(req.x_wt.jtn);
	
	        req.originalUrl = req.url;
	        req.url = req.url.replace(normalizeRouteRx, '/');
	        req.webtaskContext = attachStorageHelpers(context);
	
	        return connectFn(req, res);
	    };
	}
	
	function fromHapi(server) {
	    var webtaskContext;
	
	    server.ext('onRequest', function (request, response) {
	        var normalizeRouteRx = createRouteNormalizationRx(request.x_wt.jtn);
	
	        request.setUrl(request.url.replace(normalizeRouteRx, '/'));
	        request.webtaskContext = webtaskContext;
	    });
	
	    return function (context, req, res) {
	        var dispatchFn = server._dispatch();
	
	        webtaskContext = attachStorageHelpers(context);
	
	        dispatchFn(req, res);
	    };
	}
	
	function fromServer(httpServer) {
	    return function (context, req, res) {
	        var normalizeRouteRx = createRouteNormalizationRx(req.x_wt.jtn);
	
	        req.originalUrl = req.url;
	        req.url = req.url.replace(normalizeRouteRx, '/');
	        req.webtaskContext = attachStorageHelpers(context);
	
	        return httpServer.emit('request', req, res);
	    };
	}
	
	
	// Helper functions
	
	function createRouteNormalizationRx(jtn) {
	    var normalizeRouteBase = '^\/api\/run\/[^\/]+\/';
	    var normalizeNamedRoute = '(?:[^\/\?#]*\/?)?';
	
	    return new RegExp(
	        normalizeRouteBase + (
	        jtn
	            ?   normalizeNamedRoute
	            :   ''
	    ));
	}
	
	function attachStorageHelpers(context) {
	    context.read = context.secrets.EXT_STORAGE_URL
	        ?   readFromPath
	        :   readNotAvailable;
	    context.write = context.secrets.EXT_STORAGE_URL
	        ?   writeToPath
	        :   writeNotAvailable;
	
	    return context;
	
	
	    function readNotAvailable(path, options, cb) {
	        var Boom = __webpack_require__(/*! boom */ 4);
	
	        if (typeof options === 'function') {
	            cb = options;
	            options = {};
	        }
	
	        cb(Boom.preconditionFailed('Storage is not available in this context'));
	    }
	
	    function readFromPath(path, options, cb) {
	        var Boom = __webpack_require__(/*! boom */ 4);
	        var Request = __webpack_require__(/*! request */ 5);
	
	        if (typeof options === 'function') {
	            cb = options;
	            options = {};
	        }
	
	        Request({
	            uri: context.secrets.EXT_STORAGE_URL,
	            method: 'GET',
	            headers: options.headers || {},
	            qs: { path: path },
	            json: true,
	        }, function (err, res, body) {
	            if (err) return cb(Boom.wrap(err, 502));
	            if (res.statusCode === 404 && Object.hasOwnProperty.call(options, 'defaultValue')) return cb(null, options.defaultValue);
	            if (res.statusCode >= 400) return cb(Boom.create(res.statusCode, body && body.message));
	
	            cb(null, body);
	        });
	    }
	
	    function writeNotAvailable(path, data, options, cb) {
	        var Boom = __webpack_require__(/*! boom */ 4);
	
	        if (typeof options === 'function') {
	            cb = options;
	            options = {};
	        }
	
	        cb(Boom.preconditionFailed('Storage is not available in this context'));
	    }
	
	    function writeToPath(path, data, options, cb) {
	        var Boom = __webpack_require__(/*! boom */ 4);
	        var Request = __webpack_require__(/*! request */ 5);
	
	        if (typeof options === 'function') {
	            cb = options;
	            options = {};
	        }
	
	        Request({
	            uri: context.secrets.EXT_STORAGE_URL,
	            method: 'PUT',
	            headers: options.headers || {},
	            qs: { path: path },
	            body: data,
	        }, function (err, res, body) {
	            if (err) return cb(Boom.wrap(err, 502));
	            if (res.statusCode >= 400) return cb(Boom.create(res.statusCode, body && body.message));
	
	            cb(null);
	        });
	    }
	}


/***/ },
/* 4 */
/*!***********************!*\
  !*** external "boom" ***!
  \***********************/
/***/ function(module, exports) {

	module.exports = require("boom");

/***/ },
/* 5 */
/*!**************************!*\
  !*** external "request" ***!
  \**************************/
/***/ function(module, exports) {

	module.exports = require("request");

/***/ },
/* 6 */
/*!******************!*\
  !*** ./index.js ***!
  \******************/
/***/ function(module, exports, __webpack_require__) {

	/* WEBPACK VAR INJECTION */(function(process) {var express  = __webpack_require__(/*! express */ 8);
	var app      = express();
	var template = __webpack_require__(/*! ./views/index.jade */ 9);
	
	app.get('/users', function (req, res) {
	  res.json({foo: process.env.AUTH0_APIV2_TOKEN});
	});
	
	app.get('/', function (req, res) {
	  res.header("Content-Type", 'text/html');
	  res.status(200).send(template());
	});
	
	module.exports = app;
	
	/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(/*! ./~/process/browser.js */ 7)))

/***/ },
/* 7 */
/*!******************************!*\
  !*** ./~/process/browser.js ***!
  \******************************/
/***/ function(module, exports) {

	// shim for using process in browser
	var process = module.exports = {};
	
	// cached from whatever global is present so that test runners that stub it
	// don't break things.  But we need to wrap it in a try catch in case it is
	// wrapped in strict mode code which doesn't define any globals.  It's inside a
	// function because try/catches deoptimize in certain engines.
	
	var cachedSetTimeout;
	var cachedClearTimeout;
	
	(function () {
	    try {
	        cachedSetTimeout = setTimeout;
	    } catch (e) {
	        cachedSetTimeout = function () {
	            throw new Error('setTimeout is not defined');
	        }
	    }
	    try {
	        cachedClearTimeout = clearTimeout;
	    } catch (e) {
	        cachedClearTimeout = function () {
	            throw new Error('clearTimeout is not defined');
	        }
	    }
	} ())
	function runTimeout(fun) {
	    if (cachedSetTimeout === setTimeout) {
	        //normal enviroments in sane situations
	        return setTimeout(fun, 0);
	    }
	    try {
	        // when when somebody has screwed with setTimeout but no I.E. maddness
	        return cachedSetTimeout(fun, 0);
	    } catch(e){
	        try {
	            // When we are in I.E. but the script has been evaled so I.E. doesn't trust the global object when called normally
	            return cachedSetTimeout.call(null, fun, 0);
	        } catch(e){
	            // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error
	            return cachedSetTimeout.call(this, fun, 0);
	        }
	    }
	
	
	}
	function runClearTimeout(marker) {
	    if (cachedClearTimeout === clearTimeout) {
	        //normal enviroments in sane situations
	        return clearTimeout(marker);
	    }
	    try {
	        // when when somebody has screwed with setTimeout but no I.E. maddness
	        return cachedClearTimeout(marker);
	    } catch (e){
	        try {
	            // When we are in I.E. but the script has been evaled so I.E. doesn't  trust the global object when called normally
	            return cachedClearTimeout.call(null, marker);
	        } catch (e){
	            // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error.
	            // Some versions of I.E. have different rules for clearTimeout vs setTimeout
	            return cachedClearTimeout.call(this, marker);
	        }
	    }
	
	
	
	}
	var queue = [];
	var draining = false;
	var currentQueue;
	var queueIndex = -1;
	
	function cleanUpNextTick() {
	    if (!draining || !currentQueue) {
	        return;
	    }
	    draining = false;
	    if (currentQueue.length) {
	        queue = currentQueue.concat(queue);
	    } else {
	        queueIndex = -1;
	    }
	    if (queue.length) {
	        drainQueue();
	    }
	}
	
	function drainQueue() {
	    if (draining) {
	        return;
	    }
	    var timeout = runTimeout(cleanUpNextTick);
	    draining = true;
	
	    var len = queue.length;
	    while(len) {
	        currentQueue = queue;
	        queue = [];
	        while (++queueIndex < len) {
	            if (currentQueue) {
	                currentQueue[queueIndex].run();
	            }
	        }
	        queueIndex = -1;
	        len = queue.length;
	    }
	    currentQueue = null;
	    draining = false;
	    runClearTimeout(timeout);
	}
	
	process.nextTick = function (fun) {
	    var args = new Array(arguments.length - 1);
	    if (arguments.length > 1) {
	        for (var i = 1; i < arguments.length; i++) {
	            args[i - 1] = arguments[i];
	        }
	    }
	    queue.push(new Item(fun, args));
	    if (queue.length === 1 && !draining) {
	        runTimeout(drainQueue);
	    }
	};
	
	// v8 likes predictible objects
	function Item(fun, array) {
	    this.fun = fun;
	    this.array = array;
	}
	Item.prototype.run = function () {
	    this.fun.apply(null, this.array);
	};
	process.title = 'browser';
	process.browser = true;
	process.env = {};
	process.argv = [];
	process.version = ''; // empty string to avoid regexp issues
	process.versions = {};
	
	function noop() {}
	
	process.on = noop;
	process.addListener = noop;
	process.once = noop;
	process.off = noop;
	process.removeListener = noop;
	process.removeAllListeners = noop;
	process.emit = noop;
	
	process.binding = function (name) {
	    throw new Error('process.binding is not supported');
	};
	
	process.cwd = function () { return '/' };
	process.chdir = function (dir) {
	    throw new Error('process.chdir is not supported');
	};
	process.umask = function() { return 0; };


/***/ },
/* 8 */
/*!**************************!*\
  !*** external "express" ***!
  \**************************/
/***/ function(module, exports) {

	module.exports = require("express");

/***/ },
/* 9 */
/*!**************************!*\
  !*** ./views/index.jade ***!
  \**************************/
/***/ function(module, exports, __webpack_require__) {

	var jade = __webpack_require__(/*! ./~/jade/lib/runtime.js */ 10);
	
	module.exports = function template(locals) {
	var jade_debug = [ new jade.DebugItem( 1, "/Users/peter/projects/auth0-extensions/auth0-scim-extension/views/index.jade" ) ];
	try {
	var buf = [];
	var jade_mixins = {};
	var jade_interp;
	;var locals_for_with = (locals || {});(function (description) {
	jade_debug.unshift(new jade.DebugItem( 0, "/Users/peter/projects/auth0-extensions/auth0-scim-extension/views/layout.jade" ));
	jade_debug.unshift(new jade.DebugItem( 1, "/Users/peter/projects/auth0-extensions/auth0-scim-extension/views/layout.jade" ));
	buf.push("<!DOCTYPE html>");
	jade_debug.shift();
	jade_debug.unshift(new jade.DebugItem( 2, "/Users/peter/projects/auth0-extensions/auth0-scim-extension/views/layout.jade" ));
	buf.push("<html>");
	jade_debug.unshift(new jade.DebugItem( undefined, jade_debug[0].filename ));
	jade_debug.unshift(new jade.DebugItem( 3, "/Users/peter/projects/auth0-extensions/auth0-scim-extension/views/layout.jade" ));
	buf.push("<head>");
	jade_debug.unshift(new jade.DebugItem( undefined, jade_debug[0].filename ));
	jade_debug.unshift(new jade.DebugItem( 3, "/Users/peter/projects/auth0-extensions/auth0-scim-extension/views/layout.jade" ));
	jade_debug.unshift(new jade.DebugItem( 4, "/Users/peter/projects/auth0-extensions/auth0-scim-extension/views/index.jade" ));
	buf.push("<title>");
	jade_debug.unshift(new jade.DebugItem( undefined, jade_debug[0].filename ));
	jade_debug.unshift(new jade.DebugItem( 4, jade_debug[0].filename ));
	buf.push("My Application");
	jade_debug.shift();
	jade_debug.shift();
	buf.push("</title>");
	jade_debug.shift();
	jade_debug.shift();
	jade_debug.unshift(new jade.DebugItem( 6, "/Users/peter/projects/auth0-extensions/auth0-scim-extension/views/layout.jade" ));
	buf.push("<meta charset=\"UTF-8\">");
	jade_debug.shift();
	jade_debug.unshift(new jade.DebugItem( 7, "/Users/peter/projects/auth0-extensions/auth0-scim-extension/views/layout.jade" ));
	buf.push("<meta http-equiv=\"X-UA-Compatible\" content=\"IE=Edge\">");
	jade_debug.shift();
	jade_debug.unshift(new jade.DebugItem( 8, "/Users/peter/projects/auth0-extensions/auth0-scim-extension/views/layout.jade" ));
	buf.push("<meta name=\"viewport\" content=\"width=device-width, initial-scale=1.0\">");
	jade_debug.shift();
	jade_debug.unshift(new jade.DebugItem( 9, "/Users/peter/projects/auth0-extensions/auth0-scim-extension/views/layout.jade" ));
	buf.push("<meta name=\"description\"" + (jade.attr("content", '' + (description) + '', true, true)) + ">");
	jade_debug.shift();
	jade_debug.unshift(new jade.DebugItem( 10, "/Users/peter/projects/auth0-extensions/auth0-scim-extension/views/layout.jade" ));
	buf.push("<meta name=\"viewport\" content=\"width=device-width, initial-scale=1\">");
	jade_debug.shift();
	jade_debug.unshift(new jade.DebugItem( 11, "/Users/peter/projects/auth0-extensions/auth0-scim-extension/views/layout.jade" ));
	buf.push("<link rel=\"shortcut icon\" href=\"https://cdn.auth0.com/styleguide/2.0.1/lib/logos/img/favicon.png\">");
	jade_debug.shift();
	jade_debug.unshift(new jade.DebugItem( 12, "/Users/peter/projects/auth0-extensions/auth0-scim-extension/views/layout.jade" ));
	buf.push("<link rel=\"apple-touch-icon\" href=\"apple-touch-icon.png\">");
	jade_debug.shift();
	jade_debug.unshift(new jade.DebugItem( 14, "/Users/peter/projects/auth0-extensions/auth0-scim-extension/views/layout.jade" ));
	buf.push("<link rel=\"stylesheet\" type=\"text/css\" href=\"https://cdn.auth0.com/manage/v0.3.973/css/index.min.css\">");
	jade_debug.shift();
	jade_debug.unshift(new jade.DebugItem( 15, "/Users/peter/projects/auth0-extensions/auth0-scim-extension/views/layout.jade" ));
	buf.push("<link rel=\"stylesheet\" type=\"text/css\" href=\"https://cdn.auth0.com/styleguide/latest/index.css\">");
	jade_debug.shift();
	jade_debug.shift();
	buf.push("</head>");
	jade_debug.shift();
	jade_debug.unshift(new jade.DebugItem( 17, "/Users/peter/projects/auth0-extensions/auth0-scim-extension/views/layout.jade" ));
	buf.push("<body class=\"a0-extension\">");
	jade_debug.unshift(new jade.DebugItem( undefined, jade_debug[0].filename ));
	jade_debug.unshift(new jade.DebugItem( 19, "/Users/peter/projects/auth0-extensions/auth0-scim-extension/views/layout.jade" ));
	buf.push("<div class=\"container\">");
	jade_debug.unshift(new jade.DebugItem( undefined, jade_debug[0].filename ));
	jade_debug.unshift(new jade.DebugItem( 20, "/Users/peter/projects/auth0-extensions/auth0-scim-extension/views/layout.jade" ));
	buf.push("<div class=\"row\">");
	jade_debug.unshift(new jade.DebugItem( undefined, jade_debug[0].filename ));
	jade_debug.unshift(new jade.DebugItem( 21, "/Users/peter/projects/auth0-extensions/auth0-scim-extension/views/layout.jade" ));
	buf.push("<section class=\"content-page current\">");
	jade_debug.unshift(new jade.DebugItem( undefined, jade_debug[0].filename ));
	jade_debug.unshift(new jade.DebugItem( 22, "/Users/peter/projects/auth0-extensions/auth0-scim-extension/views/layout.jade" ));
	buf.push("<div class=\"col-xs-12\">");
	jade_debug.unshift(new jade.DebugItem( undefined, jade_debug[0].filename ));
	jade_debug.unshift(new jade.DebugItem( 23, "/Users/peter/projects/auth0-extensions/auth0-scim-extension/views/layout.jade" ));
	buf.push("<div id=\"my-application\">");
	jade_debug.unshift(new jade.DebugItem( undefined, jade_debug[0].filename ));
	jade_debug.unshift(new jade.DebugItem( 6, "/Users/peter/projects/auth0-extensions/auth0-scim-extension/views/layout.jade" ));
	jade_debug.unshift(new jade.DebugItem( 7, "/Users/peter/projects/auth0-extensions/auth0-scim-extension/views/index.jade" ));
	buf.push("<h1>");
	jade_debug.unshift(new jade.DebugItem( undefined, jade_debug[0].filename ));
	jade_debug.unshift(new jade.DebugItem( 7, jade_debug[0].filename ));
	buf.push("Welcome to SCIM!");
	jade_debug.shift();
	jade_debug.shift();
	buf.push("</h1>");
	jade_debug.shift();
	jade_debug.unshift(new jade.DebugItem( 8, "/Users/peter/projects/auth0-extensions/auth0-scim-extension/views/index.jade" ));
	buf.push("<p>");
	jade_debug.unshift(new jade.DebugItem( undefined, jade_debug[0].filename ));
	jade_debug.unshift(new jade.DebugItem( 8, jade_debug[0].filename ));
	buf.push("The base URL is:");
	jade_debug.shift();
	jade_debug.unshift(new jade.DebugItem( 9, "/Users/peter/projects/auth0-extensions/auth0-scim-extension/views/index.jade" ));
	buf.push("<a href=\"users\">");
	jade_debug.unshift(new jade.DebugItem( undefined, jade_debug[0].filename ));
	jade_debug.unshift(new jade.DebugItem( 9, jade_debug[0].filename ));
	buf.push("./users");
	jade_debug.shift();
	jade_debug.shift();
	buf.push("</a>");
	jade_debug.shift();
	jade_debug.shift();
	buf.push("</p>");
	jade_debug.shift();
	jade_debug.shift();
	jade_debug.shift();
	buf.push("</div>");
	jade_debug.shift();
	jade_debug.shift();
	buf.push("</div>");
	jade_debug.shift();
	jade_debug.shift();
	buf.push("</section>");
	jade_debug.shift();
	jade_debug.shift();
	buf.push("</div>");
	jade_debug.shift();
	jade_debug.shift();
	buf.push("</div>");
	jade_debug.shift();
	jade_debug.shift();
	buf.push("</body>");
	jade_debug.shift();
	jade_debug.shift();
	buf.push("</html>");
	jade_debug.shift();
	jade_debug.shift();}.call(this,"description" in locals_for_with?locals_for_with.description:typeof description!=="undefined"?description:undefined));;return buf.join("");
	} catch (err) {
	  jade.rethrow(err, jade_debug[0].filename, jade_debug[0].lineno, "extends ./layout.jade\n\nblock title\n  title My Application\n\nblock content\n  h1 Welcome to SCIM!\n  p The base URL is:\n    a(href=\"users\") ./users\n");
	}
	}

/***/ },
/* 10 */
/*!*******************************!*\
  !*** ./~/jade/lib/runtime.js ***!
  \*******************************/
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	/**
	 * Merge two attribute objects giving precedence
	 * to values in object `b`. Classes are special-cased
	 * allowing for arrays and merging/joining appropriately
	 * resulting in a string.
	 *
	 * @param {Object} a
	 * @param {Object} b
	 * @return {Object} a
	 * @api private
	 */
	
	exports.merge = function merge(a, b) {
	  if (arguments.length === 1) {
	    var attrs = a[0];
	    for (var i = 1; i < a.length; i++) {
	      attrs = merge(attrs, a[i]);
	    }
	    return attrs;
	  }
	  var ac = a['class'];
	  var bc = b['class'];
	
	  if (ac || bc) {
	    ac = ac || [];
	    bc = bc || [];
	    if (!Array.isArray(ac)) ac = [ac];
	    if (!Array.isArray(bc)) bc = [bc];
	    a['class'] = ac.concat(bc).filter(nulls);
	  }
	
	  for (var key in b) {
	    if (key != 'class') {
	      a[key] = b[key];
	    }
	  }
	
	  return a;
	};
	
	/**
	 * Filter null `val`s.
	 *
	 * @param {*} val
	 * @return {Boolean}
	 * @api private
	 */
	
	function nulls(val) {
	  return val != null && val !== '';
	}
	
	/**
	 * join array as classes.
	 *
	 * @param {*} val
	 * @return {String}
	 */
	exports.joinClasses = joinClasses;
	function joinClasses(val) {
	  return (Array.isArray(val) ? val.map(joinClasses) :
	    (val && typeof val === 'object') ? Object.keys(val).filter(function (key) { return val[key]; }) :
	    [val]).filter(nulls).join(' ');
	}
	
	/**
	 * Render the given classes.
	 *
	 * @param {Array} classes
	 * @param {Array.<Boolean>} escaped
	 * @return {String}
	 */
	exports.cls = function cls(classes, escaped) {
	  var buf = [];
	  for (var i = 0; i < classes.length; i++) {
	    if (escaped && escaped[i]) {
	      buf.push(exports.escape(joinClasses([classes[i]])));
	    } else {
	      buf.push(joinClasses(classes[i]));
	    }
	  }
	  var text = joinClasses(buf);
	  if (text.length) {
	    return ' class="' + text + '"';
	  } else {
	    return '';
	  }
	};
	
	
	exports.style = function (val) {
	  if (val && typeof val === 'object') {
	    return Object.keys(val).map(function (style) {
	      return style + ':' + val[style];
	    }).join(';');
	  } else {
	    return val;
	  }
	};
	/**
	 * Render the given attribute.
	 *
	 * @param {String} key
	 * @param {String} val
	 * @param {Boolean} escaped
	 * @param {Boolean} terse
	 * @return {String}
	 */
	exports.attr = function attr(key, val, escaped, terse) {
	  if (key === 'style') {
	    val = exports.style(val);
	  }
	  if ('boolean' == typeof val || null == val) {
	    if (val) {
	      return ' ' + (terse ? key : key + '="' + key + '"');
	    } else {
	      return '';
	    }
	  } else if (0 == key.indexOf('data') && 'string' != typeof val) {
	    if (JSON.stringify(val).indexOf('&') !== -1) {
	      console.warn('Since Jade 2.0.0, ampersands (`&`) in data attributes ' +
	                   'will be escaped to `&amp;`');
	    };
	    if (val && typeof val.toISOString === 'function') {
	      console.warn('Jade will eliminate the double quotes around dates in ' +
	                   'ISO form after 2.0.0');
	    }
	    return ' ' + key + "='" + JSON.stringify(val).replace(/'/g, '&apos;') + "'";
	  } else if (escaped) {
	    if (val && typeof val.toISOString === 'function') {
	      console.warn('Jade will stringify dates in ISO form after 2.0.0');
	    }
	    return ' ' + key + '="' + exports.escape(val) + '"';
	  } else {
	    if (val && typeof val.toISOString === 'function') {
	      console.warn('Jade will stringify dates in ISO form after 2.0.0');
	    }
	    return ' ' + key + '="' + val + '"';
	  }
	};
	
	/**
	 * Render the given attributes object.
	 *
	 * @param {Object} obj
	 * @param {Object} escaped
	 * @return {String}
	 */
	exports.attrs = function attrs(obj, terse){
	  var buf = [];
	
	  var keys = Object.keys(obj);
	
	  if (keys.length) {
	    for (var i = 0; i < keys.length; ++i) {
	      var key = keys[i]
	        , val = obj[key];
	
	      if ('class' == key) {
	        if (val = joinClasses(val)) {
	          buf.push(' ' + key + '="' + val + '"');
	        }
	      } else {
	        buf.push(exports.attr(key, val, false, terse));
	      }
	    }
	  }
	
	  return buf.join('');
	};
	
	/**
	 * Escape the given string of `html`.
	 *
	 * @param {String} html
	 * @return {String}
	 * @api private
	 */
	
	exports.escape = function escape(html){
	  var result = String(html)
	    .replace(/&/g, '&amp;')
	    .replace(/</g, '&lt;')
	    .replace(/>/g, '&gt;')
	    .replace(/"/g, '&quot;');
	  if (result === '' + html) return html;
	  else return result;
	};
	
	/**
	 * Re-throw the given `err` in context to the
	 * the jade in `filename` at the given `lineno`.
	 *
	 * @param {Error} err
	 * @param {String} filename
	 * @param {String} lineno
	 * @api private
	 */
	
	exports.rethrow = function rethrow(err, filename, lineno, str){
	  if (!(err instanceof Error)) throw err;
	  if ((typeof window != 'undefined' || !filename) && !str) {
	    err.message += ' on line ' + lineno;
	    throw err;
	  }
	  try {
	    str = str || __webpack_require__(/*! fs */ 11).readFileSync(filename, 'utf8')
	  } catch (ex) {
	    rethrow(err, null, lineno)
	  }
	  var context = 3
	    , lines = str.split('\n')
	    , start = Math.max(lineno - context, 0)
	    , end = Math.min(lines.length, lineno + context);
	
	  // Error context
	  var context = lines.slice(start, end).map(function(line, i){
	    var curr = i + start + 1;
	    return (curr == lineno ? '  > ' : '    ')
	      + curr
	      + '| '
	      + line;
	  }).join('\n');
	
	  // Alter exception message
	  err.path = filename;
	  err.message = (filename || 'Jade') + ':' + lineno
	    + '\n' + context + '\n\n' + err.message;
	  throw err;
	};
	
	exports.DebugItem = function DebugItem(lineno, filename) {
	  this.lineno = lineno;
	  this.filename = filename;
	}


/***/ },
/* 11 */
/*!*********************!*\
  !*** external "fs" ***!
  \*********************/
/***/ function(module, exports) {

	module.exports = require("fs");

/***/ }
/******/ ]);
//# sourceMappingURL=bundle.js.map