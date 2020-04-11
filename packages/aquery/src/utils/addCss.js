module.exports = (str) => {
  const style = document.createElement('style');
  style.appendChild(document.createTextNode(str));

  document.head.appendChild(style);
};
