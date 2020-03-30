import Config from './Config';
import { getDotEnv } from './utils/utils';

let lastTabId = null;
let Settings;

const DEVICES = {
  'IPHONE-5': {
    viewPort: {
      mobile: true,
      width: 320,
      height: 568,
      screenWidth: 320,
      screenHeight: 568,
      deviceScaleFactor: 2,
      fitWindow: true
    },
    userAgent:
      'Mozilla/5.0 (iPhone; CPU iPhone OS 10_3_1 like Mac OS X) AppleWebKit/603.1.30 (KHTML, like Gecko) Version/10.0 Mobile/14E304 Safari/602.1'
  },
  'IPHONE-X': {
    viewPort: {
      mobile: true,
      width: 375,
      height: 812,
      screenWidth: 375,
      screenHeight: 812,
      deviceScaleFactor: 3,
      fitWindow: true
    },
    userAgent:
      'Mozilla/5.0 (iPhone; CPU iPhone OS 10_3_1 like Mac OS X) AppleWebKit/603.1.30 (KHTML, like Gecko) Version/10.0 Mobile/14E304 Safari/602.1'
  }
};

const initConfig = async () => {
  const env = await getDotEnv();

  Object.assign(Config, env);
}

const getConfig = () => {
  return Config;
}

const init = async () => {
  //init initial settings
  chrome.storage.local.get(['settings'], function(data) {
    if (!data.settings) {
      chrome.storage.local.set({
        settings: {
          isMinify: true,
          isParse: true,
          isAmpify: true,
          isRunPlugins: true,
          type: 'ampify'
        }
      });
    }

    Settings = data.settings || {};
  });

  initConfig();
}

const startAmpify = tabId => {
  return chrome.tabs.sendMessage(tabId, { action: 'start-ampify' });
};

const completeAmpify = tabId => {
  return new Promise(resolve => {
    chrome.tabs.sendMessage(tabId, { action: 'ampify-complete' }, async response => {
      resolve();
    });
  });
};

const attachDebugger = tabId => {
  return new Promise(resolve => {
    chrome.debugger.attach(
      {
        tabId
      },
      '1.2',
      resolve
    );
  });
};

const detachDebugger = tabId => {
  return new Promise(resolve => {
    chrome.debugger.detach(
      {
        tabId
      },
      resolve
    );
  });
};

const setDeviceHeader = (tabId, device) => {
  return new Promise(resolve => {
    chrome.debugger.sendCommand(
      {
        tabId
      },
      'Network.setUserAgentOverride',
      {
        userAgent: DEVICES[device].userAgent
      },
      resolve
    );
  });
};

const setDeviceViewPort = (tabId, device) => {
  return new Promise(resolve => {
    chrome.debugger.sendCommand(
      {
        tabId
      },
      'Emulation.setDeviceMetricsOverride',
      DEVICES[device].viewPort,
      resolve
    );
  });
};

const ajaxRequest = ({ contentType = 'application/json', method = 'post' ,data, url }) => {
  return new Promise((resolve, reject) => {
    const xmlhttp = new XMLHttpRequest(); // new HttpRequest instance
    xmlhttp.open(method, url);
    xmlhttp.setRequestHeader('Content-Type', `${contentType};charset=UTF-8`);
    xmlhttp.addEventListener('load', function() {
      if (this.status === 200) {
        resolve(this.responseText);
      } else {
        reject();
      }
    });
    xmlhttp.addEventListener('error', function(e) {
      reject();
    });
    xmlhttp.send(data);
  });
};

chrome.webRequest.onBeforeRequest.addListener(
  function(details) {
    const { blockList = [] } = Settings;

    if (blockList.indexOf(details.url) > -1) {
      return { cancel: true };
    }

    return { cancel: false };
  },
  { urls: ['<all_urls>'] },
  ['blocking']
);

chrome.webRequest.onHeadersReceived.addListener(
  details => {
    if (details.tabId == lastTabId) {
      details.responseHeaders = details.responseHeaders.filter(header => {
        return header.name !== 'Access-Control-Allow-Origin';
      });
  
      details.responseHeaders.push({
        name: 'Access-Control-Allow-Origin',
        value: '*'
      });
    }

    return { responseHeaders: details.responseHeaders };
  },
  { urls: ['<all_urls>'] },
  ['blocking', 'responseHeaders']
);

chrome.runtime.onMessage.addListener(async (request, sender, sendResponse) => {
  if (request.action == 'ajax-request') {
    try {
      const data = await ajaxRequest({
        method: request.method,
        url: request.url,
        data: request.data,
        contentType: request.contentType
      });

      chrome.tabs.sendMessage(sender.tab.id, { action: 'response-callback', data, id: request.cbid });
    } catch (e) {
      chrome.tabs.sendMessage(sender.tab.id, { action: 'response-callback', id: request.cbid }); 
    }
    
  } else if (request.action == 'emulate-device') {
    await setDeviceHeader(sender.tab.id, request.device);
    await setDeviceViewPort(sender.tab.id, request.device);

    chrome.tabs.sendMessage(sender.tab.id, { action: 'response-callback', id: request.cbid });
  } else if (request.action == 'reload') {
    chrome.tabs.update( sender.tab.id, {
      url: chrome.runtime.getURL(`redirect.html?r=${sender.tab.url}`)
    });
  } else if (request.action == 'get-config') {
    chrome.tabs.sendMessage(sender.tab.id, { data: getConfig(), action: 'response-callback', id: request.cbid });
  } else if (request.action == 'open-ampify-tab') {
    chrome.tabs.query({currentWindow: true, url: request.url.replace(/\#.*/, '') + '*'}, tabs => {
      if (!tabs.length) {
        chrome.tabs.create({ url: request.url, index: sender.tab.index + 1 });
      }
    });
  }
});

chrome.browserAction.onClicked.addListener(async tab => {
  lastTabId = tab.id;

  await attachDebugger(tab.id);

  await startAmpify(tab.id);

  await completeAmpify(tab.id);

  await detachDebugger(tab.id);
});

init();