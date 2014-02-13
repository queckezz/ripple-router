
/**
 * Module dependencies.
 */

var Router = require('router');
var slice = require('sliced');
var router = new Router();

/**
 * Container where templates is going in.
 *
 * @type {String}
 */

var mount;

/**
 * Exports
 *
 * @type {Function}
 */

module.exports = function (Ripple) {

  /**
   * Add `view` directive.
   */

  Ripple.attribute('view', function (view, el, attr) {
    mount = el;
  })

  Ripple.on('construct', function (View) {

    /**
     * Add route handler.
     *
     * @param {String} route (optional)
     * @param {String | Function} template | Custom Function
     * @return {View}
     */

    View.route = function (route, cb) {
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

      return View;
    }

    /**
     * Listens for click events and dispatches a `route`
     *
     * @return {View}
     */

    View.listen = function () {
      router.listen();
      return View;
    }
  })
}