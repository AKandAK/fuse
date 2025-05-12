const logger = require('@backend/common/logger');
const dbclient = require('../../services/db');
const { validationResult } = require('express-validator'); // For input validation
const { buildSearchQuery, buildBaseQuery } = require('./queryControllerHelper');

async function getMongoResults(res, search, page = 1, pageSize = 20, filterQuery = {}, isNaturalLanguage = false, llmSearch = '') {
    try {
        let mongoQuery = buildBaseQuery(filterQuery);
        
        if (isNaturalLanguage && llmSearch) {
            const llmQuery = await buildSearchQuery(llmSearch, true);
            mongoQuery = { ...mongoQuery, ...llmQuery };
        } else if (search) {
            mongoQuery.$text = { $search: search };
        }

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
            updatedAt: 1,
            ...(search && !isNaturalLanguage && { search_score: { $meta: "textScore" } })
        };

        const queryOptions = {
            sort: search && !isNaturalLanguage
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

        return res.json({ 
            page: Number(page),
            pageSize: Number(pageSize), 
            totalPages: Math.ceil(total_count/pageSize),
            total_count,
            results,
        });
    } catch (error) {
        logger.error('Search failed:', error);
        return res.status(400).json({ 
            message: error.message || 'Invalid search parameters',
        });
    }
}

openTextSearch = async (req, res) => {
    const { search, page = 1, pageSize = 10, ...filterQuery } = req.query;
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    if (!search) {
        return res.status(400).json({ message: 'open language search requires search parameter' });
    }
    const llmText = search
    const searchText = '' // dont want to search by text index in mongodb
    const isNaturalLanguage = true
    const baseFilterQuery = {} // dont want to use filter options

    await getMongoResults(res, searchText, page, pageSize, baseFilterQuery, isNaturalLanguage, llmText);
}

query = async (req, res) => {
    let { search, page = 1, pageSize = 10, ...filterQuery } = req.query;
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    const isNaturalLanguage = false

    await getMongoResults(res, search, page, pageSize, filterQuery, isNaturalLanguage);
}

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
            locality: 1,
            country: 1,
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
    openTextSearch,
};