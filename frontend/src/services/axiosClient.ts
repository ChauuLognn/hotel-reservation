import axios, { InternalAxiosRequestConfig, AxiosResponse } from 'axios';

const BASE_URL = (import.meta.env.VITE_API_BASE_URL as string) || '/hotel_reservation_premium';

const axiosClient = axios.create({
  baseURL: BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

interface JwtPayload {
  exp?: number;
  [key: string]: any;
}

function getJwtExp(token: string): number | null {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    const payload = JSON.parse(jsonPayload) as JwtPayload;
    return payload.exp ? payload.exp * 1000 : null;
  } catch {
    return null;
  }
}

let isRefreshing = false;
let refreshSubscribers: ((token: string) => void)[] = [];

function subscribeTokenRefresh(cb: (token: string) => void) {
  refreshSubscribers.push(cb);
}

function onRefreshed(token: string) {
  refreshSubscribers.forEach((cb) => cb(token));
  refreshSubscribers = [];
}

// Request interceptor: tự động thêm JWT token và làm mới nếu gần hết hạn
axiosClient.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    const publicPaths = ['/api/auth/login', '/api/auth/register', '/api/auth/reset-password', '/api/auth/logout', '/api/auth/refresh'];
    if (publicPaths.some(p => config.url === p)) {
      return config;
    }

    let token = localStorage.getItem('jwtToken');
    if (token) {
      const exp = getJwtExp(token);
      const now = Date.now();
      // Nếu token hết hạn trong vòng 5 phút (hoặc đã hết hạn), thực hiện làm mới
      if (exp && exp - now < 5 * 60 * 1000) {
        if (!isRefreshing) {
          isRefreshing = true;
          axios
            .post<{ data?: { token: string }; token?: string }>(
              `${BASE_URL}/api/auth/refresh`,
              null,
              {
                headers: { Authorization: `Bearer ${token}` },
              }
            )
            .then((res) => {
              const data = res.data?.data || res.data;
              const newToken = data?.token;
              if (newToken) {
                localStorage.setItem('jwtToken', newToken);
                localStorage.setItem('userInfo', JSON.stringify(data));
                isRefreshing = false;
                onRefreshed(newToken);
                window.dispatchEvent(new CustomEvent('tokenRefreshed', { detail: data }));
              }
            })
            .catch(() => {
              isRefreshing = false;
              localStorage.removeItem('jwtToken');
              localStorage.removeItem('userId');
              localStorage.removeItem('userInfo');
              localStorage.removeItem('currentGuestId');
              window.location.href = '/login';
            });
        }

        token = await new Promise<string>((resolve) => {
          subscribeTokenRefresh((newToken) => {
            resolve(newToken);
          });
        });
      }

      config.headers.Authorization = `Bearer ${token}`;
    }

    const userId = localStorage.getItem('userId');
    if (userId) {
      config.headers['X-User-Id'] = userId;
      config.headers['X-User_id'] = userId;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor: xử lý lỗi 401 và chuẩn hóa payload trả về
axiosClient.interceptors.response.use(
  (response: AxiosResponse) => {
    const payload = response.data;
    if (
      payload &&
      typeof payload === 'object' &&
      Object.prototype.hasOwnProperty.call(payload, 'success')
    ) {
      return {
        ...response,
        data: Object.prototype.hasOwnProperty.call(payload, 'data') ? payload.data : null,
      } as any;
    }
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      const requestUrl = error.config?.url || '';
      if (!requestUrl.includes('/api/auth/login')) {
        localStorage.removeItem('jwtToken');
        localStorage.removeItem('userId');
        localStorage.removeItem('userInfo');
        localStorage.removeItem('currentGuestId');
        window.location.href = '/login';
      }
    }

    const payload = error.response?.data;
    if (payload && typeof payload === 'object' && payload.message) {
      error.message = payload.message;
    }

    return Promise.reject(error);
  }
);

export default axiosClient;
