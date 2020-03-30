import randomId from './randomId';

const ajaxList = ({
  container,
  url,
  template,
  height,
  infinite = false
}) => {
  const list = document.createElement('amp-list');

  list.id = randomId();
  list.setAttribute('layout', 'fixed-height');
  list.setAttribute('height', height);
  list.setAttribute('src', url);

  if (infinite) {
    list.setAttribute('load-more', 'auto');
    list.setAttribute('load-more-bookmark', 'next');
  }

  container.appendChild(list);
  
  const tmpl = document.createElement('template');

  tmpl.setAttribute('type', 'amp-mustache');
  tmpl.innerHTML = template;
  
  list.appendChild(tmpl);
};

export default ajaxList;