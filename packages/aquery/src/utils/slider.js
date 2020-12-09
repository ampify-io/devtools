const strategies = { img_src: 'img_src', attr: 'attr', images: 'images' };

const create = ({ container, items, controls, strategy }) => {
  const width = items[0].offsetWidth;
  const height = items[0].offsetHeight;
  const carousel = document.createElement('amp-carousel');

  carousel.setAttribute('layout', 'responsive');
  carousel.setAttribute('width', width);
  carousel.setAttribute('height', height);
  carousel.setAttribute('type', 'slides');
  carousel.setAttribute('loop', '');
  if (controls) {
    carousel.setAttribute('controls', '');
  }

  items.forEach((item) => {
    let element;
    const strategyKey = strategy ? Object.keys(strategy)[0] : 'img_src';
    if (strategyKey === strategies.attr) {
      element = document.createElement('img');
      const imageSrc = item.getAttribute(strategy.attr);
      element.setAttribute('src', imageSrc);
    } else {
      element = document.createElement('div');
      element.innerHTML = item.innerHTML;
    }
    carousel.appendChild(element);
  });

  container.replaceWith(carousel);
};

export default ({ slides, container, controls, strategy }, $) => {
  const items = container.querySelectorAll(slides + ':not(.cloned)');

  create({ container, items, controls, strategy });

  $.injectCss(`
    amp-carousel {
      display: block;
    }
  `);
};
