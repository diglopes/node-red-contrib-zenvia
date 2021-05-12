const ZenviaError = require("./errors/zenvia-error");
const zenviaSDK = require("@zenvia/sdk");
const { zenvia } = require("../lib/constants");

module.exports = function (RED) {
  "use strict";

  function ZenviaWhatsApp(n) {
    RED.nodes.createNode(this, n);
    const authentication = RED.nodes.getNode(n.authentication);
    const { apiToken, senderId } = authentication.credentials;

    /**
     * Provide access to credentials on interface
     */
    RED.httpNode.get(
      `/credentials/zenvia-credentials/${n.authentication}/values`,
      (_, res) => {
        res.send({ credentials: { apiToken } });
      }
    );

    const client = new zenviaSDK.Client(apiToken);
    const whatsapp = client.getChannel(zenvia.WHATSAPP_CHANNEL);

    this.on("input", async (msg, send, done) => {
      try {
        this.status({});
        if (!n.template) throw new ZenviaError({ msg: "Template must be set" });
        const recipient = msg.recipient;
        const fields = msg.payload;
        const templateId = n.template;
        const fieldsKeys = Object.keys(fields);
        const [template] = n.templateList.filter(
          (item) => item.id === templateId
        );
        const hasAllFields = template.fields.every((f) =>
          fieldsKeys.includes(f)
        );
        if (!hasAllFields)
          throw new ZenviaError({ msg: "Not all template fields are filled" });
        const content = new zenviaSDK.TemplateContent(templateId, fields);
        const result = await whatsapp.sendMessage(senderId, recipient, content);
        msg.payload = result;
        send(msg);
        done();
      } catch (error) {
        this.status({ fill: "red", shape: "ring", text: "Failed" });
        if (error.httpStatusCode) {
          done(new ZenviaError({ msg: error.body.message }));
        } else {
          done(error);
        }
      }
    });

    this.on("close", (_, done) => {
      this.status({});
      done();
    });
  }

  RED.nodes.registerType("zenvia whatsapp", ZenviaWhatsApp);
};
