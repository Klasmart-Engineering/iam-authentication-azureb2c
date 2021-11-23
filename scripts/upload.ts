
import * as fs from 'fs';
import { BlobServiceClient } from '@azure/storage-blob';

class BlobController {

    //private AZURE_STORAGE_CONNECTION_STRING = process.env.CONSTRINGBlob;
    
    private AZURE_STORAGE_CONNECTION_STRING = `BlobEndpoint=https://klukb2cstorage.blob.core.windows.net/b2ccosmosdb?sp=r&st=2021-11-23T05:23:39Z&se=2021-11-23T13:23:39Z&spr=https&sv=2020-08-04&sr=c&sig=VG9ZNCSYrAZkEBwmqMco3u8KWUO6fPWSuDpd99O4szw%3D;'
    SharedAccessSignature=sv=2015-04-05&sr=b&si=tutorial-policy-635959936145100803&sig=9aCzs76n0E7y5BpEi2GvsSv433BZa22leDOZXX%2BXXIU%3D`;

    private CONTAINER_NAME = 'b2ccosmosdb';
    constructor(router) {
        router.post('/file', this.upload.bind(this));
    }


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