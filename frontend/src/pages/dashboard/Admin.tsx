import Layout from '@layouts/Layout';
import { Shield, Key } from 'lucide-react';
import { useAuth } from '@contexts/AuthContext';

export default function Admin() {
  const { user } = useAuth();
  const token = localStorage.getItem('jwtToken');

  return (
    <Layout title="Quản Trị Hệ Thống">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-fade-in">
        
        {/* System Info */}
        <div className="bg-white rounded-apple-lg border border-apple-hairline p-6 shadow-sm flex flex-col">
          <div className="flex items-center gap-2 border-b border-apple-divider-soft pb-3 mb-4 select-none">
            <Shield size={18} className="text-apple-primary" />
            <h3 className="font-display font-semibold text-[16px] text-apple-ink">Thông Tin Hệ Thống</h3>
          </div>
          <div className="flex-1 flex flex-col justify-center">
            <div className="divide-y divide-apple-divider-soft text-sm">
              <div className="flex justify-between py-2.5">
                <span className="font-semibold text-apple-ink-muted-80">Backend Framework</span>
                <span className="text-apple-ink">Spring Boot 3.5.7</span>
              </div>
              <div className="flex justify-between py-2.5">
                <span className="font-semibold text-apple-ink-muted-80">Runtime Environment</span>
                <span className="text-apple-ink">JDK 17</span>
              </div>
              <div className="flex justify-between py-2.5">
                <span className="font-semibold text-apple-ink-muted-80">Database Server</span>
                <span className="text-apple-ink">MySQL 8</span>
              </div>
              <div className="flex justify-between py-2.5">
                <span className="font-semibold text-apple-ink-muted-80">Context Path</span>
                <span className="text-apple-ink">/hotel_reservation_premium</span>
              </div>
              <div className="flex justify-between py-2.5">
                <span className="font-semibold text-apple-ink-muted-80">Server Port</span>
                <span className="text-apple-ink">8080 / 8081</span>
              </div>
              <div className="flex justify-between py-2.5">
                <span className="font-semibold text-apple-ink-muted-80">Frontend Framework</span>
                <span className="text-apple-ink">React + Vite (Port 5173)</span>
              </div>
            </div>
          </div>
        </div>

        {/* Current User Session */}
        <div className="bg-white rounded-apple-lg border border-apple-hairline p-6 shadow-sm flex flex-col">
          <div className="flex items-center gap-2 border-b border-apple-divider-soft pb-3 mb-4 select-none">
            <Key size={18} className="text-apple-primary" />
            <h3 className="font-display font-semibold text-[16px] text-apple-ink">Phiên Đăng Nhập Hiện Tại</h3>
          </div>
          <div className="flex-1 flex flex-col justify-center">
            <div className="divide-y divide-apple-divider-soft text-sm">
              <div className="flex justify-between py-2.5">
                <span className="font-semibold text-apple-ink-muted-80">Tài Khoản</span>
                <span className="text-apple-ink font-mono">{user?.account || '-'}</span>
              </div>
              <div className="flex justify-between py-2.5">
                <span className="font-semibold text-apple-ink-muted-80">Họ và tên</span>
                <span className="text-apple-ink">{user?.empName || '-'}</span>
              </div>
              <div className="flex justify-between py-2.5">
                <span className="font-semibold text-apple-ink-muted-80">Chức Vụ / Vai Trò</span>
                <span className="text-apple-ink">{user?.role || '-'}</span>
              </div>
              <div className="flex justify-between py-2.5">
                <span className="font-semibold text-apple-ink-muted-80">User ID</span>
                <span className="text-apple-ink">{user?.userId || '-'}</span>
              </div>
              <div className="flex justify-between py-2.5">
                <span className="font-semibold text-apple-ink-muted-80">Emp ID</span>
                <span className="text-apple-ink">{user?.empId || '-'}</span>
              </div>
              <div className="flex justify-between py-2.5 items-center gap-4">
                <span className="font-semibold text-apple-ink-muted-80 flex-shrink-0">JWT Token</span>
                <span className="text-[11px] font-mono text-apple-ink-muted-48 truncate max-w-[200px]" title={token || ''}>
                  {token ? `${token.substring(0, 30)}...` : '-'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* API Endpoints */}
        <div className="bg-white rounded-apple-lg border border-apple-hairline p-6 shadow-sm md:col-span-2">
          <div className="border-b border-apple-divider-soft pb-3 mb-4 select-none">
            <h3 className="font-display font-semibold text-[16px] text-apple-ink">API Endpoints Hệ Thống</h3>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {[
              ['POST', '/api/auth/login', 'Đăng nhập'],
              ['POST', '/api/auth/register', 'Đăng ký khách'],
              ['GET', '/api/rooms', 'Tất cả phòng'],
              ['GET', '/api/guests', 'Tất cả khách'],
              ['GET', '/api/reservations/all', 'Tất cả đặt phòng'],
              ['GET', '/api/bills/summaries', 'Tất cả hóa đơn'],
              ['GET', '/api/services', 'Tất cả dịch vụ'],
              ['GET', '/api/reports/revenue', 'Báo cáo doanh thu'],
            ].map(([method, path, desc], i) => (
              <div
                key={i}
                className="bg-apple-surface-pearl border border-apple-divider-soft/50 rounded-apple-sm px-4 py-3 flex items-center justify-between text-xs"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <span
                    className={`font-mono font-bold px-2 py-0.5 rounded text-[10px] tracking-wider flex-shrink-0 ${
                      method === 'GET'
                        ? 'bg-blue-50 border border-blue-100 text-blue-700'
                        : 'bg-green-50 border border-green-100 text-green-700'
                    }`}
                  >
                    {method}
                  </span>
                  <code className="text-apple-primary font-mono truncate">{path}</code>
                </div>
                <span className="text-apple-ink-muted-48 text-[11px] flex-shrink-0">— {desc}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Layout>
  );
}
