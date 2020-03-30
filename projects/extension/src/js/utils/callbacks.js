const registeredCallbacks = {};

window.addEventListener('message', e => {
  try {
    const data = JSON.parse(e.data);

    if (data.action == 'receive-css') {
      registeredCallbacks[data.url](data.css);
    } else if (data.action == 'emulate-device-complete') {
      registeredCallbacks['emulate-device']();
    }
  } catch (e) {}
});

export default ({ key, cb }) => {
  registeredCallbacks[key] = cb;
};
