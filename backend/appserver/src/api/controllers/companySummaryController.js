const logger = require('@backend/common/logger');
const dbclient = require('../../services/db');
const config = require('../../config')
const publisher = require('../../services/publisher')
const { validationResult } = require('express-validator'); // For input validation
const utils = require('../../utils/utils')

const summary_refresh_threshold_hrs = config.app.constants.summary_refresh_threshold_hrs;

details = async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ message: errors.array().join(", ") });
        }
        const { id } = req.params;
        const { attempt } = req.query;
        const projection = {
            _id: 0,
            id: 1,
            summary: 1,
            summary_updated_at: 1,
            website: 1,
            linkedin_url: 1,
            // name: 1,
            // founded: 1,
            // size: 1,
            // industry: 1,
        };
        let result = await dbclient.getCompanyById(id, projection);
        if (!result) {
            return res.status(404).json({ 
                message: 'Couldnt find company details',
            });
        }

        // if summary is outdated, queue it
        const summaryThreshold = new Date();
        summaryThreshold.setHours(summaryThreshold.getHours() - summary_refresh_threshold_hrs);

        // TODO: can also check last scrapped time for this company
        const scheduleSummaryTask = (!result.summary_updated_at || new Date(result.summary_updated_at) < summaryThreshold)

        if (scheduleSummaryTask) {
            if (attempt > 1) {
                await utils.delay(6000);
                result = await dbclient.getCompanyById(id, projection);
            }
            else {
                logger.info(`Fetching summary for Company ${id}`, {
                    lastUpdated: result.summary_updated_at,
                    thresholdHours: config.app.constants.summary_refresh_threshold_hrs
                });
                let msg = {
                    id: result.id,
                    website: result.website,
                    linkedin_url: result.linkedin_url,
                }
                await publisher.publish(config.sqs.SCRAPPER_QUEUE, msg);
            }
        }
        
        res.json({ 
            id: result.id,
            summary: result.summary,
        });

    } catch (error) {
        logger.error('Error companyDetailsController:', error);
        res.status(500).json({ 
            message: 'Failed to get company details',
        });
    }
};

module.exports = details;