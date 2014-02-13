
# Router

Basic routing with [ripple](https://github.com/ripplejs/ripple).

_Note: I haven't added tests for this yet._

## Installation

  Install with [component(1)](http://component.io):

  ```
  $ component install queckezz/ripple-router
  ```

## Example

```html
<div>
  <nav>
    <ul>
      <li><a href='/'>Home</a></li>
      <li><a href='/projects'>Projects</a></li>
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
var router = require('router');

var App = ripple()
  // Use the plugin
  .use(router)
  .compile(template);

var el = document.body.firstElementChild;

var app = new App()
  .route('<div class="home"><p>home</p></div>')
  .route('/projects', projects)
  .route('/login', '<div class="login"><p>login</p></div>')
  .listen();

app.mount(el)

// Custom handler for `/projects`
function projects () {
  console.log('projects');
}
```

## API

This module adds two new methods to the [View](https://github.com/ripplejs/view) object:

### #route([path,] template | fn)

Bind `fn` to `path`.

* `path`: path relative to the url. Defaults to `/` when nothing is set
* `fn`: function to be executed when a path is dispatched
* `template` If you define a template instead of a function, it will directly append your template to any element with a `view` attribute on it

### #listen(path)

* `path`: Only listen on a specific route

Start and listen for link clicks that the router should handle.
