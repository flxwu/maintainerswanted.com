#!/usr/bin/env node
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var gp12 = require("../index");
var argv = process.argv;
var p12Path = argv[2];
if (!p12Path) {
    console.error('Please specify a *.p12 file to convert.');
    process.exit(1);
}
gp12.getPem(p12Path, function (err, pem) {
    if (err) {
        console.log(err);
        process.exit(1);
    }
    else {
        console.log(pem);
    }
});
//# sourceMappingURL=gp12-pem.js.map