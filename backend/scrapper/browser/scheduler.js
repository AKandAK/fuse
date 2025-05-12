const puppeteerModule = require('./puppeteer');
const config = require('../config');
const logger = require('@backend/common/logger');

class BrowserManager {
  constructor() {
    if (!BrowserManager.instance) {
      this.poolSize = config.puppeteer.MaxBrowsers;
      this.maxPagesPerBrowser = config.puppeteer.MaxPagesPerBrowser;
      this.browsers = [];
      this.activePages = new Array(this.poolSize).fill(0);
      this.queue = [];
      this.isProcessing = false;
      BrowserManager.instance = this;
    }
    return BrowserManager.instance;
  }

  async initializeBrowsers() {
    if (this.browsers.length === 0) {
      for (let i = 0; i < this.poolSize; i++) {
        try {
          const browser = await puppeteerModule.createBrowser();
          this.browsers.push(browser);
        } catch (error) {
          logger.error('Error initializing browser:', error);
          throw new Error('initializeBrowsers failed');
        }
      }
    } else {
      logger.info('Browsers already initialized.');
    }
  }

  enqueue(url) {
    return new Promise(async (resolve, reject) => {
      this.queue.push({ url, resolve, reject });
      if (!this.isProcessing) {
        this._processQueue();
      }
    });
  }

  async _processQueue() {
    if (this.isProcessing) return; // Prevent concurrent processing
    this.isProcessing = true;

    while (this.queue.length > 0 && this.browsers.length > 0) {
      const { url, resolve, reject } = this.queue.shift();
      const availableBrowserIndex = this._findAvailableBrowser();

      if (availableBrowserIndex !== -1) {
        this.activePages[availableBrowserIndex]++;
        try {
          const data = await this._scrapeWithBrowser(this.browsers[availableBrowserIndex], url);
          resolve(data);
        } catch (error) {
          reject(error);
        } finally {
          this.activePages[availableBrowserIndex]--;
          if (this.queue.length > 0) {
            // Continue processing the queue
            this._processQueue();
          } else {
            this.isProcessing = false;
          }
        }
      } else {
        // No available browser, reject the promise
        reject('No available browser instances at the moment.');
        this.isProcessing = false;
        break; // Stop processing the queue for now
      }
    }
    if (this.queue.length === 0) {
      this.isProcessing = false;
    }
  }

  _findAvailableBrowser() {
    for (let i = 0; i < this.browsers.length; i++) {
      if (this.activePages[i] < this.maxPagesPerBrowser) {
        return i;
      }
    }
    return -1;
  }

  async _scrapeWithBrowser(browser, url) {
    try {
      return await puppeteerModule.scrapUrl(browser, url);
    } catch (error) {
      logger.error(`Error during scraping of ${url}:`, error);
      throw error;
    }
  }

  async closeAllBrowsers() {
    for (const browser of this.browsers) {
      try {
        await browser.close();
      } catch (error) {
        logger.error('Error closing browser:', error);
      }
    }
    this.browsers = [];
    this.activePages.fill(0);
  }

  async waitForInitialization() {
    return this._initializationPromise;
  }
}

let instance;

module.exports = {
  getInstance: () => {
    if (!instance) {
      instance = new BrowserManager();
    }
    return instance;
  },
};