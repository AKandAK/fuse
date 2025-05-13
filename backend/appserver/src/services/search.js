const axios = require('axios');
const config = require('../config');
const logger = require('@backend/common/logger');
const { GoogleCustomSearch } = require("@langchain/community/tools/google_custom_search")


async function langchainGoogleSearch(query, page = 1, pageSize = 20) {
    try {
      const tool = new GoogleCustomSearch({
          apiKey: config.search.GOOGLE_JSON_SEARCH_API_KEY,
          googleCSEId: config.search.GOOGLE_CSE_ID,
      });

      const rawString = await tool.invoke(query);
      const jsonResponse = JSON.parse(rawString);
      const results = jsonResponse.map((item, index) => ({
          title: item.title,
          url: item.link,
          snippet: item.snippet,
          score: page,
      }));
      return results;
    }
    catch (error) {
      logger.error(`langchainGoogleSearch error: ${query}`, {msg: error.message});
      return { results: [], total_count: 0};
    }
}


async function googleSearch(query, page = 1, pageSize = 20) {
  try {
    const start = (page - 1) * pageSize + 1;
    
    const response = await axios.get('https://www.googleapis.com/customsearch/v1', {
      params: {
        q: query,
        key: config.search.GOOGLE_JSON_SEARCH_API_KEY,
        cx: config.search.GOOGLE_CSE_ID,
        num: pageSize,
        start: start
      }
    });
    
    const total_count = parseInt(response.data.searchInformation?.totalResults || "0", 10); // nouse, high no of pages
    const results = response.data.items.map((item, index) => ({
        title: item.title,
        url: item.link,
        snippet: item.snippet,
        position: start + index,
        score: 1 - ((start + index - 1) / 100) // normalized
    }));
    return results;
  } catch (error) {
    logger.error(`googleSearch error: ${query}`, {msg: error.message});
    return []
  }
}

// return top searches in the format
// {results : [{website: url, score: search_score}]}
async function getSearchResults(searchText, page = 1, pageSize = 20, searchEngine = 'googleJson') {
  try {
    if (searchEngine == 'googleJson') {
      let tweakedGoogleSearchText = searchText;
      if (!searchText.includes('.com')) {
        tweakedGoogleSearchText= `'${searchText} official site' -inurl:blog -inurl:news -inurl:review -intitle:Compared site:.com`
      }
      // let t1= `'${searchText} official site' -inurl:blog -inurl:news -inurl:review -inurl:comparison -inurl:top -intitle:top10 site:*.com OR site:*.ai`
      // const {r, w} = await googleSearch(t1, page, pageSize);
      // let tweakedGoogleSearchText = `
      //   '${searchText} official site'
      //   -inurl:news -inurl:review -inurl:comparison
      //   -intitle:top10 -intitle:top20
      //   -intitle:'top 10' -intitle:'top 20'
      //   -intitle:'Top 10' -intitle:'Top 20'
      //   -intitle:'Review' -intitle:'Compared'
      //   -intitle:'10 Best' -intitle:'20 Best'
      //   site:.com
      // `;
      tweakedGoogleSearchText = tweakedGoogleSearchText.replace(/\n+/g, " ").replace(/\s+/g, " ").trim();
      const results = await langchainGoogleSearch(tweakedGoogleSearchText, page, pageSize);
      return results;
    }
    return null;
  }
  catch (error) {
    return null;
  }
}

module.exports = {
  getSearchResults
}