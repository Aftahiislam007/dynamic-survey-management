const generateOTP = (): number => {
  const length = 6;
  let otp = '';

  otp += Math.floor(Math.random() * 9) + 1;

  for (let i = 1; i < length; i++) {
    const digit = Math.floor(Math.random() * 10);
    otp += digit;
  }

  return parseInt(otp, 10);
};

export const randomNumGenerate = {
  generateOTP,
};
