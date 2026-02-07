import * as bcrypt from 'bcrypt';

export const hashPassword = async (password: string) => {
  const SALT_ROUNDS = 10;
  // const salt = await bcrypt.genSalt(SALT_ROUNDS);
  const hash = await bcrypt.hash(password, SALT_ROUNDS);
  return hash;
};
