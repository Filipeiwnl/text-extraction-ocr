import mongoose from "mongoose"

const UserSchema = new mongoose.Schema ({

    Name:{type: String, required: true},
    Cpf: {type: String, required: true, unique: true},
    DataNascimento: {type: Date, required: true},
    Parentes: {type:String, required: true},
    Naturalidade: {type: String, required: true},
    Rg:{type: String, required: true}
})                 

const User = mongoose.model("User", UserSchema)

export default User;