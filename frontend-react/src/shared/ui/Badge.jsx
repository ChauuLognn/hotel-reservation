export default function Badge({ status, statusMap }) {
  const info = statusMap?.[status] || { label: status, cls: 'badge-secondary' };
  return <span className={`badge-status ${info.cls}`}>{info.label}</span>;
}
