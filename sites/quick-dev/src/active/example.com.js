import $ from '@ampify/aQuery';
import delay from '@ampify/toolbox/delay';

const menu = () => {};

export default () => {
  menu();

  return { cssIgnore: $.cssIgnore() };
};
