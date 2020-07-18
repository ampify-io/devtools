import genId from './genId';

export default ({ top = '1500px' }, $) => {
  const observee = document.createElement('div');
  observee.id = genId(observee);
  document.body.prepend(observee);

  $.injectCss(`#${observee.id} {
    position:absolute;
    left:0;
    top:${top};
    width:100%;
    height:0px;
  }`);

  const observer = document.createElement('amp-position-observer');
  observer.setAttribute('target', observee.id);
  observer.setAttribute('layout', 'nodisplay');
  document.body.prepend(observer);

  return { observer, observee };
};
