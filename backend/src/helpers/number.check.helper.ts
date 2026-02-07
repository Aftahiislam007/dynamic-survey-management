export const isPhoneNumber = (value: string): boolean => {
  const phoneNumberPattern = /^01\d{9}$/;
  console.log('isPhoneNumber', value, phoneNumberPattern.test(value));
  return phoneNumberPattern.test(value);
};
