const colors = [
  '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7',
  '#DDA0DD', '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E9',
  '#F8C471', '#82E0AA', '#F1948A', '#D7BDE2', '#FAD7A0',
  '#A9CCE3', '#F9E79F', '#D5A6BD', '#A3E4D7'
];

function getRandomColor() {
  return colors[Math.floor(Math.random() * colors.length)];
}

module.exports = { getRandomColor };