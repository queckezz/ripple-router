
/**
 * Module dependencies.
 */

import empty from 'empty';

/**
 * Exports `route`.
 */

export default route;

/**
 * Simple router for ripple.
 *
 * @param  {Object} View
 */

function route (View) {

  /**
   * Container for views.
   *
   * @type {DOMElement}
   */

  var mount;

  /**
   * Add a directive that searches for a element with
   * a `view` attribute.
   */

  View.directive('view', function () {
    if (mount) throw new Error('There can only be one `view` attr per View');
    mount = this.node;
  })

  /**
   * Switch to `view`.
   *
   * @param  {view} view
   * @return {Function} middleware
   */

  View.prototype.view = function (view) {
    return function () {
      if (!mount) return;
      empty(mount);
      view.appendTo(mount);
    }
  }
}