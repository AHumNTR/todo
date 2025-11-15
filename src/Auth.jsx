// src/Auth.jsx
import React, { useState } from 'react';
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(import.meta.env.VITE_SUPABASE_URL, import.meta.env.VITE_SUPABASE_ANON_KEY);
export default function Auth() {
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [statusMsg, setStatusMsg] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleRegister = async (e) => {
    e.preventDefault();
    setStatusMsg(null);
    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signUp({
	email:email,
        password:password
      });

      if (error) throw error;
      // When email confirmations are enabled, Supabase sends a confirmation link.
      setStatusMsg('Registration OK — check your email for a confirmation link (if enabled). If your project uses auto-confirm, you should be logged in.');
    } catch (err) {
      setStatusMsg(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setStatusMsg(null);
    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });
      if (error) throw error;
      if (data?.session) {
        setStatusMsg('Signed in successfully');
      } else {
        setStatusMsg('Sign-in attempt made. Check your email if using magic links.');
      }
    } catch (err) {
      setStatusMsg(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: 420, margin: '40px auto', padding: 20, border: '1px solid #eee', borderRadius: 8 }}>
      <h2 style={{ marginTop: 0 }}>{isRegister ? 'Register' : 'Sign In'}</h2>

      <form onSubmit={isRegister ? handleRegister : handleLogin}>
        <label style={{ display: 'block', marginBottom: 8 }}>
          Email
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            style={{ width: '100%', padding: 8, marginTop: 6 }}
          />
        </label>

        <label style={{ display: 'block', marginBottom: 12 }}>
          Password
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            style={{ width: '100%', padding: 8, marginTop: 6 }}
          />
        </label>

        <div style={{ display: 'flex', gap: 8 }}>
          <button type="submit" disabled={loading} style={{ padding: '8px 12px' }}>
            {isRegister ? 'Register' : 'Sign in'}
          </button>

          <button
            type="button"
            onClick={() => {
              setIsRegister((s) => !s);
              setStatusMsg(null);
            }}
            style={{ padding: '8px 12px', background: '#eee', border: 'none' }}
          >
            {isRegister ? 'Have an account? Sign in' : "Don't have an account? Register"}
          </button>
        </div>
      </form>

      {statusMsg && <div style={{ marginTop: 12, color: '#333' }}>{statusMsg}</div>}

      <hr style={{ margin: '18px 0' }} />

      <div style={{ fontSize: 13, color: '#666' }}>
        Tip: this app uses email+password auth. If your Supabase project requires email confirmations, check the inbox for a confirmation link after registering.
      </div>
    </div>
  );
}
