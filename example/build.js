
/**
 * Require the given path.
 *
 * @param {String} path
 * @return {Object} exports
 * @api public
 */

function require(path, parent, orig) {
  var resolved = require.resolve(path);

  // lookup failed
  if (null == resolved) {
    orig = orig || path;
    parent = parent || 'root';
    var err = new Error('Failed to require "' + orig + '" from "' + parent + '"');
    err.path = orig;
    err.parent = parent;
    err.require = true;
    throw err;
  }

  var module = require.modules[resolved];

  // perform real require()
  // by invoking the module's
  // registered function
  if (!module._resolving && !module.exports) {
    var mod = {};
    mod.exports = {};
    mod.client = mod.component = true;
    module._resolving = true;
    module.call(this, mod.exports, require.relative(resolved), mod);
    delete module._resolving;
    module.exports = mod.exports;
  }

  return module.exports;
}

/**
 * Registered modules.
 */

require.modules = {};

/**
 * Registered aliases.
 */

require.aliases = {};

/**
 * Resolve `path`.
 *
 * Lookup:
 *
 *   - PATH/index.js
 *   - PATH.js
 *   - PATH
 *
 * @param {String} path
 * @return {String} path or null
 * @api private
 */

require.resolve = function(path) {
  if (path.charAt(0) === '/') path = path.slice(1);

  var paths = [
    path,
    path + '.js',
    path + '.json',
    path + '/index.js',
    path + '/index.json'
  ];

  for (var i = 0; i < paths.length; i++) {
    var path = paths[i];
    if (require.modules.hasOwnProperty(path)) return path;
    if (require.aliases.hasOwnProperty(path)) return require.aliases[path];
  }
};

/**
 * Normalize `path` relative to the current path.
 *
 * @param {String} curr
 * @param {String} path
 * @return {String}
 * @api private
 */

require.normalize = function(curr, path) {
  var segs = [];

  if ('.' != path.charAt(0)) return path;

  curr = curr.split('/');
  path = path.split('/');

  for (var i = 0; i < path.length; ++i) {
    if ('..' == path[i]) {
      curr.pop();
    } else if ('.' != path[i] && '' != path[i]) {
      segs.push(path[i]);
    }
  }

  return curr.concat(segs).join('/');
};

/**
 * Register module at `path` with callback `definition`.
 *
 * @param {String} path
 * @param {Function} definition
 * @api private
 */

require.register = function(path, definition) {
  require.modules[path] = definition;
};

/**
 * Alias a module definition.
 *
 * @param {String} from
 * @param {String} to
 * @api private
 */

require.alias = function(from, to) {
  if (!require.modules.hasOwnProperty(from)) {
    throw new Error('Failed to alias "' + from + '", it does not exist');
  }
  require.aliases[to] = from;
};

/**
 * Return a require function relative to the `parent` path.
 *
 * @param {String} parent
 * @return {Function}
 * @api private
 */

require.relative = function(parent) {
  var p = require.normalize(parent, '..');

  /**
   * lastIndexOf helper.
   */

  function lastIndexOf(arr, obj) {
    var i = arr.length;
    while (i--) {
      if (arr[i] === obj) return i;
    }
    return -1;
  }

  /**
   * The relative require() itself.
   */

  function localRequire(path) {
    var resolved = localRequire.resolve(path);
    return require(resolved, parent, path);
  }

  /**
   * Resolve relative to the parent.
   */

  localRequire.resolve = function(path) {
    var c = path.charAt(0);
    if ('/' == c) return path.slice(1);
    if ('.' == c) return require.normalize(p, path);

    // resolve deps by returning
    // the dep in the nearest "deps"
    // directory
    var segs = parent.split('/');
    var i = lastIndexOf(segs, 'deps') + 1;
    if (!i) i = 0;
    path = segs.slice(0, i + 1).join('/') + '/deps/' + path;
    return path;
  };

  /**
   * Check if module is defined at `path`.
   */

  localRequire.exists = function(path) {
    return require.modules.hasOwnProperty(localRequire.resolve(path));
  };

  return localRequire;
};
require.register("component-event/index.js", function(exports, require, module){
var bind = window.addEventListener ? 'addEventListener' : 'attachEvent',
    unbind = window.removeEventListener ? 'removeEventListener' : 'detachEvent',
    prefix = bind !== 'addEventListener' ? 'on' : '';

/**
 * Bind `el` event `type` to `fn`.
 *
 * @param {Element} el
 * @param {String} type
 * @param {Function} fn
 * @param {Boolean} capture
 * @return {Function}
 * @api public
 */

exports.bind = function(el, type, fn, capture){
  el[bind](prefix + type, fn, capture || false);
  return fn;
};

/**
 * Unbind `el` event `type`'s callback `fn`.
 *
 * @param {Element} el
 * @param {String} type
 * @param {Function} fn
 * @param {Boolean} capture
 * @return {Function}
 * @api public
 */

exports.unbind = function(el, type, fn, capture){
  el[unbind](prefix + type, fn, capture || false);
  return fn;
};
});
require.register("component-query/index.js", function(exports, require, module){
function one(selector, el) {
  return el.querySelector(selector);
}

exports = module.exports = function(selector, el){
  el = el || document;
  return one(selector, el);
};

exports.all = function(selector, el){
  el = el || document;
  return el.querySelectorAll(selector);
};

exports.engine = function(obj){
  if (!obj.one) throw new Error('.one callback required');
  if (!obj.all) throw new Error('.all callback required');
  one = obj.one;
  exports.all = obj.all;
  return exports;
};

});
require.register("component-matches-selector/index.js", function(exports, require, module){
/**
 * Module dependencies.
 */

var query = require('query');

/**
 * Element prototype.
 */

var proto = Element.prototype;

/**
 * Vendor function.
 */

var vendor = proto.matches
  || proto.webkitMatchesSelector
  || proto.mozMatchesSelector
  || proto.msMatchesSelector
  || proto.oMatchesSelector;

/**
 * Expose `match()`.
 */

module.exports = match;

/**
 * Match `el` to `selector`.
 *
 * @param {Element} el
 * @param {String} selector
 * @return {Boolean}
 * @api public
 */

function match(el, selector) {
  if (vendor) return vendor.call(el, selector);
  var nodes = query.all(selector, el.parentNode);
  for (var i = 0; i < nodes.length; ++i) {
    if (nodes[i] == el) return true;
  }
  return false;
}

});
require.register("discore-closest/index.js", function(exports, require, module){
var matches = require('matches-selector')

module.exports = function (element, selector, checkYoSelf, root) {
  element = checkYoSelf ? {parentNode: element} : element

  root = root || document

  // Make sure `element !== document` and `element != null`
  // otherwise we get an illegal invocation
  while ((element = element.parentNode) && element !== document) {
    if (matches(element, selector))
      return element
    // After `matches` on the edge case that
    // the selector matches the root
    // (when the root is not the document)
    if (element === root)
      return  
  }
}
});
require.register("component-delegate/index.js", function(exports, require, module){
/**
 * Module dependencies.
 */

var closest = require('closest')
  , event = require('event');

/**
 * Delegate event `type` to `selector`
 * and invoke `fn(e)`. A callback function
 * is returned which may be passed to `.unbind()`.
 *
 * @param {Element} el
 * @param {String} selector
 * @param {String} type
 * @param {Function} fn
 * @param {Boolean} capture
 * @return {Function}
 * @api public
 */

exports.bind = function(el, selector, type, fn, capture){
  return event.bind(el, type, function(e){
    var target = e.target || e.srcElement;
    e.delegateTarget = closest(target, selector, true, el);
    if (e.delegateTarget) fn.call(el, e);
  }, capture);
};

/**
 * Unbind event `type`'s callback `fn`.
 *
 * @param {Element} el
 * @param {String} type
 * @param {Function} fn
 * @param {Boolean} capture
 * @api public
 */

exports.unbind = function(el, type, fn, capture){
  event.unbind(el, type, fn, capture);
};

});
require.register("component-link-delegate/index.js", function(exports, require, module){

/**
 * Module dependencies.
 */

var delegate = require('delegate');
var url = require('url');

/**
 * Handle link delegation on `el` or the document,
 * and invoke `fn(e)` when clickable.
 *
 * @param {Element|Function} el or fn
 * @param {Function} [fn]
 * @api public
 */

module.exports = function(el, fn){
  // default to document
  if ('function' == typeof el) {
    fn = el;
    el = document;
  }

  delegate.bind(el, 'a', 'click', function(e){
    if (clickable(e)) fn(e);
  });
};

/**
 * Check if `e` is clickable.
 */

function clickable(e) {
  if (1 != which(e)) return;
  if (e.metaKey || e.ctrlKey || e.shiftKey) return;
  if (e.defaultPrevented) return;

  // target
  var el = e.target;

  // check target
  if (el.target) return;

  // x-origin
  if (url.isCrossDomain(el.href)) return;

  return true;
}

/**
 * Event button.
 */

function which(e) {
  e = e || window.event;
  return null == e.which
    ? e.button
    : e.which;
}

});
require.register("component-path-to-regexp/index.js", function(exports, require, module){
/**
 * Expose `pathtoRegexp`.
 */

module.exports = pathtoRegexp;

/**
 * Normalize the given path string,
 * returning a regular expression.
 *
 * An empty array should be passed,
 * which will contain the placeholder
 * key names. For example "/user/:id" will
 * then contain ["id"].
 *
 * @param  {String|RegExp|Array} path
 * @param  {Array} keys
 * @param  {Object} options
 * @return {RegExp}
 * @api private
 */

function pathtoRegexp(path, keys, options) {
  options = options || {};
  var sensitive = options.sensitive;
  var strict = options.strict;
  keys = keys || [];

  if (path instanceof RegExp) return path;
  if (path instanceof Array) path = '(' + path.join('|') + ')';

  path = path
    .concat(strict ? '' : '/?')
    .replace(/\/\(/g, '(?:/')
    .replace(/(\/)?(\.)?:(\w+)(?:(\(.*?\)))?(\?)?(\*)?/g, function(_, slash, format, key, capture, optional, star){
      keys.push({ name: key, optional: !! optional });
      slash = slash || '';
      return ''
        + (optional ? '' : slash)
        + '(?:'
        + (optional ? slash : '')
        + (format || '') + (capture || (format && '([^/.]+?)' || '([^/]+?)')) + ')'
        + (optional || '')
        + (star ? '(/*)?' : '');
    })
    .replace(/([\/.])/g, '\\$1')
    .replace(/\*/g, '(.*)');

  return new RegExp('^' + path + '$', sensitive ? '' : 'i');
};

});
require.register("component-trim/index.js", function(exports, require, module){

exports = module.exports = trim;

function trim(str){
  if (str.trim) return str.trim();
  return str.replace(/^\s*|\s*$/g, '');
}

exports.left = function(str){
  if (str.trimLeft) return str.trimLeft();
  return str.replace(/^\s*/, '');
};

exports.right = function(str){
  if (str.trimRight) return str.trimRight();
  return str.replace(/\s*$/, '');
};

});
require.register("component-querystring/index.js", function(exports, require, module){

/**
 * Module dependencies.
 */

var trim = require('trim');

/**
 * Parse the given query `str`.
 *
 * @param {String} str
 * @return {Object}
 * @api public
 */

exports.parse = function(str){
  if ('string' != typeof str) return {};

  str = trim(str);
  if ('' == str) return {};
  if ('?' == str.charAt(0)) str = str.slice(1);

  var obj = {};
  var pairs = str.split('&');
  for (var i = 0; i < pairs.length; i++) {
    var parts = pairs[i].split('=');
    obj[parts[0]] = null == parts[1]
      ? ''
      : decodeURIComponent(parts[1]);
  }

  return obj;
};

/**
 * Stringify the given `obj`.
 *
 * @param {Object} obj
 * @return {String}
 * @api public
 */

exports.stringify = function(obj){
  if (!obj) return '';
  var pairs = [];
  for (var key in obj) {
    pairs.push(encodeURIComponent(key) + '=' + encodeURIComponent(obj[key]));
  }
  return pairs.join('&');
};

});
require.register("component-url/index.js", function(exports, require, module){

/**
 * Parse the given `url`.
 *
 * @param {String} str
 * @return {Object}
 * @api public
 */

exports.parse = function(url){
  var a = document.createElement('a');
  a.href = url;
  return {
    href: a.href,
    host: a.host || location.host,
    port: ('0' === a.port || '' === a.port) ? port(a.protocol) : a.port,
    hash: a.hash,
    hostname: a.hostname || location.hostname,
    pathname: a.pathname.charAt(0) != '/' ? '/' + a.pathname : a.pathname,
    protocol: !a.protocol || ':' == a.protocol ? location.protocol : a.protocol,
    search: a.search,
    query: a.search.slice(1)
  };
};

/**
 * Check if `url` is absolute.
 *
 * @param {String} url
 * @return {Boolean}
 * @api public
 */

exports.isAbsolute = function(url){
  return 0 == url.indexOf('//') || !!~url.indexOf('://');
};

/**
 * Check if `url` is relative.
 *
 * @param {String} url
 * @return {Boolean}
 * @api public
 */

exports.isRelative = function(url){
  return !exports.isAbsolute(url);
};

/**
 * Check if `url` is cross domain.
 *
 * @param {String} url
 * @return {Boolean}
 * @api public
 */

exports.isCrossDomain = function(url){
  url = exports.parse(url);
  return url.hostname !== location.hostname
    || url.port !== location.port
    || url.protocol !== location.protocol;
};

/**
 * Return default port for `protocol`.
 *
 * @param  {String} protocol
 * @return {String}
 * @api private
 */
function port (protocol){
  switch (protocol) {
    case 'http:':
      return 80;
    case 'https:':
      return 443;
    default:
      return location.port;
  }
}

});
require.register("ianstormtaylor-history/index.js", function(exports, require, module){

/**
 * Get the current path.
 *
 * @return {String}
 */

exports.path = function () {
  return window.location.pathname;
};


/**
 * Get the current state.
 *
 * @return {Object}
 */

exports.state = function () {
  return window.history.state;
};


/**
 * Push a new `url` on to the history.
 *
 * @param {String} url
 * @param {Object} state (optional)
 */

exports.push = function (url, state) {
  window.history.pushState(state, null, url);
};


/**
 * Replace the current url with a new `url`.
 *
 * @param {String} url
 * @param {Object} state (optional)
 */

exports.replace = function (url, state) {
  window.history.replaceState(state, null, url);
};


/**
 * Move back in the history, by an optional number of `steps`.
 *
 * @param {Number} steps (optional)
 */

exports.back =
exports.backward = function (steps) {
  steps || (steps = 1);
  window.history.go(-1 * steps);
};


/**
 * Move forward in the history, by an optional number of `steps`.
 *
 * @param {Number} steps (optional)
 */

exports.forward = function (steps) {
  steps || (steps = 1);
  window.history.go(steps);
};
});
require.register("segmentio-ware/lib/index.js", function(exports, require, module){

/**
 * Expose `Ware`.
 */

module.exports = Ware;

/**
 * Initialize a new `Ware` manager.
 */

function Ware () {
  if (!(this instanceof Ware)) return new Ware();
  this.fns = [];
}

/**
 * Use a middleware `fn`.
 *
 * @param {Function} fn
 * @return {Ware}
 */

Ware.prototype.use = function (fn) {
  this.fns.push(fn);
  return this;
};

/**
 * Run through the middleware with the given `args` and optional `callback`.
 *
 * @param {Mixed} args...
 * @param {Function} callback (optional)
 * @return {Ware}
 */

Ware.prototype.run = function () {
  var fns = this.fns;
  var i = 0;
  var last = arguments[arguments.length - 1];
  var callback = 'function' == typeof last ? last : null;
  var args = callback
    ? [].slice.call(arguments, 0, arguments.length - 1)
    : [].slice.call(arguments);

  function next (err) {
    var fn = fns[i++];
    if (!fn) return callback && callback.apply(null, [err].concat(args));

    if (fn.length < args.length + 2 && err) return next(err);
    if (fn.length == args.length + 2 && !err) return next();

    var arr = [].slice.call(args);
    if (err) arr.unshift(err);
    arr.push(next);
    fn.apply(null, arr);
  }

  next();
  return this;
};
});
require.register("timoxley-next-tick/index.js", function(exports, require, module){
"use strict"

if (typeof setImmediate == 'function') {
  module.exports = function(f){ setImmediate(f) }
}
// legacy node.js
else if (typeof process != 'undefined' && typeof process.nextTick == 'function') {
  module.exports = process.nextTick
}
// fallback for other environments / postMessage behaves badly on IE8
else if (typeof window == 'undefined' || window.ActiveXObject || !window.postMessage) {
  module.exports = function(f){ setTimeout(f) };
} else {
  var q = [];

  window.addEventListener('message', function(){
    var i = 0;
    while (i < q.length) {
      try { q[i++](); }
      catch (e) {
        q = q.slice(i);
        window.postMessage('tic!', '*');
        throw e;
      }
    }
    q.length = 0;
  }, true);

  module.exports = function(fn){
    if (!q.length) window.postMessage('tic!', '*');
    q.push(fn);
  }
}

});
require.register("yields-prevent/index.js", function(exports, require, module){

/**
 * prevent default on the given `e`.
 * 
 * examples:
 * 
 *      anchor.onclick = prevent;
 *      anchor.onclick = function(e){
 *        if (something) return prevent(e);
 *      };
 * 
 * @param {Event} e
 */

module.exports = function(e){
  e = e || window.event
  return e.preventDefault
    ? e.preventDefault()
    : e.returnValue = false;
};

});
require.register("yields-stop/index.js", function(exports, require, module){

/**
 * stop propagation on the given `e`.
 * 
 * examples:
 * 
 *      anchor.onclick = require('stop');
 *      anchor.onclick = function(e){
 *        if (!some) return require('stop')(e);
 *      };
 * 
 * 
 * @param {Event} e
 */

module.exports = function(e){
  e = e || window.event;
  return e.stopPropagation
    ? e.stopPropagation()
    : e.cancelBubble = true;
};

});
require.register("ianstormtaylor-router/lib/context.js", function(exports, require, module){

var history = require('history');
var querystring = require('querystring');


/**
 * Expose `Context`.
 */

module.exports = Context;


/**
 * Initialize a new `Context`.
 *
 * @param {String} path
 */

function Context (path) {
  this.path = path || '';
  this.params = [];
  this.state = history.state() || {};
  this.query = this.path.indexOf('?')
    ? querystring.parse(this.path.split('?')[1])
    : {};
}
});
require.register("ianstormtaylor-router/lib/index.js", function(exports, require, module){

var bind = require('event').bind;
var Context = require('./context');
var history = require('history');
var link = require('link-delegate');
var prevent = require('prevent');
var Route = require('./route');
var stop = require('stop');
var tick = require('next-tick');
var url = require('url');

/**
 * Expose `Router`.
 */

module.exports = exports = Router;

/**
 * Expose `Route`.
 */

exports.Route = Route;

/**
 * Expose `Context`.
 */

exports.Context = Context;

/**
 * Initialize a new `Router`.
 */

function Router () {
  this.routes = [];
  this.bind();
}

/**
 * Use the given `plugin`.
 *
 * @param {Function} plugin
 * @return {Router}
 */

Router.prototype.use = function (plugin) {
  plugin(this);
  return this;
};

/**
 * Attach a route handler.
 *
 * @param {String} path
 * @param {Functions...} (optional)
 * @return {Router}
 */

Router.prototype.on = function (path) {
  var route = this._route = new Route(path);
  var fns = [].slice.call(arguments, 1);
  this.in.apply(this, fns);
  this.routes.push(route);
  return this;
};

/**
 * Add `in` middleware for the current route.
 *
 * @param {Functions...}
 */

Router.prototype.in = function () {
  return this.add('in', [].slice.call(arguments));
};

/**
 * Add `out` middleware for the current route.
 *
 * @param {Functions...}
 */

Router.prototype.out = function () {
  return this.add('out', [].slice.call(arguments));
};

/**
 * Trigger a route at `path`.
 *
 * @param {String} path
 * @return {Router}
 */

Router.prototype.dispatch = function (path) {
  var context = this.context(path);
  var route = this._route;
  if (route && context.previous) route.run('out', context.previous);

  var routes = this.routes;
  for (var i = 0, l = routes.length; i < l; i++) {
    routes[i].run('in', context);
  }

  return this;
};

/**
 * Dispatch a new `path` and push it to the history, or use the current path.
 *
 * @param {String} path (optional)
 * @param {Object} state (optional)
 * @return {Router}
 */

Router.prototype.start =
Router.prototype.go = function (path, state) {
  if (!path) {
    path = location.pathname + location.search;
  } else {
    this.push(path, state);
  }

  this.dispatch(path);
  return this;
};

/**
 * Start the router and listen for link clicks relative to an optional `path`.
 * You can optionally set `start` to false to manage the first dispatch yourself.
 *
 * @param {String} path
 * @param {Boolean} start
 * @return {Router}
 */

Router.prototype.listen = function (path, start) {
  if ('boolean' == typeof path) {
    start = path;
    path = null;
  }

  if (start || start === undefined) this.start();

  var self = this;
  link(function (e) {
    var el = e.delegateTarget;
    var href = el.href;
    if (!el.hasAttribute('href') || !routable(href, path)) return;
    prevent(e);
    stop(e);
    var parsed = url.parse(href);
    self.go(parsed.pathname);
  });

  return this;
};

/**
 * Push a new `path` to the browsers history.
 *
 * @param {String} path
 * @param {Object} state (optional)
 * @return {Router}
 */

Router.prototype.push = function (path, state) {
  history.push(path, state);
  return this;
};

/**
 * Replace the current path in the browsers history.
 *
 * @param {String} path
 * @param {Object} state (optional)
 * @return {Router}
 */

Router.prototype.replace = function (path, state) {
  history.replace(path, state);
  return this;
};

/**
 * Bind to `popstate` so that the router follow back events. Bind after the
 * document has loaded, and after an additional tick because some browsers
 * trigger a `popstate` event when the page first loads.
 *
 * @api private
 */

Router.prototype.bind = function () {
  var self = this;
  setTimeout(function () {
    bind(window, 'popstate', function (e) {
      self.go();
    });
  }, 2000);
};

/**
 * Add `type` middleware `fns` to the current route.
 *
 * @param {String} type
 * @param {Array of Functions} fns
 * @return {Router}
 * @api private
 */

Router.prototype.add = function (type, fns) {
  var route = this._route;
  if (!route) throw new Error('Must define a route first.');
  for (var i = 0; i < fns.length; i++) route[type](fns[i]);
  return this;
};

/**
 * Generate a new context object for a given `path`.
 *
 * @param {String} path
 * @return {Context}
 * @api private
 */

Router.prototype.context = function (path) {
  var previous = this._context;
  var context = this._context = new Context(path);
  context.previous = previous;
  return context;
};

/**
 * Check if a given `href` is routable under `path`.
 *
 * @param {String} href
 * @return {Boolean}
 */

function routable (href, path) {
  if (!path) return true;
  var parsed = url.parse(href);
  if (parsed.pathname.indexOf(path) === 0) return true;
  return false;
}

});
require.register("ianstormtaylor-router/lib/route.js", function(exports, require, module){

var regexp = require('path-to-regexp');
var Ware = require('ware');

/**
 * Expose `Route`.
 */

module.exports = Route;

/**
 * Initialize a new `Route` with the given `path`.
 *
 * @param {String} path
 */

function Route (path) {
  this.path = path;
  this.keys = [];
  this.regexp = regexp(path, this.keys);
  this._in = new Ware();
  this._out = new Ware();
}

/**
 * Use `in` middleware `fn`.
 *
 * @param {Function} fn
 * @return {Route}
 */

Route.prototype.in = function (fn) {
  this._in.use(this.middleware(fn));
  return this;
};

/**
 * Use `out` middleware `fn`.
 *
 * @param {Function} fn
 * @return {Route}
 */

Route.prototype.out = function (fn) {
  this._out.use(this.middleware(fn));
  return this;
};

/**
 * Run middleware of `type` with `context`.
 *
 * @param {String} type ('in' or 'out')
 * @param {Context} context
 * @return {Route}
 */

Route.prototype.run = function (type, context) {
  var ware = this['_' + type];
  ware.run(context);
  return this;
};

/**
 * Check if the route matches a given `path`, adding matches into `params`.
 *
 * @param {String} path
 * @param {Array} params
 * @return {Boolean}
 */

Route.prototype.match = function (path, params) {
  var keys = this.keys;
  var pathname = path.split('?')[0];
  var m = this.regexp.exec(pathname);
  if (!m) return false;

  for (var i = 1, len = m.length; i < len; ++i) {
    var key = keys[i - 1];
    var val = 'string' == typeof m[i] ? decodeURIComponent(m[i]) : m[i];
    if (key) params[key.name] = val;
    params.push(val);
  }

  return true;
};

/**
 * Return route middleware with the given `fn`.
 *
 * @param {Function} fn
 * @return {Function}
 * @api private
 */

Route.prototype.middleware = function (fn) {
  var self = this;
  var match = function (context) {
    return self.match(context.path, context.params);
  };

  switch (fn.length) {
    case 3: return function (err, ctx, next) { match(ctx) ? fn(err, ctx, next) : next(); };
    case 2: return function (ctx, next) { match(ctx) ? fn(ctx, next) : next(); };
    default: return function (ctx, next) { if (match(ctx)) fn(ctx); next(); };
  }
};
});
require.register("aheckmann-sliced/lib/sliced.js", function(exports, require, module){

/**
 * An Array.prototype.slice.call(arguments) alternative
 *
 * @param {Object} args something with a length
 * @param {Number} slice
 * @param {Number} sliceEnd
 * @api public
 */

module.exports = function (args, slice, sliceEnd) {
  var ret = [];
  var len = args.length;

  if (0 === len) return ret;

  var start = slice < 0
    ? Math.max(0, slice + len)
    : slice || 0;

  if (sliceEnd !== undefined) {
    len = sliceEnd < 0
      ? sliceEnd + len
      : sliceEnd
  }

  while (len-- > start) {
    ret[len - start] = args[len];
  }

  return ret;
}


});
require.register("aheckmann-sliced/index.js", function(exports, require, module){
module.exports = exports = require('./lib/sliced');

});
require.register("router/index.js", function(exports, require, module){

/**
 * Module dependencies.
 */

var Router = require('router');
var slice = require('sliced');
var router = new Router();

/**
 * Exports
 *
 * @type {Function}
 */

module.exports = function (View) {
  /**
   * Container where templates is going in.
   *
   * @type {String}
   */

  var mount;

  /**
   * Add `view` directive.
   */

  View.directive('view', function (view, el, attr) {
    mount = el;
  });

  View.on('construct', function (view) {
    /**
     * Add route handler.
     *
     * @param {String} route (optional)
     * @param {String | Function} template | Custom Function
     * @return {View}
     */

    view.route = function (route, cb) {
      var args = slice(arguments);

      if(args.length !== 2) {
        cb = route;
        route = '/';
      }

      router.on(route, function (context, params) {
        if (typeof cb != 'function') {
          var el = cb;
          mount.innerHTML = el;
        } else cb();
      });

      return view;
    };

    /**
     * Listens for click events and dispatches a `route`
     *
     * @param {String} path (optional)
     * @return {view}
     */

    view.listen = function (path) {
      router.listen(path);
      return view;
    };
  })
};
});






















require.alias("ianstormtaylor-router/lib/context.js", "router/deps/router/lib/context.js");
require.alias("ianstormtaylor-router/lib/index.js", "router/deps/router/lib/index.js");
require.alias("ianstormtaylor-router/lib/route.js", "router/deps/router/lib/route.js");
require.alias("ianstormtaylor-router/lib/index.js", "router/deps/router/index.js");
require.alias("ianstormtaylor-router/lib/index.js", "router/index.js");
require.alias("component-event/index.js", "ianstormtaylor-router/deps/event/index.js");

require.alias("component-link-delegate/index.js", "ianstormtaylor-router/deps/link-delegate/index.js");
require.alias("component-link-delegate/index.js", "ianstormtaylor-router/deps/link-delegate/index.js");
require.alias("component-delegate/index.js", "component-link-delegate/deps/delegate/index.js");
require.alias("discore-closest/index.js", "component-delegate/deps/closest/index.js");
require.alias("discore-closest/index.js", "component-delegate/deps/closest/index.js");
require.alias("component-matches-selector/index.js", "discore-closest/deps/matches-selector/index.js");
require.alias("component-query/index.js", "component-matches-selector/deps/query/index.js");

require.alias("discore-closest/index.js", "discore-closest/index.js");
require.alias("component-event/index.js", "component-delegate/deps/event/index.js");

require.alias("component-url/index.js", "component-link-delegate/deps/url/index.js");

require.alias("component-link-delegate/index.js", "component-link-delegate/index.js");
require.alias("component-path-to-regexp/index.js", "ianstormtaylor-router/deps/path-to-regexp/index.js");

require.alias("component-querystring/index.js", "ianstormtaylor-router/deps/querystring/index.js");
require.alias("component-trim/index.js", "component-querystring/deps/trim/index.js");

require.alias("component-url/index.js", "ianstormtaylor-router/deps/url/index.js");

require.alias("ianstormtaylor-history/index.js", "ianstormtaylor-router/deps/history/index.js");

require.alias("segmentio-ware/lib/index.js", "ianstormtaylor-router/deps/ware/lib/index.js");
require.alias("segmentio-ware/lib/index.js", "ianstormtaylor-router/deps/ware/index.js");
require.alias("segmentio-ware/lib/index.js", "segmentio-ware/index.js");
require.alias("timoxley-next-tick/index.js", "ianstormtaylor-router/deps/next-tick/index.js");

require.alias("yields-prevent/index.js", "ianstormtaylor-router/deps/prevent/index.js");

require.alias("yields-stop/index.js", "ianstormtaylor-router/deps/stop/index.js");

require.alias("ianstormtaylor-router/lib/index.js", "ianstormtaylor-router/index.js");
require.alias("aheckmann-sliced/lib/sliced.js", "router/deps/sliced/lib/sliced.js");
require.alias("aheckmann-sliced/index.js", "router/deps/sliced/index.js");
require.alias("aheckmann-sliced/index.js", "sliced/index.js");
