import delay from './delay';

/**
 *
 * @param {HTMLElement} el
 * @param {String} dir
 * @param {Number} step
 * @param {Number} delayMs
 * @param {Number} from
 * @return {Promise<void>}
 */
const scrollElement = async ({
  el = document.documentElement,
  dir = 'bottom',
  step = 300,
  delayMs = 100,
  from = 0,
  to,
} = {}) => {
  const axis = dir === 'bottom' ? 'Height' : 'Width';

  let position;

  if (axis === 'Height') position = 'Top';
  if (axis === 'Width') position = 'Left';

  const length = el[`scroll${axis}`];
  const distance = Math.ceil((to || length) / step);
  const scrollPosition = `scroll${position}`;

  el[scrollPosition] = from;

  for (let i = 0; i <= distance; i++) {
    el[scrollPosition] = step * i;
    await delay(delayMs);
  }

  el[scrollPosition] = from;
};

module.exports = scrollElement;
