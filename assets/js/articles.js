/* Behaviour of the articles section: list filters, "show more", table of contents, FAQ, sharing. */
(function () {
  'use strict';

  const CARDS_PER_STEP = 3;

  function initFilters() {
    const filters = document.querySelector('[data-article-filters]');
    if (!filters) return;

    const cards = Array.from(document.querySelectorAll('[data-article-category]'));
    const curated = document.querySelectorAll('[data-article-curated]');
    const moreBlock = document.querySelector('[data-article-more]');
    const moreButton = document.querySelector('[data-article-more-button]');
    const moreCounter = document.querySelector('[data-article-more-counter]');
    let activeCategory = 'all';
    let visibleLimit = cards.filter((card) => !card.hasAttribute('data-article-collapsed')).length;

    function render() {
      const matching = cards.filter((card) => activeCategory === 'all' || card.dataset.articleCategory === activeCategory);
      const limit = activeCategory === 'all' ? visibleLimit : matching.length;

      cards.forEach((card) => {
        card.hidden = true;
      });
      matching.slice(0, limit).forEach((card) => {
        card.hidden = false;
      });
      curated.forEach((block) => {
        block.hidden = activeCategory !== 'all';
      });

      if (moreBlock) moreBlock.hidden = limit >= matching.length;
      if (moreCounter) {
        moreCounter.textContent = 'Показано ' + Math.min(limit, matching.length) + ' из ' + matching.length + ' статей';
      }
    }

    filters.addEventListener('click', (event) => {
      const button = event.target.closest('[data-article-filter]');
      if (!button) return;
      activeCategory = button.dataset.articleFilter;
      filters.querySelectorAll('[data-article-filter]').forEach((item) => {
        const isActive = item === button;
        item.classList.toggle('active', isActive);
        item.setAttribute('aria-pressed', String(isActive));
      });
      render();
    });

    if (moreButton) {
      moreButton.addEventListener('click', () => {
        visibleLimit += CARDS_PER_STEP;
        render();
      });
    }

    render();
  }

  function initTableOfContents() {
    const toc = document.querySelector('[data-article-toc]');
    const content = document.querySelector('[data-article-content]');
    if (!toc || !content) return;

    const links = Array.from(toc.querySelectorAll('.article-toc__link'));
    const sections = links
      .map((link) => document.getElementById(link.getAttribute('href').slice(1)))
      .filter(Boolean);
    const bar = toc.querySelector('[data-article-progress]');
    const percent = toc.querySelector('[data-article-percent]');
    const head = toc.querySelector('.article-toc__head');
    const OFFSET = 140;
    let frame = null;

    function update() {
      frame = null;
      const rect = content.getBoundingClientRect();
      const total = rect.height - window.innerHeight;
      const ratio = total > 0 ? Math.min(Math.max(-rect.top / total, 0), 1) : 1;
      if (bar) bar.style.transform = 'scaleX(' + ratio + ')';
      if (percent) percent.textContent = Math.round(ratio * 100) + ' %';

      let activeIndex = -1;
      sections.forEach((section, index) => {
        if (section.getBoundingClientRect().top - OFFSET <= 0) activeIndex = index;
      });
      links.forEach((link, index) => {
        link.classList.toggle('is-active', index === activeIndex);
      });
    }

    function schedule() {
      if (frame === null) frame = window.requestAnimationFrame(update);
    }

    window.addEventListener('scroll', schedule, { passive: true });
    window.addEventListener('resize', schedule);
    update();

    head.addEventListener('click', () => {
      if (getComputedStyle(toc.querySelector('.article-toc__toggle')).display === 'none') return;
      const isOpen = toc.classList.toggle('is-open');
      head.setAttribute('aria-expanded', String(isOpen));
    });

    links.forEach((link) => {
      link.addEventListener('click', () => {
        toc.classList.remove('is-open');
        head.setAttribute('aria-expanded', 'false');
      });
    });
  }

  function initFaq() {
    document.querySelectorAll('.article-faq__question').forEach((button) => {
      button.addEventListener('click', () => {
        const item = button.closest('.article-faq__item');
        const isOpen = item.classList.toggle('is-open');
        button.setAttribute('aria-expanded', String(isOpen));
      });
    });
  }

  /* Narrow screens show one card per column instead of a wide table. */
  function buildTableCards() {
    document.querySelectorAll('.article-table').forEach((wrapper) => {
      const table = wrapper.querySelector('table');
      if (!table || !table.tHead) return;

      const headers = Array.from(table.tHead.rows[0].cells).map((cell) => cell.textContent.trim());
      const rows = Array.from(table.tBodies[0].rows);
      const list = document.createElement('div');
      list.className = 'article-table-cards';

      headers.slice(1).forEach((title, columnIndex) => {
        const card = document.createElement('div');
        card.className = 'article-table-cards__card';
        const heading = document.createElement('div');
        heading.className = 'article-table-cards__title';
        heading.textContent = title;
        card.append(heading);

        rows.forEach((row) => {
          const line = document.createElement('div');
          line.className = 'article-table-cards__row';
          const label = document.createElement('span');
          label.textContent = row.cells[0].textContent.trim();
          const value = document.createElement('span');
          value.textContent = row.cells[columnIndex + 1].textContent.trim();
          line.append(label, value);
          card.append(line);
        });
        list.append(card);
      });

      wrapper.after(list);
    });
  }

  function initShare() {
    const url = encodeURIComponent(window.location.href);
    const title = encodeURIComponent(document.title);

    document.querySelectorAll('[data-share="telegram"]').forEach((link) => {
      link.href = 'https://t.me/share/url?url=' + url + '&text=' + title;
    });
    document.querySelectorAll('[data-share="max"]').forEach((link) => {
      link.href = 'https://max.ru/:share?text=' + title + '%20' + url;
    });
    document.querySelectorAll('[data-share="copy"]').forEach((button) => {
      button.addEventListener('click', async () => {
        if (navigator.share) {
          try {
            await navigator.share({ title: document.title, url: window.location.href });
          } catch (error) {
            /* The visitor closed the share sheet. */
          }
          return;
        }
        if (navigator.clipboard) {
          await navigator.clipboard.writeText(window.location.href);
          button.setAttribute('aria-label', 'Ссылка скопирована');
        }
      });
    });
  }

  initFilters();
  buildTableCards();
  initTableOfContents();
  initFaq();
  initShare();
})();
