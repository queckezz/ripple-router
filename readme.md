
# ripple-router

Basic router for [ripple](https://github.com/ripplejs/ripple). Works best together with [ianstormtaylor/router](https://github.com/ianstormtaylor/router).

## Installation

  ```bash
  $ component install queckezz/ripple-router
  ```

## Example

```html
<div>
  <nav>
    <ul>
      <li><a href='/'>Home</a></li>
      <li><a href='/login'>Login</a></li>
    </ul>
  </nav>

  <!-- Templates will be automatically injected
  here when a path is dispatched. -->
  <main view>
  </main>
</div>
```

```js
var template = require('./template.html');
var ripple = require('ripple');
var Router = require('router');
var view = require('view');

/**
 * App.
 */

var App = ripple(template)
  .use(view());

/**
 * Login.
 * Should be of course live in another module.
 */

var Login = ripple(template);

/**
 * Setup routes.
 */

var router = new Router()
  .on('/', app.view(Login))

```

## API

### #view(View)

replace a node with a attribute of `view` with `View`'s template.

* `View`: A ripple view.