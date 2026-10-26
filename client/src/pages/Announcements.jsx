import { useEffect, useState } from 'react';
import api, { errMsg, fmtDate } from '../api';
import { useAuth } from '../context/AuthContext';
import Layout, { Alert } from '../components/Layout';

const empty = { title: '', content: '', category: 'announcement', pinned: false };

export default function Announcements() {
  const { user } = useAuth();
  const isHR = user.role === 'hr';
  const [items, setItems] = useState([]);
  const [form, setForm] = useState(empty);
  const [show, setShow] = useState(false);
  const [error, setError] = useState('');

  const load = async () => setItems((await api.get('/announcements')).data);
  useEffect(() => {
    load().catch((e) => setError(errMsg(e)));
  }, []);

  const submit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/announcements', form);
      setForm(empty);
      setShow(false);
      load();
    } catch (err) {
      setError(errMsg(err));
    }
  };

  const remove = async (id) => {
    if (!confirm('Delete this post?')) return;
    await api.delete(`/announcements/${id}`);
    load();
  };

  return (
    <Layout title="Announcements & News" actions={isHR && <button className="btn btn-primary" onClick={() => setShow(!show)}>+ New post</button>}>
      <Alert msg={error} onClose={() => setError('')} />
      {show && (
        <form className="card p-3 mb-3" onSubmit={submit}>
          <input className="form-control mb-2" placeholder="Title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
          <textarea className="form-control mb-2" rows={4} placeholder="Content" value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })} required />
          <div className="d-flex gap-3 align-items-center">
            <select className="form-select w-auto" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
              <option value="announcement">Announcement</option><option value="news">News</option><option value="policy">Policy</option><option value="event">Event</option>
            </select>
            <label className="form-check-label"><input type="checkbox" className="form-check-input me-1" checked={form.pinned} onChange={(e) => setForm({ ...form, pinned: e.target.checked })} />Pin to top</label>
            <button className="btn btn-success ms-auto">Publish</button>
          </div>
        </form>
      )}
      {items.map((a) => (
        <div className="card p-3 mb-3" key={a._id}>
          <div className="d-flex justify-content-between">
            <h5>{a.pinned && '📌 '}{a.title} <span className="badge bg-secondary ms-1">{a.category}</span></h5>
            {isHR && <button className="btn btn-sm btn-outline-danger" onClick={() => remove(a._id)}>Delete</button>}
          </div>
          <p style={{ whiteSpace: 'pre-wrap' }}>{a.content}</p>
          <small className="text-muted">Posted by {a.postedBy?.name} on {fmtDate(a.createdAt)}</small>
        </div>
      ))}
      {items.length === 0 && <p className="text-muted">Nothing posted yet.</p>}
    </Layout>
  );
}
