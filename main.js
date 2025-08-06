const { readFile, writeFile } = require("./utils/fileUtils");
const { buildUrlMapping } = require("./utils/urlMapper");
const { applyMapping } = require("./utils/htmlProcessor");

function main() {
  const htmlContent = readFile("index.html");
  const data = JSON.parse(readFile("data.json"));

  const urlMapping = buildUrlMapping(data);
  const processedHtml = applyMapping(htmlContent, urlMapping);

  writeFile("index.html", processedHtml);

  console.log(`Processing completed! Processed ${Object.keys(urlMapping).length} URLs`);
  console.log("Sample replacements:");
  Object.keys(urlMapping)
    .slice(0, 5)
    .forEach((originalUrl, index) => {
      console.log(`${index + 1}: ${originalUrl} -> ${urlMapping[originalUrl]}`);
    });
}

main();
