// scripts/ingest.ts
import * as admin from "firebase-admin";
import { getFirestore } from "firebase-admin/firestore";
import { GoogleGenerativeAI } from "@google/generative-ai";
import * as path from "path";
import * as dotenv from "dotenv";

// 1. کانفیگ‌ها
const SERVICE_ACCOUNT_PATH = path.join(process.cwd(), "service-account.json");
const GEMINI_KEY = "AIzaSyDFzblmzu4FWl6u9oBHOrgQT9Y1w2EZ6bI"; // کلید جمنای شما

// دیتای نمونه (بعدا میتونیم از فایل بخونیم)
const DATASET = [
  {
    q: "What is a safe burn rate for a seed stage startup?",
    a: "For a seed stage startup with $1M-2M funding, a safe burn rate is typically between $10k to $40k per month, giving you 18-24 months of runway."
  },
  {
    q: "How to calculate TAM (Total Addressable Market)?",
    a: "TAM is calculated by multiplying the total number of potential customers by the average annual revenue per customer. Formula: TAM = Total Customers * Annual Contract Value (ACV)."
  },
  {
    q: "What is a SAFE agreement?",
    a: "Simple Agreement for Future Equity (SAFE) is a financing contract used by startups. It gives investors the right to equity in the future (usually at the next priced round) without setting a valuation immediately."
  }
];

async function main() {
  console.log("🚀 Starting Ingestion Script (Node.js)...");

  // 2. اتصال به فایربیس (ادمین)
  if (!admin.apps.length) {
    admin.initializeApp({
      credential: admin.credential.cert(require(SERVICE_ACCOUNT_PATH)),
    });
  }
  const db = getFirestore();
  
  // 3. اتصال به جمنای
  const genAI = new GoogleGenerativeAI(GEMINI_KEY);
  const model = genAI.getGenerativeModel({ model: "text-embedding-004" });

  console.log(`📦 Found ${DATASET.length} items to process.`);

  const batch = db.batch();
  const collectionRef = db.collection("knowledge_base");

  for (const [i, item] of DATASET.entries()) {
    const textContent = `Question: ${item.q}\nAnswer: ${item.a}`;

    try {
      // تولید وکتور
      const result = await model.embedContent(textContent);
      const vector = result.embedding.values;

      // آماده‌سازی داکیومنت
      const docRef = collectionRef.doc();
      batch.set(docRef, {
        text: textContent,
        embedding: admin.firestore.FieldValue.vector(vector), // فرمت مخصوص وکتور گوگل
        source: "manual_upload",
        createdAt: new Date()
      });

      console.log(`✅ Processed item ${i + 1}`);
    } catch (error) {
      console.error(`❌ Error on item ${i + 1}:`, error);
    }
  }

  // ذخیره نهایی
  await batch.commit();
  console.log("🎉 All data uploaded successfully to Firestore!");
}

main().catch(console.error);