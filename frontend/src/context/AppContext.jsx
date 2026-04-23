import { createContext, useContext, useState, useCallback, useEffect } from 'react';

const AppContext = createContext(null);

export function AppProvider({ children }) {
  const [links, setLinks] = useState(() => {
    const saved = localStorage.getItem('links');
    return saved ? JSON.parse(saved) : [];
  });
  const [collections, setCollections] = useState(() => {
    const saved = localStorage.getItem('collections');
    return saved ? JSON.parse(saved) : [];
  });
  const [tags, setTags] = useState(() => {
    const saved = localStorage.getItem('tags');
    return saved ? JSON.parse(saved) : [];
  });
  const [profile, setProfile] = useState(() => {
    const saved = localStorage.getItem('profile');
    return saved ? JSON.parse(saved) : null;
  });
  const [plan, setPlan] = useState(() => {
    const saved = localStorage.getItem('plan');
    return saved ? JSON.parse(saved) : 'free';
  });

  useEffect(() => {
    localStorage.setItem('links', JSON.stringify(links));
  }, [links]);

  useEffect(() => {
    localStorage.setItem('collections', JSON.stringify(collections));
  }, [collections]);

  useEffect(() => {
    localStorage.setItem('tags', JSON.stringify(tags));
  }, [tags]);

  useEffect(() => {
    localStorage.setItem('profile', JSON.stringify(profile));
  }, [profile]);

  useEffect(() => {
    localStorage.setItem('plan', JSON.stringify(plan));
  }, [plan]);

  const addLink = useCallback((link) => setLinks(prev => [link, ...prev]), []);
  const removeLink = useCallback((id) => setLinks(prev => prev.filter(l => l.id !== id)), []);
  const updateLink = useCallback((id, data) => setLinks(prev => prev.map(l => l.id === id ? { ...l, ...data } : l)), []);
  const addCollection = useCallback((col) => setCollections(prev => [col, ...prev]), []);
  const removeCollection = useCallback((id) => setCollections(prev => prev.filter(c => c.id !== id)), []);
  const updateCollection = useCallback((id, data) => setCollections(prev => prev.map(c => c.id === id ? { ...c, ...data } : c)), []);

  return (
    <AppContext.Provider value={{
      links, setLinks, addLink, removeLink, updateLink,
      collections, setCollections, addCollection, removeCollection, updateCollection,
      tags, setTags,
      profile, setProfile,
      plan, setPlan,
    }}>
      {children}
    </AppContext.Provider>
  );
}

export const useApp = () => {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be inside AppProvider');
  return ctx;
};
