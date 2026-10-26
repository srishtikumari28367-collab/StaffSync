import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api, { fmtDate } from '../api';
import { useAuth } from '../context/AuthContext';
import Layout from '../components/Layout';

export default function Dashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState({});
  const [news, setNews] = useState([]);

  useEffect(() => {
    (async () => {
      const s = {};
      const today = new Date().toISOString().slice(0, 10);
      try {
        const me = (await api.get('/auth/me')).data;
        s.balance = me.leaveBalance;
        const mine = (await api.get('/leaves/mine')).data;
        s.myPending = mine.filter((l) => l.status === 'pending').length;
        const att = (await api.get('/attendance/mine')).data;
        s.today = att.find((a) => a.date === today);
        if (user.role !== 'employee') {
          s.reviewPending = (await api.get('/leaves')).data.filter((l) => l.status === 'pending' && l.user?._id !== user._id).length;
          s.team = (await api.get('/users')).data.length;
          s.presentToday = (await api.get(`/attendance?date=${today}`)).data.length;
        }
        setNews((await api.get('/announcements')).data.slice(0, 4));
      } catch {}
      setStats(s);
    })();
  }, [user]);

  const Tile = ({ cls, label, value, to }) => (
    <div className="col-md-3 col-6 mb-3">
      <Link to={to} className="text-decoration-none">
        <div className={`card card-stat p-3 ${cls}`}>
          <small>{label}</small>
          <h2 className="mb-0">{value ?? '-'}</h2>
        </div>
      </Link>
    </div>
  );

  return (
    <Layout title={`Welcome, ${user.name}`}>
      <div className="row">
        <Tile cls="bg-grad-1" label="Leave balance (days)" value={stats.balance} to="/leaves" />
        <Tile cls="bg-grad-2" label="My pending leaves" value={stats.myPending} to="/leaves" />
        <Tile cls="bg-grad-4" label="Today's attendance" value={stats.today ? (stats.today.checkOut ? 'Done' : 'Checked in') : 'Not marked'} to="/attendance" />
        {user.role !== 'employee' && <Tile cls="bg-grad-3" label="Requests to review" value={stats.reviewPending} to="/leaves" />}
        {user.role !== 'employee' && <Tile cls="bg-grad-1" label={user.role === 'hr' ? 'Total employees' : 'Team size'} value={stats.team} to="/employees" />}
        {user.role !== 'employee' && <Tile cls="bg-grad-2" label="Present today" value={stats.presentToday} to="/attendance" />}
      </div>
      <div className="card p-3 mt-2">
        <h5>Latest announcements</h5>
        {news.length === 0 && <p className="text-muted mb-0">No announcements yet.</p>}
        {news.map((n) => (
          <div key={n._id} className="border-bottom py-2">
            <strong>{n.pinned && '📌 '}{n.title}</strong> <span className="badge bg-secondary">{n.category}</span>
            <div className="text-muted small">{fmtDate(n.createdAt)} · {n.postedBy?.name}</div>
          </div>
        ))}
      </div>
    </Layout>
  );
}
