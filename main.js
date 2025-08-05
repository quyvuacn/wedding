const fs = require("fs");

const htmlContent = fs.readFileSync("index.html", "utf8");

const data = JSON.parse(fs.readFileSync("data.json", "utf8"));

const urlMapping = {};
data.forEach((url, index) => {
  const sizeMatch = url.match(/\/s(\d+x\d+)\//);

  if (sizeMatch) {
    const size = sizeMatch[1];
    const paddedIndex = (index + 1).toString().padStart(6, "0");
    urlMapping[url] = `images/s${size}/${paddedIndex}?preview=true`;
  } else {
    const paddedIndex = (index + 1).toString().padStart(6, "0");
    urlMapping[url] = `images/s750x950/${paddedIndex}?preview=true`;
  }
});

let processedHtml = htmlContent;
Object.keys(urlMapping).forEach((originalUrl) => {
  const newUrl = urlMapping[originalUrl];
  const escapedUrl = originalUrl.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const regex = new RegExp(escapedUrl, "g");
  processedHtml = processedHtml.replace(regex, newUrl);
});

fs.writeFileSync("index.html", processedHtml);

console.log("Processing completed!");
console.log(`Processed ${Object.keys(urlMapping).length} URLs`);
console.log("Sample replacements:");
Object.keys(urlMapping)
  .slice(0, 5)
  .forEach((originalUrl, index) => {
    console.log(`${index + 1}: ${originalUrl} -> ${urlMapping[originalUrl]}`);
  });
