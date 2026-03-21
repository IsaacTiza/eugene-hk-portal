import jwt from 'jsonwebtoken'

function signJWT(payload) {
    return jwt.sign(payload, process.env.JWT_SECRET, {
        expiresIn:process.env.JWT_EXPIRES_IN    
    })
}
export default signJWT