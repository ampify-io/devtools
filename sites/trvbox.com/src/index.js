import $ from '@ampify/aQuery';

const menu = () => {
  $('#menu-btn').on('click', (e) => {
    $(e.target).toggleClass('active');
    $('#menu').slideToggle();
  });

  $('#menu-menu li.menu-item-has-children > a').on('click', (e) => {
    $(e.target).next().toggleVisibility();
    $(e.target).first().toggleClass('fa-minus');
  });
};

const search = () => {
  $('#search-btn').on('click', (e) => {
    $('#search-form').slideToggle();
  });

  const url = 'https://proxy.staging.ampify.io/trvbox/autocomplete';

  $('#search-inp').autocomplete({
    source: url,
    select: function (e) {
      $('.search-form').submit();
    },
  });
};

const social = () => {
  $('#social-btn').on('click', (e) => {
    $('#social-links').slideToggle();
  });
};

const slider = () => {
  $('.slick-slider').slider({
    slides: '.slick-slide',
  });
};

const sticky = () => {
  $(window).on(
    'scroll',
    () => {
      $('.sticky-footer').slideUp();
    },
    { enter: '1300px' },
  );

  $('.sticky-footer .close').on('click', () => {
    $('.sticky-footer').hide();
  });
};

export default () => {
  menu();
  search();
  social();
  slider();
  sticky();

  return { cssIgnore: $.cssIgnore() };
};
