import { genAI } from "./client";

export async function createFileSearchStore() {
  const displayName = "nigeria-tax-laws";

  // Try to find existing store
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

  return await genAI.fileSearchStores.create({
    config: {
      displayName: displayName,
    },
  });
}
