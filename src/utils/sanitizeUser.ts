export const sanitizeUser = <T extends { password?: string }>(user: T) => {
  const { password: _password, ...safeUser } = user;
  return safeUser;
};

export const sanitizeUsers = <T extends { password?: string }>(users: T[]) =>
  users.map(sanitizeUser);
