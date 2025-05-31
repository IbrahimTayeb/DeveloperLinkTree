const API_URL = 'http://localhost:4000';

export const login = async (username: string, password: string) => {
  const res = await fetch(`${API_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password })
  });
  return res.json();
};

export const signup = async (username: string, password: string) => {
  const res = await fetch(`${API_URL}/auth/signup`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password })
  });
  return res.json();
};

export const logout = () => {
  localStorage.removeItem('token');
};

export const getProfile = async () => {
  const token = localStorage.getItem('token');
  const res = await fetch(`${API_URL}/profile/me`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return res.json();
};