const config = require('../config');
const logger = require('@backend/common/logger');
const { GoogleGenerativeAI } = require("@google/generative-ai");

let genAI = new GoogleGenerativeAI(config.llm.gemini.API_KEY);;

function safeParseJSON(text) {
  if (!text) return {};
  try {
    const cleanText = text.replace(/```(json)?/g, '').trim();
    const match = cleanText.match(/\{[\s\S]*\}/);
    return match ? JSON.parse(match[0]) : {};
  } catch (error) {
    logger.error("safeParseJSON parsing error:", error);
    return {};
  }
}

async function queryGemini(prompt) {
  try {
    const model = genAI.getGenerativeModel({ 
      model: config.llm.gemini.MODEL_NAME,
    });

    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error("Gemini Error:", error);
    throw error;
  }
}

async function convertTextToMongoQuery(text, allowedFields = []) {
  const prompt = `CONVERT THIS NATURAL LANGUAGE TO MONGODB QUERY JSON:
  
    User Query: "${text}"

    REQUIREMENTS:
    1. Use ONLY these fields: ${allowedFields.join(", ")}
    2. Return VALID JSON ONLY (no explanations)
    3. Maintain the original query intent

    EXAMPLE OUTPUT:
    {
      "category": "electronics",
      "price": { "$lt": 500 },
      "stock": { "$gte": 10 }
    }

    YOUR OUTPUT:`;

  try {
    const response = await queryGemini(prompt);
    const result = safeParseJSON(response);
    
    Object.keys(result).forEach(field => {
      if (!allowedFields.includes(field)) {
        console.warn(`Removing disallowed field: ${field}`);
        delete result[field];
      }
    });
    
    return result;
  } catch (error) {
    logger.error("convertTextToMongoQuery conversion failed:", error);
    return null;
  }
}

async function convertTextToUrl(text, availableFields = [], availableOps = ["eq", "eq", "gt", "lt", "gte", "lte", "ne"]) {
  const prompt = `CONVERT TO URL PARAMETERS:
  
  Query: "${text}"

  RULES:
  1. Use ONLY these fields: ${availableFields.join(", ")}
  2. Use ONLY these operators: ${availableOps.join(", ")}
  3. Format: field[op]=value&field=value
  4. For exact matches, omit operator (field=value)

  EXAMPLE:
   fields = ["price", "ram", "category", "company"]
   operators = ["lt", "eq", "in"]
  "Show available phones under $500 with 8gb ram and made by samsung or apple with storage 256gb" → "category[eq]=phones&price[lt]=500&company[in]=apple,samsung"

  YOUR OUTPUT:`;

  try {
    const response = await queryGemini(prompt);
    return response.trim();
  } catch (error) {
    logger.error("convertTextToUrl conversion failed:", error);
    return null;
  }
}

module.exports = {
  convertTextToMongoQuery,
  convertTextToUrl
};