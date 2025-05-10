const logger = require('../../utils/logger');
const dbclient = require('../../services/db');
const queryToMongo = require('query-to-mongo');
const { validationResult } = require('express-validator'); // For input validation

query = async (req, res) => {
    try {
        const { search, page = 1, pageSize = 20, ...filterQuery } = req.query;
        let mongoQuery = {};

        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        try {
            // Parse regular filters
            const { criteria } = queryToMongo(filterQuery, {
                allowedFields: ['name', 'industry', 'size', 'founded', 'linkedin_url'],
                defaultLimit: 0,
                maxLimit: 0,
            });
            mongoQuery = criteria;

            // use text search indexes if search parameter exists
            // for now name field has text index
            if (search) {
                mongoQuery.$text = { $search: search };
            }

        } catch (error) {
            return res.status(400).json({ 
                message: 'Invalid filter parameters',
            });
        }

        // Include text score in projection if doing text search
        const projection = {
            _id: 0,
            id: 1,
            name: 1,
            website: 1,
            founded: 1,
            size: 1,
            industry: 1,
            linkedin_url: 1,
            summary: 1,
            ...(search && { search_score: { $meta: "textScore" } }) // Only include if text search
        };

        const queryOptions = {
            ...(search && { sort: { search_score: { $meta: "textScore" } } }) // Sort by relevance
        };

        const { results, total_count } = await dbclient.getPaginatedCompanyResults(
            mongoQuery,
            page, 
            pageSize,
            projection,
            queryOptions
        );

        res.json({ 
            page: Number(page),
            pageSize: Number(pageSize), 
            totalPages: Math.ceil(total_count/pageSize),
            total_count,
            results,
        });

    } catch (error) {
        logger.error('Error during company search:', error);
        res.status(500).json({ 
            message: 'Failed to search companies',
        });
    }
};

module.exports = query;