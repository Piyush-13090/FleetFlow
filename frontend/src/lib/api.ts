const sessionStorageKey = 'fleetflow.session-token';

export const getSessionToken = () => localStorage.getItem(sessionStorageKey);

export const setSessionToken = (token: string) => {
  localStorage.setItem(sessionStorageKey, token);
};

export const clearSessionToken = () => {
  localStorage.removeItem(sessionStorageKey);
};

export const apiFetch = (input: RequestInfo | URL, init: RequestInit = {}) => {
  const headers = new Headers(init.headers);
  const token = getSessionToken();

  if (token && !headers.has('Authorization')) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  return fetch(input, { ...init, headers });
};
