import { getJwt } from '../utils/auth.js';
import { displayPopup } from '../utils/display_popup.js';
import { renderSignInView } from '../components/auth/signin_view.js';

export async function fetchGraphQLData(query) {
  const jwt = getJwt();
  if (!jwt) {
    displayPopup('No authentication token found. Please sign in.', false);
    renderSignInView();
    return null;
  }

  try {
    const response = await fetch(
      'https://learn.zone01oujda.ma/api/graphql-engine/v1/graphql',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${jwt}`,
        },
        body: JSON.stringify({
          query: query,
        }),
      }
    );

    if (!response.ok) {
      const error = await response.json();
      displayPopup(error.message || 'Failed to load data', false);

      // If unauthorized, clear token and redirect to sign in
      if (response.status === 401 || response.status === 403) {
        localStorage.removeItem('jwt');
        renderSignInView();
      }
      return null;
    }

    const data = await response.json();

    // Check for GraphQL errors
    if (data.errors && data.errors.length > 0) {
      const errorMessage = data.errors[0].message;
      console.error('GraphQL Error:', errorMessage);

      // If JWT verification failed, clear token and redirect to sign in
      if (errorMessage.includes('Could not verify JWT')) {
        localStorage.removeItem('jwt');
        displayPopup('Session expired. Please sign in again.', false);
        renderSignInView();
        return null;
      }

      displayPopup(errorMessage || 'Error in GraphQL response', false);
      return null;
    }

    return data;
  } catch (error) {
    console.error('Error fetching GraphQL data:', error);
    displayPopup('An error occurred while fetching data', false);
    return null;
  }
}