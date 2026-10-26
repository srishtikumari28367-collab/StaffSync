import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const role = user.role;

  const links = [
    { to: '/', label: 'Dashboard', roles: ['hr', 'manager', 'employee'], end: true },
    { to: '/employees', label: role === 'hr' ? 'Employees' : 'My Team', roles: ['hr', 'manager'] },
    { to: '/leaves', label: 'Leaves', roles: ['hr', 'manager', 'employee'] },
    { to: '/attendance', label: 'Attendance', roles: ['hr', 'manager', 'employee'] },
    { to: '/training', label: 'Training', roles: ['hr', 'manager', 'employee'] },
    { to: '/announcements', label: 'News', roles: ['hr', 'manager', 'employee'] },
    { to: '/profile', label: 'Profile', roles: ['hr', 'manager', 'employee'] },
  ];

  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-dark">
      <div className="container">
        <span className="navbar-brand brand">StaffSync</span>
        <button className="navbar-toggler" data-bs-toggle="collapse" data-bs-target="#nav">
          <span className="navbar-toggler-icon" />
        </button>
        <div className="collapse navbar-collapse" id="nav">
          <ul className="navbar-nav me-auto">
            {links
              .filter((l) => l.roles.includes(role))
              .map((l) => (
                <li className="nav-item" key={l.to}>
                  <NavLink end={l.end} to={l.to} className="nav-link">
                    {l.label}
                  </NavLink>
                </li>
              ))}
          </ul>
          <span className="navbar-text me-3">
            {user.name} <span className="badge bg-primary text-uppercase">{role}</span>
          </span>
          <button
            className="btn btn-outline-light btn-sm"
            onClick={() => {
              logout();
              navigate('/login');
            }}
          >
            Logout
          </button>
        </div>
      </div>
    </nav>
  );
}
