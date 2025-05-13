const logger = require('@backend/common/logger');
const dbclient = require('../../services/db');
const { validationResult } = require('express-validator'); // For input validation
const { buildSearchQuery, buildBaseQuery } = require('./queryControllerHelper');

async function getMongoResults(mongoQuery, search, page = 1, pageSize = 10) {
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

    return { 
        page: Number(page),
        pageSize: Number(pageSize), 
        totalPages: Math.ceil(total_count/pageSize),
        total_count,
        results,
    };
}

openTextSearch = async (req, res) => {
    try {
        const { search, page = '1', pageSize = '10', ...filterQuery } = req.query;
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ message: errors.array().join(", ") });
        }
        if (!search) {
            return res.status(400).json({ message: 'open language search requires search parameter' });
        }

        // dont want to search by text index in mongodb
        // dont want to use filters for open text search
        const llmText = search
        const llmQuery = await buildSearchQuery(llmText, true);
        if (!llmQuery) {
            res.status(503).json({ 
                message: 'Generative AI Api is not available now',
            });
        }
        let mongoQuery = { ...llmQuery }

        const resposne = await getMongoResults(mongoQuery, search, Number(page), Number(pageSize));
        return res.json(resposne);
    }
    catch (error) {
        logger.error('Error openTextSearch:', error);
        res.status(500).json({ 
            message: 'Failed to get openTextSearch details',
        });
    }
}

simpleTextSearch = async (req, res) => {
    try {
        let { search, page = '1', pageSize = '10', ...filterQuery } = req.query;
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ message: errors.array().join(", ") });
        }
        let mongoQuery = buildBaseQuery(filterQuery);
        if (search) {
            mongoQuery.$text = { $search: search };
        }

        const resposne =  await getMongoResults(mongoQuery, search, Number(page), Number(pageSize));
        return res.json(resposne);
    }
    catch (error) {
        logger.error('Error simpleTextSearch:', error);
        res.status(500).json({ 
            message: 'Failed to get simpleTextSearch details',
        });
    }
}

autocomplete = async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ message: errors.array().join(", ") });
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
            return res.status(400).json({ message: errors.array().join(", ") });
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
    simpleTextSearch,
    queryById,
    autocomplete,
    openTextSearch,
};