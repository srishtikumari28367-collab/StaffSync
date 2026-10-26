import { useEffect, useState } from 'react';
import api, { errMsg, fmtDate } from '../api';
import Layout, { Alert } from '../components/Layout';

export default function Profile() {
  const [me, setMe] = useState(null);
  const [form, setForm] = useState({ name: '', phone: '', address: '', password: '' });
  const [error, setError] = useState('');
  const [ok, setOk] = useState('');

  useEffect(() => {
    api.get('/auth/me').then((r) => {
      setMe(r.data);
      setForm({ name: r.data.name, phone: r.data.phone || '', address: r.data.address || '', password: '' });
    }).catch((e) => setError(errMsg(e)));
  }, []);

  const save = async (e) => {
    e.preventDefault();
    setError(''); setOk('');
    try {
      const body = { ...form };
      if (!body.password) delete body.password;
      const { data } = await api.put('/users/me/profile', body);
      setMe(data);
      const stored = JSON.parse(localStorage.getItem('user') || '{}');
      localStorage.setItem('user', JSON.stringify({ ...stored, name: data.name }));
      setForm({ ...form, password: '' });
      setOk('Profile updated');
    } catch (err) {
      setError(errMsg(err));
    }
  };

  if (!me) return <Layout title="My Profile"><Alert msg={error} /></Layout>;

  return (
    <Layout title="My Profile">
      <Alert msg={error} onClose={() => setError('')} />
      <Alert msg={ok} type="success" onClose={() => setOk('')} />
      <div className="row">
        <div className="col-md-4 mb-3">
          <div className="card p-3">
            <h5>{me.name}</h5>
            <div className="text-muted">{me.email}</div>
            <hr />
            <div><strong>Role:</strong> <span className="text-capitalize">{me.role}</span></div>
            <div><strong>Department:</strong> {me.department}</div>
            <div><strong>Designation:</strong> {me.designation || '-'}</div>
            <div><strong>Joined:</strong> {fmtDate(me.joinDate)}</div>
            <div><strong>Leave balance:</strong> {me.leaveBalance} days</div>
          </div>
        </div>
        <div className="col-md-8">
          <form className="card p-3" onSubmit={save}>
            <h5>Edit personal details</h5>
            <label className="form-label">Name</label>
            <input className="form-control mb-2" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
            <label className="form-label">Phone</label>
            <input className="form-control mb-2" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
            <label className="form-label">Address</label>
            <textarea className="form-control mb-2" rows={2} value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} />
            <label className="form-label">New password (optional)</label>
            <input type="password" className="form-control mb-3" minLength={6} value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
            <button className="btn btn-primary align-self-start">Save changes</button>
          </form>
        </div>
      </div>
    </Layout>
  );
}
