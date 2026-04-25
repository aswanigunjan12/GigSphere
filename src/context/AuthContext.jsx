import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

// Seed demo accounts — only if they don't already exist in storage
// This prevents overwriting profile edits on reload
const seedDemoUsers = () => {
  const existing = JSON.parse(localStorage.getItem('gigsphere_users') || '[]');

  const demoDefaults = [
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

  let changed = false;
  for (const demo of demoDefaults) {
    const existingIdx = existing.findIndex((u) => u.email === demo.email);
    if (existingIdx === -1) {
      // Demo user doesn't exist at all → add it
      existing.push(demo);
      changed = true;
    }
    // If already exists, do NOT overwrite — user may have edited their profile
  }
  if (changed) {
    localStorage.setItem('gigsphere_users', JSON.stringify(existing));
  }
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    seedDemoUsers();
    const savedUser = localStorage.getItem('gigsphere_user');
    if (savedUser) {
      try {
        const parsed = JSON.parse(savedUser);
        // Re-hydrate from the users store to pick up the latest profile data
        const allUsers = JSON.parse(localStorage.getItem('gigsphere_users') || '[]');
        const fresh = allUsers.find((u) => u.id === parsed.id);
        if (fresh) {
          const { password: _pw, ...sessionUser } = fresh;
          localStorage.setItem('gigsphere_user', JSON.stringify(sessionUser));
          setUser(sessionUser);
        } else {
          setUser(parsed);
        }
      } catch {
        setUser(null);
      }
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

  /**
   * updateUser(updates)
   * Merges partial updates into the current user, persists to:
   *   1. gigsphere_user   (session — what gets restored on refresh)
   *   2. gigsphere_users  (user store — so login re-loads the latest profile)
   *   3. gs_users          (mock-seed store — so mock users also update)
   * Also clears AI recommendation cache so skill changes take effect immediately.
   */
  const updateUser = (updates) => {
    if (!user) return;

    const merged = { ...user, ...updates };

    // 1. Update React state
    setUser(merged);

    // 2. Persist to session
    localStorage.setItem('gigsphere_user', JSON.stringify(merged));

    // 3. Update gigsphere_users store
    const appUsers = JSON.parse(localStorage.getItem('gigsphere_users') || '[]');
    const idx = appUsers.findIndex((u) => u.id === merged.id);
    if (idx !== -1) {
      // Preserve the stored password
      appUsers[idx] = { ...appUsers[idx], ...merged };
    } else {
      appUsers.push(merged);
    }
    localStorage.setItem('gigsphere_users', JSON.stringify(appUsers));

    // 4. Also update gs_users (mock-seed store) if the user exists there
    const gsUsers = JSON.parse(localStorage.getItem('gs_users') || '[]');
    const gsIdx = gsUsers.findIndex((u) => u.id === merged.id || u.email === merged.email);
    if (gsIdx !== -1) {
      gsUsers[gsIdx] = { ...gsUsers[gsIdx], ...merged };
      localStorage.setItem('gs_users', JSON.stringify(gsUsers));
    }

    // 5. Clear AI recommendation cache so updated skills re-trigger matching
    localStorage.removeItem('gs_ai_recommendations');
  };

  const logout = () => {
    localStorage.removeItem('gigsphere_user');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, signup, logout, updateUser, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);