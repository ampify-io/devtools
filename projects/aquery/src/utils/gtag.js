import cssIgnore from './cssIgnore';

export default ({ ga, aw = '' }) => {
  let amp, state, stateJson = {}, evCache = {index: {}, ids: {}}, evIndex = 0, stateIndex = 0;

  const json = {
    'vars' : {
      'gtag_id': ga,
      'config' : {
        [ga]: {},
        [aw]: {}
      }
    },
    'triggers': {}
  }

  const genSelector = (el) => {
    const selecor = '_ag' + evIndex;

    el.classList.add(selecor);

    cssIgnore.add(`.${selecor}`);

    return selecor;
  }

  const getVarId = (prefix, name) => {
    const cacheId = prefix + ':'+ name;
    const { index, ids } = evCache;

    if (index[prefix] === undefined) {
      index[prefix] = 0;
    }

    if (ids[cacheId] === undefined) {
      ids[cacheId] = index[prefix] ++;
    }

    return `${prefix}${ids[cacheId]}`;
  }

  const getEventName = (name) => {
    const varId = getVarId('n', name);

    json.vars[varId] = name;

    return '${' + varId + '}';
  }

  const getEventCatrgory = (category) => {
    const varId = getVarId('c', category);
    
    json.vars[varId] = category;

    return '${' + varId + '}';
  }

  const getEventLabel = (label) => {
    if (!state) { initState(); }

    stateJson[stateIndex ++] = label;

    updateStateJSON();

    return '${ampState(_ag.' + stateIndex + ')}';
  }

  const updateJSON = () => {
    amp.innerHTML = `<script type='application/json'>${JSON.stringify(json)}</script>`;
  }

  const updateStateJSON = () => {
    state.innerHTML = `<script type='application/json'>${JSON.stringify(stateJson)}</script>`;
  }

  const init = () => {
    amp = document.createElement('amp-analytics');

    amp.setAttribute('type', 'gtag');
    amp.setAttribute('data-credentials', 'include');

    document.body.prepend(amp);

    updateJSON(amp);
  }

  const initState = () => {
    state = document.createElement('amp-state');
    state.id = '_ag';

    cssIgnore.add(`#${state.id}`);

    document.body.prepend(state);
  }

  function event(name, { event_category, event_label }) {
    const vars = {};

    if (name) { vars.event_name = getEventName(name); }
    if (event_category) { vars.event_category = getEventCatrgory(event_category); }
    if (event_label) { vars.event_label = event_label.length < 20 ? event_label : getEventLabel(event_label); }
    
    json.triggers[evIndex ++] = {
      'selector': '.' + genSelector(this),
      'on': 'click',
      vars
    }

    updateJSON(amp);
  }

  init();

  return (el) => {
    return { event: event.bind(el) };
  }
}