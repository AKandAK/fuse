const config = {
    API_BASE_URL: process.env.NODE_ENV == 'production' ? '/api/v1' : 'http://localhost:4000/api/v1',
    GET_SUMMARY_RETRY_PERIOD: 15000, // 10 seconds
    MAX_SUMMARY_RETRIES: 2,
    TOKEN_KEY: 'auth_token',
};

export default config; 