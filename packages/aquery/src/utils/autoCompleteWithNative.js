import randomId from './randomId';
import createNativeAutocomplete from './createNativeAutocomplete';

const onDebounced = ({ id, minLength }) => {
  return `{
    ${id}_ac: {
      query: event.value,
      showDropdown: true
    }, 
    ${id}_ac_xhr: {
      status: event.value.length >= ${minLength} ? 'LOADING' : ''
    }
  }`;
};

const onTap = ({ id }) => {
  return `{
    ${id}_ac: {
      showDropdown: true
    }
  }`;
};

const isActive = ({ id, minLength, itemsKey }) => {
  return `(${id}_ac.query.length >= ${minLength} && ${id}_ac_xhr.${itemsKey} && ${id}_ac_xhr.${itemsKey}.length)`;
};

const maxItems = () => {
  return `filter((item, index) => index < 5)`;
};

const filterItems = ({ id }) => {
  return `filter(item => item.label.toLowerCase().indexOf(${id}_ac.query.toLowerCase()) > -1)`;
};

const createState = ({ id }) => {
  const state = document.createElement('amp-state');

  state.id = `${id}_ac`;
  state.innerHTML = `<script type="application/json">
    {
      "query": "",
      "showDropdown": false,
      "height": 0
    }
  </script>`;

  document.body.prepend(state);
};

const createXhrState = ({ id, source, query, minLength }) => {
  const state = document.createElement('amp-state');

  state.id = `${id}_ac_xhr`;
  state.setAttribute('src', source);
  state.setAttribute(
    'data-amp-bind-src',
    `${id}_ac.query.length >= ${minLength} ? '${source}${
      (source.includes('?') ? '&' : '?') + query
    }=' + encodeURIComponent(${id}_ac.query) : '${source}'`,
  );

  document.body.prepend(state);

  console.log('el state');
};

const createResultsList = ({
  id,
  tagName = 'div',
  appendTo,
  classes,
  template,
  minLength,
  itemsKey,
}) => {
  const dialog = document.createElement(tagName);

  dialog.className = `aq-ac-dialog ${classes.dialog || ''}`;
  dialog.setAttribute('hidden', '');
  dialog.setAttribute('ampify-keep', '');
  dialog.setAttribute(
    'data-amp-bind-hidden',
    `!(${id}_ac.query.length >= ${minLength} && ${id}_ac_xhr.items && ${id}_ac_xhr.items.length)`,
  );
  appendTo.appendChild(dialog);

  const list = document.createElement('amp-list');

  list.setAttribute('layout', 'fixed-height');
  list.setAttribute('height', '0');
  list.setAttribute(
    'data-amp-bind-is-layout-container',
    `${id}_ac_xhr.${itemsKey}.length > 0`,
  );
  list.setAttribute(
    'data-amp-bind-src',
    `${isActive({
      id,
      minLength,
      itemsKey,
    })} ? ${id}_ac_xhr.${itemsKey}.${filterItems({ id })}.${maxItems()} : null`,
  );
  list.setAttribute('items', `.`);

  dialog.appendChild(list);

  const tmpl = document.createElement('template');

  tmpl.setAttribute('type', 'amp-mustache');
  tmpl.innerHTML = template;

  list.appendChild(tmpl);
};

const getDefaultTemplate = () => {
  return '<div>Hi</div>';
};

const wrap = (el) => {
  const wrapper = document.createElement('span');

  wrapper.classList.add('ampify-autocomplete');

  el.parentNode.insertBefore(wrapper, el);

  wrapper.appendChild(el);
};

const autoComplete = (
  {
    input,
    source,
    minLength = 1,
    appendTo,
    tagName,
    classes = {},
    template = getDefaultTemplate(),
    itemsKey = 'items',
    query = 'term',
  },
  $,
) => {
  if (!input.getAttribute('placeholder') && input.getAttribute('value')) {
    input.setAttribute('placeholder', input.getAttribute('value'));
    input.value = '';
  }

  if (input.closest('form')) {
    return createNativeAutocomplete(
      {
        input,
        source,
        minLength,
        query,
      },
      $,
    );
  }

  const id = randomId();
  const debounced = `input-debounced:AMP.setState(${onDebounced({
    id,
    minLength,
  })})`;
  const tap = `tap:AMP.setState(${onTap({ id })})`;
  const container = appendTo
    ? appendTo.constructor.name === 'aQueryEvents'
      ? appendTo.get(0)
      : appendTo
    : input.parentNode;

  $.injectCss(`
    .ampify-autocomplete {
      position: relative !important;
      display: inline-block !important;
    }
  `);
  $(input).appendActions([debounced, tap]);

  createState({ id });

  //url
  if (typeof source === 'string') {
    createXhrState({ id, source, query, minLength });
    //aQuery state
  } else if (typeof source === 'object' && source.state) {
    //source.setId(id);
    source.ampState.id = `${id}_ac_xhr`;
  }

  createResultsList({
    id,
    tagName,
    appendTo: container,
    classes,
    template,
    minLength,
    itemsKey,
  });
};

export default autoComplete;
