// seedCompanies.js -- simple seed

const fs = require('fs');
const readline = require('readline');
const db = require('../src/services/db')

// hardcoded for simplicity
const DATASET_FILE = 'free_company_dataset.json';
const SEED_COUNT = 100 * 1000;
const BATCH_SIZE = 500;
const TOTAL_LINES_ESTIMATE = 20000000;


// --- print unique values ---
const collectUniqueValues = true
const uniqueCountries = new Set();
const uniqueIndustries = new Set();
const uniqueSizes = new Set();

async function seedCompanies() {
  let currentLine = 0;
  let selectedCompanies = [];
  let insertedCount = 0;

  const rl = readline.createInterface({
    input: fs.createReadStream(DATASET_FILE),
    crlfDelay: Infinity,
  });

  try {
    await db.connectDB();
    console.log('DB connected, Starting seed.')

    for await (const line of rl) {
      currentLine++;

      // random selection
      if (Math.random() < SEED_COUNT / TOTAL_LINES_ESTIMATE) {
        try {
          const companyData = JSON.parse(line);
          if (companyData && typeof companyData === 'object' && companyData.id) {
            selectedCompanies.push(companyData);

            if (selectedCompanies.length >= BATCH_SIZE) {
              await db.insertManyCompanies(selectedCompanies);
              insertedCount += selectedCompanies.length;
              console.log(`Inserted ${insertedCount} companies...`); // Simple log
              selectedCompanies = [];
              if (insertedCount >= SEED_COUNT) {
                break; // Stop if target reached
              }
            }

             // collect unique values
            if (collectUniqueValues) {
              if (companyData.country) {
                uniqueCountries.add(companyData.country);
              }
              if (companyData.industry) {
                uniqueIndustries.add(companyData.industry);
              }
              if (companyData.size) {
                uniqueSizes.add(companyData.size);
              }
            }

          }
        } catch (err) {
          console.error(`Error parsing line ${currentLine}: ${err.message}`);
        }
      }
    }
  
    console.log(`Seeding completed. Total companies inserted: ${insertedCount}`);


    if (collectUniqueValues) {
      if (uniqueCountries.size < 300) {
        console.log(JSON.stringify(Array.from(uniqueCountries).sort()));
      }
      if (uniqueIndustries.size < 200) {
        console.log(JSON.stringify(Array.from(uniqueCountries).sort()));
      }
      if (uniqueSizes.size < 200) {
        console.log(JSON.stringify(Array.from(uniqueCountries).sort()));
      }
    }


  } catch (err) {
    console.error(`Seeding failed: ${err.message}`);
    process.exit(1);
  } finally {
    await db.disconnectDB();
    console.log('MongoDB connection closed.');
  }
}

seedCompanies();