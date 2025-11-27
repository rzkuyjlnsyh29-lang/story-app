// src/scripts/pages/app.js - FIXED VERSION
import routes from '../routes/routes';
import { getActiveRoute, getActivePathname } from '../routes/url-parser';
import ViewTransitions from '../utils/view-transitions';
import Auth from '../../scripts/utils/auth';

class App {
  #content = null;
  #drawerButton = null;
  #navigationDrawer = null;
  #currentPage = null;

  constructor({ navigationDrawer, drawerButton, content }) {
    this.#content = content;
    this.#drawerButton = drawerButton;
    this.#navigationDrawer = navigationDrawer;

    this.#setupDrawer();
    this.#setupSkipLink(); // ← TAMBAH INI
    this.#updateNavigation();
  }

  #setupDrawer() {
    this.#drawerButton.addEventListener('click', () => {
      this.#navigationDrawer.classList.toggle('open');
      this.#drawerButton.setAttribute('aria-expanded', 
        this.#navigationDrawer.classList.contains('open')
      );
    });

    document.body.addEventListener('click', (event) => {
      if (
        !this.#navigationDrawer.contains(event.target) &&
        !this.#drawerButton.contains(event.target)
      ) {
        this.#navigationDrawer.classList.remove('open');
        this.#drawerButton.setAttribute('aria-expanded', 'false');
      }

      this.#navigationDrawer.querySelectorAll('a').forEach((link) => {
        if (link.contains(event.target)) {
          this.#navigationDrawer.classList.remove('open');
          this.#drawerButton.setAttribute('aria-expanded', 'false');
        }
      });
    });
  }

  // ✅ TAMBAH METHOD INI
  #setupSkipLink() {
    const skipLink = document.querySelector('.skip-link');
    if (skipLink) {
      skipLink.addEventListener('click', (e) => {
        e.preventDefault();
        this.#focusMainContent();
      });
    }
  }

  #updateNavigation() {
    const navLinks = this.#navigationDrawer.querySelectorAll('a');
    navLinks.forEach(link => {
      link.removeAttribute('aria-current');
    });

    const currentPath = window.location.hash.replace('#', '') || '/';
    const currentLink = this.#navigationDrawer.querySelector(`a[href="#${currentPath}"]`);
    if (currentLink) {
      currentLink.setAttribute('aria-current', 'page');
    }
  }

  async renderPage() {
    const url = getActiveRoute();
    let page = routes[url];

    // Fallback for map with query parameters
    if (!page && url.startsWith('/map')) {
      page = routes['/map/:id'];
    }

    if (!page) {
      this.#content.innerHTML = '<h1>Halaman tidak ditemukan</h1>';
      return;
    }

    // CRITERIA 1 FIX: Hybrid transitions - View API + Custom
    if (document.startViewTransition) {
      // Use View Transition API (yang diminta reviewer)
      await document.startViewTransition(async () => {
        await ViewTransitions.fadeOut(this.#content);
        this.#content.innerHTML = await page.render();
        await page.afterRender();
        await ViewTransitions.fadeIn(this.#content);
      }).finished;
    } else {
      // Fallback: Custom transitions saja
      await ViewTransitions.fadeOut(this.#content);
      this.#content.innerHTML = await page.render();
      await page.afterRender();
      await ViewTransitions.fadeIn(this.#content);
    }

    this.#currentPage = page;
    this.#updateNavigation();
    
    // ✅ COMMENT/REMOVE BARIS INI - BIAR GA AUTO FOCUS:
    // this.#focusMainContent();
  }

  #focusMainContent() {
    const mainContent = this.#content.querySelector('#main-content-section');
    if (mainContent) {
      mainContent.setAttribute('tabindex', '-1');
      mainContent.focus();
      mainContent.scrollIntoView({ behavior: 'smooth' });
    }
  }
}

export default App;