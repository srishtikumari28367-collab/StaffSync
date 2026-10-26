import { useEffect, useState } from 'react';
import api, { errMsg, fmtDate } from '../api';
import { useAuth } from '../context/AuthContext';
import Layout, { Alert, statusBadge } from '../components/Layout';

export default function Leaves() {
  const { user } = useAuth();
  const canReview = user.role !== 'employee';
  const [mine, setMine] = useState([]);
  const [requests, setRequests] = useState([]);
  const [form, setForm] = useState({ type: 'casual', startDate: '', endDate: '', reason: '' });
  const [error, setError] = useState('');
  const [ok, setOk] = useState('');

  const load = async () => {
    setMine((await api.get('/leaves/mine')).data);
    if (canReview) setRequests((await api.get('/leaves')).data);
  };
  useEffect(() => {
    load().catch((e) => setError(errMsg(e)));
  }, []);

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const apply = async (e) => {
    e.preventDefault();
    setError(''); setOk('');
    try {
      await api.post('/leaves', form);
      setForm({ type: 'casual', startDate: '', endDate: '', reason: '' });
      setOk('Leave request submitted');
      load();
    } catch (err) {
      setError(errMsg(err));
    }
  };

  const review = async (id, status) => {
    const reviewNote = status === 'rejected' ? prompt('Reason for rejection (optional):') || '' : '';
    try {
      await api.put(`/leaves/${id}/status`, { status, reviewNote });
      load();
    } catch (err) {
      setError(errMsg(err));
    }
  };

  const cancel = async (id) => {
    try { await api.delete(`/leaves/${id}`); load(); } catch (err) { setError(errMsg(err)); }
  };

  const toReview = requests.filter((r) => r.user?._id !== user._id);

  return (
    <Layout title="Leaves">
      <Alert msg={error} onClose={() => setError('')} />
      <Alert msg={ok} type="success" onClose={() => setOk('')} />

      <form className="card p-3 mb-4" onSubmit={apply}>
        <h5>Apply for leave</h5>
        <div className="row g-2">
          <div className="col-md-2">
            <select className="form-select" value={form.type} onChange={set('type')}>
              <option value="casual">Casual</option><option value="sick">Sick</option><option value="earned">Earned</option><option value="unpaid">Unpaid</option>
            </select>
          </div>
          <div className="col-md-2"><input type="date" className="form-control" value={form.startDate} onChange={set('startDate')} required /></div>
          <div className="col-md-2"><input type="date" className="form-control" value={form.endDate} min={form.startDate} onChange={set('endDate')} required /></div>
          <div className="col-md-4"><input className="form-control" placeholder="Reason" value={form.reason} onChange={set('reason')} required /></div>
          <div className="col-md-2"><button className="btn btn-primary w-100">Submit</button></div>
        </div>
      </form>

      <h5>My leave history</h5>
      <div className="card table-responsive mb-4">
        <table className="table mb-0">
          <thead><tr><th>Type</th><th>From</th><th>To</th><th>Days</th><th>Reason</th><th>Status</th><th>Reviewed by</th><th /></tr></thead>
          <tbody>
            {mine.map((l) => (
              <tr key={l._id}>
                <td className="text-capitalize">{l.type}</td><td>{fmtDate(l.startDate)}</td><td>{fmtDate(l.endDate)}</td><td>{l.days}</td><td>{l.reason}</td>
                <td><span className={`badge bg-${statusBadge(l.status)}`}>{l.status}</span></td>
                <td>{l.reviewedBy?.name || '-'}{l.reviewNote && <div className="small text-muted">{l.reviewNote}</div>}</td>
                <td>{l.status === 'pending' && <button className="btn btn-sm btn-outline-danger" onClick={() => cancel(l._id)}>Cancel</button>}</td>
              </tr>
            ))}
            {mine.length === 0 && <tr><td colSpan={8} className="text-center text-muted py-3">No leave requests yet</td></tr>}
          </tbody>
        </table>
      </div>

      {canReview && (
        <>
          <h5>{user.role === 'hr' ? 'All leave requests' : 'Team leave requests'}</h5>
          <div className="card table-responsive">
            <table className="table mb-0">
              <thead><tr><th>Employee</th><th>Type</th><th>From</th><th>To</th><th>Days</th><th>Reason</th><th>Status</th><th /></tr></thead>
              <tbody>
                {toReview.map((l) => (
                  <tr key={l._id}>
                    <td>{l.user?.name}<div className="small text-muted">{l.user?.department}</div></td>
                    <td className="text-capitalize">{l.type}</td><td>{fmtDate(l.startDate)}</td><td>{fmtDate(l.endDate)}</td><td>{l.days}</td><td>{l.reason}</td>
                    <td><span className={`badge bg-${statusBadge(l.status)}`}>{l.status}</span></td>
                    <td className="text-nowrap">
                      {l.status === 'pending' && (
                        <>
                          <button className="btn btn-sm btn-success me-1" onClick={() => review(l._id, 'approved')}>Approve</button>
                          <button className="btn btn-sm btn-danger" onClick={() => review(l._id, 'rejected')}>Reject</button>
                        </>
                      )}
                    </td>
                  </tr>
                ))}
                {toReview.length === 0 && <tr><td colSpan={8} className="text-center text-muted py-3">Nothing to review</td></tr>}
              </tbody>
            </table>
          </div>
        </>
      )}
    </Layout>
  );
}
