const logger = require('../../utils/logger');
const dbclient = require('../../services/db');
const config = require('../../config')

const summary_refresh_threshold_hrs = config.app.constants.summary_refresh_threshold_hrs;

details = async (req, res) => {
    try {
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
            summary_updated_at: 1,
        };
        const result = await dbclient.getCompanyById(id, projection);
        if (!result) {
            return res.status(404).json({ 
                message: 'Couldnt find company details',
            });
        }

        // if summary is outdated, queue it
        const summaryThreshold = new Date();
        summaryThreshold.setHours(summaryThreshold.getHours() - summary_refresh_threshold_hrs);
        
        if (!result.summary_updated_at || new Date(result.summary_updated_at) < summaryThreshold) {
            logger.info(`Company ${id} has outdated summary`, {
                lastUpdated: result.summary_updated_at,
                thresholdHours: config.app.constants.summary_refresh_threshold_hrs
            });
        }

        const { summary_updated_at, ...response } = result 
        res.json({ response });

    } catch (error) {
        logger.error('Error companyDetailsController:', error);
        res.status(500).json({ 
            message: 'Failed to get company details',
        });
    }
};

module.exports = details;