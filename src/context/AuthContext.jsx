import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

// Seed demo accounts — always overwrite so stale localStorage data can't block login
const seedDemoUsers = () => {
  const existing = JSON.parse(localStorage.getItem('gigsphere_users') || '[]');
  // Remove any stale demo accounts then re-add fresh ones
  const nonDemo = existing.filter(
    (u) => u.email !== 'alex@example.com' && u.email !== 'techstart@example.com'
  );
  const demoUsers = [
    {
      id: 'demo-student-1',
      email: 'alex@example.com',
      password: 'password123',
      name: 'Alex Rivera',
      role: 'student',
      avatar: '🧑‍💻',
      skills: ['React', 'JavaScript', 'Design'],
      availability: 'Weekends',
      location: 'Bhopal, India',
    },
    {
      id: 'demo-business-1',
      email: 'techstart@example.com',
      password: 'password123',
      name: 'TechStart Inc.',
      role: 'business',
      avatar: '🏢',
      industry: 'Technology',
      location: 'Mumbai, India',
    },
  ];
  localStorage.setItem('gigsphere_users', JSON.stringify([...nonDemo, ...demoUsers]));
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    seedDemoUsers();
    const savedUser = localStorage.getItem('gigsphere_user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
    setLoading(false);
  }, []);

  const login = (email, password) => {
    if (!email || !password) return { success: false, error: 'Please enter email and password.' };
    // Check both stores: gigsphere_users (new signups) + gs_users (storage.js mock seed)
    const appUsers  = JSON.parse(localStorage.getItem('gigsphere_users') || '[]');
    const mockUsers = JSON.parse(localStorage.getItem('gs_users') || '[]');
    const allUsers  = [...appUsers, ...mockUsers];
    const found = allUsers.find((u) => u.email === email && u.password === password);
    if (!found) return { success: false, error: 'Invalid email or password.' };
    const { password: _pw, ...sessionUser } = found;
    localStorage.setItem('gigsphere_user', JSON.stringify(sessionUser));
    setUser(sessionUser);
    return { success: true, error: null };
  };

  const signup = (userData) => {
    if (!userData.name || !userData.email || !userData.password)
      return { success: false, error: 'Please fill in all required fields.' };
    if (userData.password.length < 6)
      return { success: false, error: 'Password must be at least 6 characters.' };
    const users = JSON.parse(localStorage.getItem('gigsphere_users') || '[]');
    if (users.find((u) => u.email === userData.email))
      return { success: false, error: 'An account with this email already exists.' };
    const newUser = { id: Date.now().toString(), ...userData };
    localStorage.setItem('gigsphere_users', JSON.stringify([...users, newUser]));
    const { password: _pw, ...sessionUser } = newUser;
    localStorage.setItem('gigsphere_user', JSON.stringify(sessionUser));
    setUser(sessionUser);
    return { success: true, error: null };
  };

  const logout = () => {
    localStorage.removeItem('gigsphere_user');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, signup, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);