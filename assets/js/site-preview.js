/*
 * Local preview only: minimal stand-in for the site's header script (hero-header-main.js).
 * Do not ship this file: on the live site the header is already handled by the template.
 */
(function () {
  'use strict';

  /* Header and footer links are root-relative, so in the preview they lead to the live site. */
  const LIVE_SITE = 'https://xn--80aawhzciqc.xn--p1ai';
  /* Rewritten on interaction, so links of the form loaded over AJAX are covered too. */
  ['click', 'auxclick', 'contextmenu'].forEach((type) => {
    document.addEventListener(type, (event) => {
      const link = event.target.closest('a[href^="/"]');
      if (link) link.href = LIVE_SITE + link.getAttribute('href');
    }, true);
  });

  document.querySelectorAll('.header__hamburger-wrapper').forEach((wrapper) => {
    const open = wrapper.querySelector('.header__hamburger-button:not(.header__close-button)');
    const close = wrapper.querySelector('.header__close-button');
    if (open) open.addEventListener('click', () => wrapper.classList.add('active'));
    if (close) close.addEventListener('click', () => wrapper.classList.remove('active'));
  });

  const sticky = document.querySelector('.header_sticky');
  if (sticky) {
    const toggle = () => sticky.classList.toggle('hidden', window.scrollY < 300);
    window.addEventListener('scroll', toggle, { passive: true });
    toggle();
  }
})();
