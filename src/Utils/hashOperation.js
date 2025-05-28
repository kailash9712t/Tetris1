import bcrypt from 'bcrypt';

const HashOperation = {
    GenerateHash: (rawPassword) => {
        return new Promise((resolve, reject) => {
            bcrypt.hash(rawPassword, 10, (error, HashPassword) => {
                if (error) {
                    reject("");
                } else {
                    resolve(HashPassword);
                }
            })
        }) 
    },
    compareHash: async (HashPassword, rawPassword) => {
        const response = await bcrypt.compare(rawPassword, HashPassword);
        return response; 
    }   
}

export default HashOperation; 