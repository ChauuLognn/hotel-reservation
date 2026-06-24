export interface StatusInfo {
  label: string;
  cls: string;
}

export const RESERVATION_STATUS: Record<string, StatusInfo> = {
  PENDING_PAYMENT: { label: 'Chờ Thanh Toán', cls: 'bg-yellow-100 text-yellow-800' },
  PENDING_EXPIRED: { label: 'Hết Hạn',        cls: 'bg-red-100 text-red-800'  },
  CONFIRMED:       { label: 'Đã Xác Nhận',    cls: 'bg-blue-100 text-blue-800'    },
  CHECK_IN:        { label: 'Đang Ở',          cls: 'bg-green-100 text-green-800' },
  CHECK_OUT:       { label: 'Đã Trả Phòng',   cls: 'bg-gray-100 text-gray-800'},
  CANCELLED:       { label: 'Đã Hủy',          cls: 'bg-red-100 text-red-800'  },
};

export const ROOM_STATUS: Record<string, StatusInfo> = {
  READY:        { label: 'Sẵn Sàng',       cls: 'bg-green-100 text-green-800' },
  UNDER_REPAIR: { label: 'Đang Sửa Chữa',  cls: 'bg-yellow-100 text-yellow-800' },
};

export const ROLE_BADGE: Record<string, string> = {
  MANAGER:  'bg-yellow-100 text-yellow-800',
  EMPLOYEE: 'bg-gray-100 text-gray-800',
  CUSTOMER: 'bg-blue-100 text-blue-800',
};
