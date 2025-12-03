import { displayPopup } from '../../utils/display_popup.js';
import { setJwt } from '../../utils/auth.js';
import { renderProfileView } from '../profile/profile_view.js';

export function validateSignInFormData() {
  const signInForm = document.getElementById('signinForm');

  if (!signInForm) {
    console.error('Signin form not found');
    return;
  }

  const passwordVisibilityBtn = document.querySelector(
    '.toggle-password-visibility'
  );

  if (passwordVisibilityBtn) {
    passwordVisibilityBtn.addEventListener('click', (e) => {
      const targetId = e.target.closest('button').dataset.target;
      const input = document.getElementById(targetId);

      if (input) {
        if (input.type === 'password') {
          input.type = 'text';
        } else {
          input.type = 'password';
        }
      } else {
        console.error(`Input element with ID "${targetId}" not found.`);
      }
    });
  }

  signInForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const emailOrUsername = document.getElementById('emailOrUsername').value;
    const password = document.getElementById('password').value;

    if (!emailOrUsername || !password) {
      displayPopup('Please fill in all fields', false);
      return;
    }

    try {
      const signInBtn = document.querySelector('.sign-in-btn');
      if (signInBtn) {
        signInBtn.disabled = true;
        signInBtn.textContent = 'Signing in...';
      }

      // Basic Auth header
      const authString = btoa(`${emailOrUsername}:${password}`);

      // Make request to signin endpoint
      const response = await fetch(
        'https://learn.zone01oujda.ma/api/auth/signin',
        {
          method: 'POST',
          headers: {
            Authorization: `Basic ${authString}`,
            'Content-Type': 'application/json',
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        displayPopup(data.message || 'Sign in unsuccessful! Check your credentials and try again.', false);
        if (signInBtn) {
          signInBtn.disabled = false;
          signInBtn.textContent = 'Sign In';
        }
        return;
      }

      // Store JWT in localStorage
      setJwt(data);

      // Display success message
      displayPopup('Sign in successful!', true);

      // Redirect to profile page
      renderProfileView();

    } catch (error) {
      console.error('Error during sign in:', error);
      displayPopup('An error occurred during sign in. Please try again.', false);
      
      const signInBtn = document.querySelector('.sign-in-btn');
      if (signInBtn) {
        signInBtn.disabled = false;
        signInBtn.textContent = 'Sign In';
      }
    }
  });
}
