class ParamError extends Error {
    constructor(...params) {
        super(...params);
        // Maintains proper stack trace for where our error was thrown (only available on V8)
        if (Error.captureStackTrace) {
            Error.captureStackTrace(this, ParamError);
        }
        this.date = new Date();
    }
}

export default ParamError;