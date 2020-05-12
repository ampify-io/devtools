const defaults = {
  'submit-error': { color: '#F44336' },
  'submit-success': { color: '#009688' },
  'submitting': { color: '#607D8B' },
};

const addMessage = (form, messageId, message) => {
  const { color } = defaults[messageId];
  const div = document.createElement('div');

  div.setAttribute(messageId, '');
  div.innerHTML = `
    <template type="amp-mustache">
      ${/^\</.test(message) ? message : `<span style="color: ${color}; clear: both;">${message}</span>`}
    </template>
  `;

  form.appendChild(div);
};

const createForm = ({ form, url, success, error, submit, fields = [] }, $) => {
  for (const { name, value } of fields) {
    $(`<input type="hidden" name="${name}" value="${value}" />`).appendTo(form);
  }
  
  if (url) {
    form.setAttribute('action', url);
  }

  if (success) {
    addMessage(form, 'submit-success', success);
  }

  if (error) {
    addMessage(form, 'submit-error', error);
  }

  if (submit) {
    addMessage(form, 'submit', submit);
  }
};

export default createForm;
