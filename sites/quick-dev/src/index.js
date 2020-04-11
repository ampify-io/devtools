export default () => {
  return new Promise((resolve) => {
    async function importAll(r) {
      for (const key of r.keys()) {
        const project = key.replace(/((^\.\/)|(\.js$))/g, '');

        if (location.hostname.includes(project)) {
          const response = await r(key).default();

          return resolve(response);
        }
      }

      return resolve();
    }

    importAll(require.context('./active', true, /\.js$/));
  });
};
