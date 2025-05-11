const logger = require('../../../../common/logger');
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
            // Parse regular filters only
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
            location: 1,
            summary: 1,
            updatedAt: 1,
            ...(search && { search_score: { $meta: "textScore" } })
        };

        const queryOptions = {
            sort: search
                ? { search_score: { $meta: "textScore" }, updatedAt: -1 }
                : { updatedAt: -1 }
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

autocomplete = async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        const { text } = req.params;

        // TODO: cache autocomplete
        // for now simple, direct querying
        let mongoQuery = {};
        mongoQuery.$text = { $search: text };

        const projection = {
            _id: 0,
            id: 1,
            name: 1,
        };
        const page = 1
        const pageSize = 10
        const { results, total_count } = await dbclient.getPaginatedCompanyResults(
            mongoQuery,
            page, 
            pageSize,
            projection
        );

        res.json({
            results,
        });

    } catch (error) {
        logger.error('Error companyQueryController autocomplete:', error);
        res.status(500).json({ 
            message: 'Failed to get autocomplete details',
        });
    }
}

queryById = async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        const { id } = req.params;
        
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
        };
        const result = await dbclient.getCompanyById(id, projection);
        if (!result) {
            return res.status(404).json({ 
                message: 'Couldnt find company details',
            });
        }
        res.json({ result });
    } catch (error) {
        logger.error('Error companyDetailsController queryById:', error);
        res.status(500).json({ 
            message: 'Failed to get company queryById',
        });
    }
}

module.exports = {
    query,
    queryById,
    autocomplete,
};