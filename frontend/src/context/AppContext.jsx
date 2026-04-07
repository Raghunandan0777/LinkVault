import { createContext, useContext, useState, useCallback } from 'react';

const AppContext = createContext(null);

export function AppProvider({ children }) {
  const [links, setLinks] = useState([]);
  const [collections, setCollections] = useState([]);
  const [tags, setTags] = useState([]);
  const [profile, setProfile] = useState(null);
  const [plan, setPlan] = useState('free');

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
