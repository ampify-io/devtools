const create = ({input, template}) => {
  const ampAC = document.createElement('amp-autocomplete');
  const tmpl = document.createElement('template');
  
  input.parentNode.insertBefore(ampAC, input);
  
  ampAC.appendChild(input);

  tmpl.setAttribute('type', 'amp-mustache');
  tmpl.innerHTML = template;
  
  ampAC.appendChild(tmpl);

  return ampAC;
}

const getDefaultTemplate = () => {
  return '<div class="ui-menu-item" data-value="{{value}}">{{label}}</div>';
}

export default ({
  input,
  source,
  minLength,
  maxItems,
  template = getDefaultTemplate(),
  itemsKey,
  query,
  select
}, $) => {
  const ampAC = create({input, template});

  ampAC.setAttribute('filter', 'none');
  ampAC.setAttribute('query', query); 
  ampAC.setAttribute('min-characters', minLength);
  ampAC.setAttribute('src', source);
  ampAC.setAttribute('items', itemsKey); 
  ampAC.setAttribute('max-entries', maxItems);

  if (select) {
    $(ampAC).on('select', select);
  }
}