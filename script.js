(function () {
    const scenes = Array.from(document.querySelectorAll('.scene'));
    const viewport = document.getElementById('viewport');
    const hamburger = document.getElementById('hamburger');
    const overlay = document.getElementById('menu-overlay');
    const links = overlay.querySelectorAll('a');
  
    let current = 0;
    let animating = false;
  
    function applyPositions() {
      scenes.forEach((s, i) => {
        s.classList.remove('active', 'above');
        if (i < current) s.classList.add('above');
        if (i === current) s.classList.add('active');
      });
    }
  
    function goToSection(index, opts = { immediate: false }) {
      if (index < 0 || index >= scenes.length) return;
      if (animating && !opts.immediate) return;
      if (index === current) return;
      animating = true;
      current = index;
      applyPositions();
      const duration = getComputedStyle(document.documentElement)
        .getPropertyValue('--transition-ms')
        .trim();
      const ms = parseInt(duration, 10) || 480;
  
      const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      window.setTimeout(() => {
        animating = false;
      }, opts.immediate || prefersReduced ? 0 : ms);
    }
  
    function nextSection() {
      const next = (current + 1) % scenes.length;
      goToSection(next);
    }
    function prevSection() {
      const prev = (current - 1 + scenes.length) % scenes.length;
      goToSection(prev);
    }
  
    // Initialize positions
    applyPositions();
  
    // Down arrows
    document.querySelectorAll('.down-arrow').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const idx = parseInt(btn.getAttribute('data-next'), 10);
        if (!Number.isNaN(idx)) {
          goToSection(idx);
        }
      });
    });
  
    // Menu open/close
    function openMenu() {
      overlay.hidden = false;
      hamburger.setAttribute('aria-expanded', 'true');
      // trap focus to menu
      overlay.querySelector('a')?.focus();
      document.addEventListener('keydown', escCloser);
      document.addEventListener('click', backdropCloser);
    }
    function closeMenu() {
      overlay.hidden = true;
      hamburger.setAttribute('aria-expanded', 'false');
      hamburger.focus();
      document.removeEventListener('keydown', escCloser);
      document.removeEventListener('click', backdropCloser);
    }
    function escCloser(e) {
      if (e.key === 'Escape') closeMenu();
    }
    function backdropCloser(e) {
      if (e.target === overlay) closeMenu();
    }
  
    hamburger.addEventListener('click', () => {
      if (overlay.hidden) openMenu(); else closeMenu();
    });
  
    // Menu links: close overlay first, then navigate
    links.forEach(a => {
        a.addEventListener('click', (e) => {
            e.preventDefault();
            const idx = parseInt(a.dataset.section, 10);
    
            // Close the menu overlay immediately
            closeMenu();
        
            // Navigate after a microtask so focus returns cleanly to the page
            Promise.resolve().then(() => {
                goToSection(idx);
            });
        });
    });
    
    // Keyboard navigation for sections
    window.addEventListener('keydown', (e) => {
      const activeEl = document.activeElement;
      const inPanel = activeEl && activeEl.closest && activeEl.closest('.text-side');
      // Allow arrow keys inside text panel to scroll content
      if (inPanel) return;
  
      if (e.key === 'ArrowDown' || e.key === 'PageDown') {
        e.preventDefault();
        nextSection();
      } else if (e.key === 'ArrowUp' || e.key === 'PageUp') {
        e.preventDefault();
        prevSection();
      }
    });
  
    // Wheel navigation: only when NOT over the right panel
    window.addEventListener('wheel', (e) => {
      const path = e.composedPath ? e.composedPath() : [];
      const overPanel = path.some(el => el && el.classList && el.classList.contains('text-content'));
      if (overPanel) return; // let the panel scroll
      e.preventDefault();
      if (animating) return;
      if (e.deltaY > 10) nextSection();
      else if (e.deltaY < -10) prevSection();
    }, { passive: false });
  
    // Hash deep linking (optional)
    const idToIndex = {
      'section-hero': 0,
      'section-sub1': 1,
      'section-sub2': 2,
      'section-sub3': 3
    };
    function goToHash() {
      const id = location.hash.replace('#', '');
      if (idToIndex.hasOwnProperty(id)) {
        goToSection(idToIndex[id], { immediate: true });
      }
    }
    window.addEventListener('hashchange', goToHash);
    goToHash();
  
    // Resize guard to maintain layout
    window.addEventListener('resize', () => {
      applyPositions();
    });
  })();