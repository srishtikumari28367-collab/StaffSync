import { useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { errMsg } from '../api';
import { Alert } from '../components/Layout';

export default function Login() {
  const { user, login, register } = useAuth();
  const navigate = useNavigate();
  const [mode, setMode] = useState('login');
  const [form, setForm] = useState({ name: '', email: '', password: '', department: '' });
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  if (user) return <Navigate to="/" replace />;

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    setBusy(true);
    try {
      if (mode === 'login') await login(form.email, form.password);
      else await register(form);
      navigate('/');
    } catch (err) {
      setError(errMsg(err));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="login-wrap">
      <div className="card p-4" style={{ width: 400 }}>
        <h3 className="brand text-center mb-1">StaffSync</h3>
        <p className="text-center text-muted">Modern HR management</p>
        <Alert msg={error} />
        <form onSubmit={submit}>
          {mode === 'register' && (
            <>
              <input className="form-control mb-2" placeholder="Full name" value={form.name} onChange={set('name')} required />
              <input className="form-control mb-2" placeholder="Department" value={form.department} onChange={set('department')} />
            </>
          )}
          <input type="email" className="form-control mb-2" placeholder="Email" value={form.email} onChange={set('email')} required />
          <input type="password" className="form-control mb-3" placeholder="Password (min 6 chars)" value={form.password} onChange={set('password')} required minLength={6} />
          <button className="btn btn-primary w-100" disabled={busy}>
            {busy ? 'Please wait...' : mode === 'login' ? 'Login' : 'Create employee account'}
          </button>
        </form>
        <button className="btn btn-link mt-2" onClick={() => setMode(mode === 'login' ? 'register' : 'login')}>
          {mode === 'login' ? "New employee? Register" : 'Already have an account? Login'}
        </button>
        <small className="text-muted text-center">Demo (after seeding): hr@ / manager@ / employee@staffsync.com — password123</small>
      </div>
    </div>
  );
}
