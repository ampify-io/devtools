import randomId from '../randomId';

const FORMATS = { FORMAT_US: 'MM-DD-YYYY', FORMAT_WORLD: 'DD-MM-YYYY' };

const addDatePicker = (date, $) => {
  if (date) {
    const input = date.input;
    if (!input.getAttribute('name')) {
      input.setAttribute('name', randomId());
    }
    const datePicker = document.createElement('amp-date-picker');
    datePicker.setAttribute(
      'input-selector',
      `[name=${input.getAttribute('name')}]`,
    );
    if (date.mode && date.mode === 'static') {
    } else {
      datePicker.setAttribute('mode', 'overlay');
      datePicker.setAttribute('layout', 'container');
    }
    const format = resolveFormat(date.format);
    datePicker.setAttribute('format', format);
    if (date.required) {
      input.removeAttribute('readonly');
      input.setAttribute('required', '');
      datePicker.setAttribute('required', '');
      const validator = document.createElement('span');
      validator.setAttribute('visible-when-invalid', 'valueMissing');
      validator.setAttribute('validation-for', input.id);
      datePicker.appendChild(validator);
      console.log('addDatePicker ', datePicker);
    }
    const parent = input.parentNode;
    parent.appendChild(datePicker);
    datePicker.appendChild(input);
  }
};
const resolveFormat = (format) => {
  if (format && format.toLowerCase().startsWith('mm')) {
    return FORMATS.FORMAT_US;
  }
  return FORMATS.FORMAT_WORLD;
};

export default addDatePicker;
