import { injectCss } from './utils/utils';

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const setSmallDevice = async () => {
  document.querySelector(':root').classList.add('ampify-small-device');

  await delay(200);
};

const removeSmallDevice = async () => {
  document.querySelector(':root').classList.remove('ampify-small-device');

  await delay(200);
};

const prepareCSS = () => {
  const sheets = [...document.styleSheets];

  sheets.forEach((sheet) => {
    const node = sheet.ownerNode;

    if (sheet.href) {
      return node.setAttribute('href', sheet.href);
    }

    if (!node.innerText && sheet.cssRules.length) {
      let css = '';

      [...sheet.cssRules].forEach((rule) => {
        css += rule.cssText;
      });

      if (css) {
        const style = document.createElement('style');
        style.appendChild(document.createTextNode(css));

        node.parentElement.insertBefore(style, node);
        node.remove();
      }
    }
  });
};

const prepareHTML = () => {
  const fixRelativePaths = () => {
    const icons = document.querySelectorAll('link[rel=icon]');
    icons.forEach((el) => {
      if (el.href) {
        el.href = new URL(el.href, location).toString();
      }
    });

    const images = document.querySelectorAll('img');
    images.forEach((el) => {
      const src = el.src;

      if (src && /^(?!data:)/.test(src)) {
        el.src = new URL(src, location).toString();
      }
    });

    const links = document.querySelectorAll('a');
    links.forEach((el) => {
      const href = el.getAttribute('href');

      if (!href || /^\#/.test(href)) return;

      try {
        el.href = new URL(href, location).toString();
      } catch (e) {
        //invalid href
      }
    });
  };

  const removeScripts = () => {
    Array.from(document.scripts).forEach((s) => {
      const allowedTypes = [
        'application/json',
        'text/plain',
        'application/ld+json',
      ];
      if (!allowedTypes.includes(s.type)) s.remove();
    });
  };

  const removeLink = (rels = ['preload', 'amphtml']) => {
    Array.from(document.querySelectorAll('link')).forEach((s) => {
      const attr = s.getAttribute('rel');
      if (attr && rels.includes(attr.trim().toLowerCase())) s.remove();
    });
  };

  removeScripts();
  removeLink();
  fixRelativePaths();
};

const setSizing = (size) => {
  const elements = [
    ...document.querySelectorAll(
      'img:not([layout]), iframe:not([layout]), video:not([layout])',
    ),
    ...document.querySelectorAll('[style]:not([layout])'),
  ];

  elements.forEach((el) => {
    const data = {};

    data.w = Math.floor(Math.max(el.clientWidth, el.offsetWidth));
    data.h = Math.floor(Math.max(el.clientHeight, el.offsetHeight));
    data.style = el.getAttribute('style') || '';

    if (el.matches('img') && !el.offsetParent) {
      data.w = Math.max(data.w, el.naturalWidth);
      data.h = Math.max(data.h, el.naturalHeight);
      data.ih = true;
    }

    el.setAttribute(`data-ampify-size-${size}`, JSON.stringify(data));
  });
};

const insertBase = () => {
  const base = document.createElement('base');

  base.href = location.href;

  document.head.prepend(base);
};

const removeContentPolity = () => {
  const meta = document.querySelector(
    'meta[http-equiv=Content-Security-Policy]',
  );

  if (meta) {
    meta.remove();
  }
};

const insertAmpCss = () => {
  injectCss(`
    :root:not(#_) [hidden] {
      display: none !important;
    }
  `);
};

const getHTMLForAmpify = () => {
  insertBase();
  removeContentPolity();

  let html;

  if (document.doctype)
    html = new XMLSerializer().serializeToString(document.doctype);
  if (document.documentElement) html += document.documentElement.outerHTML;

  return html;
};

(async () => {
  const settings = window.__ampify__settings || {};
  const config = window.__ampify__json || {};
  const {
    cssFilter = [],
    plugins = [],
    blockFiles = [],
    waitForElement,
  } = config;
  let finalReplace = {};
  insertAmpCss();

  for (const { name, options = {} } of plugins) {
    const exec = (window[name] && window[name].default) || window[name];
    if (typeof exec !== 'function') continue;

    const { cssIgnore = [], debug = {}, replace = {} } =
      (await exec(options)) || {};
    Object.assign(finalReplace, replace);
    cssFilter.push(...cssIgnore);

    if (debug.convert === false) {
      settings.isRunPluginsOnly = true;
    }
    if (debug.minify === false) {
      settings.isDisableMinify = true;
    }
  }

  console.log('[Ampify DevTool] - Ignore Css: ', cssFilter);
  console.log('[Ampify DevTool] - Replace Css: ', finalReplace);

  setSizing('large');

  await setSmallDevice();
  setSizing('small');

  await removeSmallDevice();

  //sanitaizeViewportMeta

  //postImage Hook
  for (const { name, options = {} } of plugins) {
    const exec = window[name] && window[name].postImages;
    if (typeof exec !== 'function') continue;

    const { cssIgnore = [] } = (await exec(options)) || {};

    cssFilter.push(...cssIgnore);
  }

  if (settings.isRunPluginsOnly) {
    return window.postMessage(
      JSON.stringify({
        action: 'ampify-complete',
      }),
      '*',
    );
  }

  prepareCSS();
  prepareHTML();

  const html = getHTMLForAmpify();

  console.log('Sending html to Ampify  \n ==============================');

  window.postMessage(
    JSON.stringify({
      action: 'ampify-algo',
      url: location.href,
      html,
      cssFilter,
      settings,
      replace: finalReplace,
    }),
    '*',
  );

  window.ampifyHTML = html;
})();
