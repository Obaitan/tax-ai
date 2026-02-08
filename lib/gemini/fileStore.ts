import { genAI } from "./client";

export async function createFileSearchStore(forceNew = false) {
  const displayName = "nigeria-tax-laws";

  // If not forcing new, try to find existing store
  if (!forceNew) {
    try {
      const pager = await genAI.fileSearchStores.list();
      for await (const store of pager) {
        if (store.displayName === displayName) {
          return store;
        }
      }
    } catch (error) {
      console.warn("Could not list stores, attempting to create new one...");
    }
  }

  return await genAI.fileSearchStores.create({
    config: {
      displayName: displayName,
    },
  });
}

/**
 * List all files in a file search store
 */
export async function listFilesInStore(storeId: string): Promise<any[]> {
  try {
   

    // Try to get store info
    const store = await genAI.fileSearchStores.get({ name: storeId });

    return [];
  } catch (error) {
    console.error(`Failed to get store info for ${storeId}:`, error);
    throw error;
  }
}

/**
 * Delete a specific file from a file search store
 * Note: Gemini API doesn't provide a direct way to remove individual files from stores.
 * Files can only be removed by deleting the entire store.
 */
export async function deleteFileFromStore(storeId: string, fileName: string) {
  console.warn(`⚠️  Gemini API doesn't support removing individual files from stores.`);
  console.warn(`To remove files, you need to delete the entire store and create a new one.`);
  console.warn(`File ${fileName} cannot be removed individually.`);
  throw new Error("Individual file removal not supported by Gemini API");
}

/**
 * Delete the entire file search store
 */
export async function deleteFileSearchStore(storeId: string) {
  try {
    await genAI.fileSearchStores.delete({ name: storeId });
  } catch (error) {
    console.error(`Failed to delete file search store ${storeId}:`, error);
    throw error;
  }
}
