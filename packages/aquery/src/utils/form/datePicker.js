import randomId from '../randomId';

const FORMATS = { FORMAT_US: 'MM-DD-YYYY', FORMAT_WORLD: 'DD-MM-YYYY' };

const addDatePicker = (date, $) => {
    if (date) {
        date.mode = date.mode ? date.mode : 'lightbox';
        const mode = mode_pre;
        const input = date.input;
        if (!input.getAttribute('name')) {
            input.setAttribute('name', randomId());
        }
        const datePicker = document.createElement('amp-date-picker');
        datePicker.setAttribute(
            'input-selector',
            `[name=${input.getAttribute('name')}]`
        );
        const format = resolveFormat(date.format);
        datePicker.setAttribute('format', format);

        if (date.required) {
            input.removeAttribute('readonly');
            input.setAttribute('required', '');
            datePicker.setAttribute('required', '');
            console.log('addDatePicker', datePicker);
        }

        if (date.mode && date.mode === 'static') {} else if (mode === "overlay") {
            datePicker.setAttribute('mode', 'overlay');
            datePicker.setAttribute('layout', 'container');
            const parent = input.parentNode;
            parent.appendChild(datePicker);
            datePicker.appendChild(input);
        } else {
            const lightboxID = `lb${input.getAttribute('name')}`;
            datePicker.setAttribute('mode', 'static');
            datePicker.setAttribute('layout', 'fixed-height');
            datePicker.setAttribute('height', '360');
            datePicker.setAttribute('on', `select:${lightboxID}.close`);
            input.setAttribute('on', `tap:${lightboxID}.open`);
            input.setAttribute('tabindex', '0');
            input.setAttribute('role', 'textbox');
            const lightbox = document.createElement('amp-lightbox');
            lightbox.setAttribute('id', `${lightboxID}`);
            lightbox.setAttribute('layout', 'nodisplay');
            lightbox.innerHTML = `
            <button on="tap:${lightboxID}.close" tabindex="0" class="lb_close"></button>
            <div class="align-content-center">
            ${datePicker.outerHTML}
            </div>`

            document.querySelector('body').append(lightbox);

            $.injectCss(`
            amp-lightbox {background-color: rgba(0 0 0 / 50%);}
            amp-lightbox > div {padding-top:35%;}
            amp-lightbox .align-content-center {width:318px; margin:auto}
            amp-lightbox button.lb_close {font-size:20px;color:white;margin-bottom:5px;background-color:transparent;position:absolute!important;right:20px!important;top:20px!important;}
            amp-lightbox button.lb_close:before {font-size:35px;font-family: 'Helvetica', 'Arial', sans-serif; content: 'X';}
            `)
            $.cssIgnore(`#${lightboxID}`)
        }
    }
};
const resolveFormat = (format) => {
    if (format && format.toLowerCase().startsWith('mm')) {
        return FORMATS.FORMAT_US;
    }
    return FORMATS.FORMAT_WORLD;
};

export default addDatePicker;