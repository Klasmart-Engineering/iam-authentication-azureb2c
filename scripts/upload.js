
import * as fs from 'fs';
import { BlobServiceClient } from '@azure/storage-blob';
import { resolve } from 'path';
const { readdir } = fs.promises;

const UploadStatus = {
  Error: 0,
  Success: 1
};

const upload = async () => {
  try {
    const azureStorageConnectionString = `BlobEndpoint=https://klukb2cstorage.blob.core.windows.net/b2ccosmosdb?sp=racwdli&st=2021-11-24T05:18:16Z&se=2021-11-24T13:18:16Z&skoid=0855e5bd-a106-4b8e-ba85-89503fade888&sktid=8dc632b7-4df1-4904-a155-7c4663e345bb&skt=2021-11-24T05:18:16Z&ske=2021-11-24T13:18:16Z&sks=b&skv=2020-08-04&spr=https&sv=2020-08-04&sr=c&sig=zyWvk7HbGBQuMsVszdp3juLCvLn%2F4eAQK7XK3qCmm%2F0%3D;
        SharedAccessSignature=sp=racwdli&st=2021-11-24T05:18:16Z&se=2021-11-24T13:18:16Z&skoid=0855e5bd-a106-4b8e-ba85-89503fade888&sktid=8dc632b7-4df1-4904-a155-7c4663e345bb&skt=2021-11-24T05:18:16Z&ske=2021-11-24T13:18:16Z&sks=b&skv=2020-08-04&spr=https&sv=2020-08-04&sr=c&sig=zyWvk7HbGBQuMsVszdp3juLCvLn%2F4eAQK7XK3qCmm%2F0%3D`;
    const distFolderRoot = './dist/';
    const containerName = 'b2ccosmosdb';

    const blobServiceClient = await BlobServiceClient.fromConnectionString(azureStorageConnectionString);

    // Create a unique name for the container
    const containerNameObj = blobServiceClient.getContainerClient(containerName);

    // Get a reference to a container
    const containerClient = await blobServiceClient.getContainerClient(containerNameObj.containerName);

    const uploadIterator = await uploadFiles(distFolderRoot, containerClient);
    let result = await uploadIterator.next();

    while (!result.done) {
      result = await uploadIterator.next();
    }
    return UploadStatus.Success;

  } catch (error) {
    return UploadStatus.Error;
  }
}

async function* uploadFiles(dir, containerClient) {
  const dirents = await readdir(dir, { withFileTypes: true });

  for (const dirent of dirents) {
    const resolvedPath = resolve(dir, dirent.name);
    if (dirent.isDirectory()) {
      yield* uploadFiles(resolvedPath, containerClient);
    } else {
      const blockBlobClient = containerClient.getBlockBlobClient(dirent.name);
      const direntPath = resolvedPath.substr(resolvedPath.indexOf('dist\\'), resolvedPath.length - 1);

      // Upload files to the blob
      await blockBlobClient.uploadFile(direntPath);
      yield resolvedPath;
    }
  }
}

export default upload