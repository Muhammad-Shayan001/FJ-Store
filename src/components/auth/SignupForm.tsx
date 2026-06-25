"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { signupSchema, type SignupFormValues } from "@/lib/validations/auth";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Loader2 } from "lucide-react";
import { BrandLogo } from "@/components/ui/BrandLogo";

export function SignupForm() {
  const router = useRouter();

  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignupFormValues>({
    resolver: zodResolver(signupSchema),
  });

  const onSubmit = async (data: SignupFormValues) => {
    setIsLoading(true);
    setError(null);

    try {
      console.log("[SIGNUP FORM] Submitting signup request for:", data.email);
      
      // Use custom signup endpoint that sends verification email via Gmail
      const response = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: data.email,
          password: data.password,
          fullName: data.fullName,
        }),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.error || "Signup failed");
      }

      console.log("[SIGNUP FORM] ✓ Signup successful, verification email sent");
      setSuccess(true);
    } catch (err) {
      const message = err instanceof Error ? err.message : "An error occurred";
      console.error("[SIGNUP FORM] Error:", message);
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  if (success) {
    return (
      <div className="w-full max-w-md mx-auto p-8 rounded-2xl bg-card border border-border shadow-lg text-center flex flex-col items-center">
        <BrandLogo width={140} height={36} className="mb-6 justify-center" />
        <div className="w-16 h-16 bg-emerald-500/10 text-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6 text-3xl">
          ✓
        </div>
        <h2 className="text-2xl font-bold text-foreground mb-2">Check your email</h2>
        <p className="text-muted-foreground text-sm mb-6">
          We have sent a verification link to your email address. Please click the link to activate
          your account.
        </p>
        <Link href="/login">
          <button className="w-full bg-primary text-primary-foreground font-semibold rounded-lg px-4 py-3 hover:bg-primary/90 transition-colors">
            Return to Login
          </button>
        </Link>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md mx-auto p-8 rounded-2xl bg-card border border-border shadow-lg">
      <div className="text-center mb-8 flex flex-col items-center">
        <BrandLogo width={140} height={36} className="mb-6 justify-center" />
        <h2 className="text-3xl font-bold text-foreground mb-2">Create Account</h2>
        <p className="text-muted-foreground text-sm">Join the exclusive world of FJ Store</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {error && (
          <div className="p-3 rounded bg-destructive/10 text-destructive border border-destructive/20 text-sm text-center">
            {error}
          </div>
        )}

        <div className="space-y-1">
          <label className="text-sm font-medium text-foreground">Full Name</label>
          <input
            {...register("fullName")}
            type="text"
            className="w-full bg-background border border-input rounded-lg px-4 py-3 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary transition-all"
            placeholder="Jane Doe"
          />
          {errors.fullName && <p className="text-destructive text-xs">{errors.fullName.message}</p>}
        </div>

        <div className="space-y-1">
          <label className="text-sm font-medium text-foreground">Email Address</label>
          <input
            {...register("email")}
            type="email"
            className="w-full bg-background border border-border rounded-lg px-4 py-3 text-foreground placeholder:text-text-muted focus:outline-none focus:border-accent-gold transition-colors"
            placeholder="you@luxurystore.com"
          />
          {errors.email && <p className="text-error text-xs">{errors.email.message}</p>}
        </div>

        <div className="space-y-1">
          <label className="text-sm font-medium text-foreground">Password</label>
          <input
            {...register("password")}
            type="password"
            className="w-full bg-background border border-border rounded-lg px-4 py-3 text-foreground placeholder:text-text-muted focus:outline-none focus:border-accent-gold transition-colors"
            placeholder="••••••••"
          />
          {errors.password && <p className="text-error text-xs">{errors.password.message}</p>}
        </div>

        <div className="space-y-1">
          <label className="text-sm font-medium text-foreground">Confirm Password</label>
          <input
            {...register("confirmPassword")}
            type="password"
            className="w-full bg-background border border-border rounded-lg px-4 py-3 text-foreground placeholder:text-text-muted focus:outline-none focus:border-accent-gold transition-colors"
            placeholder="••••••••"
          />
          {errors.confirmPassword && (
            <p className="text-error text-xs">{errors.confirmPassword.message}</p>
          )}
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-accent-gold text-black font-semibold rounded-lg px-4 py-3 hover:bg-accent-gold/90 transition-colors flex items-center justify-center disabled:opacity-50 mt-4"
        >
          {isLoading ? <Loader2 size={20} className="animate-spin" /> : "Create Account"}
        </button>
      </form>

      <div className="mt-6 text-center text-sm text-text-muted">
        Already have an account?{" "}
        <Link href="/login" className="text-accent-gold font-medium hover:underline">
          Sign In
        </Link>
      </div>
    </div>
  );
}
