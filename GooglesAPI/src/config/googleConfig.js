const vision = require(`@google-cloud/vision`)

const client = new vision.ImageAnnotatorClient({})

module.exports = client