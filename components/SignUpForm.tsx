"use client";
import React, { useState } from "react";
import AuthButton from "./AuthButton";
import { useRouter } from "next/navigation";
import { signUp } from "@/actions/auth";

const SignUpForm = () => {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const router = useRouter();
  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setError(null);

    const formData = new FormData(event.currentTarget);
    const result = await signUp(formData);

    if (result.status === "success") {
      router.push("/login");
    } else {
      setError(result.status);
    }

    setLoading(false);
  };
  return (
    <div className="bg-[var(--background)] text-[var(--foreground)] p-4 sm:p-6 rounded-xl shadow-md w-full max-w-md mx-auto">
      <form onSubmit={handleSubmit} className="w-full flex flex-col gap-4">
        <div>
          <label className="block text-sm font-medium mb-1 text-[var(--foreground)]">
            Username
          </label>
          <input
            type="text"
            placeholder="Username"
            id="username"
            name="username"
            className="mt-1 w-full px-4 p-2 h-10 rounded-md border border-gray-300 dark:border-gray-700 bg-[var(--background)] text-sm text-[var(--foreground)] focus:outline focus:outline-2 focus:outline-blue-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1 text-[var(--foreground)]">
            Email
          </label>
          <input
            type="email"
            placeholder="Email"
            id="Email"
            name="email"
            className="mt-1 w-full px-4 p-2 h-10 rounded-md border border-gray-300 dark:border-gray-700 bg-[var(--background)] text-sm text-[var(--foreground)] focus:outline focus:outline-2 focus:outline-blue-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1 text-[var(--foreground)]">
            Password
          </label>
          <input
            type="password"
            placeholder="Password"
            name="password"
            id="password"
            className="mt-1 w-full px-4 p-2 h-10 rounded-md border border-gray-300 dark:border-gray-700 bg-[var(--background)] text-sm text-[var(--foreground)] focus:outline focus:outline-2 focus:outline-blue-500"
          />
        </div>
        <div className="mt-4">
          <AuthButton type="Sign up" loading={loading} />
        </div>
        {error && <p className="text-red-500">{error}</p>}
      </form>
    </div>
  );
};

export default SignUpForm;
