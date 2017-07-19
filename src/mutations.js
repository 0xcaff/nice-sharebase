export const auth = async (email, password, { network }) => {
  const res = await network.renew(email, password);
  return res;
};
