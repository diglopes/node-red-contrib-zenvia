const ZenviaError = require("./errors/zenvia-error")
const zenviaSDK = require("@zenvia/sdk")
const { zenvia } = require("../lib/constants")

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
                const fields = msg.payload
                const templateId = n.template
                const fieldsKeys = Object.keys(fields)
                const [template] = n.templateList.filter(item => item.id === templateId)
                const hasAllFields = template.fields.every(f => fieldsKeys.includes(f))
                if(!hasAllFields) throw new ZenviaError({ msg: "Not all template fields are filled" })
                msg.payload = { template: n.template, apiToken }
                msg.payload = { template }
                send(msg)
                done()
            } catch (error) {
                done(error)
            }
        })
    }

    RED.nodes.registerType("zenvia whatsapp", ZenviaWhatsApp)
}