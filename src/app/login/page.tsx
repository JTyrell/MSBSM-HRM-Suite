"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Building2, Lock, User, Mail, ArrowRight, KeyRound, Eye, EyeOff, AlertCircle, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type Mode = "login" | "reset" | "setup";

export default function LoginPage() {
  const router = useRouter();
  const [mode, setMode] = useState<Mode>("login");
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [setupRequired, setSetupRequired] = useState(false);

  // Form fields
  const [employeeId, setEmployeeId] = useState("");
  const [password, setPassword] = useState("");
  const [email, setEmail] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [setupEmployeeId, setSetupEmployeeId] = useState("");

  // Check if setup is required on mount
  useEffect(() => {
    fetch("/api/auth/setup")
      .then((r) => r.json())
      .then((data) => {
        if (data.setup_required) {
          setSetupRequired(true);
          setMode("setup");
        }
      })
      .catch(() => {});
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ employee_id: employeeId, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Login failed");
        return;
      }

      router.push("/");
      router.refresh();
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setIsLoading(true);

    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Failed to send reset email");
        return;
      }

      setSuccess(data.message);
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSetup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      setIsLoading(false);
      return;
    }

    if (password.length < 8) {
      setError("Password must be at least 8 characters");
      setIsLoading(false);
      return;
    }

    try {
      const res = await fetch("/api/auth/setup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          first_name: firstName,
          last_name: lastName,
          email,
          password,
          phone: phone || undefined,
          employee_id: setupEmployeeId,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Setup failed");
        return;
      }

      setSuccess("Admin account created! Redirecting to login...");
      setSetupRequired(false);
      setTimeout(() => {
        setMode("login");
        setSuccess("");
        setEmployeeId(setupEmployeeId);
      }, 2000);
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-950 via-[#4a0a10] to-slate-950 p-4">
      {/* Background pattern */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(172,25,40,0.08),transparent_50%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,rgba(35,65,164,0.06),transparent_50%)]" />

      <div className="relative w-full max-w-md">
        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <img src="/MSBM-icon.png" alt="MSBM" className="w-32 md:w-40 h-auto rounded-2xl shadow-lg shadow-msbm-red/25 mb-4 bg-white p-1" />
          <h1 className="text-2xl font-bold text-white tracking-tight">MSBM-HR Suite</h1>
          <p className="text-sm text-white/60 mt-1">
            {mode === "setup" ? "Initial Administrator Setup" :
             mode === "reset" ? "Reset Your Password" :
             "AI-Powered Human Resource Management"}
          </p>
        </div>

        {/* Card */}
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 shadow-2xl">
          {/* Error/Success alerts */}
          {error && (
            <div className="flex items-center gap-2 bg-red-500/10 border border-red-500/20 text-red-300 px-4 py-3 rounded-lg mb-4 text-sm">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}
          {success && (
            <div className="flex items-center gap-2 bg-msbm-red/10 border border-msbm-red/20 text-msbm-red-bright px-4 py-3 rounded-lg mb-4 text-sm">
              <CheckCircle2 className="h-4 w-4 shrink-0" />
              <span>{success}</span>
            </div>
          )}

          {/* ─── LOGIN FORM ──────────────────────────────────── */}
          {mode === "login" && (
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="employeeId" className="text-white/70 text-sm">Employee ID</Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/30" />
                  <Input
                    id="employeeId"
                    type="text"
                    placeholder="620123456"
                    value={employeeId}
                    onChange={(e) => setEmployeeId(e.target.value)}
                    className="pl-10 bg-white/5 border-white/10 text-white placeholder:text-white/20 focus:border-msbm-red/50 focus:ring-msbm-red/20"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-white/70 text-sm">Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/30" />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10 pr-10 bg-white/5 border-white/10 text-white placeholder:text-white/20 focus:border-msbm-red/50 focus:ring-msbm-red/20"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <Button
                type="submit"
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-msbm-red to-inner-blue hover:from-msbm-red-bright hover:to-inner-blue text-white shadow-lg shadow-msbm-red/25"
              >
                {isLoading ? "Signing in..." : "Sign In"}
                {!isLoading && <ArrowRight className="ml-2 h-4 w-4" />}
              </Button>

              <button
                type="button"
                onClick={() => { setMode("reset"); setError(""); setSuccess(""); }}
                className="w-full text-sm text-light-blue/60 hover:text-light-blue transition-colors"
              >
                <KeyRound className="inline h-3.5 w-3.5 mr-1" />
                Forgot password? Reset via magic link
              </button>
            </form>
          )}

          {/* ─── RESET PASSWORD FORM ─────────────────────────── */}
          {mode === "reset" && (
            <form onSubmit={handleResetPassword} className="space-y-4">
              <p className="text-white/50 text-sm">
                Enter your registered email address. We&apos;ll send a magic link to reset your password.
              </p>

              <div className="space-y-2">
                <Label htmlFor="resetEmail" className="text-white/70 text-sm">Email Address</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/30" />
                  <Input
                    id="resetEmail"
                    type="email"
                    placeholder="your.email@uwi.edu"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10 bg-white/5 border-white/10 text-white placeholder:text-white/20 focus:border-msbm-red/50 focus:ring-msbm-red/20"
                    required
                  />
                </div>
              </div>

              <Button
                type="submit"
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-msbm-red to-inner-blue hover:from-msbm-red-bright hover:to-inner-blue text-white"
              >
                {isLoading ? "Sending..." : "Send Reset Link"}
              </Button>

              <button
                type="button"
                onClick={() => { setMode("login"); setError(""); setSuccess(""); }}
                className="w-full text-sm text-light-blue/60 hover:text-light-blue transition-colors"
              >
                ← Back to login
              </button>
            </form>
          )}

          {/* ─── INITIAL SETUP FORM ──────────────────────────── */}
          {mode === "setup" && (
            <form onSubmit={handleSetup} className="space-y-4">
              <div className="bg-amber-500/10 border border-amber-500/20 text-amber-300 px-4 py-3 rounded-lg text-sm">
                <p className="font-medium">First-Time Setup</p>
                <p className="text-amber-300/70 mt-1">Create the initial administrator account. This can only be done once.</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="setupEmployeeId" className="text-white/70 text-sm">Employee ID</Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/30" />
                  <Input
                    id="setupEmployeeId"
                    type="text"
                    placeholder="620123456"
                    value={setupEmployeeId}
                    onChange={(e) => setSetupEmployeeId(e.target.value.replace(/\D/g, "").slice(0, 9))}
                    className="pl-10 bg-white/5 border-white/10 text-white placeholder:text-white/20 focus:border-msbm-red/50"
                    required
                    pattern="[0-9]{9}"
                    title="Enter a 9-digit employee ID number"
                    maxLength={9}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label htmlFor="firstName" className="text-white/70 text-sm">First Name</Label>
                  <Input
                    id="firstName"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    className="bg-white/5 border-white/10 text-white placeholder:text-white/20 focus:border-msbm-red/50"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName" className="text-white/70 text-sm">Last Name</Label>
                  <Input
                    id="lastName"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    className="bg-white/5 border-white/10 text-white placeholder:text-white/20 focus:border-msbm-red/50"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="setupEmail" className="text-white/70 text-sm">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/30" />
                  <Input
                    id="setupEmail"
                    type="email"
                    placeholder="admin@uwi.edu"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10 bg-white/5 border-white/10 text-white placeholder:text-white/20 focus:border-msbm-red/50"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="setupPhone" className="text-white/70 text-sm">Phone (optional)</Label>
                <Input
                  id="setupPhone"
                  type="tel"
                  placeholder="+1 (876) 555-1234"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="bg-white/5 border-white/10 text-white placeholder:text-white/20 focus:border-msbm-red/50"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="setupPassword" className="text-white/70 text-sm">Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/30" />
                  <Input
                    id="setupPassword"
                    type={showPassword ? "text" : "password"}
                    placeholder="Min 8 characters"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10 pr-10 bg-white/5 border-white/10 text-white placeholder:text-white/20 focus:border-msbm-red/50"
                    required
                    minLength={8}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword" className="text-white/70 text-sm">Confirm Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/30" />
                  <Input
                    id="confirmPassword"
                    type={showPassword ? "text" : "password"}
                    placeholder="Confirm password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="pl-10 bg-white/5 border-white/10 text-white placeholder:text-white/20 focus:border-msbm-red/50"
                    required
                    minLength={8}
                  />
                </div>
              </div>

              <Button
                type="submit"
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-msbm-red to-inner-blue hover:from-msbm-red-bright hover:to-inner-blue text-white shadow-lg shadow-msbm-red/25"
              >
                {isLoading ? "Creating Account..." : "Create Admin Account"}
              </Button>
            </form>
          )}
        </div>

        {/* Footer */}
        <p className="text-center text-xs text-white/20 mt-6">
          MSBM-HR Suite v13.0 • © 2026 MSBM
        </p>
      </div>
    </div>
  );
}
