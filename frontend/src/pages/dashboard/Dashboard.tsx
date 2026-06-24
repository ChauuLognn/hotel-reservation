import { useState, useEffect } from 'react';
import { DollarSign, Users, Home, Coffee, RefreshCw } from 'lucide-react';
import Layout from '@layouts/Layout';
import reportApi from '@services/reportApi';
import { formatVND, formatDate } from '@utils/format';
import StatCard from '@components/ui/StatCard';
import Button from '@components/ui/Button';
import { useToast } from '@contexts/ToastContext';

interface DailyRevenue {
  date: string;
  roomCharge: number;
  serviceCharge: number;
  refundAmount: number;
  netRevenue: number;
}

interface TopRoom {
  roomTypeName: string;
  timesBooked: number;
}

interface TopServiceItem {
  serviceName: string;
  timesUsed: number;
  totalRevenue: number;
}

interface RevenueData {
  totalNetRevenue: number;
  totalGuestsStayed: number;
  days: DailyRevenue[];
}

interface RoomUsageData {
  topRoom: TopRoom;
}

interface ServiceUsageData {
  topService: TopServiceItem;
  services: TopServiceItem[];
}

export default function Dashboard() {
  const { showToast } = useToast();
  const today = new Date();
  const firstDay = new Date(today.getFullYear(), today.getMonth(), 1).toISOString().split('T')[0];
  const lastDay = new Date(today.getFullYear(), today.getMonth() + 1, 0).toISOString().split('T')[0];

  const [dateFrom, setDateFrom] = useState<string>(firstDay);
  const [dateTo, setDateTo] = useState<string>(lastDay);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<boolean>(false);
  const [revenue, setRevenue] = useState<RevenueData | null>(null);
  const [roomUsage, setRoomUsage] = useState<RoomUsageData | null>(null);
  const [serviceUsage, setServiceUsage] = useState<ServiceUsageData | null>(null);

  useEffect(() => {
    fetchData();
  }, [dateFrom, dateTo]);

  async function fetchData() {
    setLoading(true);
    setError(false);
    try {
      const [revRes, roomRes, svcRes] = await Promise.all([
        reportApi.getRevenue(dateFrom, dateTo),
        reportApi.getRoomUsage(dateFrom, dateTo),
        reportApi.getServiceUsage(dateFrom, dateTo),
      ]);
      setRevenue(revRes.data as any);
      setRoomUsage(roomRes.data as any);
      setServiceUsage(svcRes.data as any);
    } catch (err: any) {
      console.error('Dashboard fetch error:', err);
      setError(true);
      showToast('Lỗi tải dữ liệu báo cáo: ' + (err?.response?.data?.message || err.message || err), 'error');
    } finally {
      setLoading(false);
    }
  }

  return (
    <Layout title="Bảng Điều Khiển">
      {error && (
        <div className="bg-red-50 text-red-700 p-4 border border-red-200 rounded-apple-lg mb-6 flex justify-between items-center select-none shadow-sm animate-fade-in">
          <div>
            <span className="font-semibold text-sm">⚠️ Không thể tải dữ liệu báo cáo</span>
            <p className="text-xs text-red-600 mt-0.5">Vui lòng kiểm tra lại kết nối mạng hoặc thử lại.</p>
          </div>
          <Button onClick={fetchData} variant="pearl-capsule" className="!py-1.5 !px-4 hover:bg-red-100 border-red-300">
            Thử Lại
          </Button>
        </div>
      )}

      {/* Welcome + Filter Panel */}
      <div className="bg-white rounded-apple-lg border border-apple-hairline p-6 mb-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 shadow-sm select-none animate-slide-up">
        <div>
          <h1 className="font-display font-semibold text-xl text-apple-ink tracking-apple-tight">Chào mừng trở lại! 👋</h1>
          <p className="text-apple-ink-muted-48 text-sm mt-0.5">Đây là báo cáo hiệu suất khách sạn của bạn.</p>
        </div>
        <div className="flex items-center gap-3 bg-apple-canvas-parchment px-4 py-2 border border-apple-hairline rounded-apple-md">
          <input
            type="date"
            className="bg-transparent text-[14px] text-apple-ink border-none focus:outline-none font-medium cursor-pointer"
            value={dateFrom}
            onChange={(e) => setDateFrom(e.target.value)}
          />
          <span className="text-apple-ink-muted-48 font-light">—</span>
          <input
            type="date"
            className="bg-transparent text-[14px] text-apple-ink border-none focus:outline-none font-medium cursor-pointer"
            value={dateTo}
            onChange={(e) => setDateTo(e.target.value)}
          />
          <Button
            onClick={fetchData}
            variant="pearl-capsule"
            className="!p-1.5 h-8 w-8 hover:bg-apple-divider-soft"
            disabled={loading}
          >
            <RefreshCw size={14} className={loading ? 'animate-spin-custom' : ''} />
          </Button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-6">
        <StatCard
          label="Tổng Doanh Thu"
          value={formatVND(revenue?.totalNetRevenue)}
          icon={<DollarSign size={20} />}
          iconBg="bg-green-50 text-green-600 border border-green-100"
        />
        <StatCard
          label="Tổng Khách"
          value={revenue?.totalGuestsStayed || 0}
          icon={<Users size={20} />}
          iconBg="bg-blue-50 text-blue-600 border border-blue-100"
        />
        <StatCard
          label="Loại Phòng Hàng Đầu"
          value={roomUsage?.topRoom?.roomTypeName || '-'}
          icon={<Home size={20} />}
          iconBg="bg-yellow-50 text-yellow-600 border border-yellow-100"
        />
        <StatCard
          label="Dịch Vụ Hàng Đầu"
          value={serviceUsage?.topService?.serviceName || '-'}
          icon={<Coffee size={20} />}
          iconBg="bg-purple-50 text-purple-600 border border-purple-100"
        />
      </div>

      {/* Content Layout: 2 Columns */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Daily Revenue Table */}
        <div className="lg:col-span-2 bg-white rounded-apple-lg border border-apple-hairline overflow-hidden shadow-sm animate-slide-up">
          <div className="px-5 py-4 border-b border-apple-divider-soft">
            <h3 className="font-display font-semibold text-[16px] text-apple-ink">Báo Cáo Doanh Thu Hàng Ngày</h3>
          </div>
          <div className="overflow-x-auto max-h-[450px]">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-apple-surface-pearl border-b border-apple-divider-soft text-[11px] font-semibold text-apple-ink-muted-48 uppercase tracking-wider">
                  <th className="px-5 py-3">Ngày</th>
                  <th className="px-5 py-3">Tiền Phòng</th>
                  <th className="px-5 py-3">Tiền Dịch Vụ</th>
                  <th className="px-5 py-3">Hoàn Tiền</th>
                  <th className="px-5 py-3">Doanh Thu Ròng</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-apple-divider-soft text-[14px]">
                {loading ? (
                  <tr>
                    <td colSpan={5} className="text-center py-10 text-apple-ink-muted-48">
                      Đang xử lý dữ liệu báo cáo...
                    </td>
                  </tr>
                ) : revenue?.days?.length ? (
                  revenue.days.map((d, i) => (
                    <tr key={i} className="hover:bg-apple-surface-pearl/40">
                      <td className="px-5 py-3.5 font-medium">{formatDate(d.date)}</td>
                      <td className="px-5 py-3.5">{formatVND(d.roomCharge)}</td>
                      <td className="px-5 py-3.5">{formatVND(d.serviceCharge)}</td>
                      <td className="px-5 py-3.5 text-red-600 font-medium">-{formatVND(d.refundAmount)}</td>
                      <td className="px-5 py-3.5 text-green-600 font-bold">{formatVND(d.netRevenue)}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="text-center py-10 text-apple-ink-muted-48">
                      Không tìm thấy dữ liệu doanh thu trong khoảng thời gian này.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Top Services Column */}
        <div className="bg-white rounded-apple-lg border border-apple-hairline overflow-hidden shadow-sm flex flex-col animate-slide-up delay-150">
          <div className="px-5 py-4 border-b border-apple-divider-soft">
            <h3 className="font-display font-semibold text-[16px] text-apple-ink">Dịch Vụ Hàng Đầu</h3>
          </div>
          <div className="flex-1 divide-y divide-apple-divider-soft overflow-y-auto">
            {loading ? (
              <div className="flex items-center justify-center py-12 text-apple-ink-muted-48">
                <div className="w-6 h-6 border-2 border-apple-divider-soft border-t-apple-primary rounded-full animate-spin-custom mr-2" />
                <span>Đang tính toán...</span>
              </div>
            ) : serviceUsage?.services?.length ? (
              [...serviceUsage.services]
                .sort((a, b) => (b.totalRevenue || 0) - (a.totalRevenue || 0))
                .slice(0, 8)
                .map((svc, i) => (
                  <div key={i} className="flex justify-between items-center px-5 py-3.5 hover:bg-apple-surface-pearl/40">
                    <div>
                      <div className="font-semibold text-sm text-apple-ink">{svc.serviceName}</div>
                      <div className="text-[11px] text-apple-ink-muted-48 mt-0.5">Đã dùng {svc.timesUsed || 0} lần</div>
                    </div>
                    <div className="font-bold text-[14px] text-apple-primary">{formatVND(svc.totalRevenue)}</div>
                  </div>
                ))
            ) : (
              <div className="text-center py-12 text-apple-ink-muted-48 select-none">
                Chưa có dữ liệu dịch vụ phòng nào.
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}
