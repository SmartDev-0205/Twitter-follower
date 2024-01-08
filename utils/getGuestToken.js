const https = require("https");


function getGuestToken() {
    return new Promise(function (resolve, reject) {
        const options = {
            "method": "POST",
            "hostname": "api.twitter.com",
            "port": null,
            "path": "/1.1/guest/activate.json",
            "headers": {
                "authorization": "Bearer " + process.env.BEARER_AUTH_TOKEN,
            }
        };

        const req = https.request(options, function (res) {
            const chunks = [];

            res.on("data", function (chunk) {
                chunks.push(chunk);
            });

            res.on("end", function () {
                const body = Buffer.concat(chunks);
                resolve(JSON.parse(body.toString()));
            });
        });

        req.end();
    })
}


module.exports = getGuestToken;