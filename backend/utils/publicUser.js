import User from "../models/User.js";

export const getPublicUser = async () => {
  return await User.findOne(); // Le premier user de la DB
};
