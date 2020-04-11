import $ from '@ampify/aQuery';
import delay from '@ampify/toolbox/delay';

export default () => {
  console.log('aQuery goes here...');

  return { cssIgnore: $.cssIgnore() };
};
