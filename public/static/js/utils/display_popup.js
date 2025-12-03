export function displayPopup(message, isSuccess = true) {
  const popup = document.getElementById('messagePopup');
  if (!popup) {
    const newPopup = document.createElement('p');
    newPopup.id = 'messagePopup';
    newPopup.className = 'message-popup';
    document.body.appendChild(newPopup);
    return displayPopup(message, isSuccess);
  }

  popup.textContent = message;
  popup.className = `message-popup ${isSuccess ? 'success' : 'error'} show`;

  setTimeout(() => {
    popup.className = 'message-popup';
  }, 3000);
}