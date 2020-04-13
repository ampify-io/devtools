const defaults = {
  'submit-error': {color: '#F44336'},
  'submit-success': {color: '#009688'},
  'submitting': {color: '#607D8B'}
};

const addMessage = (form, messageId, message) => {
  const { color } = defaults[messageId];
  const div = document.createElement('div');

  div.setAttribute(messageId, '');
  div.innerHTML = `<template type="amp-mustache"><p style="padding: 1.5rem; direction: ltr; color: ${color}; clear: both;">${message}</p></template>`;

  form.appendChild(div);
}

const createForm = ({ form, url, success, error, submit }, $) => {
  if (url) {
    form.setAttribute('action', url);
  }

  if (success) {
    addMessage(form, 'submit-success', success);
  }

  if (error) {
    addMessage(form, 'submit-success', error);
  }

  if (submit) {
    addMessage(form, 'submit', submit);
  }
};

export default createForm;