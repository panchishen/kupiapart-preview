/* All form logic of the articles section: loads form.html over AJAX, validates and submits it. */
(function () {
  'use strict';

  const FORM_URL = 'form.html';
  const MESSAGES = {
    success: 'Спасибо! Менеджер перезвонит вам в ближайшее время.',
    error: 'Не удалось отправить заявку. Попробуйте ещё раз или позвоните нам: +7 351 200-27-91.',
    loadError: 'Форма временно недоступна. Позвоните нам: +7 351 200-27-91.',
  };

  function formatPhone(value) {
    let digits = value.replace(/\D/g, '');
    if (!digits) return '';
    if (digits[0] === '8') digits = '7' + digits.slice(1);
    if (digits[0] !== '7') digits = '7' + digits;
    digits = digits.slice(0, 11);

    let result = '+7';
    if (digits.length > 1) result += ' (' + digits.slice(1, 4);
    if (digits.length >= 5) result += ') ' + digits.slice(4, 7);
    if (digits.length >= 8) result += '-' + digits.slice(7, 9);
    if (digits.length >= 10) result += '-' + digits.slice(9, 11);
    return result;
  }

  function isPhoneComplete(value) {
    return value.replace(/\D/g, '').length === 11;
  }

  function initForm(form) {
    const nameInput = form.querySelector('[name="f_Name"]');
    const phoneInput = form.querySelector('[name="f_Phone"]');
    const consents = Array.from(form.querySelectorAll('[data-form-consent]'));
    const submitButton = form.querySelector('[type="submit"]');
    const status = form.querySelector('[data-form-status]');

    function setStatus(text, isError) {
      status.textContent = text;
      status.classList.toggle('lead-form__status_error', Boolean(isError));
    }

    function updateSubmitState() {
      submitButton.disabled = !consents.every((box) => box.checked);
    }

    phoneInput.addEventListener('input', () => {
      phoneInput.value = formatPhone(phoneInput.value);
      phoneInput.classList.remove('is-invalid');
    });
    nameInput.addEventListener('input', () => nameInput.classList.remove('is-invalid'));
    consents.forEach((box) => box.addEventListener('change', updateSubmitState));
    updateSubmitState();

    form.addEventListener('submit', async (event) => {
      event.preventDefault();
      setStatus('');

      const isNameValid = nameInput.value.trim().length > 0;
      const isPhoneValid = isPhoneComplete(phoneInput.value);
      nameInput.classList.toggle('is-invalid', !isNameValid);
      phoneInput.classList.toggle('is-invalid', !isPhoneValid);
      if (!isNameValid || !isPhoneValid) {
        (isNameValid ? phoneInput : nameInput).focus();
        return;
      }

      submitButton.disabled = true;
      try {
        const response = await fetch(form.action, { method: 'POST', body: new FormData(form) });
        if (!response.ok) throw new Error('HTTP ' + response.status);
        form.reset();
        setStatus(MESSAGES.success);
      } catch (error) {
        setStatus(MESSAGES.error, true);
      } finally {
        updateSubmitState();
      }
    });
  }

  async function loadForms() {
    const slots = document.querySelectorAll('[data-form-slot]');
    if (!slots.length) return;

    try {
      const response = await fetch(FORM_URL);
      if (!response.ok) throw new Error('HTTP ' + response.status);
      const markup = await response.text();
      slots.forEach((slot, index) => {
        /* Keep label and input ids unique if several forms are placed on one page. */
        slot.innerHTML = markup.replace(/lead-(name|phone)/g, 'lead-$1-' + index);
        initForm(slot.querySelector('form'));
      });
    } catch (error) {
      slots.forEach((slot) => {
        slot.textContent = MESSAGES.loadError;
      });
    }
  }

  loadForms();
})();
