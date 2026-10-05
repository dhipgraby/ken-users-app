export const AUTH_SECRET = process.env.AUTH_SECRET || "default_secret";
export const AUTH_URL = process.env.NEXT_PUBLIC_AUTH_API || "http://localhost:3011/";

export const USERS_LOCAL_API = "http://localhost:3012/";
export const USERS_API = process.env.NEXT_PUBLIC_USERS_API || USERS_LOCAL_API;

console.log("Using Auth: ", AUTH_URL);
console.log("Using Users: ", USERS_API);