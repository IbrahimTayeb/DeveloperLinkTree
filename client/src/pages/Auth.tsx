import { useState } from 'react';
import { login, signup } from '../api';
import { useNavigate } from 'react-router-dom';

export default function Auth() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isSignup, setIsSignup] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const fn = isSignup ? signup : login;
    const { token } = await fn(username, password);
    if (token) {
      localStorage.setItem('token', token);
      navigate('/dashboard');
    }
  };

  return (
    <div className="p-4 max-w-md mx-auto">
      <h2 className="text-xl font-bold mb-2">{isSignup ? 'Sign Up' : 'Log In'}</h2>
      <form onSubmit={handleSubmit} className="space-y-3">
        <input value={username} onChange={e => setUsername(e.target.value)} placeholder="Username" className="border w-full p-2" />
        <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Password" className="border w-full p-2" />
        <button className="bg-blue-500 text-white px-4 py-2 rounded">Submit</button>
      </form>
      <button className="text-blue-600 mt-2" onClick={() => setIsSignup(!isSignup)}>
        {isSignup ? 'Already have an account? Log in' : "Don't have an account? Sign up"}
      </button>
    </div>
  );
}