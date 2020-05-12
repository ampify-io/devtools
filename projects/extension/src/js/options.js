import Config from './Config';

const Settings = {};

Settings.init = () => {
  Settings.message = document.querySelector('#message');
  Settings.isMinify = document.querySelector('#is-minify');
  Settings.isAmpify = document.querySelector('#is-ampify');
  Settings.isReload = document.querySelector('#is-reload');
  Settings.isRunPlugins = document.querySelector('#is-run-plugins');
  Settings.isRunPluginsOnly = document.querySelector('#is-plugins-only');
  Settings.isRunPluginsOnlyContainer = document.querySelector(
    '#is-plugins-only-container',
  );
  Settings.blockList = document.querySelector('#block-list');

  Settings.devServBtn = document.querySelector('#add-url-btn');
  Settings.devServInp = document.querySelector('#add-url-inp');
};

Settings.populate = ({
  isMinify,
  isAmpify,
  isReload,
  isRunPlugins,
  isRunPluginsOnly,
  blockList,
  ampifyDevServList,
  ampifyDevServ,
}) => {
  Settings.isMinify.checked = isMinify;
  Settings.isAmpify.checked = isAmpify;
  Settings.isReload.checked = isReload;
  Settings.isRunPlugins.checked = isRunPlugins;
  Settings.isRunPluginsOnly.checked = isRunPluginsOnly;

  if (isRunPlugins) Settings.isRunPluginsOnlyContainer.hidden = false;

  blockList && (Settings.blockList.value = blockList);

  Settings.populateampifyDevServ({ ampifyDevServList, ampifyDevServ });
};

Settings.initEvents = () => {
  Settings.isMinify.addEventListener('change', (e) =>
    Settings.updateSettings({ isMinify: !!e.target.checked }),
  );
  Settings.isAmpify.addEventListener('change', (e) =>
    Settings.updateSettings({ isAmpify: !!e.target.checked }),
  );
  Settings.isReload.addEventListener('change', (e) =>
    Settings.updateSettings({ isReload: !!e.target.checked }),
  );
  Settings.isRunPlugins.addEventListener('change', (e) => {
    Settings.updateSettings({ isRunPlugins: !!e.target.checked });

    Settings.isRunPluginsOnlyContainer.hidden = !e.target.checked;
  });
  Settings.isRunPluginsOnly.addEventListener('change', (e) =>
    Settings.updateSettings({ isRunPluginsOnly: !!e.target.checked }),
  );

  Settings.blockList.addEventListener('change', (e) =>
    Settings.updateSettings({ blockList: e.target.value }),
  );

  Settings.devServBtn.addEventListener('click', Settings.addampifyDevServItem);
};

Settings.populateampifyDevServ = ({ ampifyDevServList = [], ampifyDevServ }) => {
  const container = document.querySelector('#ampify-dev-serv-urls');
  const activeUrl = ampifyDevServ || Config.AMPIFY_LOCAL_DEV_SERV;
  let html = '';

  html += `<div>
    <input type="radio" name="ampify-json" value="" checked>
    <span>${Config.AMPIFY_LOCAL_DEV_SERV} (default)<span>
  </div>`;

  ampifyDevServList.forEach((url) => {
    html += `<div class="item">
      <input type="radio" name="ampify-json" value="${url}" ${
      activeUrl === url ? 'checked' : ''
    }>
      <button class="close" data-url="${url}" ${
      activeUrl === url ? 'disabled' : ''
    }>×</button>
      <span class="text">${url}<span>
    </div>`;
  });

  container.innerHTML = html;

  container
    .querySelectorAll('.close')
    .forEach((btn) =>
      btn.addEventListener('click', Settings.removeampifyDevServItem),
    );
  container
    .querySelectorAll('[name=ampify-json]')
    .forEach((inp) => inp.addEventListener('change', Settings.setampifyDevServ));
};

Settings.setampifyDevServ = (e) => {
  const url = e.target.value;

  Settings.updateSettings({ ampifyDevServ: url }, () => {
    Settings.populateampifyDevServ(Settings.data);
  });
};

Settings.removeampifyDevServItem = (e) => {
  const url = e.target.dataset['url'];

  if (confirm(`Remove ${url}?`)) {
    const urls = Settings.data.ampifyDevServList.filter((u) => u !== url);

    Settings.updateSettings({ ampifyDevServList: urls }, () => {
      Settings.populateampifyDevServ(Settings.data);
    });
  }
};

Settings.addampifyDevServItem = () => {
  const url = Settings.devServInp.value;
  const urls = Settings.data.ampifyDevServList || [];

  if (!url) {
    return;
  }
  if (urls.includes(url)) {
    return alert(`"${url}" url is already added`);
  }

  urls.push(url.trim());

  Settings.updateSettings({ ampifyDevServList: urls }, () => {
    Settings.devServInp.value = '';

    Settings.populateampifyDevServ(Settings.data);
  });
};

Settings.updateSettings = (update, callback) => {
  const data = Object.assign(Settings.data, update);

  chrome.storage.local.set({ settings: data }, function () {
    Settings.message.innerHTML = 'Successfully saved!';

    if (Settings.timeout) {
      clearTimeout(Settings.timeout);
    }

    Settings.timeout = setTimeout(() => {
      Settings.message.innerHTML = '';
    }, 2000);

    if (callback) {
      callback();
    }
  });

  console.log('data', data);
};

Settings.storage = () => {
  return new Promise((resolve) => {
    chrome.storage.local.get(['settings'], function (data) {
      Settings.data = data.settings;

      resolve();
    });
  });
};

document.addEventListener('DOMContentLoaded', async () => {
  Settings.init();

  await Settings.storage();

  Settings.populate(Settings.data);

  Settings.initEvents();

  document.querySelector('#my-button').addEventListener('click', function(event) {
    // Permissions must be requested from inside a user gesture, like a button's
    // click handler.
    chrome.permissions.request({
      permissions: [
        "webRequest",
        "webRequestBlocking",
      ],
      origins: ['<all_urls>']
    }, function(granted) {
      // The callback argument will be true if the user granted the permissions.
      console.log(granted);
      /*if (granted) {
        doSomething();
      } else {
        doSomethingElse();
      }*/
    });
  });
});
