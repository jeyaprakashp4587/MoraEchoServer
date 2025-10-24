const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
const numbers = "0123456789";

const randomLetters = (length) => {
  let result = "";
  for (let i = 0; i < length; i++) {
    result += letters.charAt(Math.floor(Math.random() * letters.length));
  }
  return result;
};

// Function to generate random numbers
const randomNumbers = (length) => {
  let result = "";
  for (let i = 0; i < length; i++) {
    result += numbers.charAt(Math.floor(Math.random() * numbers.length));
  }
  return result;
};

const generateReferralCode = () => {
  return "MORA" + randomNumbers(4) + randomLetters(4);
};

export default generateReferralCode;
