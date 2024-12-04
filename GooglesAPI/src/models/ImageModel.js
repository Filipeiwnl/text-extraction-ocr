import mongoose from "mongoose"

const imageSchema = new mongoose.Schema({
        url: {type: String, required: true},
        cratedAt:{
            type: Date,
            default: Date.now,
        },
        hash:{
            type: String, unique: true
        }

})

const ImageSchema = mongoose.model('ImageSchema', imageSchema)

export default ImageSchema;