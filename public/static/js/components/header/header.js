import { toggleTheme, initTheme } from '../../utils/theme.js';

export function renderHeader() {
  const app = document.getElementById('app');
  const header = document.createElement('header');
  header.className = 'header';
  header.id = 'header';
  
  // Check for saved theme in localStorage
  const savedTheme = localStorage.getItem('theme');
  if (savedTheme === 'dark' || document.body.classList.contains('dark-theme')) {
    header.classList.add('dark-theme');
  }

  header.innerHTML = `
    <div class="logo">
      <a href="#" id="homeLink">GraphQL</a>
    </div>

    <div class="header-controls">
      <div id="themeToggler" class="theme-toggler ${savedTheme === 'dark' ? 'active' : ''}">
        <box-icon name='sun' size="md" class="sun"></box-icon>
        <box-icon name='moon' size="md" class="moon"></box-icon>
      </div>
    </div>
  `;

  app.appendChild(header);

  // Add event listeners for navigation
  document.getElementById('homeLink').addEventListener('click', (e) => {
    e.preventDefault();
  });
  
  // Add event listener for theme toggler
  const themeToggler = document.getElementById('themeToggler');
  themeToggler.addEventListener('click', () => {
    toggleTheme();
  });
}
