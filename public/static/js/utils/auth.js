export function logout() {
  localStorage.removeItem('jwt');
}

export function isLoggedIn() {
  return !!localStorage.getItem('jwt');
}

export function getJwt() {
  return localStorage.getItem('jwt');
}

export function setJwt(token) {
  localStorage.setItem('jwt', token);
}