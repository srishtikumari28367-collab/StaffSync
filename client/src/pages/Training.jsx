import { useEffect, useState } from 'react';
import api, { errMsg, fmtDate } from '../api';
import { useAuth } from '../context/AuthContext';
import Layout, { Alert, statusBadge } from '../components/Layout';

const empty = { title: '', description: '', startDate: '', endDate: '', mode: 'online', participantIds: [] };

export default function Training() {
  const { user } = useAuth();
  const canManage = user.role !== 'employee';
  const [items, setItems] = useState([]);
  const [team, setTeam] = useState([]);
  const [form, setForm] = useState(empty);
  const [show, setShow] = useState(false);
  const [error, setError] = useState('');

  const load = async () => {
    setItems((await api.get('/training')).data);
    if (canManage) setTeam((await api.get('/users')).data.filter((u) => u.active));
  };
  useEffect(() => {
    load().catch((e) => setError(errMsg(e)));
  }, []);

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });
  const toggleP = (id) =>
    setForm({ ...form, participantIds: form.participantIds.includes(id) ? form.participantIds.filter((x) => x !== id) : [...form.participantIds, id] });

  const submit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/training', form);
      setForm(empty);
      setShow(false);
      load();
    } catch (err) {
      setError(errMsg(err));
    }
  };

  const progress = async (id, status) => {
    try { await api.put(`/training/${id}/progress`, { status }); load(); } catch (err) { setError(errMsg(err)); }
  };
  const remove = async (id) => {
    if (!confirm('Delete this program?')) return;
    try { await api.delete(`/training/${id}`); load(); } catch (err) { setError(errMsg(err)); }
  };

  return (
    <Layout title="Training & Development" actions={canManage && <button className="btn btn-primary" onClick={() => setShow(!show)}>+ New program</button>}>
      <Alert msg={error} onClose={() => setError('')} />
      {show && (
        <form className="card p-3 mb-3" onSubmit={submit}>
          <div className="row g-2">
            <div className="col-md-6"><input className="form-control" placeholder="Program title" value={form.title} onChange={set('title')} required /></div>
            <div className="col-md-2"><input type="date" className="form-control" value={form.startDate} onChange={set('startDate')} required /></div>
            <div className="col-md-2"><input type="date" className="form-control" value={form.endDate} min={form.startDate} onChange={set('endDate')} required /></div>
            <div className="col-md-2">
              <select className="form-select" value={form.mode} onChange={set('mode')}><option value="online">Online</option><option value="offline">Offline</option></select>
            </div>
            <div className="col-12"><textarea className="form-control" rows={2} placeholder="Description" value={form.description} onChange={set('description')} /></div>
            <div className="col-12">
              <div className="small text-muted mb-1">Assign participants</div>
              {team.filter((u) => u._id !== user._id).map((u) => (
                <label key={u._id} className="me-3">
                  <input type="checkbox" className="form-check-input me-1" checked={form.participantIds.includes(u._id)} onChange={() => toggleP(u._id)} />{u.name}
                </label>
              ))}
              {team.length === 0 && <span className="text-muted">No team members available.</span>}
            </div>
          </div>
          <button className="btn btn-success mt-3 align-self-start">Create program</button>
        </form>
      )}

      <div className="row">
        {items.map((t) => {
          const me = t.participants.find((p) => p.user?._id === user._id);
          return (
            <div className="col-md-6 mb-3" key={t._id}>
              <div className="card p-3 h-100">
                <div className="d-flex justify-content-between">
                  <h5>{t.title}</h5>
                  <span className="badge bg-dark align-self-start text-capitalize">{t.mode}</span>
                </div>
                <p className="mb-1">{t.description}</p>
                <small className="text-muted">{fmtDate(t.startDate)} → {fmtDate(t.endDate)} · by {t.createdBy?.name}</small>
                <div className="mt-2">
                  {t.participants.map((p) => (
                    <span key={p.user?._id} className={`badge bg-${statusBadge(p.status)} me-1`}>{p.user?.name}: {p.status}</span>
                  ))}
                </div>
                <div className="mt-3">
                  {me && me.status !== 'completed' && (
                    <>
                      {me.status === 'assigned' && <button className="btn btn-sm btn-primary me-2" onClick={() => progress(t._id, 'in-progress')}>Start</button>}
                      <button className="btn btn-sm btn-success" onClick={() => progress(t._id, 'completed')}>Mark complete</button>
                    </>
                  )}
                  {canManage && (user.role === 'hr' || t.createdBy?._id === user._id) && (
                    <button className="btn btn-sm btn-outline-danger float-end" onClick={() => remove(t._id)}>Delete</button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
        {items.length === 0 && <p className="text-muted">No training programs yet.</p>}
      </div>
    </Layout>
  );
}
