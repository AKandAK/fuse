const dbclient = require('../../services/db');
const searchAgent = require('../../services/search')
const logger = require('@backend/common/logger');
const { validationResult } = require('express-validator'); // For input validation

advancedTextSearch = async (req, res) => {
    try {
        const { search, page = '1', pageSize = '20', searchType, ...filterQuery } = req.query;

        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        // fetch search results through googlesearch
        const { results, total_count } = await searchAgent.getSearchResults(search.trim(), Number(page), Number('pageSize'), 'googleJson');
        const trimmedwebsites = results.map(item => {
            try {
                let hostname = new URL(item.url).hostname;
                return hostname.replace(/^www\./, '');
            } catch (error) {
                return null;
            }
        }).filter(Boolean);
        const projection = {
            _id: 0,
            id: 1,
            name: 1,
            website: 1,
            founded: 1,
            size: 1,
            industry: 1,
            linkedin_url: 1,
            locality: 1,
            country: 1,
            summary: 1,
        };
        const dbSearchResults = await dbclient.getCompaniesByWebsite(trimmedwebsites, projection)
        return res.json({ 
            page: Number(page),
            pageSize: Number(pageSize), 
            totalPages: Math.ceil(total_count/pageSize),
            total_count: dbSearchResults.length == 0 ? total_count : 0,
            dbSearchResults,
        });
    } catch (error) {
        logger.error('Error during company search advancedTextSearch:', error);
        res.status(500).json({ 
            message: 'Failed to search companies by advancedTextSearch',
        });
    }
};

module.exports = {
    advancedTextSearch
}