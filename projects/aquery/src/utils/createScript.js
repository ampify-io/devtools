const { calculateHash } = require('@ampproject/toolbox-script-csp');
import randomId from './randomId';

const createAmpScript = (id, container, js) => {
  const ampScript = document.createElement('amp-script');
  const width = container.dataset['ampifyWidth'] || container.offsetWidth;
  const height = container.dataset['ampifyHeight'] || container.offsetHeight;
  const ratio = height / width;

  ampScript.setAttribute('layout', 'responsive');
  /*ampScript.setAttribute('width', 1);
  ampScript.setAttribute('height', (1 * ratio).toFixed(2));*/
  ampScript.setAttribute('width', width);
  ampScript.setAttribute('height', height);
  ampScript.setAttribute('script', id);

  container.parentNode.insertBefore(ampScript, container);
  
  ampScript.appendChild(container);

  const script = document.createElement('script');

  script.setAttribute('id', id);
  script.setAttribute('type', 'text/plain');
  script.setAttribute('target', 'amp-script');
  script.textContent = js;

  ampScript.parentNode.insertBefore(script, ampScript);
}

const getMeta = () => {
  if (document.querySelector('meta[name="amp-script-src"]')) {
    return document.querySelector('meta[name="amp-script-src"]');
  }

  const meta = document.createElement('meta');

  meta.setAttribute('name', 'amp-script-src');
  meta.setAttribute('content', '');

  document.head.appendChild(meta);

  return meta;
}

const createScriptMeta = (js) => {
  const meta = getMeta();
  const content = meta.getAttribute('content').split(' ').filter(hash => !!hash);
  
  content.push(calculateHash(js));

  meta.setAttribute('content', content.join(' '));
}

const createScript = ({
  container,
  js
}, $) => {
  const id = randomId();

  createAmpScript(id, container, js);
  createScriptMeta(js);
};

export default createScript;