import AWS from 'aws-sdk'
import dotenv from 'dotenv'

dotenv.config()

const acesskey = process.env.ACESSKEY
const secretAcessKey = process.env.SECRETACESSKEY

AWS.config.update({region: 'us-west-2'});
const AWS = new aws ({
    acessKey: acesskey,
    secretAcessKey:secretAcessKey,
  //  region: pg
})