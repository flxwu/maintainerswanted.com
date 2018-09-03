"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var fs = require("fs");
var forge = require("node-forge");
var pify = require("pify");
var readFile = pify(fs.readFile);
function getPem(filename, callback) {
    if (callback) {
        getPemAsync(filename)
            .then(function (pem) { return callback(null, pem); })
            .catch(function (err) { return callback(err, null); });
    }
    else {
        return getPemAsync(filename);
    }
}
exports.getPem = getPem;
function getPemAsync(filename) {
    return readFile(filename, { encoding: 'base64' }).then(function (keyp12) {
        return convertToPem(keyp12);
    });
}
/**
 * Converts a P12 in base64 encoding to a pem.
 * @param p12base64 String containing base64 encoded p12.
 * @returns a string containing the pem.
 */
function convertToPem(p12base64) {
    var p12Der = forge.util.decode64(p12base64);
    var p12Asn1 = forge.asn1.fromDer(p12Der);
    var p12 = forge.pkcs12.pkcs12FromAsn1(p12Asn1, 'notasecret');
    var bags = p12.getBags({ friendlyName: 'privatekey' });
    if (bags.friendlyName) {
        var privateKey = bags.friendlyName[0].key;
        var pem = forge.pki.privateKeyToPem(privateKey);
        return pem.replace(/\r\n/g, '\n');
    }
    else {
        throw new Error('Unable to get friendly name.');
    }
}
//# sourceMappingURL=index.js.map