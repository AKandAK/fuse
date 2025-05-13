const express = require('express');
const config = require('./config')
const scheduler = require('./browser/scheduler').getInstance()
const { scrapGoogleWebSourcesApi } = require('./browser/puppeteer')
const cors = require('cors');


const app = express();

// app.use(cors({
//   origin: config.cors.ORIGINS
// }));

app.use(express.json());

// Request logging
app.use((req, res, next) => {
  logger.info('Incoming request', {
    method: req.method,
    path: req.path,
    ip: req.ip
  });
  next();
});

app.get('/', (req, res) => {
  res.send('Hello Fuse');
});

app.get('/api/google_intercept', async (req, res) => {
    await googleInterceptApi(req, res);
});

async function googleInterceptApi(req, res) {
    const { searchText, ...rem } = req.params;
    try {
        const scrapTask = {
            func: scrapGoogleWebSourcesApi,
            searchText: searchText
        };
        if (!searchText?.trim()) {
            return res.status(400).json({ message: 'Search text empty'});
        }
        const scrapPromise = scheduler.enqueue(scrapTask)
        const timeoutPromise = delay(15 * 1000);
        const result = await Promise.race([scrapPromise, timeoutPromise]);
        if (result.timedOut) {
            return res.status(408).json({ error: "Request Timed Out" });
        }
        // clean response to json
        const websiteArray = extractWebsitesWithLogos(result);
        return res.status(200).json({
            results: websiteArray
        })
    }
    catch (error) {
        res.status(500).json({message: 'Failed to get intercept data'})
    }
}

function extractWebsitesWithLogos(content) {
    try {
        const pattern = /\bimage of ([a-zA-Z0-9]+)/g;

        let words = [];
        let match;
        
        while ((match = pattern.exec(content)) !== null) {
            words.push(match[1].toLowerCase() + ".com");
        }

        words = [...new Set(words)].sort();
        return words;
    } catch (error) {
        logger.error(`parsing content error extractWebsitesWithLogos`, { error: error });
        return []
    }
}

async function delay(ms) {
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve({ timedOut: true });
        }, ms);
    });
}