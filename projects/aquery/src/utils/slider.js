const create = ({container, items}) => {
  const width = items[0].offsetWidth;
  const height = items[0].offsetHeight;
  const carousel = document.createElement('amp-carousel');

  carousel.setAttribute('layout', 'responsive');
  carousel.setAttribute('width', width);
  carousel.setAttribute('height', height);
  carousel.setAttribute('type', 'slides');
  carousel.setAttribute('loop', '');
  carousel.setAttribute('controls', '');

  items.forEach(item => {
    const div = document.createElement('div');

    div.innerHTML = item.innerHTML;

    carousel.appendChild(div);
  });

  container.replaceWith(carousel);
}

export default ({
  slides,
  container
}, $) => {
  const items = container.querySelectorAll(slides);
  
  create({container, items});

  $.injectCss(`
    amp-carousel {
      display: block;
    }
  `);
};