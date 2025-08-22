"use client";

import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { MailIcon } from "lucide-react";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { DUMMY_USER } from "../../lib/dummyUserData"; 



const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters long")
});

type LoginFormData = z.infer<typeof loginSchema>;

export default function LoginForm() {
  const router = useRouter();
  const [error, setError] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting }
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema)
  });

  const onSubmit = async (data: LoginFormData) => {
    if (
      data.email === DUMMY_USER.email &&
      data.password === DUMMY_USER.password
    ) {
      localStorage.setItem("isLoggedIn", "true");
      router.push("../main-app/Home");
    } else {
      setError("Invalid email or password");
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-[#FAF6F3] px-4">
      <Card className="w-full md:w-[350px] bg-[#FAF6F3] shadow-lg shadow-[#D8A39D]/50 ">
        <CardHeader>
          <CardTitle className="text-[#403635]">Login</CardTitle>
          <CardDescription className="text-[#403635]/70">Enter your credentials to access your account</CardDescription>
        </CardHeader>
        <CardContent className="space-y-8">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-[#403635]">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="Enter your email"
                {...register("email")}
                aria-invalid={errors.email ? "true" : "false"}
                className="border border-[#A882A0] text-[#403635]"
              />
              {errors.email && <p className="mt-1 text-sm text-red-500">{errors.email.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="password" className="text-[#403635]">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="Enter your password"
                {...register("password")}
                aria-invalid={errors.password ? "true" : "false"}
                className="border border-[#A882A0] text-[#403635]"
              />
              {errors.password && (
                <p className="mt-1 text-sm text-red-500">{errors.password.message}</p>
              )}
            </div>
            {error && <p className="text-sm text-red-500">{error}</p>}
            <Button type="submit" className="w-full bg-[#403635] text-[#FAF6F3]" disabled={isSubmitting}>
              {isSubmitting ? "Logging in..." : "Login with Email"}
            </Button>
          </form>
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-[#403635]" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-[#FAF6F3] text-muted-[#FAF6F3] px-2">Or continue with</span>
            </div>
          </div>
          <div className="flex w-full">
            <Button 
              variant="outline" 
              className="w-full bg-[#403635] text-[#FAF6F3]"
              onClick={() => window.location.href = "http://localhost:8000/api/auth/google/login"}
            >
              <MailIcon />
              Google
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}