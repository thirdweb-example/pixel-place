import "server-only";

export const SUPABASE_SERVICE_ROLE_KEY =
  process.env.SUPABASE_SERVICE_ROLE_KEY || "";

export const THIRDWEB_SECRET_KEY = process.env.THIRDWEB_SECRET_KEY || "";

if (!SUPABASE_SERVICE_ROLE_KEY) {
  throw new Error("SUPABASE_SERVICE_ROLE_KEY is not set");
}
if (!THIRDWEB_SECRET_KEY) {
  throw new Error("THIRDWEB_SECRET_KEY is not set");
}
