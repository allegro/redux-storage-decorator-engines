export default (engines) => ({
  load() {
    const state = {};
    const loads = engines.map(engine => engine.load().then((partialState => {
      Object.entries(partialState).forEach(([key, value]) => {
        if (process.env.NODE_ENV !== 'production') {
          if (state[key]) {
            console.warn( // eslint-disable-line no-console
              `[redux-storage-decorator-engines] "${key}" state found in more than one storage`
            );
          }
        }
        state[key] = value;
      });
    })));
    return Promise.all(loads).then(() => state);
  },
  save(state) {
    return Promise.all(engines.map(engine => engine.save(state)));
  }
});
