import Layout from '../components/Layout';
import { Shield, Key, Clock } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Admin() {
  const { user } = useAuth();

  return (
    <Layout title="Quản Trị Hệ Thống">
      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(320px,1fr))', gap:'1.5rem' }}>
        {/* System Info */}
        <div className="card">
          <div className="card-header"><h3 className="card-title"><Shield size={18} style={{marginRight:'0.5rem',display:'inline'}} />Thông Tin Hệ Thống</h3></div>
          <div className="card-body">
            <table className="table">
              <tbody>
                <tr><td style={{fontWeight:600}}>Backend</td><td>Spring Boot 3.5.7</td></tr>
                <tr><td style={{fontWeight:600}}>Java</td><td>JDK 17</td></tr>
                <tr><td style={{fontWeight:600}}>Database</td><td>MySQL 8</td></tr>
                <tr><td style={{fontWeight:600}}>Context Path</td><td>/hotel_reservation_premium</td></tr>
                <tr><td style={{fontWeight:600}}>Port</td><td>8080</td></tr>
                <tr><td style={{fontWeight:600}}>Frontend</td><td>React + Vite (Port 5173)</td></tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Current User */}
        <div className="card">
          <div className="card-header"><h3 className="card-title"><Key size={18} style={{marginRight:'0.5rem',display:'inline'}} />Phiên Đăng Nhập Hiện Tại</h3></div>
          <div className="card-body">
            <table className="table">
              <tbody>
                <tr><td style={{fontWeight:600}}>Tài Khoản</td><td>{user?.account || '-'}</td></tr>
                <tr><td style={{fontWeight:600}}>Tên</td><td>{user?.empName || '-'}</td></tr>
                <tr><td style={{fontWeight:600}}>Chức Vụ</td><td>{user?.role || '-'}</td></tr>
                <tr><td style={{fontWeight:600}}>User ID</td><td>{user?.userId || '-'}</td></tr>
                <tr><td style={{fontWeight:600}}>Emp ID</td><td>{user?.empId || '-'}</td></tr>
                <tr><td style={{fontWeight:600}}>Token</td><td><span style={{fontSize:'0.75rem', wordBreak:'break-all', color:'#6b7280'}}>{localStorage.getItem('jwtToken')?.substring(0,40)}...</span></td></tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* API Endpoints */}
        <div className="card" style={{ gridColumn:'span 2' }}>
          <div className="card-header"><h3 className="card-title">API Endpoints Chính</h3></div>
          <div className="card-body">
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'0.5rem' }}>
              {[
                ['POST', '/api/auth/login', 'Đăng nhập'],
                ['POST', '/api/auth/register', 'Đăng ký'],
                ['GET', '/api/rooms/all', 'Tất cả phòng'],
                ['GET', '/api/guests/all', 'Tất cả khách'],
                ['GET', '/api/reservations/all', 'Tất cả đặt phòng'],
                ['GET', '/api/bills/all', 'Tất cả hóa đơn'],
                ['GET', '/api/services/all', 'Tất cả dịch vụ'],
                ['GET', '/api/reports/revenue', 'Báo cáo doanh thu'],
              ].map(([method, path, desc], i) => (
                <div key={i} style={{ background:'#f9fafb', padding:'0.6rem 0.875rem', borderRadius:'8px', fontSize:'0.8rem' }}>
                  <span style={{ background: method==='GET'?'#dbeafe':'#d1fae5', color: method==='GET'?'#1d4ed8':'#065f46', padding:'0.15rem 0.4rem', borderRadius:'4px', fontWeight:700, marginRight:'0.5rem' }}>{method}</span>
                  <code style={{ color:'#4f46e5' }}>{path}</code>
                  <span style={{ color:'#9ca3af', marginLeft:'0.5rem' }}>— {desc}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
