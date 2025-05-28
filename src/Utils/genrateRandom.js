import crypto from 'crypto';

const generate = {
    GenerateRandomString : (length) => {
        return crypto.randomBytes(Math.ceil(length)).toString('hex');
    }
};

export default generate;