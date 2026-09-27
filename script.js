(() => {
  const mobileButton = document.getElementById('mobileButton');
  const nav = document.getElementById('nav');

  if (mobileButton && nav) {
    mobileButton.addEventListener('click', () => {
      const open = nav.classList.toggle('open');
      mobileButton.classList.toggle('open', open);
      mobileButton.setAttribute('aria-expanded', String(open));
    });

    nav.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        nav.classList.remove('open');
        mobileButton.classList.remove('open');
        mobileButton.setAttribute('aria-expanded', 'false');
      });
    });
  }

  // La carte reste dans le HTML : les prix sont modifiables sans JavaScript.
  // On filtre des catégories complètes, avec leurs titres, formats et illustrations.
  const filterButtons = [...document.querySelectorAll('#carte .filters button')];
  const categories = [...document.querySelectorAll('#carte .menu-category')];
  const menuToolbar = document.querySelector('#carte .menu-toolbar');
  const menuStatus = document.getElementById('menu-status');

  function selectCategory(filter, fromClick = false) {
    if (filter !== 'all' && !categories.some(category => category.dataset.category === filter)) return;

    filterButtons.forEach(button => {
      const active = button.dataset.filter === filter;
      button.classList.toggle('active', active);
      button.setAttribute('aria-pressed', String(active));
    });

    categories.forEach(category => {
      category.hidden = filter !== 'all' && category.dataset.category !== filter;
    });

    if (fromClick) {
      if (menuStatus) {
        const category = categories.find(item => item.dataset.category === filter);
        menuStatus.textContent = filter === 'all'
          ? 'Les cinq catégories de la carte sont affichées.'
          : `${category.querySelector('h3').textContent} : catégorie affichée.`;
      }
      // Revenir au début de la carte si le visiteur change de catégorie en bas de page.
      const headerHeight = document.querySelector('.header')?.getBoundingClientRect().height || 0;
      if (menuToolbar && menuToolbar.getBoundingClientRect().top <= headerHeight + 2) {
        const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        menuToolbar.scrollIntoView({ block: 'start', behavior: reducedMotion ? 'auto' : 'smooth' });
      }
    }
  }

  if (filterButtons.length && categories.length) {
    if (menuToolbar) menuToolbar.hidden = false;
    filterButtons.forEach(button => {
      button.addEventListener('click', () => selectCategory(button.dataset.filter, true));
    });
    selectCategory('softs');
  }

  document.querySelectorAll('.faq-item').forEach(item => {
    const question = item.querySelector('.faq-question');
    const icon = question?.querySelector('span');
    if (!question || !icon) return;

    question.addEventListener('click', () => {
      const open = item.classList.toggle('open');
      question.setAttribute('aria-expanded', String(open));
      icon.textContent = open ? '−' : '+';
    });
  });

  const modal = document.getElementById('reservationModal');
  const closeModalButton = document.getElementById('closeModal');
  const overlay = modal?.querySelector('.modal-overlay');
  const openButtons = document.querySelectorAll('.openReservation');
  let previousFocus = null;

  function openReservation() {
    if (!modal) return;
    previousFocus = document.activeElement;
    modal.classList.add('open');
    modal.setAttribute('aria-hidden', 'false');
    document.body.classList.add('modal-open');
    setTimeout(() => closeModalButton?.focus(), 0);
  }

  function closeReservation() {
    if (!modal) return;
    modal.classList.remove('open');
    modal.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('modal-open');
    previousFocus?.focus?.();
  }

  openButtons.forEach(button => button.addEventListener('click', openReservation));
  closeModalButton?.addEventListener('click', closeReservation);
  overlay?.addEventListener('click', closeReservation);
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && modal?.classList.contains('open')) closeReservation();
  });

  async function copyText(text, button, normalLabel, successLabel) {
    if (!button) return;
    try {
      await navigator.clipboard.writeText(text);
      button.firstChild.textContent = successLabel + ' ';
      setTimeout(() => { button.firstChild.textContent = normalLabel + ' '; }, 1800);
    } catch {
      window.prompt('Copiez ce texte :', text);
    }
  }

  const copyAddress = document.getElementById('copyAddress');
  copyAddress?.addEventListener('click', () => copyText(
    '3 rue du Four, 55000 Bar-le-Duc', copyAddress, 'Copier l’adresse', 'Adresse copiée ✓'
  ));

  const copyPhone = document.getElementById('copyPhone');
  copyPhone?.addEventListener('click', () => copyText(
    '03 29 75 95 50', copyPhone, 'Copier le numéro', 'Numéro copié ✓'
  ));

  const sections = [...document.querySelectorAll('main > section[id]')];
  const navLinks = [...document.querySelectorAll('nav a[href^="#"]')];
  if ('IntersectionObserver' in window && sections.length) {
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        navLinks.forEach(link => {
          link.classList.toggle('active', link.getAttribute('href') === `#${entry.target.id}`);
        });
      });
    }, { rootMargin: '-25% 0px -60% 0px', threshold: 0.01 });
    sections.forEach(section => observer.observe(section));
  }
})();
