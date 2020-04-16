import {
  addInlineScript,
  insertOverlay,
  removeOverlay,
  ampifyError,
} from './utils/utils';
import ERRORS from './utils/errors';

const callbacks = {};
const Config = {};

ampifyError.callbacks = callbacks;

let Settings;

callbacks.autoInc = 0;
callbacks.genCallback = () => {
  return `callback_${++callbacks.autoInc}`;
};

const init = () => {
  sendToBackground({ action: 'get-config' }).then((data) => {
    Object.assign(Config, data);
  });
};

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action == 'start-ampify') {
    startAmpify();
  } else if (request.action == 'ampify-complete') {
    callbacks.onAmpifyComplete = sendResponse;

    return true;
  } else if (request.action == 'response-callback') {
    callbacks[request.id](request.data);
  }
});

export const fetchFiles = async (...args) => {
  const files = [];

  for (const item of args) {
    const file = typeof item == 'string' ? item : item[0];
    const cb = typeof item == 'string' ? (a) => a : item[1];

    const content = await sendToBackground({
      action: 'ajax-request',
      method: 'get',
      url: file,
    });

    files.push(cb(content));
  }

  return files.join('\n');
};

export const sendToBackground = (data) => {
  return new Promise((resolve) => {
    data.cbid = callbacks.genCallback();

    callbacks[data.cbid] = (data) => {
      resolve(data);
    };

    chrome.runtime.sendMessage(data);
  });
};

const getSettings = () => {
  return new Promise((resolve) => {
    chrome.storage.local.get(['settings'], function (data) {
      resolve(data.settings);
    });
  });
};

const requestEmulateDevice = async (device) => {
  await sendToBackground({
    action: 'emulate-device',
    device,
  });

  window.postMessage(
    JSON.stringify({ action: 'emulate-device-complete' }),
    '*',
  );
};

window.addEventListener('message', (e) => {
  try {
    const data = JSON.parse(e.data);

    if (data.action == 'ampify-algo') {
      callbacks.onAmpifyComplete();

      generateAMP(data);
    } else if (data.action == 'ampify-complete') {
      callbacks.onAmpifyComplete();

      removeOverlay();
    } else if (data.action == 'emulate-device') {
      if (!Settings.isLocalMode) {
        requestEmulateDevice(data.device);
      } else {
        window.postMessage(
          JSON.stringify({ action: 'emulate-device-complete' }),
          '*',
        );
      }
    }
  } catch (e) {}
});

const generateAMP = async ({ url, html, cssFilter, settings }) => {
  insertOverlay();

  const res = await reqAmpify({ url, html, cssFilter, settings });

  if (!res) {
    return;
  }

  const save = await reqSaveAMPResult(res);

  addInlineScript(`window.latest_ampify = ${JSON.stringify({ amp: res })}`);

  if (!save) {
    return;
  }

  sendToBackground({
    action: 'open-ampify-tab',
    url: save.url + '#development=1',
  });

  if (Settings.isReload) {
    sendToBackground({ action: 'reload' });
  } else {
    console.log('Ampify Completed: ', save.url);

    removeOverlay();
  }
};

const reqAmpify = async ({ url, html, cssFilter, settings }) => {
  const res = await sendToBackground({
    action: 'ajax-request',
    url: Config.AMPIFY_PATH,
    data: JSON.stringify({
      url,
      html,
      cssFilter,
      css: {
        short: !!Settings.isMinify && !settings.isDisableMinify,
      },
    }),
  });

  if (!res) {
    return ampifyError(ERRORS.AMPIFY_ALGO_ERROR);
  }

  return JSON.parse(res).html;
};

const reqSaveAMPResult = async (html) => {
  const done = await sendToBackground({
    action: 'ajax-request',
    url: Config.AMPIFY_LOCAL_SAVE,
    data: html,
    contentType: 'text/plain',
  });

  if (!done) {
    return ampifyError(ERRORS.AMPIFY_LOCAL_SAVE);
  }

  try {
    return JSON.parse(done);
  } catch (e) {
    console.error(e);

    return null;
  }
};

const startAmpify = async () => {
  Settings = await getSettings();

  let devServPath = Settings.ampifyDevServ || Config.AMPIFY_LOCAL_DEV_SERV,
    plugins = [];

  if (Settings.isRunPlugins) {
    const jsonStr = await sendToBackground({
      method: 'get',
      action: 'ajax-request',
      url: `${devServPath}/ampify.json`,
    });

    if (!jsonStr) {
      return ampifyError(ERRORS.AMPIFY_LOCAL_DEV_SERV);
    }

    const json = JSON.parse(jsonStr);
    plugins = (json.plugins || []).map(({ name }) => {
      return `${devServPath}/${name}.js`;
    });

    if (json.dev && json.dev.paths && json.dev.paths.length) {
      plugins.push(...json.dev.paths);
    }

    addInlineScript(`window.__ampify__settings = ${JSON.stringify(Settings)};`);
    addInlineScript(`window.__ampify__json = ${jsonStr};`);

    for (const plugin of plugins) {
      const js = await fetchFiles(`${plugin}?r=${Math.random()}`);

      if (!js) {
        return ampifyError(ERRORS.AMPIFY_LOCAL_PLUGIN_NOT_FOUND, {
          file: plugin,
        });
      }

      addInlineScript(js);
    }
  }

  const scripts = await fetchFiles(
    chrome.runtime.getURL(`js/ampify.js?r=${Math.random()}`),
  );

  addInlineScript(scripts);
};

init();
