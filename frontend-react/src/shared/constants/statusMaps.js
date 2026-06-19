export const RESERVATION_STATUS = {
  PENDING_PAYMENT: { label: 'Chờ Thanh Toán', cls: 'badge-warning' },
  PENDING_EXPIRED: { label: 'Hết Hạn',        cls: 'badge-danger'  },
  CONFIRMED:       { label: 'Đã Xác Nhận',    cls: 'badge-info'    },
  CHECK_IN:        { label: 'Đang Ở',          cls: 'badge-success' },
  CHECK_OUT:       { label: 'Đã Trả Phòng',   cls: 'badge-secondary'},
  CANCELLED:       { label: 'Đã Hủy',          cls: 'badge-danger'  },
};

export const ROOM_STATUS = {
  READY:        { label: 'Sẵn Sàng',       cls: 'badge-success' },
  UNDER_REPAIR: { label: 'Đang Sửa Chữa',  cls: 'badge-warning' },
};

export const ROLE_BADGE = {
  MANAGER:  'badge-warning',
  EMPLOYEE: 'badge-secondary',
  CUSTOMER: 'badge-info',
};
