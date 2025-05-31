import { useEffect, useState } from 'react';
import { getProfile, logout } from '../api';
import { useNavigate } from 'react-router-dom';

export default function Dashboard() {
  const [username, setUsername] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    getProfile().then(res => {
      if (res.username) setUsername(res.username);
      else navigate('/auth');
    });
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/auth');
  };

  return (
    <div className="p-4">
      <h1 className="text-xl font-bold">Welcome, {username}</h1>
      <button onClick={handleLogout} className="mt-2 px-3 py-1 bg-red-500 text-white rounded">Logout</button>
    </div>
  );
}
