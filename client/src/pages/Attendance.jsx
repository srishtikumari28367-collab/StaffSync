import { useEffect, useState } from 'react';
import api, { errMsg, fmtDate, fmtTime } from '../api';
import { useAuth } from '../context/AuthContext';
import Layout, { Alert, statusBadge } from '../components/Layout';

export default function Attendance() {
  const { user } = useAuth();
  const canView = user.role !== 'employee';
  const today = new Date().toISOString().slice(0, 10);
  const [mine, setMine] = useState([]);
  const [all, setAll] = useState([]);
  const [date, setDate] = useState(today);
  const [error, setError] = useState('');

  const load = async () => {
    setMine((await api.get('/attendance/mine')).data);
    if (canView) setAll((await api.get(`/attendance?date=${date}`)).data);
  };
  useEffect(() => {
    load().catch((e) => setError(errMsg(e)));
  }, [date]);

  const todayRec = mine.find((a) => a.date === today);

  const act = async (path) => {
    setError('');
    try { await api.post(`/attendance/${path}`); load(); } catch (e) { setError(errMsg(e)); }
  };

  return (
    <Layout title="Attendance">
      <Alert msg={error} onClose={() => setError('')} />
      <div className="card p-3 mb-4 d-flex flex-row align-items-center justify-content-between">
        <div>
          <h5 className="mb-1">Today — {fmtDate(new Date())}</h5>
          <div className="text-muted">
            {todayRec ? `Checked in at ${fmtTime(todayRec.checkIn)}${todayRec.checkOut ? `, out at ${fmtTime(todayRec.checkOut)}` : ''}` : 'You have not checked in yet'}
          </div>
        </div>
        <div>
          <button className="btn btn-success me-2" disabled={!!todayRec} onClick={() => act('checkin')}>Check in</button>
          <button className="btn btn-danger" disabled={!todayRec || !!todayRec?.checkOut} onClick={() => act('checkout')}>Check out</button>
        </div>
      </div>

      <h5>My records</h5>
      <div className="card table-responsive mb-4">
        <table className="table mb-0">
          <thead><tr><th>Date</th><th>In</th><th>Out</th><th>Status</th></tr></thead>
          <tbody>
            {mine.map((a) => (
              <tr key={a._id}><td>{a.date}</td><td>{fmtTime(a.checkIn)}</td><td>{fmtTime(a.checkOut)}</td><td><span className={`badge bg-${statusBadge(a.status)}`}>{a.status}</span></td></tr>
            ))}
            {mine.length === 0 && <tr><td colSpan={4} className="text-center text-muted py-3">No records yet</td></tr>}
          </tbody>
        </table>
      </div>

      {canView && (
        <>
          <div className="d-flex justify-content-between align-items-center mb-2">
            <h5 className="mb-0">{user.role === 'hr' ? 'Company' : 'Team'} attendance</h5>
            <input type="date" className="form-control w-auto" value={date} onChange={(e) => setDate(e.target.value)} />
          </div>
          <div className="card table-responsive">
            <table className="table mb-0">
              <thead><tr><th>Employee</th><th>Department</th><th>In</th><th>Out</th><th>Status</th></tr></thead>
              <tbody>
                {all.map((a) => (
                  <tr key={a._id}><td>{a.user?.name}</td><td>{a.user?.department}</td><td>{fmtTime(a.checkIn)}</td><td>{fmtTime(a.checkOut)}</td><td><span className={`badge bg-${statusBadge(a.status)}`}>{a.status}</span></td></tr>
                ))}
                {all.length === 0 && <tr><td colSpan={5} className="text-center text-muted py-3">No attendance marked on this date</td></tr>}
              </tbody>
            </table>
          </div>
        </>
      )}
    </Layout>
  );
}
