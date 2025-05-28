const asynchandler = (fun) => {
    return (req, res, next) => {
        Promise.resolve(fun(req, res)).catch((error) => {
            console.log("Error : - ",error.message.toString());
            res.status(500).send(`Error : - ${error.message.toString()}`);
        });
    }
}  

export default asynchandler; 