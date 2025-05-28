import jwt from 'jsonwebtoken';
import 'dotenv/config';

const Tokens = {
    generateToken: async (TokenType) => {
        const Token = jwt.sign(TokenType ? { "test1": "test1" } : {
            "test": "test"
        },
            TokenType ? process.env.AccessTokenPassword : process.env.RefreshTokenPassword,
            {
                expiresIn: TokenType ? process.env.AccessTokenExpiry : process.env.RefreshTokenExpiry
            }
        )
        return Token;
    },
}

export { Tokens };