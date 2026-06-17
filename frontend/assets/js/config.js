/**
 * API Configuration
 * Centralized API configuration for all frontend files
 * 
 * QUAN TRỌNG: File này phải được load TRƯỚC tất cả các file JS khác
 */

// Backend API Base URL
// Thay đổi URL này nếu backend chạy ở port hoặc domain khác
const API_CONFIG = {
    // Base URL bao gồm cả context-path
    BASE_URL: 'http://localhost:8080/hotel_reservation_premium',
    
    // Timeout cho các request (milliseconds)
    TIMEOUT: 30000, // 30 seconds
    
    // Retry configuration
    MAX_RETRIES: 3,
    RETRY_DELAY: 1000, // 1 second
};

// Helper function để build full API URL
function getApiUrl(endpoint) {
    // Đảm bảo endpoint bắt đầu bằng /
    if (!endpoint.startsWith('/')) {
        endpoint = '/' + endpoint;
    }
    return `${API_CONFIG.BASE_URL}${endpoint}`;
}

// Helper function để fetch với retry
async function fetchWithRetry(url, options = {}, retries = API_CONFIG.MAX_RETRIES) {
    try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), API_CONFIG.TIMEOUT);
        
        const response = await fetch(url, {
            ...options,
            signal: controller.signal
        });
        
        clearTimeout(timeoutId);
        return response;
    } catch (error) {
        if (retries > 0 && error.name !== 'AbortError') {
            console.warn(`Request failed, retrying... (${retries} attempts left)`);
            await new Promise(resolve => setTimeout(resolve, API_CONFIG.RETRY_DELAY));
            return fetchWithRetry(url, options, retries - 1);
        }
        throw error;
    }
}

// Export cho sử dụng trong các module khác
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { API_CONFIG, getApiUrl, fetchWithRetry };
}

// Log configuration khi load (chỉ trong development)
console.log('🔧 API Configuration loaded:', {
    baseUrl: API_CONFIG.BASE_URL,
    timeout: API_CONFIG.TIMEOUT + 'ms'
});

