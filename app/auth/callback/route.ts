import { NextResponse } from "next/server";
import { createClient } from "../../../utils/supabase/server";

// import { createClient } from "@/utils/supabase/serve";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  // if "next" is in param, use it as the redirect URL
  let next = searchParams.get("next") ?? "/";
  if (!next.startsWith("/")) {
    // if "next" is not a relative URL, use the default
    next = "/";
  }

  if (code) {
    const supabase = await createClient();
    const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(
      code
    );
    if (!exchangeError) {
      // Correct usage: getUser() uses the session from cookies
      const { data, error: useError } = await supabase.auth.getUser();
      if (useError) {
        console.error("Error fetching user data:", useError.message);
        return NextResponse.redirect(`${origin}/error`);
      }

      // check if the user already exists in the user_profiles table
      const { data: existingUser } = await supabase
        .from("user_profiles")
        .select("*")
        .eq("email", data?.user?.email)
        .limit(1)
        .single();

      if (!existingUser) {
        // Fallback: use username from metadata, or email prefix if missing
        let username = data?.user?.user_metadata?.username;
        if (!username && data?.user?.email) {
          username = data.user.email.split("@")[0];
        }
        const { error: dbError } = await supabase.from("user_profiles").insert({
          email: data?.user.email,
          username,
        });
        if (dbError) {
          console.error("Error inserting user data", dbError.message);
          return NextResponse.redirect(`${origin}/error`);
        }
      }

      const forwardedHost = request.headers.get("x-forwarded-host"); // original origin before load balancer
      const isLocalEnv = process.env.NODE_ENV === "development";
      if (isLocalEnv) {
        // we can be sure that there is no load balancer in between, so no need to watch for X-Forwarded-Host
        return NextResponse.redirect(`${origin}${next}`);
      } else if (forwardedHost) {
        return NextResponse.redirect(`https://${forwardedHost}${next}`);
      } else {
        return NextResponse.redirect(`${origin}${next}`);
      }
    } else {
      console.error(
        "Error exchanging code for session:",
        exchangeError.message
      );
      return NextResponse.redirect(`${origin}/error`);
    }
  }

  // return the user to an error page with instructions
  return NextResponse.redirect(`${origin}/auth/auth-code-error`);
}
