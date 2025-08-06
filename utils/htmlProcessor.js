const escapeRegExp = (string) => string.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const applyMapping = (htmlContent, urlMapping) => {
  let processedHtml = htmlContent;
  Object.keys(urlMapping).forEach((originalUrl) => {
    const newUrl = urlMapping[originalUrl];
    const escapedUrl = escapeRegExp(originalUrl);
    const regex = new RegExp(escapedUrl, "g");
    processedHtml = processedHtml.replace(regex, newUrl);
  });
  return processedHtml;
};

module.exports = { applyMapping };