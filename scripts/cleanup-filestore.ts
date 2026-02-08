import dotenv from 'dotenv';
dotenv.config();

import { createFileSearchStore } from '@/lib/gemini/fileStore';
import { ingestFileFromUrl } from '@/lib/gemini/ingest';

async function cleanupFileStore() {
  process.exit(1);
}

async function recreateStoreWithSingleFile() {
  try {
    // Validate environment
    if (!process.env.GOOGLE_GEMINI_API_KEY) {
      throw new Error('GOOGLE_GEMINI_API_KEY environment variable is not set.');
    }

    // URL for Nigeria Tax Act 2025 from resources.ts
    const taxActUrl =
      'https://xifruaov831d4lhw.public.blob.vercel-storage.com/Nigeria%20Tax%20Act%202025-U1QUJ4YyTFg3nS8rwqWpPsDEQoirRw.pdf';
    const displayName = 'Nigeria Tax Act 2025';

    const newStore = await createFileSearchStore(true); // forceNew = true
    const newStoreId = newStore.name;

    if (!newStoreId) {
      throw new Error('Failed to create new store.');
    }

    // Upload the single desired file from URL

    await ingestFileFromUrl({
      url: taxActUrl,
      displayName: displayName,
      storeId: newStoreId,
    });
  } catch (error) {
    console.error(
      'Store recreation failed:',
      (error as Error).message || error,
    );
    process.exit(1);
  }
}

// Command line argument handling
const command = process.argv[2];

if (command === 'recreate') {
  recreateStoreWithSingleFile();
} else {
  cleanupFileStore();
}
