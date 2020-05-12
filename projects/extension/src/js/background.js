import Config from './Config';
import { getDotEnv } from './utils/utils';

let lastTabId = null;
let Settings;

const initConfig = async () => {
  const env = await getDotEnv();

  Object.assign(Config, env);
};

const getConfig = () => {
  return Config;
};

const init = async () => {
  //init initial settings
  chrome.storage.local.get(['settings'], function (data) {
    if (!data.settings) {
      chrome.storage.local.set({
        settings: {
          isMinify: true,
          isParse: true,
          isAmpify: true,
          isRunPlugins: true,
          isReload: true,
          type: 'ampify',
        },
      });
    }

    Settings = data.settings || {};
  });

  initConfig();
};

const startAmpify = (tabId) => {
  chrome.tabs.insertCSS(tabId, { file: 'css/style.css' });
  chrome.tabs.executeScript(tabId, { file: 'js/content.js' });
};

const ajaxRequest = ({
  contentType = 'text/plain',
  method = 'post',
  data,
  url,
}) => {
  return new Promise((resolve, reject) => {
    const xmlhttp = new XMLHttpRequest(); // new HttpRequest instance
    xmlhttp.open(method, url);
    xmlhttp.setRequestHeader('Content-Type', `${contentType};charset=UTF-8`);
    xmlhttp.addEventListener('load', function () {
      if (this.status === 200) {
        resolve(this.responseText);
      } else {
        reject();
      }
    });
    xmlhttp.addEventListener('error', function (e) {
      reject();
    });
    xmlhttp.send(data);
  });
};

const initBlockUrls = () => {
  chrome.webRequest.onBeforeRequest.addListener(
    function (details) {
      const { blockList = [] } = Settings;

      if (blockList.indexOf(details.url) > -1) {
        return { cancel: true };
      }

      return { cancel: false };
    },
    { urls: ['<all_urls>'] },
    ['blocking'],
  );

  chrome.webRequest.onHeadersReceived.addListener(
    (details) => {
      if (details.tabId == lastTabId) {
        details.responseHeaders = details.responseHeaders.filter((header) => {
          return header.name !== 'Access-Control-Allow-Origin';
        });

        details.responseHeaders.push({
          name: 'Access-Control-Allow-Origin',
          value: '*',
        });
      }

      return { responseHeaders: details.responseHeaders };
    },
    { urls: ['<all_urls>'] },
    ['blocking', 'responseHeaders'],
  );
}

chrome.permissions.contains({
  permissions: ['webRequest', 'webRequestBlocking'],
  origins: ['<all_urls>']
}, granted => {
  if (granted) {
    initBlockUrls();
  }
});

chrome.runtime.onMessage.addListener(async (request, sender, sendResponse) => {
  if (request.action == 'ajax-request') {
    try {
      const data = await ajaxRequest({
        method: request.method,
        url: request.url,
        data: request.data,
        contentType: request.contentType,
      });

      chrome.tabs.sendMessage(sender.tab.id, {
        action: 'response-callback',
        data,
        id: request.cbid,
      });
    } catch (e) {
      chrome.tabs.sendMessage(sender.tab.id, {
        action: 'response-callback',
        id: request.cbid,
      });
    }
  } else if (request.action == 'reload') {
    chrome.tabs.update(sender.tab.id, {
      url: chrome.runtime.getURL(`redirect.html?r=${sender.tab.url}`),
    });
  } else if (request.action == 'get-config') {
    chrome.tabs.sendMessage(sender.tab.id, {
      data: getConfig(),
      action: 'response-callback',
      id: request.cbid,
    });
  } else if (request.action == 'open-ampify-tab') {
    chrome.tabs.query(
      { currentWindow: true, url: request.url.replace(/\#.*/, '') + '*' },
      (tabs) => {
        if (!tabs.length) {
          chrome.tabs.create({ url: request.url, index: sender.tab.index + 1 });
        }
      },
    );
  }
});

chrome.browserAction.onClicked.addListener((tab) => {
  lastTabId = tab.id;

  startAmpify(tab.id);
});

init();
