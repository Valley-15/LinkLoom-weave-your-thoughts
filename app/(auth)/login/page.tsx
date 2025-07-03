import LoginForm from "@/components/LoginForm";
import LoginGithub from "@/components/LoginGithub";
import Link from "next/link";

export default function LoginPage() {
  return (
    <div className="flex min-h-[80vh] items-center justify-center bg-transparent">
      <section className="w-full max-w-md bg-[#181a20] rounded-2xl shadow-2xl p-8 flex flex-col gap-6 border border-gray-800">
        <h1 className="text-3xl text-center font-extrabold mb-2 text-white tracking-tight">
          Sign in
        </h1>
        <LoginForm />
        <LoginGithub />
        <div className="flex flex-col gap-2 mt-2 text-center">
          <span className="text-gray-400 text-sm">
            Don&apos;t have an account?{" "}
            <Link
              className="font-bold text-blue-400 hover:underline"
              href="/register"
            >
              Sign Up
            </Link>
          </span>
          <span className="text-gray-400 text-sm">
            Forgot your password?{" "}
            <Link
              className="font-bold text-blue-400 hover:underline"
              href="/forgot-password"
            >
              Reset Password
            </Link>
          </span>
        </div>
      </section>
    </div>
  );
}
