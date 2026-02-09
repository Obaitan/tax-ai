import { genAI } from "./client";

export async function attachFilesToStore({
  storeId,
  fileIds,
}: {
  storeId: string;
  fileIds: string[];
}) {
  const promises = fileIds.map((fileId) =>
    genAI.fileSearchStores.importFile({
      fileSearchStoreName: storeId,
      fileName: fileId,
    })
  );

  await Promise.all(promises);
}
