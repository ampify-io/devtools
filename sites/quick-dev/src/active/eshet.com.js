import $ from '@ampify/aQuery';

const iframe = () => {
  const container = document.querySelector('.one-wizard-wrapper');
  const iframe = document.createElement('iframe');

  $.injectCss(`.widget-iframe { border: none; }`);

  iframe.setAttribute(
    'src',
    `https://test1.eshet.com/wizard?url=${location.pathname}`,
  );
  iframe.setAttribute('width', container.offsetWidth);
  iframe.setAttribute('height', container.offsetHeight);

  iframe.setAttribute('resizable', '');
  iframe.setAttribute('sandbox', 'allow-scripts allow-same-origin');

  const div = document.createElement('div');
  div.setAttribute('overflow', '');
  div.setAttribute('tabindex', '45');
  div.setAttribute('role', 'button');
  div.setAttribute('aria-label', 'Read more');
  div.innerHTML = 'Read more';

  //<div overflow tabindex="45" role="button" aria-label="Read more">Read more</div>

  iframe.appendChild(div);

  iframe.classList.add('widget-iframe');

  container.replaceWith(iframe);
};

export default async () => {
  iframe();

  return { cssIgnore: $.cssIgnore() };
};
