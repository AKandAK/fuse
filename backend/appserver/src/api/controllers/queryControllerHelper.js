const logger = require('../../../../common/logger');
const dbclient = require('../../services/db');
const {buildMongoQueryFromUrlParams} = require('../../utils/urlToMongoQuery');
const llm = require('../../services/llm')

const ALLOWED_FIELDS = [
    'industry',
    'size',
    'founded',
    'linkedin_url',
    'locality',
    'country',
    'name'
];

const ALLOWED_OPERATORS = [
    'eq', 'ne', 'gt', 'gte', 'lt', 'lte', 'in', 'nin'
];

async function buildSearchQuery(searchText, isNaturalLanguage = false) {
    if (!isNaturalLanguage || !searchText) {
        return {};
    }
    try {
        const filterUrl = await llm.convertTextToUrl(searchText, ALLOWED_FIELDS, ALLOWED_OPERATORS);
        if (filterUrl) {
            // Convert "founded[gte]=1990&size=51-200" to 
            // { "founded[gte]": "1990", "size": "51-200" }
            const parsedParams = parseUrlParamString(filterUrl);
            return buildMongoQueryFromUrlParams(parsedParams, ALLOWED_FIELDS, ALLOWED_OPERATORS);
        }
        
        return await llm.convertTextToMongoQuery(searchText, ALLOWED_FIELDS);
    } catch (error) {
        logger.error('LLM query building failed:', error);
        return {};
    }
}

function buildBaseQuery(filterQuery = {}) {
    try {
        return buildMongoQueryFromUrlParams(filterQuery, ALLOWED_FIELDS, ALLOWED_OPERATORS);
    } catch (error) {
        logger.error('Filter parsing failed:', error);
        throw new Error('Invalid filter parameters');
    }
}

function parseUrlParamString(paramString) {
  const params = {};
  
  if (!paramString) return params;

  paramString.split('&').forEach(pair => {
    const [key, value] = pair.split('=');
    if (key && value !== undefined) {
      params[key] = decodeURIComponent(value);
    }
  });

  return params;
}

module.exports = {
    buildSearchQuery,
    buildBaseQuery
};