import { cookies } from "next/headers";
import { type NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const authResultStr = searchParams.get("authResult");

    if (!authResultStr) {
      return new NextResponse("No authResult found", { status: 400 });
    }

    const authResult = JSON.parse(authResultStr) as {
      storedToken: {
        authDetails: {
          walletAddress: string;
        };
        jwtToken: string;
        cookieString: string;
      };
    };

    // set auth token in cookies
    const cookieStore = await cookies();
    cookieStore.set("authToken", authResult.storedToken.cookieString, {
      httpOnly: true,
      maxAge: 60 * 60 * 24 * 30, // 30 days
    });

    // redirect to home page
    return NextResponse.redirect(new URL("/", request.url));
  } catch (error) {
    console.error("Failed to login", error);
    // return error
    return NextResponse.json({ error: "Failed to login" }, { status: 500 });
  }
}
