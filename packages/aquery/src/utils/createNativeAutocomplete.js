const create = ({ input, template }) => {
  const ampAC = document.createElement('amp-autocomplete');
  const tmpl = document.createElement('template');

  input.parentNode.insertBefore(ampAC, input);

  ampAC.appendChild(input);

  tmpl.setAttribute('type', 'amp-mustache');
  tmpl.innerHTML = template;

  ampAC.appendChild(tmpl);

  return ampAC;
};

const createDataset = ({ ampAC, source }, $) => {
  $(
    `<script type='application/json'>${JSON.stringify(source)}</script>`,
  ).appendTo(ampAC);
};

const getDefaultTemplate = () => {
  return '<div class="ui-menu-item" data-value="{{value}}">{{label}}</div>';
};

export default (
  {
    input,
    source,
    minLength,
    maxItems,
    template = getDefaultTemplate(),
    itemsKey,
    query,
    select,
  },
  $,
) => {
  const ampAC = create({ input, template }, $);

  ampAC.setAttribute('min-characters', minLength);
  ampAC.setAttribute('items', itemsKey);
  ampAC.setAttribute('max-entries', maxItems);
  ampAC.setAttribute('filter', 'substring');

  if ($.type(source) === 'string') {
    ampAC.setAttribute('src', source);

    if (query) {
      ampAC.setAttribute('query', query);
      ampAC.setAttribute('filter', 'none');
    }
  } else if ($.type(source) === 'array') {
    createDataset({ ampAC, source }, $);
  }

  if (select) {
    $(ampAC).on('select', select);
  }

  //fix rtl bug
  const computed = window.getComputedStyle(input, null).direction;
  if (computed === 'rtl') {
    $.injectCss(`
      #${$.genId(input)} {text-align: right;}
    `);
  }
};
