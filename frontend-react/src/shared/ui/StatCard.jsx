export default function StatCard({ label, value, icon, borderColor, iconBg }) {
  return (
    <div className="stat-card" style={borderColor ? { borderColor } : {}}>
      <div className="stat-content">
        <div className="stat-info">
          <p>{label}</p>
          <h3>{value}</h3>
        </div>
        <div className="stat-icon" style={iconBg ? { background: iconBg } : {}}>
          {icon}
        </div>
      </div>
    </div>
  );
}
