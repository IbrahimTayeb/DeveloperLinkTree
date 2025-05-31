import React, { useState, useEffect } from 'react';

interface LinkItem {
  id: number;
  title: string;
  url: string;
}

const DashboardPage = () => {
  const [links, setLinks] = useState<LinkItem[]>([]);
  const [newTitle, setNewTitle] = useState('');
  const [newUrl, setNewUrl] = useState('');
  const [username, setUsername] = useState('');

  useEffect(() => {
    // Simulate fetching profile and links
    setUsername('John Doe');
    setLinks([
      { id: 1, title: 'GitHub', url: 'https://github.com/yourprofile' },
      { id: 2, title: 'LinkedIn', url: 'https://linkedin.com/in/yourprofile' },
    ]);
  }, []);

  const handleAddLink = () => {
    const newLink: LinkItem = {
      id: links.length + 1,
      title: newTitle,
      url: newUrl,
    };
    setLinks([...links, newLink]);
    setNewTitle('');
    setNewUrl('');
  };

  const handleDeleteLink = (id: number) => {
    setLinks(links.filter((link) => link.id !== id));
  };

  return (
    <div>
      <h2>Welcome, {username}</h2>

      <h3>Your Links</h3>
      <ul>
        {links.map((link) => (
          <li key={link.id}>
            <a href={link.url} target="_blank" rel="noopener noreferrer">
              {link.title}
            </a>{' '}
            <button onClick={() => handleDeleteLink(link.id)}>Delete</button>
          </li>
        ))}
      </ul>

      <h4>Add New Link</h4>
      <input
        placeholder="Title"
        value={newTitle}
        onChange={(e) => setNewTitle(e.target.value)}
      />
      <input
        placeholder="URL"
        value={newUrl}
        onChange={(e) => setNewUrl(e.target.value)}
      />
      <button onClick={handleAddLink}>Add</button>
    </div>
  );
};

export default DashboardPage;