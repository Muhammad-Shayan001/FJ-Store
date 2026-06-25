"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { loginSchema, type LoginFormValues } from "@/lib/validations/auth";
import { createClient } from "@/lib/supabase/client";
import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Loader2 } from "lucide-react";
import { BrandLogo } from "@/components/ui/BrandLogo";

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get("redirect") || "/";

  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormValues) => {
    setIsLoading(true);
    setError(null);

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseAnonKey || supabaseUrl.includes("your-project")) {
      setError("Authentication is currently unavailable. Please try again shortly.");
      setIsLoading(false);
      return;
    }

    try {
      const supabase = createClient();
      const { error } = await supabase.auth.signInWithPassword({
        email: data.email,
        password: data.password,
      });

      if (error) {
        setError(error.message);
        setIsLoading(false);
        return;
      }

      setIsLoading(false);
      router.push(redirect);
      router.refresh();
    } catch {
      setError("We could not reach the authentication service. Please check your connection and try again.");
      setIsLoading(false);
    }
  };

  return (
    <div className="mx-auto w-full max-w-md rounded-2xl border border-border bg-background/95 p-8 shadow-lg shadow-black/10 backdrop-blur">
      <div className="mb-8 flex flex-col items-center text-center">
        <BrandLogo width={140} height={36} className="mb-6 justify-center" />
        <h2 className="mb-2 font-heading text-3xl font-bold text-foreground">Welcome Back</h2>
        <p className="text-sm text-text-muted">Please sign in to your elegant account</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {error && (
          <div className="rounded border border-error/20 bg-error/10 p-3 text-center text-sm text-error">
            {error}
          </div>
        )}

        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">Email Address</label>
          <input
            {...register("email")}
            type="email"
            className="w-full rounded-lg border border-border bg-background px-4 py-3 text-foreground placeholder:text-text-muted focus:border-accent-gold focus:outline-none transition-colors"
            placeholder="you@luxurystore.com"
          />
          {errors.email && <p className="text-xs text-error">{errors.email.message}</p>}
        </div>

        <div className="space-y-2">
          <label className="flex justify-between text-sm font-medium text-foreground">
            Password
            <Link href="/forgot-password" className="text-xs text-accent-gold hover:underline">
              Forgot?
            </Link>
          </label>
          <input
            {...register("password")}
            type="password"
            className="w-full rounded-lg border border-border bg-background px-4 py-3 text-foreground placeholder:text-text-muted focus:border-accent-gold focus:outline-none transition-colors"
            placeholder="••••••••"
          />
          {errors.password && <p className="text-xs text-error">{errors.password.message}</p>}
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="flex w-full items-center justify-center rounded-lg bg-accent-gold px-4 py-3 font-semibold text-black transition-colors hover:bg-accent-gold/90 disabled:opacity-50"
        >
          {isLoading ? <Loader2 size={20} className="animate-spin" /> : "Sign In"}
        </button>
      </form>

      <div className="mt-8 text-center text-sm text-text-muted">
        New to FJ Store?{" "}
        <Link href="/register" className="font-medium text-accent-gold hover:underline">
          Create an account
        </Link>
      </div>
    </div>
  );
}
