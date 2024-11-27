import vision from '@google-cloud/vision';


const client = new vision.ImageAnnotatorClient({
    keyFilename: './GoogleKeyVisionAPI.json', 
});

export default client;
