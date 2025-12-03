export function toggleTheme() {
  const header = document.getElementById('header');
  const body = document.body;

  if (!header) {
    console.error('Header element not found');
    return;
  }

  header.classList.toggle('dark-theme');
  body.classList.toggle('dark-theme');

  const isDarkTheme = body.classList.contains('dark-theme');
  if (isDarkTheme) {
    localStorage.setItem('theme', 'dark');
  } else {
    localStorage.setItem('theme', 'light');
  }
}

// Apply the saved theme on page load
export function initTheme() {
  const savedTheme = localStorage.getItem('theme');
  const header = document.getElementById('header');

  if (savedTheme === 'dark') {
    if (header) {
      header.classList.add('dark-theme');
    }
    document.body.classList.add('dark-theme');
  } else {
    if (header) {
      header.classList.remove('dark-theme');
    }
    document.body.classList.remove('dark-theme');
  }
}
