/**
 * Guests API Module
 * Handles all API calls to backend /api/guests endpoint
 */

const GuestAPI = (() => {
    const BASE_URL = 'http://localhost:8080/hotel_reservation_premium/api/guests';

    // Helper to handle fetch errors
    const handleError = (error, action) => {
        console.error(`Error in ${action}:`, error);
        throw error;
    };

    return {
        /**
         * Create a new guest
         * @param {Object} guestData - { firstName, lastName, identityNum, phone, dateOfBirth }
         * @returns {Promise<Object>} - Response with id field added
         */
        create: async (guestData) => {
            try {
                const response = await fetch(BASE_URL, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(guestData)
                });
                if (!response.ok) throw new Error(`HTTP ${response.status}`);
                return await response.json();
            } catch (error) {
                handleError(error, 'create guest');
            }
        },

        /**
         * Get all guests
         * @returns {Promise<Array>} - List of guest objects
         */
        getAll: async () => {
            try {
                const response = await fetch(BASE_URL);
                if (!response.ok) throw new Error(`HTTP ${response.status}`);
                return await response.json();
            } catch (error) {
                handleError(error, 'get all guests');
            }
        },

        /**
         * Get guest by ID
         * @param {number} id - Guest ID
         * @returns {Promise<Object>} - Guest object
         */
        getById: async (id) => {
            try {
                const response = await fetch(`${BASE_URL}/${id}`);
                if (!response.ok) throw new Error(`HTTP ${response.status}`);
                return await response.json();
            } catch (error) {
                handleError(error, `get guest ${id}`);
            }
        },

        /**
         * Update guest
         * @param {number} id - Guest ID
         * @param {Object} guestData - Updated guest data
         * @returns {Promise<Object>} - Updated guest object
         */
        update: async (id, guestData) => {
            try {
                const response = await fetch(`${BASE_URL}/${id}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(guestData)
                });
                if (!response.ok) throw new Error(`HTTP ${response.status}`);
                return await response.json();
            } catch (error) {
                handleError(error, `update guest ${id}`);
            }
        },

        /**
         * Delete guest
         * @param {number} id - Guest ID
         * @returns {Promise<string>} - Success message
         */
        delete: async (id) => {
            try {
                const response = await fetch(`${BASE_URL}/${id}`, { method: 'DELETE' });
                if (!response.ok) {
                    const errorText = await response.text().catch(() => '');
                    throw new Error(errorText || `HTTP ${response.status}`);
                }
                const contentType = response.headers.get('content-type');
                if (contentType && contentType.includes('application/json')) {
                    return await response.json();
                }
                return await response.text();
            } catch (error) {
                handleError(error, `delete guest ${id}`);
            }
        },

        /**
         * Get guest's stay history
         * @param {number} guestId - Guest ID
         * @returns {Promise<Object>} - GuestStayDto with items array
         */
        getStayHistory: async (guestId) => {
            try {
                const response = await fetch(`${BASE_URL}/${guestId}/stays`);
                if (!response.ok) throw new Error(`HTTP ${response.status}`);
                return await response.json();
            } catch (error) {
                handleError(error, `get stay history for guest ${guestId}`);
            }
        }
    };
})();
