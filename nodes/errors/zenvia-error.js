class ZenviaError extends Error {
    constructor({ msg }) {
        super()
        this.name = "ZenviaError"
        this.message = msg
        delete this.stack
    }
}


module.exports = ZenviaError