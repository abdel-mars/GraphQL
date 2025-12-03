import { renderHeader } from './components/header/header.js';
import { initTheme } from './utils/theme.js';
import { renderSignInView } from './components/auth/signin_view.js';
import { isLoggedIn } from './utils/auth.js';
import { renderProfileView } from './components/profile/profile_view.js';

// Initialize the application
export function initApp() {

  initTheme();
  renderHeader();

  // Check auth status and render appropriate view
  if (isLoggedIn()) {
    renderProfileView();
  } else {
    renderSignInView();
  }

  // Listen for auth state changes to update the header
  window.addEventListener('storage', (event) => {
    if (event.key === 'jwt') {
      // Re-render header when JWT changes (login/logout)
      const header = document.getElementById('header');
      if (header) {
        header.remove();
      }
      renderHeader();
      
      // Re-apply theme after header changes
      initTheme();
      
      // If JWT was added (user logged in), show profile
      if (event.newValue) {
        renderProfileView();
      } else {
        // If JWT was removed (user logged out), show signin
        renderSignInView();
      }
    }
    
    if (event.key === 'theme') {
      initTheme();
    }
  });
}
