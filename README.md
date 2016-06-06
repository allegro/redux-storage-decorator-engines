# [redux-storage-decorator-engines][]

Composing decorator for [redux-storage][] to use different storage types like [redux-storage-engine-localstorage][] or [redux-storage-engine-sessionstorage][] including custom engines (i.e. to load information from cookies) in a single application.

## Installation

    npm install --save redux-storage-decorator-engines

## Usage

Along with [redux-storage-decorator-filter][] you can define different persistence policy for each part of a state. Simply create the stores as you normally would do and wrap them with the decorator. 
    
```js
import engines from 'redux-storage-decorator-engines';
import filter from 'redux-storage-decorator-filter';
import createLocalStorageEngine from 'redux-storage-engine-localstorage';
import createSessionStorageEngine from 'redux-storage-engine-sessionstorage';

const localStorageEngine = filter(createLocalStorageEngine('redux'), ['todos']);
const sessionStorageEngine = filter(createSessionStorageEngine('redux'), ['visibilityFilter']);

const storageEngine = engines([
  localStorageEngine,
  sessionStorageEngine
]);
```
    
To include information from a cookie in a redux state for later easy access simply provide a custom storage engine:
    
```js
import Cookies from 'js-cookie';

const cookieStorage = {
  load() {
    const state = {
      cookie: Cookies.get('cookie')
    };
    return Promise.resolve(state);
  },
  save() {
    return Promise.resolve();
  }
};

const storageEngine = engines([
  localStorageEngine,
  sessionStorageEngine,
  cookieStorage
]);
```

**NOTE**: If the same state key is loaded from more than one storage engine an application state upon load is not deterministic. A final state depends on the actual order of the loads. In such a case a warning message is emitted on non-production environments (an environment is considered a production if *NODE_ENV* is set to *production*).

## License

[redux-storage-decorator-engines][] is published under [Apache License 2.0](http://www.apache.org/licenses/LICENSE-2.0).

  [redux-storage-decorator-engines]: https://github.com/allegro/redux-storage-decorator-engines
  [redux-storage]: https://github.com/michaelcontento/redux-storage
  [redux-storage-engine-localStorage]: https://github.com/michaelcontento/redux-storage-engine-localstorage
  [redux-storage-engine-sessionstorage]: https://github.com/bmatcuk/redux-storage-engine-sessionstorage
  [redux-storage-decorator-filter]: https://github.com/michaelcontento/redux-storage-decorator-filter
