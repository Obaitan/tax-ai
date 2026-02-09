/* eslint-disable @typescript-eslint/no-unused-vars */
import dotenv from "dotenv";
dotenv.config();

import path from "path";
import fs from "fs";
import { ingestFilesFromDirectory } from "@/lib/gemini/ingest";
import { createFileSearchStore } from "@/lib/gemini/fileStore";

async function uploadLocalFiles() {
  try {
    // Validate environment
    if (!process.env.GOOGLE_GEMINI_API_KEY) {
      throw new Error(
        "GOOGLE_GEMINI_API_KEY environment variable is not set. Please check your .env file.",
      );
    }

    // 1. Ensure we have a file search store

    const store = await createFileSearchStore();
    const storeId = store.name;

    if (!storeId) {
      throw new Error("Failed to create/get File Search Store name.");
    }

    // 2. Upload all files from lib/data/files/ directory
    const dataFilesDir = path.join(process.cwd(), "lib", "data", "files");

    // Check if directory exists
    if (!fs.existsSync(dataFilesDir)) {
      throw new Error(`Data files directory not found: ${dataFilesDir}`);
    }

    const results = await ingestFilesFromDirectory({
      directoryPath: dataFilesDir,
      storeId: storeId,
      deleteAfterUpload: true, // Delete files after successful upload
    });

    // 3. Report results
    const successful = results.filter((r) => r.success);
    const failed = results.filter((r) => !r.success);

    // Exit with error code if any files failed
    if (failed.length > 0) {
      console.error(`Failed to ingest ${failed.length} files:`);
      failed.forEach((f) => console.error(`- ${f.fileName}: ${f.error}`));
      process.exit(1);
    }
  } catch (error) {
    console.error("Upload process failed:", (error as Error).message || error);
    process.exit(1);
  }
}

uploadLocalFiles();
