import Navbar from './Navbar';

export default function Layout({ title, children, actions }) {
  return (
    <>
      <Navbar />
      <div className="container py-4">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h3 className="mb-0">{title}</h3>
          <div>{actions}</div>
        </div>
        {children}
      </div>
    </>
  );
}

export function Alert({ msg, type = 'danger', onClose }) {
  if (!msg) return null;
  return (
    <div className={`alert alert-${type} alert-dismissible`}>
      {msg}
      {onClose && <button type="button" className="btn-close" onClick={onClose} />}
    </div>
  );
}

export const statusBadge = (s) =>
  ({ pending: 'warning', approved: 'success', rejected: 'danger', present: 'success', late: 'warning', 'half-day': 'info', assigned: 'secondary', 'in-progress': 'primary', completed: 'success' }[s] || 'secondary');
