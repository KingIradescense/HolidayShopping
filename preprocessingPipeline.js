const admin = require("firebase-admin");
const dotenv = require("dotenv");
const fs = require("fs");
const path = require("path");
const csv = require("csv-parser");

dotenv.config();

// Initialize Firebase Admin SDK
let db;
const initializeFirestore = async () => {
  const firebaseKeyPath = "C:\\Users\\scarl\\Desktop\\Ghost Zone\\college\\firebase priv keys\\holiday shopping\\holiday-shopping-e31ba-firebase-adminsdk-x43b1-c580beeddf.json";

  if (!fs.existsSync(firebaseKeyPath)) {
    throw new Error(`Firebase key not found at: ${firebaseKeyPath}`);
  }

  const firebaseConfig = JSON.parse(fs.readFileSync(firebaseKeyPath, "utf-8"));

  if (!admin.apps.length) {
    admin.initializeApp({
      credential: admin.credential.cert(firebaseConfig),
    });
  }

  db = admin.firestore();
  console.log("Firestore initialized successfully.");
};

// Update Recommended Age
const updateRecommendedAge = (record) => {
  const name = record["Name"] ? record["Name"].toLowerCase() : "";
  const category = record["Category"] ? record["Category"].toLowerCase() : "";
  let recommendedAge = record["Recommended Age"] || "";

  if (!recommendedAge || recommendedAge.trim().toLowerCase() === "age info not found") {
    if (/\b(adult|adults|women|men|'s)\b/i.test(name)) {
      recommendedAge = "18+";
    } else if (/\b(kid|kids|girl|girls|boy|boys|'s)\b/i.test(name)) {
      recommendedAge = "5+";
    } else if (/\btoddler(s|'s)?\b/i.test(name)) {
      recommendedAge = "1+";
    } else if (/\b(handbags|jewelry|accessories|fragrance)\b/i.test(category)) {
      recommendedAge = "15+";
    } else if (/\b(laptops|phones|cameras|game consoles|headphones|tablets)\b/i.test(category)) {
      recommendedAge = "10+";
    } else {
      recommendedAge = "Age info not found";
    }
  }

  record["Recommended Age"] = recommendedAge;
  return record;
};

// Calculate Category Averages for Missing Prices
const calculateCategoryAverages = (records) => {
  const categoryTotals = {};
  const categoryCounts = {};

  records.forEach((record) => {
    const category = record["Category"];
    const price = parseFloat(record["Price"]?.replace("$", "").trim()) || 0;

    if (price > 0) {
      categoryTotals[category] = (categoryTotals[category] || 0) + price;
      categoryCounts[category] = (categoryCounts[category] || 0) + 1;
    }
  });

  const categoryAverages = {};
  for (const category in categoryTotals) {
    categoryAverages[category] = categoryTotals[category] / categoryCounts[category];
  }

  return categoryAverages;
};

// Update Missing Price
const updateMissingPrice = (record, categoryAverages) => {
  if (!record["Price"] || record["Price"].trim() === "" || record["Price"].trim() === "Price not available") {
    const category = record["Category"];
    if (categoryAverages[category]) {
      record["Price"] = `$${categoryAverages[category].toFixed(2)}`;
      console.log(`Updated price for ${record["Name"]} in category ${category}: ${record["Price"]}`);
    } else {
      console.log(`No average price available for category: ${category}. Skipping price update.`);
    }
  }
  return record;
};

// Validate Record
const isValidRecord = (record) => {
  const requiredFields = ["Name", "Category", "Price", "Rating", "Recommended Age", "Retailer", "Product URL", "Image URL"];
  const acceptablePlaceholders = ["Age not found", "Price not available", "Rating not available", "URL not available", "Image URL not available"];

  return requiredFields.every((field) => {
    const value = record[field];
    return value && value.trim() !== "" && !acceptablePlaceholders.includes(value.trim());
  });
};

// Write to Firestore
const writeRecordToFirestore = async (record) => {
  try {
    const querySnapshot = await db.collection("products").where("Product URL", "==", record["Product URL"]).get();
    if (!querySnapshot.empty) {
      const doc = querySnapshot.docs[0];
      await db.collection("products").doc(doc.id).set(record, { merge: true });
      console.log(`Updated record in Firestore: ${record.Name}`);
    } else {
      await db.collection("products").add(record);
      console.log(`Added new record to Firestore: ${record.Name}`);
    }
  } catch (error) {
    console.error(`Error writing to Firestore: ${error.message}`);
  }
};

// Save valid records to JSON file
const saveValidRecordsToJSON = (validRecords, filePath) => {
  try {
    fs.writeFileSync(filePath, JSON.stringify(validRecords, null, 2));
    console.log(`Valid records saved to: ${filePath}`);
  } catch (error) {
    console.error(`Error saving valid records to JSON: ${error.message}`);
  }
};

// Process CSV
const processCSV = async (csvFilePath) => {
  const allRecords = [];
  const validRecords = [];
  const retailerCounts = {};
  let totalRecords = 0;
  let skippedRecords = 0;

  return new Promise((resolve, reject) => {
    fs.createReadStream(csvFilePath)
      .pipe(csv())
      .on("data", (record) => {
        totalRecords++;

        // Collect all records for further processing
        allRecords.push(record);
      })
      .on("end", async () => {
        try {
          // Calculate category averages
          const categoryAverages = calculateCategoryAverages(allRecords);

          // Process each record
          allRecords.forEach((record) => {
            // Update recommended age and missing price
            record = updateRecommendedAge(record);
            record = updateMissingPrice(record, categoryAverages);

            // Validate the record
            if (isValidRecord(record)) {
              validRecords.push(record);

              // Count valid records per retailer
              const retailer = record.Retailer || "Unknown";
              retailerCounts[retailer] = (retailerCounts[retailer] || 0) + 1;
            } else {
              skippedRecords++;
              console.log(`Skipping invalid record: ${JSON.stringify(record)}`);
            }
          });

          console.log(`Total records: ${totalRecords}`);
          console.log(`Invalid records: ${skippedRecords}`);
          console.log(`Valid records: ${validRecords.length}`);

          // Log valid record counts per retailer
          console.log("Valid records per retailer:");
          for (const [retailer, count] of Object.entries(retailerCounts)) {
            console.log(`${retailer}: ${count}`);
          }

          // Save valid records to JSON
          const jsonFilePath = path.resolve(__dirname, "valid_records.json");
          saveValidRecordsToJSON(validRecords, jsonFilePath);

          // Save valid records to Firestore
          for (const record of validRecords) {
            await writeRecordToFirestore(record);
          }

          console.log("All valid records have been processed and saved.");
          resolve(validRecords); // Resolve with updated valid records
        } catch (error) {
          reject(error);
        }
      })
      .on("error", (error) => {
        reject(error);
      });
  });
};

// Main Execution
(async () => {
  try {
    await initializeFirestore();
    const csvFilePath = path.resolve(__dirname, "C:\\Users\\scarl\\Desktop\\Ghost Zone\\college\\firebase priv keys\\holiday shopping\\Products - Products.csv");
    await processCSV(csvFilePath);
    console.log("Processing complete.");
  } catch (error) {
    console.error("Pipeline execution failed:", error);
  }
})();
