require('dotenv').config();
const sharedkey = process.env.SECURE_KEY

const formAuthMiddleware = (req, res, next) => {
    const apiKey = req.headers['x-api-key']
    if(apiKey === sharedkey){
        next()
    }
    else{
        res.status(401).json({message:'Unauthorized'})
    }
}
module.exports = formAuthMiddleware;