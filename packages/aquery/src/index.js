import jQuery from 'jquery';
import cssIgnore from './utils/cssIgnore';
import injectCss from './utils/addCss';
import autoComplete from './utils/autoComplete';
import scrollObserver from './utils/scrollObserver';
import createScript from './utils/createScript';
import createForm from './utils/createForm';
import carousel from './utils/carousel';
import slider from './utils/slider';
import ajaxList from './utils/ajaxList';
import triggerTouch from './utils/triggerTouch';
import genId from './utils/genId';
import gtag from './utils/gtag';

const aQuery = (() => {
  let tabIndex = 1000;
  let activeAQEvents;
  let aQMode = 'events';
  let arrActions = [];

  const Effects = {
    'slide-up': {
      start: 'ampify-su',
      end: 'ampify-sy',
      duration: 300,
    },
    'slide-down': {
      start: 'ampify-sd',
      end: 'ampify-sy',
      duration: 300,
    },
    'slide-right': {
      start: 'ampify-sr',
      end: 'ampify-sx',
      duration: 300,
    },
    'slide-left': {
      start: 'ampify-sl',
      end: 'ampify-sx',
      duration: 300,
    },
    visibility: {
      start: 'ampify-effect-hidden',
      animation: 'translateY(0)',
      animationInverse: 'translateY(-1000px)',
      duration: 0,
    },
  };

  const AMPlaceHolders = {
    value: '[AMPIFY_EVENT_VALUE]',
  };

  const nodesToArray = (el) => {
    if (typeof el === 'string') {
      el =
        /^\</.test(el) && /\>$/.test(el)
          ? createAmpElement(el)
          : document.querySelectorAll(el);
    }

    return NodeList.prototype.isPrototypeOf(el) ? Array.from(el) : [el];
  };

  const createAnimation = (animation) => {
    const json = JSON.stringify(animation);
    const anim = document.createElement('amp-animation');

    anim.id = genId(anim);
    anim.setAttribute('layout', 'nodisplay');
    anim.innerHTML = `<script type="application/json">${json}</script>`;
    document.body.prepend(anim);

    return anim;
  };

  const addEffectsCss = () => {
    if (window[`aQuery_css_effect`]) return;

    injectCss(`
      .ampify-sd {
        transition: transform 250ms ease-in-out !important;
        transform-origin: top !important;
        transform: scaleY(0) !important;
        display: block !important;
        visibility: visible !important;
      }

      .ampify-su {
        transition: transform 250ms ease-in-out !important;
        transform-origin: bottom !important;
        transform: scaleY(0) !important;
        display: block !important;
        visibility: visible !important;
      }
      
      .ampify-sy {
        transform: scaleY(1) !important;
      }

      .ampify-sr {
        transition: transform 250ms ease-in-out !important;
        transform-origin: left !important;
        transform: scaleX(0) !important;
        display: block !important;
        left: 0px !important;
        visibility: visible !important;
      }

      .ampify-sl {
        transition: transform 250ms ease-in-out !important;
        transform-origin: right !important;
        transform: scaleX(0) !important;
        display: block !important;
        visibility: visible !important;
        right: 0px !important;
      }
      
      .ampify-sx {
        transform: scaleX(1) !important;
      }

      .ampify-effect-hidden {
        transition: transform 250ms ease-in-out !important;
        transform: translateY(-1000px) !important;
        display: block !important;
        visibility: visible !important;
      }
    `);

    window[`aQuery_css_effect`] = true;
  };

  const setDefaultVisibility = (node) => {
    const isHidden = window.getComputedStyle(node).display === 'none';

    if (isHidden) {
      node.style.display = 'block';
      node.setAttribute('hidden', '');
    }
  };

  const AMP = {
    appendActions: (node, actions) => {
      const on = node.getAttribute('on')
        ? node.getAttribute('on').split(';')
        : [];

      actions.forEach((action) => on.push(action));

      node.setAttribute('on', actions.join(';'));
    },
  };

  class aQueryEvents {
    constructor(nodes) {
      this.nodes = nodes;
      this.length = nodes.length;

      this.proxy = new Proxy(this, {
        get(target, prop) {
          if (aQMode === 'scroll-actions') {
            return new aQueryScrollActions(target.nodes, target)[prop];
          }

          if (aQMode === 'actions') {
            return new aQueryActions(target.nodes, target)[prop];
          }

          if (target[prop]) {
            return target[prop];
          } else if (jQuery.fn[prop]) {
            return (...args) => {
              args = args.map((arg) =>
                arg.__proto__.constructor.name == 'aQueryEvents'
                  ? arg.nodes
                  : arg,
              );

              const ret = jQuery(target.nodes)[prop](...args);

              if (ret instanceof jQuery) {
                //target.nodes = ret.toArray();

                return new aQueryEvents(ret.toArray());
              }

              return ret;
            };
          } else if (target.nodes[prop]) {
            return target.nodes[prop];
          }
        },
      });

      for (const node of this.nodes) {
        if (node.nodeType === 1) {
          node.setAttribute('ampify-keep', '');
        }
      }

      return this.proxy;
    }

    get(index) {
      return this.nodes[index];
    }

    on(event, callback, options) {
      arrActions = [];

      if (event === 'click' || event === 'change' || event === 'select') {
        aQMode = 'actions';
      } else if (event === 'scroll') {
        aQMode = 'scroll-actions';
      }

      for (const node of this.nodes) {
        arrActions = [];

        callback({ target: node, value: AMPlaceHolders.value });

        if (event === 'click') {
          node.removeAttribute('href');
          node.setAttribute('role', 'button');
          node.setAttribute('tabindex', ++tabIndex);

          AMP.appendActions(node, [`tap:${arrActions.join(',')}`]);
        } else if (event === 'change' || event === 'select') {
          AMP.appendActions(node, [`${event}:${arrActions.join(',')}`]);
        } else if (event === 'scroll') {
          const exitAction = arrActions.length == 2 ? arrActions.pop() : null;
          const enter = `calc(100vh + ${
            /^\d+$/.test(options.enter.toString())
              ? options.enter + 'px'
              : options.enter
          })`;

          const { observer, observee } = scrollObserver({ top: enter }, aQuery);
          const anim = createAnimation({
            selector: `#${genId(observee)}`,
            duration: '0s',
            fill: 'forwards',
            keyframes: { transform: `translateY(-100000px)` },
          });

          arrActions.push(`${anim.id}.start`);

          if (options.exit) {
            const exit = /^\d+$/.test(options.exit.toString())
              ? options.exit + 'px'
              : options.exit;

            const {
              observer: observerExit,
              observee: observeeExit,
            } = scrollObserver({ top: exit }, aQuery);
            const animExit = createAnimation({
              selector: `#${genId(observeeExit)}`,
              duration: '0s',
              fill: 'forwards',
              keyframes: { transform: `translateY(0.001px)` },
            });
            const animRestoreEnter = createAnimation({
              selector: `#${genId(observee)}`,
              duration: '0s',
              fill: 'forwards',
              keyframes: { transform: `translateY(0.001px)` },
            });

            arrActions.push(`${animExit.id}.start`);

            injectCss(`#${observeeExit.id} {
              transform: translateY(-100000px);
            }`);

            AMP.appendActions(observerExit, [
              `enter:${exitAction},${animRestoreEnter.id}.start`,
            ]);

            console.log(exitAction, arrActions);
          }

          AMP.appendActions(observer, [`enter:${arrActions.join(',')}`]);
        }
      }

      aQMode = 'events';
    }

    touch() {
      for (const node of this.nodes) {
        triggerTouch(node);
      }

      return this;
    }

    hide() {
      for (const node of this.nodes) {
        jQuery(node).show();

        node.setAttribute('hidden', '');
      }

      return this;
    }

    ajaxList(options = {}) {
      for (const node of this.nodes) {
        ajaxList(Object.assign({}, options, { container: node }), aQuery);
      }

      return this;
    }

    autocomplete(options = {}) {
      for (const node of this.nodes) {
        autoComplete(Object.assign({}, options, { input: node }), aQuery);
      }

      return this;
    }

    carousel(options = {}) {
      for (const node of this.nodes) {
        carousel(Object.assign({}, options, { container: node }), aQuery);
      }

      return this;
    }

    slider(options = {}) {
      for (const node of this.nodes) {
        slider(Object.assign({}, options, { container: node }), aQuery);
      }

      return this;
    }

    script(options = {}) {
      for (const node of this.nodes) {
        createScript(Object.assign({}, options, { container: node }), aQuery);
      }

      return this;
    }

    form(options = {}) {
      console.log('zorg', options, createForm);

      for (const node of this.nodes) {
        if (aQuery(node).is('form')) {
          createForm(Object.assign({}, options, { form: node }), aQuery);
        }
      }

      return this;
    }

    bindState(prop, bind) {
      for (const node of this.nodes) {
        node.setAttribute(`data-amp-bind-${prop}`, `'${bind}'`);
      }

      return this;
    }

    appendActions(actions) {
      for (const node of this.nodes) {
        AMP.appendActions(node, actions);
      }

      return this;
    }
  }

  class aQueryActions {
    constructor(nodes, aQueryEventParent) {
      this.aQueryEventParent = aQueryEventParent;
      this.nodes = nodes;

      for (const node of this.nodes) {
        if (node.nodeType === 1) {
          node.setAttribute('ampify-keep', '');
        }
      }

      this.proxy = new Proxy(this, {
        get(target, prop) {
          if (target[prop]) {
            return target[prop];
          } else if (jQuery.fn[prop]) {
            return (...args) => {
              args = args.map((arg) =>
                arg.__proto__.constructor.name == 'aQueryActions'
                  ? arg.nodes
                  : arg,
              );

              const ret = jQuery(target.nodes)[prop](...args);

              if (ret instanceof jQuery) {
                return new aQueryActions(ret.toArray());
              }

              return ret;
            };
          }
        },
      });

      return this.proxy;
    }

    toggle() {
      for (const node of this.nodes) {
        setDefaultVisibility(node);

        arrActions.push(`${genId(node)}.toggleVisibility()`);
      }

      return this;
    }

    toggleVisibility() {
      return this.toggle();
    }

    show() {
      for (const node of this.nodes) {
        //if node is hidden we need to show and and hide it again using hidden attribute
        if (!node.offsetParent) {
          jQuery(node).show().attr('hidden', '');
        }

        arrActions.push(`${genId(node)}.show()`);
      }

      return this;
    }

    hide() {
      for (const node of this.nodes) {
        arrActions.push(`${genId(node)}.hide()`);
      }

      return this;
    }

    submit() {
      for (const node of this.nodes) {
        arrActions.push(`${genId(node)}.submit()`);
      }

      return this;
    }

    _toggleClass({ classList, force }) {
      force = force !== undefined ? ', force=' + force.toString() : '';

      for (const node of this.nodes) {
        classList.forEach((cls) => {
          cssIgnore.add(`.${cls}`);

          arrActions.push(`${genId(node)}.toggleClass(class='${cls}'${force})`);
        });
      }

      return this;
    }

    toggleClass(...classList) {
      return this._toggleClass({ classList });
    }

    addClass(...classList) {
      return this._toggleClass({ classList, force: true });
    }

    removeClass(...classList) {
      return this._toggleClass({ classList, force: false });
    }

    focus() {
      for (const node of this.nodes) {
        arrActions.push(`${genId(node)}.focus()`);

        //if element is not visible, focus() might not work
        //amp supports autofocus on visibility change so we'll add this also
        if (node.offsetParent === null) {
          node.setAttribute('autofocus', '');
        }
      }

      return this;
    }

    slideToggle({ direction = 'down' } = {}) {
      return this.addEffect('slide-' + direction, true);
    }

    slideUp() {
      return this.addEffect('slide-up');
    }

    slideDown() {
      return this.addEffect('slide-down');
    }

    slideRight() {
      return this.addEffect('slide-right');
    }

    slideLeft() {
      return this.addEffect('slide-left');
    }

    addEffect(effect, toggle = false) {
      const { start, end } = Effects[effect];

      addEffectsCss();

      for (const node of this.nodes) {
        node.classList.add(start);

        cssIgnore.add(`.${end}`);

        arrActions.push(
          `${genId(node)}.toggleClass(class='${end}'${
            toggle ? '' : ', force=true'
          })`,
        );
      }

      return this;
    }

    scrollTop(val = 0, duration = 250) {
      if (this.nodes[0] !== document.body)
        throw new Error('scrollTop can only be applied to body');

      const div = document.createElement('div');
      div.setAttribute('ampify-keep', '');
      div.id = genId(div);

      document.body.prepend(div);

      injectCss(`#${div.id} {
        position:absolute;
        left:0;
        top:${val}px;
        width:0px;
        height:0px;
      }`);

      arrActions.push(`${div.id}.scrollTo(duration=${duration})`);
    }

    scrollTo(duration = 0, position = 'top') {
      for (const node of this.nodes) {
        arrActions.push(
          `${genId(node)}.scrollTo(duration=${duration}, position=${position})`,
        );
      }
    }

    open(url, target = '_top') {
      const eventSource = this.aQueryEventParent.nodes[0].matches('select')
        ? 'select'
        : 'node';

      if (eventSource === 'select') {
        for (const { options } of this.aQueryEventParent.nodes) {
          for (const opt of options) {
            if (opt.getAttribute('value')) {
              opt.value = url.replace(AMPlaceHolders.value, opt.value);
            }
          }
        }

        arrActions.push(`AMP.navigateTo(url=event.value, target=${target})`);
      } else {
        arrActions.push(
          `AMP.navigateTo(url=${
            url == `[AMPIFY_EVENT_VALUE]` ? 'event.value' : `'${url}'`
          }, target=${target})`,
        );
      }
    }
  }

  class aQueryScrollActions {
    constructor(nodes, aQueryEventParent) {
      this.aQueryEventParent = aQueryEventParent;
      this.nodes = nodes;

      for (const node of this.nodes) {
        if (node.nodeType === 1) {
          node.setAttribute('ampify-keep', '');
        }
      }

      addEffectsCss();

      return this;
    }

    toggle() {
      for (const node of this.nodes) {
        node.removeAttribute('hidden');
      }

      return this.addEffect('visibility', true);
    }

    slideToggle({ direction = 'down' } = {}) {
      return this.addEffect('slide-' + direction, true);
    }

    slideUp() {
      return this.addEffect('slide-up');
    }

    slideDown() {
      return this.addEffect('slide-down');
    }

    addEffect(effect, toggle = false) {
      const { start, animation, animationInverse, duration } = Effects[effect];

      for (const node of this.nodes) {
        node.classList.add(start);

        const anim = createAnimation({
          selector: `#${genId(node)}`,
          duration: duration,
          fill: 'forwards',
          keyframes: { transform: animation || 'scaleY(1)' },
        });

        arrActions.push(`${anim.id}.start`);

        if (toggle) {
          const anim = createAnimation({
            selector: `#${genId(node)}`,
            duration: duration,
            fill: 'forwards',
            keyframes: { transform: animationInverse || 'scaleY(0.001)' },
          });

          arrActions.push(`${anim.id}.start`);
        }
      }

      return this;
    }
  }

  class aQueryState {
    constructor(state) {
      this.state = state;

      this._createState();
    }

    _createState() {
      const ampState = document.createElement('amp-state');

      ampState.id = genId(ampState);

      if (typeof this.state === 'string') {
        ampState.setAttribute('src', this.state);
      } else {
        ampState.innerHTML = `<script type="application/json">${JSON.stringify(
          this.state,
        )}</script>`;
      }

      document.body.prepend(ampState);

      this.id = ampState.id;
      this.ampState = ampState;
    }

    render(appendTo, template) {
      const list = document.createElement('amp-list');

      list.id = genId(list);
      list.setAttribute('layout', 'fixed-height');
      list.setAttribute('height', '0');
      list.setAttribute(
        'data-amp-bind-is-layout-container',
        `${list.id}.length > 0`,
      );
      list.setAttribute('src', this.state);

      appendTo.prepend(list);

      const tmpl = document.createElement('template');

      tmpl.setAttribute('type', 'amp-mustache');
      tmpl.innerHTML = template;

      list.appendChild(tmpl);
    }

    bind(prop) {
      return `' + ${this.id}.${prop} + '`;
    }

    get(prop) {
      return `${this.id}.${prop}`;
    }

    set(state) {
      const arrState = [];

      Object.keys(state).forEach((prop) => {
        const value = state[prop].replace(AMPlaceHolders.value, 'event.value');

        arrState.push(`${prop}: ${value}`);
      });

      arrActions.push(`AMP.setState({${this.id}: { ${arrState.join(',')} }})`);
    }
  }

  const aQuery = (window.aQuery = new Proxy(
    (nodes) => {
      nodes = jQuery(nodes.nodes || nodes).toArray();

      if (aQMode == 'events') {
        return (activeAQEvents = new aQueryEvents(nodes));
      } else if (aQMode == 'actions') {
        return new aQueryActions(nodes, activeAQEvents);
      } else if (aQMode == 'scroll-actions') {
        return new aQueryScrollActions(nodes, activeAQEvents);
      }
    },
    {
      get(target, prop) {
        return target[prop] || jQuery[prop];
      },
    },
  ));

  aQuery.cssIgnore = (...ignoreList) => {
    if (ignoreList.length) {
      return ignoreList.forEach((ignore) => cssIgnore.add(`${ignore}`));
    }

    return Array.from(cssIgnore).filter(
      (ignore) => !/#__ampify__/.test(ignore),
    );
  };

  aQuery.injectCss = injectCss;

  aQuery.ajaxList = ajaxList;

  aQuery.gtag = gtag;

  aQuery.genId = genId;

  aQuery.createState = (state) => {
    return new aQueryState(state);
  };

  /*aQuery.getJSON = (url) => {
    return new aQueryState(url);
  }*/

  aQuery.AMP = AMP;

  return aQuery;
})();

export default aQuery;

//
