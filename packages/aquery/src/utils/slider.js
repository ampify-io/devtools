const strategies = ['img_src', 'attr', 'images'];

const create = ({ container, items, controls, strategy }, $) => {
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
    if (!strategy || strategy.img_src) {
      element = document.createElement('div');
      element.innerHTML = item.innerHTML;
    } else if (strategy.attr) {
      element = document.createElement('amp-img');
      const imageSrc = item.getAttribute(strategy.attr);
      element.setAttribute('src', imageSrc);
      element.setAttribute('width', width);
      element.setAttribute('height', height);
      element.setAttribute('layout', 'responsive');
    }
    if (strategy && strategy.display) {
      element.classList.add(strategy.display);
      $.injectCss(`
         .${strategy.display} { object-fit: ${strategy.display};  }`);
    }
    carousel.appendChild(element);
  });
  container.replaceWith(carousel);
};

export default ({ slides, container, controls, strategy }, $) => {
  const items = container.querySelectorAll(slides + ':not(.cloned)');

  create({ container, items, controls, strategy }, $);

  $.injectCss(`
    amp-carousel {
      display: block;
    }
  `);
};
