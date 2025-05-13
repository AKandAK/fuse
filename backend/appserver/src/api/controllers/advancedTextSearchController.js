const dbclient = require('../../services/db');
const searchAgent = require('../../services/search')
const logger = require('@backend/common/logger');
const { validationResult } = require('express-validator'); // For input validation

advancedTextSearch = async (req, res) => {
    try {
        const { search, page = '1', pageSize = '20', searchType, ...filterQuery } = req.query;
        const newPageSize = 10; // google search free api limit, 10 per query
        
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ message: errors.array().join(", ") }); message: errors.array().join(", ")
        }

        // fetch search results through googlesearch
        const searchResults = await searchAgent.getSearchResults(search.trim(), Number(page), newPageSize, 'googleJson');
        
        if (!searchResults) {
            return res.status(503).json({ 
                message: 'Search Engine Apis not available',
            });
        }
        if (searchResults.length == 0) {
            return res.status(400).json({ 
                message: 'Couldnt find any results for the text',
            });
        }

        const trimmedwebsites = searchResults.map(item => {
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
            totalPages: 2,
            total_count: dbSearchResults.length, // since free google search api can give 10 results only
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