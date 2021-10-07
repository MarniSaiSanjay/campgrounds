class ExpressError extends Error {
    constructor(message,status){
        super();
        this.message = message;
        this.status = status || 404 ;  // we can even set default values if needed.
    }
}
module.exports = ExpressError;