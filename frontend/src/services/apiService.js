import axiosInstance from '../utils/axios';
import config from '../config';

export const authService = {
    login: async (credentials) => {
        try {
            const response = await axiosInstance.post('/user/login', credentials);
            return response.data;
        } catch (error) {
            throw new Error(error.response?.data?.message || 'Login failed');
        }
    },

    signup: async (credentials) => {
        try {
            const response = await axiosInstance.post('/user/create', credentials);
            return response.data;
        } catch (error) {
            throw new Error(error.response?.data?.message || 'Signup failed');
        }
    },

    logout: async () => {
        try {
            await axiosInstance.post('/user/logout');
        } catch (error) {
            console.error('Logout failed:', error);
            throw error;
        }
    },
};

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

export const companyService = {
    search: async (paramsUrl, searchType = 'simple_search') => {
        try {
            const response = await axiosInstance.get(`/query/company/${searchType}?${paramsUrl}`);
            // sort
            const sortedResults = [...response.data.results].sort((a, b) => {
                if (a.search_score != null && b.search_score != null) {
                    return b.search_score - a.search_score;
                }
                if (b.updatedAt != null && a.updatedAt != null) {
                    return new Date(b.updatedAt) - new Date(a.updatedAt);
                }
                return b.name.localeCompare(a.name);
            });
            return {
                results: sortedResults,
                totalCount: response.data.total_count
            };
        } catch (error) {
            throw new Error(error.response?.data?.message || 'Company search failed');
        }
    },

    getById: async (id) => {
        try {
            const response = await axiosInstance.get(`/query/company/${id}`);
            return response.data.result;
        } catch (error) {
            throw new Error(error.response?.data?.message || 'Failed to fetch company details');
        }
    },

    getAutocomplete: async (text) => {
        try {
            const response = await axiosInstance.get(`/query/company/autocomplete/${text}`);
            return response.data.results;
        } catch (error) {
            throw new Error(error.response?.data?.message || 'Autocomplete failed');
        }
    },

    getSummary: async (companyId, maxRetries = config.MAX_SUMMARY_RETRIES) => {
        const maxAttempts = maxRetries || 3;
        const retryDelay = config.GET_SUMMARY_RETRY_PERIOD || 7000; // 7 seconds
    
        for (let attempt = 1; attempt <= maxAttempts; attempt++) {
            try {
                const response = await axiosInstance.get(`/summary/company/${companyId}`, {
                    params: { attempt } // can use this to just poll
                });
                const summary = response.data.summary;
                if (summary) {
                    return summary;
                }
                // wait for retries
                if (attempt < maxAttempts) {
                    await delay(retryDelay);
                }
    
            } catch (error) {
                throw new Error(error.response?.data?.message || 'Failed to fetch company summary');
            }
        }
        // After all attempts, if no summary
        return null;
    }
};

export const publicApiService = {
    getFilterConfig: async () => {
        try {
            const response = await axiosInstance.get('/public/filters/company');
            return response.data;
        }
        catch (error) {
            return {}
        }
    }
}

export const bookmarkService = {
    getBookmarks: async (page, pageSize) => {
        try {
            const response = await axiosInstance.post('/bookmarks', {
                params: { page, pageSize }
            });
            const sortedResults = [...response.data.results].map(x => x.company).sort((a, b) => {
                if (a.search_score != null && b.search_score != null) {
                    return b.search_score - a.search_score;
                }
                if (b.updatedAt != null && a.updatedAt != null) {
                    return new Date(b.updatedAt) - new Date(a.updatedAt);
                }
                return b.name.localeCompare(a.name);
            });
            return {
                results: sortedResults,
                totalCount: response.data.total_count
            };
        } catch (error) {
            throw new Error(error.response?.data?.message || 'getBookmarks failed');
        }
    },
    
    saveBookmark: async (companyId) => {
        try {
            const response = await axiosInstance.post(`/bookmarks/create`, {
                companyId
            });
            return response.data;
        } catch (error) {
            if (error.response?.status === 409) {
                console.log('Bookmark already exists');
                return;
            }
            throw new Error(error.response?.data?.message || 'Failed to save saveBookmark');
        }
    },

    deleteBookmark: async (companyId) => {
        try {
            const response = await axiosInstance.delete(`/bookmarks/delete/${companyId}`);
        } catch (error) {
            throw new Error(error.response?.data?.message || 'Failed to delete saveBookmark');
        }
    },
}

export default {
    auth: authService,
    company: companyService,
    bookmark: bookmarkService,
    public: publicApiService,
};
