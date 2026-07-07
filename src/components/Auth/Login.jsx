import React, { useState, useContext } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useError } from "@/context/ErrorContext";
import { Button } from "@/components/ui/button";
import { Eye, EyeOff, Phone, LockKeyhole, ArrowLeft } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import logo from "/assets/logo_bindfam.png";
import { UserContext } from "@/context/UserContext";
import {
  forgotPasswordRequestOtp,
  forgotPasswordVerify,
} from "@/api/Auth/auth";

/* ================= ERROR MODAL ================= */
function ErrorModal({ message, onClose }) {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 w-full max-w-sm shadow-lg">
        <h2 className="text-lg font-bold text-red-600 mb-3">Error</h2>
        <p className="text-sm text-gray-700 dark:text-gray-200">{message}</p>
        <Button onClick={onClose} className="mt-5 w-full rounded-full button-primary">
          OK
        </Button>
      </div>
    </div>
  );
}

/* ================= COUNTRY CODES ================= */
const COUNTRY_CODES = [
  { code: "+91", label: "India" },
  { code: "+880", label: "Bangladesh" },
  { code: "+1", label: "USA / Canada" },
  { code: "+44", label: "United Kingdom" },
  { code: "+971", label: "UAE" },
  { code: "+966", label: "Saudi Arabia" },
  { code: "+61", label: "Australia" },
  { code: "+81", label: "Japan" },
  { code: "+49", label: "Germany" },
  { code: "+33", label: "France" },
];

/* ================= LOGIN ================= */
export default function Login() {
  const navigate = useNavigate();
  const { login } = useContext(UserContext);
  const { showError } = useError();

  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("parent");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [errorModal, setErrorModal] = useState("");

  /* ---------- Forgot Password ---------- */
  const [showForgot, setShowForgot] = useState(false);
  const [step, setStep] = useState(1);
  const [mobile, setMobile] = useState("");
  const [forgotCountryCode, setForgotCountryCode] = useState("+91"); // Default India
  const [forgotRole, setForgotRole] = useState("parent");
  const [sessionId, setSessionId] = useState("");
  const [otp, setOtp] = useState("");
  const [newPass, setNewPass] = useState("");
  const [confirmPass, setConfirmPass] = useState("");
  const [forgotLoading, setForgotLoading] = useState(false);
  const [forgotError, setForgotError] = useState("");
  const [forgotSuccess, setForgotSuccess] = useState("");

  /* ================= VALIDATION HELPERS ================= */
  const isValidMobileLength = (value) => value.length >= 7; // Minimum for international

  /* ================= LOGIN HANDLER ================= */
  const handleLogin = async (e) => {
    e.preventDefault();

    if (!identifier.trim()) {
      return showError("Mobile number or user code is required");
    }

    if (/^\d+$/.test(identifier) && identifier.length < 7) {
      return showError("Enter a valid mobile number");
    }

    if (!password || password.length < 6) {
      return showError("Password must be at least 6 characters");
    }

    if (!role) {
      return showError("Please select a role");
    }

    setLoading(true);

    try {
      const result = await login(identifier.trim(), password, role);

      if (result.role === "doctor") navigate("/doctor-dashboard/");
      else if (result.role === "admin") navigate("/admin-dashboard/");
      else navigate("/account-selection/");
    } catch (err) {
      const status = err.response?.status;

      if (status === 401) {
        showError("Invalid mobile number or password");
      } else if (status === 403) {
        showError("Your account is disabled. Contact support.");
      } else {
        showError("Something went wrong. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  /* ================= FORGOT PASSWORD ================= */
  const sendForgotOtp = async () => {
    setForgotError("");

    if (!isValidMobileLength(mobile)) {
      return setForgotError("Enter a valid mobile number");
    }

    const fullMobileNumber = forgotCountryCode.replace("+", "") + mobile;

    setForgotLoading(true);
    try {
      const res = await forgotPasswordRequestOtp(fullMobileNumber, forgotRole);
      setSessionId(res.sessionId);
      setStep(2);
      setForgotSuccess("OTP sent to your mobile");
    } catch (err) {
      setForgotError(err.response?.data?.message || "Failed to send OTP");
    } finally {
      setForgotLoading(false);
    }
  };

  const resetPassword = async () => {
    setForgotError("");

    if (!/^\d{6}$/.test(otp)) {
      return setForgotError("OTP must be 6 digits");
    }

    if (newPass.length < 6) {
      return setForgotError("Password must be at least 6 characters");
    }

    if (newPass !== confirmPass) {
      return setForgotError("Passwords do not match");
    }

    const fullMobileNumber = forgotCountryCode.replace("+", "") + mobile;

    setForgotLoading(true);
    try {
      await forgotPasswordVerify(fullMobileNumber, forgotRole, sessionId, otp, newPass);
      setForgotSuccess("Password changed successfully");

      setTimeout(() => {
        setShowForgot(false);
        setStep(1);
        setMobile("");
        setForgotCountryCode("+91");
        setOtp("");
        setNewPass("");
        setConfirmPass("");
        setForgotSuccess("");
      }, 2500);
    } catch (err) {
      setForgotError(err.response?.data?.message || "Invalid OTP");
    } finally {
      setForgotLoading(false);
    }
  };

  return (
    <>
      <div className="flex w-full items-center justify-center p-4 sm:p-6 bg-gradient-to-br from-background to-muted h-auto">
        <div className="w-full max-w-md glass-card rounded-xl p-6 sm:p-8 shadow-soft animate-slide-in-right">
          {/* Logo */}
          <div className="flex justify-center mb-5">
            <img
              src={logo}
              alt="BindFam Logo"
              className="w-24 sm:w-28 h-24 sm:h-28 object-contain drop-shadow-md"
            />
          </div>

          <h1 className="text-2xl font-extrabold text-center text-primary mb-2">
            Welcome
          </h1>
          <p className="text-muted text-center text-sm mb-6">
            Continue your journey with{" "}
            <span className="font-bold">
              <span className="text-bind">Bind</span>
              <span className="text-fam">Fam</span>
            </span>
          </p>

          {/* Login Form */}
          <form onSubmit={handleLogin} className="space-y-4">
            {/* Mobile/UserCode */}
            <div>
              <Label className="text-sm font-medium mb-1">
                Mobile Number / User Code
              </Label>
              <div className="relative bg-input rounded-full border border-primary focus-within:ring-2 focus-within:ring-primary transition-all">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-primary" />
                <Input
                  type="text"
                  placeholder="Enter mobile number or user code"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  className="pl-9 pr-4 py-2 text-sm sm:text-base bg-transparent text-text focus:outline-none rounded-full"
                  disabled={loading}
                  required
                  autoComplete="username"
                />
              </div>
            </div>

            {/* Role Select */}
            <div>
              <Label className="text-sm font-medium mb-1">Select Role</Label>
              <Select value={role} onValueChange={setRole} disabled={loading}>
                <SelectTrigger className="w-full text-sm sm:text-base bg-input text-text border border-primary focus:ring-2 focus:ring-primary rounded-full">
                  <SelectValue placeholder="Select role" />
                </SelectTrigger>
                <SelectContent className="bg-card text-text">
                  <SelectItem value="parent">Parent</SelectItem>
                  <SelectItem value="doctor">Doctor</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Password */}
            <div>
              <Label className="text-sm font-medium mb-1">Password</Label>
              <div className="relative bg-input rounded-full border border-primary focus-within:ring-2 focus-within:ring-primary transition-all">
                <LockKeyhole className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-primary" />
                <Input
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-9 pr-9 py-2 text-sm sm:text-base bg-transparent text-text focus:outline-none rounded-full"
                  disabled={loading}
                  required
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-primary hover:text-accent transition-colors"
                  disabled={loading}
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            {/* Login Button */}
            <Button
              type="submit"
              className="w-full py-3 rounded-full shadow-md hover:shadow-lg transition-all button-primary disabled:opacity-60 text-white font-semibold text-lg"
              disabled={loading}
            >
              {loading ? "Logging in..." : "Log In"}
            </Button>
          </form>

          <div className="text-center mt-4">
            <button
              onClick={() => setShowForgot(true)}
              className="text-primary text-sm font-medium hover:text-accent transition-colors"
            >
              Forgot Password?
            </button>
          </div>

          <p className="text-center text-sm text-muted mt-6">
            Don’t have an account?{" "}
            <Link
              to="/register"
              className="text-secondary font-semibold hover:text-accent"
            >
              Sign Up
            </Link>
          </p>
        </div>
      </div>

      {/* Forgot Password Modal */}
      {showForgot && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="w-full max-w-md glass-card rounded-xl p-6 sm:p-8 shadow-soft animate-slide-in-right relative">
            <div className="flex justify-between items-center mb-5">
              <h2 className="text-xl font-extrabold text-primary">
                {step === 1 ? "Reset Password" : "Verify & Reset"}
              </h2>
              <button
                onClick={() => setShowForgot(false)}
                className="text-text hover:text-primary text-3xl font-light"
              >
                ×
              </button>
            </div>

            {step === 1 ? (
              <>
                <div className="space-y-4">
                  {/* Mobile Number with Country Code */}
                  <div>
                    <Label className="text-sm font-medium mb-1">
                      Mobile Number
                    </Label>
                    <div className="flex gap-2">
                      <Select value={forgotCountryCode} onValueChange={setForgotCountryCode}>
                        <SelectTrigger className="w-28 h-11 rounded-full bg-input border border-primary text-sm">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-card text-text max-h-60 overflow-y-auto">
                          {COUNTRY_CODES.map((c) => (
                            <SelectItem key={c.code} value={c.code}>
                              {c.code} {c.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>

                      <div className="relative flex-1 bg-input rounded-full border border-primary">
                        <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-primary" />
                        <Input
                          type="text"
                          placeholder="Enter mobile"
                          value={mobile}
                          onChange={(e) => {
                            const val = e.target.value.replace(/\D/g, "").slice(0, 15);
                            setMobile(val);
                          }}
                          className="h-11 pl-9 pr-4 py-0 bg-transparent text-text focus:outline-none rounded-full"
                        />
                      </div>
                    </div>
                  </div>

                  <div>
                    <Label className="text-sm font-medium mb-1">Role</Label>
                    <Select value={forgotRole} onValueChange={setForgotRole}>
                      <SelectTrigger className="bg-input border border-primary rounded-full">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-card text-text">
                        <SelectItem value="parent">Parent</SelectItem>
                        <SelectItem value="doctor">Doctor</SelectItem>
                        <SelectItem value="admin">Admin</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <Button
                  onClick={sendForgotOtp}
                  className="w-full mt-5 py-3 rounded-full button-primary"
                  disabled={forgotLoading}
                >
                  {forgotLoading ? "Sending OTP..." : "Send OTP"}
                </Button>
              </>
            ) : (
              <>
                <div className="space-y-4">
                  <Input
                    placeholder="Enter OTP"
                    value={otp}
                    onChange={(e) => {
                      const val = e.target.value.replace(/\D/g, "").slice(0, 6);
                      setOtp(val);
                    }}
                    className="text-center text-lg tracking-widest font-mono rounded-full"
                    maxLength={6}
                  />

                  <Input
                    type="password"
                    placeholder="New Password"
                    value={newPass}
                    onChange={(e) => setNewPass(e.target.value)}
                    className="rounded-full"
                  />

                  <Input
                    type="password"
                    placeholder="Confirm Password"
                    value={confirmPass}
                    onChange={(e) => setConfirmPass(e.target.value)}
                    className="rounded-full"
                  />
                </div>

                <div className="flex gap-3 mt-5">
                  <Button
                    variant="outline"
                    onClick={() => setStep(1)}
                    className="flex-1 rounded-full"
                  >
                    <ArrowLeft className="w-4 h-4 mr-1" /> Back
                  </Button>
                  <Button
                    onClick={resetPassword}
                    className="flex-1 button-primary rounded-full"
                    disabled={forgotLoading}
                  >
                    {forgotLoading ? "Resetting..." : "Reset Password"}
                  </Button>
                </div>
              </>
            )}

            {forgotError && (
              <p className="text-red-500 text-sm text-center mt-3 animate-pulse">
                {forgotError}
              </p>
            )}
            {forgotSuccess && (
              <p className="text-green-600 text-sm text-center mt-3 font-semibold">
                {forgotSuccess}
              </p>
            )}
          </div>
        </div>
      )}

      {/* Error Modal */}
      {errorModal && (
        <ErrorModal message={errorModal} onClose={() => setErrorModal("")} />
      )}
    </>
  );
}