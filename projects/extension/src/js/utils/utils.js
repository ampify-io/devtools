import { parseDotEnv } from './dotenv';

export const getDotEnv = () => {
  return new Promise(resolve => {
    chrome.runtime.getPackageDirectoryEntry(root => {
      root.getFile('.env', {}, fileEntry => {
        fileEntry.file(file => {
          const reader = new FileReader();
          
          reader.onloadend = function(e) {
            resolve(parseDotEnv(this.result));
          };
          reader.readAsText(file);
        });
      }, err => {
        resolve({});
      });
    });
  });
}

export const addInlineScript = js => {
  const script = document.createElement('script');
  const content = document.createTextNode(`(() => {\n${js}\n})();`);

  script.appendChild(content);
  document.head.appendChild(script);

  setTimeout(() => {
    script.remove();
  }, 10);
};

//<meta id="viewport-meta" name="viewport" content="width=320, user-scalable=no">
//viewport meta tag with fixed width forces the screen width to remain 320 both in iphone x(large device) and iphone 5 (small device)
//this makes the images algo useless
//we are fixing it by forcing the body to the the correct width and reseting it when done.
export const sanitaizeViewportMeta = step => {
  const getMetaViewportWidth = () => {
    if (store.metaViewportWidth) {
      return true;
    }

    const viewportMeta = document.querySelector('meta[name="viewport"]');

    if (!viewportMeta) {
      return false;
    }

    const content = viewportMeta.getAttribute('content');
    const rxWidth = /width\=(\d+)/;

    if (!rxWidth.test(content)) {
      return false;
    }

    store.metaViewportWidth = RegExp.$1 * 1;
    store.originalBodyWidth = document.body.style.width;

    return true;
  };

  if (step === 'start' && getMetaViewportWidth()) {
    document.body.style.width = `${window.outerWidth}px`;
  }

  if (step === 'end' && getMetaViewportWidth()) {
    document.body.style.width = store.originalBodyWidth;
  }
};

export const insertOverlay = () => {
  const div = document.createElement('div');

  div.innerHTML = 'Ampifying...';
  div.className = 'ampify-devtools-overlay';

  document.body.prepend(div);
}

export const removeOverlay = () => {
  const overlay = document.querySelector('.ampify-devtools-overlay');

  if (overlay) { overlay.remove(); }
}

export const ampifyError = (err, subs = {}) => {
  const overlay = document.querySelector('.ampify-devtools-overlay');
  
  for (let [key, value] of Object.entries(subs)) {
    err = err.replace(`[@${key.toUpperCase()}]`, value);
  }

  if (overlay) { 
    overlay.classList.add('ampify-devtools-error');
    overlay.innerHTML = err.replace(/\n/g, '<br>');
  }

  try {
    ampifyError.callbacks.onAmpifyComplete();
  } catch (e) {}

  console.error(err);

  return;
}