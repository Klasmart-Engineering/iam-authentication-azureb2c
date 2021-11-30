import * as fs from 'fs';
import { BlobServiceClient, BlockBlobClient, ContainerClient, } from '@azure/storage-blob';
import { resolve } from 'path';
const { readdir } = fs.promises;

const OUTPUT_FOLDER_ROOT = 'dist';
const AZURE_CONNECTION_STRING = `DefaultEndpointsProtocol=${process.env.DefaultEndpointsProtocol};AccountName=${process.env.AccountName};AccountKey=${process.env.AccountKey};EndpointSuffix=${process.env.EndpointSuffix}`;
const CONTAINER_NAME = 'b2ccosmosdb';

const UploadStatus = {
  Success: 0,
  Error: 1
};

const upload = async () => {
  try {

   const distFolderRoot = `./${OUTPUT_FOLDER_ROOT}/`;

     const blobServiceClient = await BlobServiceClient.fromConnectionString(AZURE_CONNECTION_STRING);

    // Get a reference to a container
    const containerClient = await blobServiceClient.getContainerClient(CONTAINER_NAME);

    const uploadIterator = await uploadFiles(distFolderRoot, containerClient);
    let result = await uploadIterator.next();

    while (!result.done) {
      result = await uploadIterator.next();
    }
    return UploadStatus.Success;

  } catch (error) {
    console.error(error);
    process.exitCode = 1;
    return UploadStatus.Error;
  }
}

async function* uploadFiles(directory: string, containerClient: ContainerClient): AsyncGenerator {
  const dirents = await readdir(directory, { withFileTypes: true });

  for (const dirent of dirents) {
    const resolvedPath = resolve(directory, dirent.name);
    const outputLength = OUTPUT_FOLDER_ROOT.length + 1;
    const direntPath = resolvedPath.substr(resolvedPath.indexOf(`${OUTPUT_FOLDER_ROOT}\\`) + outputLength, resolvedPath.length - 1);
    const direntOriginalPath = resolvedPath.substr(resolvedPath.indexOf(`${OUTPUT_FOLDER_ROOT}\\`), resolvedPath.length - 1);
    if (dirent.isDirectory()) {
      new BlockBlobClient(AZURE_CONNECTION_STRING, CONTAINER_NAME, direntPath);
      yield* uploadFiles(direntOriginalPath, containerClient);
    } else {
      const blockBlobClient = new BlockBlobClient(AZURE_CONNECTION_STRING, CONTAINER_NAME, direntPath);
      await blockBlobClient.uploadFile(direntOriginalPath);
      yield resolvedPath;
    }
  }
}

export default upload