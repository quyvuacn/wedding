const buildUrlMapping = (data) => {
  const urlMapping = {};
  data.forEach((url, index) => {
    const sizeMatch = url.match(/\/s(\d+x\d+)\//);
    const paddedIndex = (index + 1).toString().padStart(6, "0");
    if (sizeMatch) {
      const size = sizeMatch[1];
      urlMapping[url] = `images/s${size}/${paddedIndex}?preview=true`;
    } else {
      urlMapping[url] = `images/s750x950/${paddedIndex}?preview=true`;
    }
  });
  return urlMapping;
};

module.exports = { buildUrlMapping };