module.exports = function(RED) {
    function ZenviaCredentials(n) {
        RED.nodes.createNode(this, n);
        this.name = n.name;
    }
    RED.nodes.registerType("zenvia credentials", ZenviaCredentials, {
        credentials: {
            apiToken: { type: "password", required:true },
            senderId: { type: "string", required: true }
        }
    });
}