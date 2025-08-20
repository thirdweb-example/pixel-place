import { cookies } from "next/headers";

export type User = {
  id: string;
  name: string;
  username: string;
  email: string;
  picture: string;
  type: string;
  walletAddress: string;
};

export async function getUser() {
  // Get auth token from cookies
  const cookieStore = await cookies();
  const authToken = cookieStore.get("authToken")?.value;

  if (!authToken) {
    return {
      user: null,
      authToken: null,
    };
  }

  const result = await fetch("https://api.thirdweb.com/v1/wallets/me", {
    method: "GET",
    headers: {
      Authorization: `Bearer ${authToken}`,
      "x-secret-key": process.env.THIRDWEB_SECRET_KEY || "",
    },
  });

  if (!result.ok) {
    return {
      user: null,
      authToken: null,
    };
  }

  const data = await result.json();
  const json = data.result as {
    address: string;
    createdAt: string;
    profiles: {
      email: string;
      name: string;
      profileImageUrl: string;
      type: string;
      emailVerified: boolean;
      familyName: string;
      givenName: string;
      hd: string;
      id: string;
      locale: string;
      username: string;
    }[];
  };

  const user: User = {
    id: json.profiles[0].id,
    name: json.profiles[0].name,
    username: json.profiles[0].username,
    email: json.profiles[0].email,
    picture: json.profiles[0].profileImageUrl,
    type: json.profiles[0].type,
    walletAddress: json.address,
  };

  return {
    user,
    authToken,
  };
}
