const fs = require("fs");

const readFile = (path, encoding = "utf8") => fs.readFileSync(path, encoding);

const writeFile = (path, data, encoding = "utf8") => fs.writeFileSync(path, data, encoding);

module.exports = { readFile, writeFile };