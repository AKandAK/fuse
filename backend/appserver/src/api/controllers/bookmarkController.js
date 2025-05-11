const logger = require('../../../../common/logger');
const dbclient = require('../../services/db');
const { validationResult } = require('express-validator'); // For input validation


async function createBookmark(req, res) {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        const { companyId } = req.body;
        const user = req.user;

        // validate user, company details
        const userExists = await dbclient.getUserById(user._id, {_id: 1});
        if (!userExists) {
            return res.status(400).json({ message: 'User does not exist' });
        }

        const companyExists = await dbclient.getCompanyById(companyId, {_id: 1});
        if (!companyExists) {
            return res.status(400).json({ message: 'Company does not exist' });
        }

        const newBookmark = {
            user: userExists._id,
            company: companyExists._id,
        };

        const createdBookmark = await dbclient.insertUserBookmark(newBookmark);
        logger.info('Bookmark created successfully', {
            userBookmarkId: createdBookmark._id,
            userId: createdBookmark.user,
            companyId: createdBookmark.company,
        });

        res.status(201).json({ 
            userId: createdBookmark.user,
            companyId: createdBookmark.company,
        });

    } catch (error) {
        logger.error('Error creating bookmark:', {
            error: error.message,
            stack: error.stack,
            user: req.body.user,
            company: req.body.companyId,
        });

        if (error.code === 11000) {
            return res.status(409).json({ message: 'Bookmark already exists' });
        }
        res.status(500).json({ message: 'Failed to create bookmark' });
    }
};

async function deleteBookmark(req, res) {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        const { companyId } = req.params;

        const user = req.user;
        const companyExists = await dbclient.getCompanyById(companyId, {_id: 1});
        if (!companyExists) {
            return res.status(400).json({ message: 'Company does not exist' });
        }

        const userBookmarkId = req.params.id;
        const result = await dbclient.deleteUserBookmark(user._id, companyExists._id);

        if (result.deletedCount === 0) {
            logger.warn('Bookmark to delete not found', { userid: user._id, companId: companyExists._id });
            return res.status(404).json({ message: 'Bookmark not found' });
        }

        logger.info('Bookmark deleted successfully', { userBookmarkId });
        res.status(200).json({ message: 'Bookmark deleted successfully' });
    } catch (error) {
        logger.error('Error deleting bookmark:', {
            error: error.message,
            stack: error.stack,
            userid: req.user._id,
            companyId: req.params.companyId
        });
        res.status(500).json({ message: 'Failed to delete bookmark' });
    }
}

async function getBookmarksByUser(req, res) {
    try {
        const { page = 1, pageSize = 20, ..._rem } = req.query;
        const user = req.user;
        if (!user) {
            return res.status(400).json({ 
                message: 'Invalid user id ' + user,
            });
        }

        const projection = {
            _id: 1,
            notes: 1,
            createdAt: 1,
        };
        const queryOptions = { populate: [] };

        const { results, total_count } = await dbclient.getUserBookmarks(
            user._id,
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
        logger.error('Error while fetching bookmarks getBookmarksByUser:', error);
        res.status(500).json({ 
            message: 'Failed to fetch bookmarks',
        });
    }
};

module.exports = {
    createBookmark,
    deleteBookmark,
    getBookmarksByUser,
};