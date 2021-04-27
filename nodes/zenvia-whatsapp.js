const ZenviaError = require("./errors/zenvia-error")

module.exports = function(RED) {
    "use strict";

    function ZenviaWhatsApp(n) {
        RED.nodes.createNode(this, n)
        const authentication = RED.nodes.getNode(n.authentication)
        const { apiToken } = authentication.credentials 
        RED.httpNode.get(`/credentials/zenvia-credentials/${n.authentication}/values`, (_, res) => {
            res.send({ credentials: { apiToken } })
        })

        this.on("input", (msg, send, done) => {
            try {
                if(!n.template) throw new ZenviaError({ msg: "Template must be set" })
                msg.payload = { template: n.template, apiToken }
                send(msg)
                done()
            } catch (error) {
                done(error)
            }
        })
    }

    RED.nodes.registerType("zenvia whatsapp", ZenviaWhatsApp)
}