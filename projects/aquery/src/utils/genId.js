import cssIgnore from './cssIgnore';
import randomId from './randomId';

export default (node) => {
  if (node.id) {
    cssIgnore.add(`#${node.id}`);
  } else {
    node.id = randomId();
  }

  return node.id;
}