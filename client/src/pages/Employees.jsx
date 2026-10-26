import { useEffect, useState } from 'react';
import api, { errMsg, fmtDate } from '../api';
import { useAuth } from '../context/AuthContext';
import Layout, { Alert } from '../components/Layout';

const empty = { name: '', email: '', password: '', role: 'employee', department: '', designation: '', manager: '' };

export default function Employees() {
  const { user } = useAuth();
  const isHR = user.role === 'hr';
  const [users, setUsers] = useState([]);
  const [managers, setManagers] = useState([]);
  const [form, setForm] = useState(empty);
  const [editId, setEditId] = useState(null);
  const [show, setShow] = useState(false);
  const [q, setQ] = useState('');
  const [error, setError] = useState('');

  const load = async () => {
    setUsers((await api.get('/users')).data);
    if (isHR) setManagers((await api.get('/users/managers')).data);
  };
  useEffect(() => {
    load().catch((e) => setError(errMsg(e)));
  }, []);

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const body = { ...form };
      if (!body.password) delete body.password;
      if (editId) await api.put(`/users/${editId}`, body);
      else await api.post('/users', body);
      setShow(false);
      setForm(empty);
      setEditId(null);
      load();
    } catch (err) {
      setError(errMsg(err));
    }
  };

  const edit = (u) => {
    setEditId(u._id);
    setForm({ name: u.name, email: u.email, password: '', role: u.role, department: u.department, designation: u.designation, manager: u.manager?._id || '' });
    setShow(true);
  };

  const remove = async (id) => {
    if (!confirm('Delete this employee permanently?')) return;
    try {
      await api.delete(`/users/${id}`);
      load();
    } catch (err) {
      setError(errMsg(err));
    }
  };

  const toggle = async (u) => {
    await api.put(`/users/${u._id}`, { active: !u.active });
    load();
  };

  const filtered = users.filter((u) => (u.name + u.email + u.department).toLowerCase().includes(q.toLowerCase()));

  return (
    <Layout
      title={isHR ? 'Employees' : 'My Team'}
      actions={isHR && <button className="btn btn-primary" onClick={() => { setEditId(null); setForm(empty); setShow(!show); }}>+ Add user</button>}
    >
      <Alert msg={error} onClose={() => setError('')} />
      {show && (
        <form className="card p-3 mb-3" onSubmit={submit}>
          <div className="row g-2">
            <div className="col-md-4"><input className="form-control" placeholder="Name" value={form.name} onChange={set('name')} required /></div>
            <div className="col-md-4"><input type="email" className="form-control" placeholder="Email" value={form.email} onChange={set('email')} required /></div>
            <div className="col-md-4"><input type="password" className="form-control" placeholder={editId ? 'New password (optional)' : 'Password'} value={form.password} onChange={set('password')} required={!editId} minLength={6} /></div>
            <div className="col-md-3">
              <select className="form-select" value={form.role} onChange={set('role')}>
                <option value="employee">Employee</option>
                <option value="manager">Manager</option>
                <option value="hr">HR</option>
              </select>
            </div>
            <div className="col-md-3"><input className="form-control" placeholder="Department" value={form.department} onChange={set('department')} /></div>
            <div className="col-md-3"><input className="form-control" placeholder="Designation" value={form.designation} onChange={set('designation')} /></div>
            <div className="col-md-3">
              <select className="form-select" value={form.manager} onChange={set('manager')}>
                <option value="">No manager</option>
                {managers.map((m) => <option key={m._id} value={m._id}>{m.name}</option>)}
              </select>
            </div>
          </div>
          <div className="mt-3">
            <button className="btn btn-success me-2">{editId ? 'Update' : 'Create'}</button>
            <button type="button" className="btn btn-secondary" onClick={() => setShow(false)}>Cancel</button>
          </div>
        </form>
      )}
      <input className="form-control mb-3" placeholder="Search by name, email or department..." value={q} onChange={(e) => setQ(e.target.value)} />
      <div className="card table-responsive">
        <table className="table table-hover mb-0">
          <thead>
            <tr><th>Name</th><th>Email</th><th>Role</th><th>Department</th><th>Designation</th><th>Manager</th><th>Joined</th><th>Leave bal.</th>{isHR && <th />}</tr>
          </thead>
          <tbody>
            {filtered.map((u) => (
              <tr key={u._id} className={u.active ? '' : 'table-secondary'}>
                <td>{u.name}</td><td>{u.email}</td>
                <td><span className="badge bg-info text-dark">{u.role}</span></td>
                <td>{u.department}</td><td>{u.designation}</td><td>{u.manager?.name || '-'}</td>
                <td>{fmtDate(u.joinDate)}</td><td>{u.leaveBalance}</td>
                {isHR && (
                  <td className="text-nowrap">
                    <button className="btn btn-sm btn-outline-primary me-1" onClick={() => edit(u)}>Edit</button>
                    <button className="btn btn-sm btn-outline-warning me-1" onClick={() => toggle(u)}>{u.active ? 'Deactivate' : 'Activate'}</button>
                    <button className="btn btn-sm btn-outline-danger" onClick={() => remove(u._id)}>Delete</button>
                  </td>
                )}
              </tr>
            ))}
            {filtered.length === 0 && <tr><td colSpan={9} className="text-center text-muted py-3">No employees found</td></tr>}
          </tbody>
        </table>
      </div>
    </Layout>
  );
}
