const config = require('../config');
const logger = require('@backend/common/logger');
const { GoogleGenerativeAI } = require("@google/generative-ai");

let genAI = new GoogleGenerativeAI(config.llm.gemini.API_KEY);;

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

async function getSummaryOfWebsite(websiteText) {
    if (!websiteText) return ''
    const prompt = `Provide a concise summary of the following company information in 50-250 words:

    "${websiteText}"

    Focus on the company's main business, products or services, mission, and any significant achievements or information that would be important for someone to understand what the company does, competitive advantages, market position`;

    try {
        const response = await queryGemini(prompt);
        return response.trim();
    } catch (error) {
        logger.error("getSummaryOfWebsite llm conversion failed:", error);
        return null;
    }
}

module.exports = {
  getSummaryOfWebsite,
};