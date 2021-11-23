
import * as fs from 'fs';
import { BlobServiceClient } from '@azure/storage-blob';

class BlobController {

    //private AZURE_STORAGE_CONNECTION_STRING = process.env.CONSTRINGBlob;
    
    private AZURE_STORAGE_CONNECTION_STRING = `BlobEndpoint=https://klukb2cstorage.blob.core.windows.net/b2ccosmosdb?sp=racwdli&st=2021-11-23T05:23:39Z&se=2021-11-23T13:23:39Z&spr=https&sv=2020-08-04&sr=c&sig=iMY5S3S2ITrWZo9c9netBYNxuv74zs8Gg7bYyiu8fQo%3D;'
    SharedAccessSignature=sp=racwdli&st=2021-11-23T05:23:39Z&se=2021-11-23T13:23:39Z&spr=https&sv=2020-08-04&sr=c&sig=iMY5S3S2ITrWZo9c9netBYNxuv74zs8Gg7bYyiu8fQo%3D`;

    private CONTAINER_NAME = 'b2ccosmosdb';

    async upload(req, res) {
        const distFolderRoot = './dist/';

        const blobServiceClient = await BlobServiceClient.fromConnectionString(this.AZURE_STORAGE_CONNECTION_STRING);

        // Create a unique name for the container
        const containerName = blobServiceClient.getContainerClient(this.CONTAINER_NAME);
        console.log('t', containerName.containerName);

        // Get a reference to a container
        const containerClient = await blobServiceClient.getContainerClient(containerName.containerName);

        fs.readdir(distFolderRoot, (err, files) => {
            files.forEach(async file => {
                const blobName = file;

                // Get a block blob client
                const blockBlobClient = containerClient.getBlockBlobClient(blobName);
                console.log('nUploading to Azure storage as blob:nt', blobName);

                // Upload files to the blob
                const uploadBlobResponse = await blockBlobClient.uploadFile(file);
                console.log("Blob was uploaded successfully. requestId: ", uploadBlobResponse.requestId);
            });
        });
    }
}

module.exports = BlobController