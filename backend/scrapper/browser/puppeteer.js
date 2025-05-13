const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
const AdblockerPlugin = require('puppeteer-extra-plugin-adblocker');
const UserAgent = require('user-agents');
const config = require('../config');
const logger = require("@backend/common/logger")

const use_proxy = config.puppeteer.use_proxy

puppeteer.use(StealthPlugin());
puppeteer.use(AdblockerPlugin({ blockTrackers: true }));

const userAgents = [
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.6 Safari/605.1.15',
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:123.0) Gecko/20100101 Firefox/123.0',
];

function getRandomUserAgent() {
    const userAgent = new UserAgent();
    return userAgent.toString();
}

function generateRandomDelay(min, max) {
    return Math.random() * (max - min) + min;
}

async function emulateHumanBehavior(page) {
    await page.setViewport({
        width: Math.floor(Math.random() * 400) + 800,
        height: Math.floor(Math.random() * 300) + 600,
    });

    if (Math.random() > 0.5) {
        await page.evaluate(() => {
            window.scrollBy(0, Math.random() * 100 - 50);
        });
        await page.waitForTimeout(generateRandomDelay(100, 300));
    }
}

async function createBrowser() {
    try {
        const launchArgs = {
            headless: config.puppeteer.headless,
            args: [
                '--no-sandbox',
                '--disable-setuid-sandbox',
                '--disable-dev-shm-usage',
                '--disable-accelerated-2d-canvas',
                '--disable-gpu',
            ],
            ignoreDefaultArgs: ['--enable-automation'],
        };

        if (use_proxy && config.proxy.username && config.proxy.password && config.proxy.proxyUrl) {
            launchArgs.args.push(`--proxy-server=${config.proxy.proxyUrl}`);
        }

        const browser = await puppeteer.launch(launchArgs);
        console.info(`browser created)`);
        return browser;
    } catch (error) {
        logger.error('Error creating browser:', { error: error });
        throw error;
    }
}

async function scrapUrl(browser, url) {
    let page;
    const timeoutMs = config.puppeteer.TabTimeout * 1000;
    let content = '';
    try {
        page = await browser.newPage();
        page.setDefaultTimeout(timeoutMs);

        if (config.puppeteer.use_proxy && config.proxy.username && config.proxy.password && config.proxy.proxyUrl) {
            await page.authenticate({
                username: config.proxy.username,
                password: config.proxy.password,
            });
        }

        await page.setUserAgent(getRandomUserAgent());
        // await emulateHumanBehavior(page);

        await page.goto(url, { waitUntil: 'domcontentloaded' });

        content = await page.evaluate(() => document.body.innerText);

        return content;

    } catch (error) {
        logger.error(`Error scraping ${url}:`, { error: error });
        if (error.message.includes('Timeout')) {
            return '';
        }
        return '';
    } finally {
        if (page) {
            await page.close();
        }
    }
}

module.exports = { createBrowser, scrapUrl };