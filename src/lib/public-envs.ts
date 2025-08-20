export const NEXT_PUBLIC_SUPABASE_URL =
  process.env.NEXT_PUBLIC_SUPABASE_URL || "";

export const NEXT_PUBLIC_THIRDWEB_CLIENT_ID =
  process.env.NEXT_PUBLIC_THIRDWEB_CLIENT_ID || "";

export const NEXT_PUBLIC_TOKEN_CHAIN_ID =
  process.env.NEXT_PUBLIC_TOKEN_CHAIN_ID || "";

export const NEXT_PUBLIC_TOKEN_ADDRESS =
  process.env.NEXT_PUBLIC_TOKEN_ADDRESS || "";

export const NEXT_PUBLIC_SUPABASE_ANON_KEY =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

if (!NEXT_PUBLIC_SUPABASE_URL) {
  throw new Error("NEXT_PUBLIC_SUPABASE_URL is not set");
}
if (!NEXT_PUBLIC_THIRDWEB_CLIENT_ID) {
  throw new Error("NEXT_PUBLIC_THIRDWEB_CLIENT_ID is not set");
}
if (!NEXT_PUBLIC_TOKEN_CHAIN_ID) {
  throw new Error("NEXT_PUBLIC_TOKEN_CHAIN_ID is not set");
}
if (!NEXT_PUBLIC_TOKEN_ADDRESS) {
  throw new Error("NEXT_PUBLIC_TOKEN_ADDRESS is not set");
}

if (!NEXT_PUBLIC_SUPABASE_ANON_KEY) {
  throw new Error("NEXT_PUBLIC_SUPABASE_ANON_KEY is not set");
}
