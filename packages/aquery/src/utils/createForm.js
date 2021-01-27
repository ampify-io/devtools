const defaults = {
  'submit-error': { color: '#F44336' },
  'submit-success': { color: '#009688' },
  submitting: { color: '#607D8B' },
};

const addMessage = (form, messageId, message) => {
  const { color } = defaults[messageId];
  const div = document.createElement('div');

  div.setAttribute(messageId, '');
  div.innerHTML = `
    <template type="amp-mustache">
      ${
        /^\</.test(message)
          ? message
          : `<span style="color: ${color}; clear: both;">${message}</span>`
      }
    </template>
  `;

  form.appendChild(div);
};

const createForm = (
  { form, url, proxy, redirect, success, error, submit, fields = [], debug },
  $,
) => {
  if (url) {
    form.setAttribute('action', url);
  }

  if (proxy) {
    const action = new URL(form.getAttribute('action'), location);

    form.setAttribute(
      'action',
      window.AMPIFY_DEBUG_PROXY_FORM_URL || '//proxy.ampify.io/forms',
    );

    fields.push({ name: 'ampifyProxyAction', value: action });
    if (redirect) {
      fields.push({ name: 'redirect', value: redirect });
    }
  }

  if (debug) {
    fields.push({ name: 'ampifyProxyDebug', value: 1 });
  }

  if (success) {
    addMessage(form, 'submit-success', success);
  }

  if (error) {
    addMessage(form, 'submit-error', error);
  }

  if (submit) {
    addMessage(form, 'submitting', submit);
  }

  for (const { name, value } of fields) {
    $(`<input type="hidden" name="${name}" value="${value}" />`).appendTo(form);
  }
};

export default createForm;
