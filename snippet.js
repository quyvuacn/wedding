const divsWithBgImage = Array.from(document.querySelectorAll('div'))
  .map(div => getComputedStyle(div).backgroundImage)
  .filter(bgImage => bgImage && bgImage !== 'none' && bgImage.startsWith('url("https')) // lọc những cái hợp lệ
  .map(bgImage => bgImage.slice(5, -2)); 

console.log(divsWithBgImage);