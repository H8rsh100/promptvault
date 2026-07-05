import React, { useState, useEffect } from 'react';
import { Search, Plus, Key, LogOut, Terminal, BookOpen, Layers, ShieldCheck, Cpu } from 'lucide-react';

export default function App() {
  const [token, setToken] = useState(localStorage.getItem('token') || '');
  const [username, setUsername] = useState(localStorage.getItem('username') || '');
  const [prompts, setPrompts] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isRegister, setIsRegister] = useState(false);
  
  // Auth Form State
  const [authForm, setAuthForm] = useState({ username: '', email: '', password: '' });
  const [authError, setAuthError] = useState('');
  
  // Create Prompt Form State
  const [newPrompt, setNewPrompt] = useState({ title: '', content: '', tags: '' });
  const [showAddForm, setShowAddForm] = useState(false);

  // Mock initial prompts for standalone frontend showcase mode
  const defaultPrompts = [
    {
      id: 1,
      title: "Zero-Shot JSON Compiler",
      content: "Act as a deterministic JSON generator. Your output must match the following JSON schema strictly without conversational greetings or wrap text: { \"gravity\": float, \"colorMode\": string }",
      tags: "system-prompt, json, gemini",
      created_at: new Date().toISOString()
    },
    {
      id: 2,
      title: "LaTeX Formulations assistant",
      content: "Explain the following mathematical concepts in LaTeX blocks using $ and $$. Prioritize readability and step-by-step proofs.",
      tags: "latex, math, academic",
      created_at: new Date(Date.now() - 3600000).toISOString()
    },
    {
      id: 3,
      title: "Git Conventional Commit hook",
      content: "Rewrite this commit message to follow conventional commit standards (feat, fix, docs, chore, style, refactor).",
      tags: "git, workflow",
      created_at: new Date(Date.now() - 7200000).toISOString()
    }
  ];

  useEffect(() => {
    // Load mock prompts or fetch from backend API if active
    const saved = localStorage.getItem('local_prompts');
    if (saved) {
      setPrompts(JSON.parse(saved));
    } else {
      setPrompts(defaultPrompts);
      localStorage.setItem('local_prompts', JSON.stringify(defaultPrompts));
    }
  }, []);

  const handleAuth = (e) => {
    e.preventDefault();
    if (!authForm.username || !authForm.password || (isRegister && !authForm.email)) {
      setAuthError('Please fill in all required fields');
      return;
    }
    
    // Simulate API registration / login and store token
    const fakeToken = "jwt_mock_token_" + Math.random().toString(36).substring(2);
    setToken(fakeToken);
    setUsername(authForm.username);
    localStorage.setItem('token', fakeToken);
    localStorage.setItem('username', authForm.username);
    setAuthError('');
    setAuthForm({ username: '', email: '', password: '' });
  };

  const handleLogout = () => {
    setToken('');
    setUsername('');
    localStorage.removeItem('token');
    localStorage.removeItem('username');
  };

  const handleCreatePrompt = (e) => {
    e.preventDefault();
    if (!newPrompt.title || !newPrompt.content) return;

    const created = {
      id: Date.now(),
      title: newPrompt.title,
      content: newPrompt.content,
      tags: newPrompt.tags,
      created_at: new Date().toISOString()
    };

    const updated = [created, ...prompts];
    setPrompts(updated);
    localStorage.setItem('local_prompts', JSON.stringify(updated));
    setNewPrompt({ title: '', content: '', tags: '' });
    setShowAddForm(false);
  };

  const filteredPrompts = prompts.filter(p => 
    p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.tags.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="app-container">
      {/* Top Header */}
      <header style={{ display: 'flex', justifyContent: 'between', alignItems: 'center', marginBottom: '3rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
          <ShieldCheck size={32} color="#6366f1" />
          <div>
            <h1 style={{ fontSize: '1.8rem', letterSpacing: '-0.03em' }}>PROMPT<span className="gradient-text">VAULT</span></h1>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Secure AI Prompt Store & Token Compiler</p>
          </div>
        </div>
        
        {token && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginLeft: 'auto' }}>
            <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Logged in as: <strong style={{ color: '#fff' }}>{username}</strong></span>
            <button className="btn btn-secondary" onClick={handleLogout} style={{ padding: '0.5rem 1rem' }}>
              <LogOut size={16} /> Logout
            </button>
          </div>
        )}
      </header>

      {!token ? (
        /* Auth Panel */
        <div style={{ maxWidth: '400px', margin: '4rem auto' }} className="glass-panel">
          <h2 style={{ marginBottom: '1.5rem', textAlign: 'center' }}>
            {isRegister ? 'Create Vault Account' : 'Authenticate Vault'}
          </h2>
          {authError && <div style={{ color: '#ef4444', marginBottom: '1rem', fontSize: '0.9rem' }}>{authError}</div>}
          
          <form onSubmit={handleAuth} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div>
              <label style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '0.3rem' }}>Username</label>
              <input 
                type="text" 
                className="form-input" 
                placeholder="developer"
                value={authForm.username}
                onChange={e => setAuthForm({ ...authForm, username: e.target.value })}
              />
            </div>
            
            {isRegister && (
              <div>
                <label style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '0.3rem' }}>Email</label>
                <input 
                  type="email" 
                  className="form-input" 
                  placeholder="name@domain.com"
                  value={authForm.email}
                  onChange={e => setAuthForm({ ...authForm, email: e.target.value })}
                />
              </div>
            )}
            
            <div>
              <label style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '0.3rem' }}>Master Password</label>
              <input 
                type="password" 
                className="form-input" 
                placeholder="••••••••"
                value={authForm.password}
                onChange={e => setAuthForm({ ...authForm, password: e.target.value })}
              />
            </div>

            <button type="submit" className="btn" style={{ marginTop: '1rem', width: '100%', justifyContent: 'center' }}>
              <Key size={18} /> {isRegister ? 'Sign Up' : 'Unlock Vault'}
            </button>
          </form>

          <p style={{ marginTop: '1.5rem', textAlign: 'center', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
            {isRegister ? 'Already have a vault?' : 'New to promptvault?'} {' '}
            <span 
              onClick={() => { setIsRegister(!isRegister); setAuthError(''); }}
              style={{ color: 'var(--color-accent)', cursor: 'pointer', fontWeight: '500' }}
            >
              {isRegister ? 'Sign In' : 'Create One'}
            </span>
          </p>
        </div>
      ) : (
        /* Dashboard Panel */
        <div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', alignItems: 'center', marginBottom: '2rem' }}>
            <div style={{ position: 'relative', flex: 1, minWidth: '280px' }}>
              <Search style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} size={18} />
              <input 
                type="text" 
                className="form-input" 
                placeholder="Search prompt titles, tags or contents..." 
                style={{ paddingLeft: '2.8rem' }}
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
              />
            </div>
            
            <button className="btn" onClick={() => setShowAddForm(!showAddForm)}>
              <Plus size={18} /> New Prompt
            </button>
          </div>

          {showAddForm && (
            <div className="glass-panel" style={{ marginBottom: '2rem' }}>
              <h3 style={{ marginBottom: '1.2rem' }}>Add Prompt Template</h3>
              <form onSubmit={handleCreatePrompt} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div>
                  <input 
                    type="text" 
                    className="form-input" 
                    placeholder="Prompt Title (e.g., Code Refactor Hook)" 
                    value={newPrompt.title}
                    onChange={e => setNewPrompt({ ...newPrompt, title: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <textarea 
                    className="form-input" 
                    placeholder="System instruction or Prompt body..." 
                    style={{ minHeight: '120px', resize: 'vertical' }}
                    value={newPrompt.content}
                    onChange={e => setNewPrompt({ ...newPrompt, content: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <input 
                    type="text" 
                    className="form-input" 
                    placeholder="Tags (comma-separated: git, api, system)" 
                    value={newPrompt.tags}
                    onChange={e => setNewPrompt({ ...newPrompt, tags: e.target.value })}
                  />
                </div>
                <div style={{ display: 'flex', gap: '1rem', marginTop: '0.5rem' }}>
                  <button type="submit" className="btn">Save Template</button>
                  <button type="button" className="btn btn-secondary" onClick={() => setShowAddForm(false)}>Cancel</button>
                </div>
              </form>
            </div>
          )}

          {/* Prompt Cards Grid */}
          <div className="prompt-grid">
            {filteredPrompts.length > 0 ? (
              filteredPrompts.map(p => (
                <div key={p.id} className="prompt-card">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.8rem' }}>
                    <h3 style={{ fontSize: '1.2rem' }}>{p.title}</h3>
                    <Terminal size={16} color="var(--text-secondary)" />
                  </div>
                  
                  <div style={{ 
                    background: 'rgba(0,0,0,0.2)', 
                    padding: '0.8rem', 
                    borderRadius: '6px', 
                    fontSize: '0.9rem', 
                    fontFamily: 'monospace',
                    color: '#e5e7eb',
                    maxHeight: '120px',
                    overflowY: 'auto',
                    border: '1px solid rgba(255,255,255,0.03)',
                    whiteSpace: 'pre-wrap'
                  }}>
                    {p.content}
                  </div>
                  
                  <div className="tag-list">
                    {p.tags.split(',').map((tag, idx) => {
                      const t = tag.trim();
                      return t && <span key={idx} className="tag">#{t}</span>;
                    })}
                  </div>
                </div>
              ))
            ) : (
              <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '4rem 0', color: 'var(--text-secondary)' }}>
                <BookOpen size={48} style={{ marginBottom: '1rem', opacity: 0.5 }} />
                <p>No matching prompts found in this vault.</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
