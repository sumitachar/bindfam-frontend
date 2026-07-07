import React, { useState, useMemo } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Phone, LockKeyhole, User, Eye, EyeOff } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import logo from "/assets/logo_bindfam.png";
import { registerUser } from "@/api/Auth/auth";
import api from "@/api/base";

const ENABLE_OTP_VERIFICATION =
  import.meta.env.VITE_ENABLE_OTP_VERIFICATION === "true";

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

export default function Register() {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [mobile, setMobile] = useState("");
  const [countryCode, setCountryCode] = useState("+91");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [role, setRole] = useState("parent");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [acceptedPolicy, setAcceptedPolicy] = useState(false);
  const [policyError, setPolicyError] = useState("");
  const [isOtpSent, setIsOtpSent] = useState(false);
  const [sessionId, setSessionId] = useState("");
  const [otp, setOtp] = useState("");
  const [isVerified, setIsVerified] = useState(false);
  const [otpLoading, setOtpLoading] = useState(false);
  const [formErrors, setFormErrors] = useState({
    name: "",
    mobile: "",
    password: "",
    confirmPassword: "",
    otp: "",
  });

  const validateName = (value) => {
    if (!value.trim()) return "Full name is required";
    if (value.trim().length < 2) return "Name must be at least 2 characters";
    return "";
  };

  const validateMobile = (value) => {
    if (!value) return "Mobile number is required";
    if (value.length < 7) return "Enter a valid mobile number";
    return "";
  };

  const validatePassword = (value) => {
    if (!value) return "Password is required";
    if (value.length < 6) return "Password must be at least 6 characters";
    return "";
  };

  const validateConfirmPassword = (value) => {
    if (!value) return "Please confirm your password";
    if (value !== password) return "Passwords do not match";
    return "";
  };

  const validateOtp = (value) => {
    if (!value) return "OTP is required";
    if (!/^\d{6}$/.test(value)) return "OTP must be 6 digits";
    return "";
  };

  const isFormValid = useMemo(() => {
    const hasNoErrors = Object.values(formErrors).every((err) => err === "");
    const fieldsFilled = name && mobile && password && confirmPassword;
    const policyAccepted = acceptedPolicy === true;
    const otpRequirementMet = ENABLE_OTP_VERIFICATION ? isVerified : true;
    return hasNoErrors && fieldsFilled && policyAccepted && otpRequirementMet;
  }, [
    name,
    mobile,
    password,
    confirmPassword,
    formErrors,
    acceptedPolicy,
    isVerified,
  ]);

  const validateForm = () => {
    const errors = {
      name: validateName(name),
      mobile: validateMobile(mobile),
      password: validatePassword(password),
      confirmPassword: validateConfirmPassword(confirmPassword),
      otp:
        ENABLE_OTP_VERIFICATION && isOtpSent && !isVerified
          ? validateOtp(otp)
          : "",
    };
    setFormErrors(errors);
    return (
      !errors.name &&
      !errors.mobile &&
      !errors.password &&
      !errors.confirmPassword &&
      !errors.otp &&
      acceptedPolicy
    );
  };

  const sendOtp = async () => {
    const mobileError = validateMobile(mobile);
    if (mobileError) {
      setFormErrors((prev) => ({ ...prev, mobile: mobileError }));
      return;
    }
    const fullMobileNumber = countryCode.replace("+", "") + mobile;
    try {
      setOtpLoading(true);
      const res = await api.post("/auth/send-otp", { mobile: fullMobileNumber });
      const details = res.data?.Details || res.data?.details || "";
      setSessionId(details);
      setIsOtpSent(true);
      alert("OTP sent successfully. Please verify your number.");
    } catch (err) {
      console.error("Send OTP error:", err);
      setError("Failed to send OTP. Please try again.");
    } finally {
      setOtpLoading(false);
    }
  };

  const verifyOtp = async () => {
    const otpError = validateOtp(otp);
    if (otpError) {
      setFormErrors((prev) => ({ ...prev, otp: otpError }));
      return;
    }
    try {
      setOtpLoading(true);
      const res = await api.post("/auth/verify-otp", { sessionId, otp });
      if (res.data?.Status === "Success") {
        setIsVerified(true);
        setFormErrors((prev) => ({ ...prev, otp: "" }));
        alert("OTP verified successfully!");
      } else {
        setError("Invalid OTP. Please try again.");
      }
    } catch (err) {
      console.error("Verify OTP error:", err);
      setError("Error verifying OTP.");
    } finally {
      setOtpLoading(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    if (!isFormValid) return;
    setError("");
    setPolicyError("");
    if (!validateForm()) {
      if (!acceptedPolicy) {
        setPolicyError("You must accept the Privacy Policy to continue.");
      }
      return;
    }
    try {
      setLoading(true);
      await registerUser(name.trim(), mobile, password, role, sessionId, otp);
      navigate("/login", {
        state: {
          message: "Account created successfully! Please log in.",
        },
      });
    } catch (err) {
      console.error("Register error:", err);
      setError(
        err.response?.data?.message ||
          err.message ||
          "Registration failed. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex w-full items-center justify-center p-4 bg-gradient-to-br from-background to-muted ">
      <div className="w-full max-w-md glass-card rounded-xl p-5 shadow-soft">
        {/* Compact Logo */}
        <div className="flex justify-center mb-4">
          <img
            src={logo}
            alt="BindFam Logo"
            className="w-20 h-20 object-contain drop-shadow-md"
          />
        </div>

        <h1 className="text-xl font-bold text-center text-primary mb-1">
          Create Your Account
        </h1>
        <p className="text-muted text-center text-xs mb-5">
          Join{" "}
          <span className="font-bold">
            <span className="text-bind">Bind</span>
            <span className="text-fam">Fam</span>
          </span>
        </p>

        <form onSubmit={handleRegister} className="space-y-3">
          {/* Full Name */}
          <div>
            <Label className="text-xs font-medium">Full Name</Label>
            <div className="relative bg-input rounded-full border border-primary focus-within:ring-2 focus-within:ring-primary transition-all mt-1">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-primary" />
              <Input
                type="text"
                placeholder="Enter your full name"
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  setFormErrors((prev) => ({
                    ...prev,
                    name: validateName(e.target.value),
                  }));
                }}
                className="h-10 pl-9 pr-4 text-sm bg-transparent rounded-full"
              />
            </div>
            {formErrors.name && (
              <p className="text-red-500 text-xs mt-1">{formErrors.name}</p>
            )}
          </div>

          {/* Mobile Number */}
          <div>
            <Label className="text-xs font-medium">Mobile Number</Label>
            <div className="flex gap-2 mt-1">
              <Select value={countryCode} onValueChange={setCountryCode}>
                <SelectTrigger className="w-22 h-10 rounded-full bg-input border border-primary text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-card text-text max-h-60">
                  {COUNTRY_CODES.map((c) => (
                    <SelectItem key={c.code} value={c.code}>
                      {c.code}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <div className="flex-1 flex gap-2">
                <div className="relative flex-1 bg-input rounded-full border border-primary focus-within:ring-2 focus-within:ring-primary transition-all">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-primary" />
                  <Input
                    type="tel"
                    placeholder="Enter mobile number"
                    value={mobile}
                    disabled={isVerified}
                    className="h-10 pl-9 pr-3 text-sm bg-transparent border-none focus-visible:ring-0 rounded-full disabled:opacity-50"
                    onChange={(e) => {
                      const val = e.target.value.replace(/\D/g, "").slice(0, 15);
                      setMobile(val);
                      setFormErrors((prev) => ({
                        ...prev,
                        mobile: validateMobile(val),
                      }));
                    }}
                  />
                </div>

                {ENABLE_OTP_VERIFICATION && (
                  <button
                    type="button"
                    onClick={sendOtp}
                    disabled={otpLoading || isVerified || mobile.length < 7}
                    className={`h-10 px-3 rounded-full text-xs font-bold uppercase tracking-wider transition-all border whitespace-nowrap
                      ${
                        isVerified
                          ? "bg-green-100 border-green-600 text-green-700"
                          : "bg-blue-600 border-blue-600 text-white hover:bg-blue-700 disabled:opacity-50"
                      }`}
                  >
                    {otpLoading
                      ? "..."
                      : isVerified
                      ? "Verified"
                      : isOtpSent
                      ? "Resend"
                      : "Get OTP"}
                  </button>
                )}
              </div>
            </div>
            {formErrors.mobile && (
              <p className="text-red-500 text-xs mt-1">{formErrors.mobile}</p>
            )}
          </div>

          {/* OTP Verification - Compact */}
          {ENABLE_OTP_VERIFICATION && isOtpSent && !isVerified && (
            <div className="space-y-1">
              <Label className="text-xs font-medium">Verification Code</Label>
              <div className="flex gap-2 mt-1">
                <Input
                  type="text"
                  placeholder="______"
                  value={otp}
                  maxLength={6}
                  className="h-10 flex-1 text-center tracking-widest text-sm font-bold bg-input border border-primary rounded-full"
                  onChange={(e) => {
                    const val = e.target.value.replace(/\D/g, "").slice(0, 6);
                    setOtp(val);
                    setFormErrors((prev) => ({
                      ...prev,
                      otp: validateOtp(val),
                    }));
                  }}
                />
                <button
                  type="button"
                  onClick={verifyOtp}
                  disabled={otpLoading || otp.length !== 6}
                  className="h-10 px-5 rounded-full bg-blue-600 text-white text-xs font-bold uppercase tracking-wider hover:bg-blue-700 disabled:opacity-50 border border-blue-600"
                >
                  {otpLoading ? "..." : "Verify"}
                </button>
              </div>
              {formErrors.otp && (
                <p className="text-red-500 text-xs mt-1">{formErrors.otp}</p>
              )}
            </div>
          )}

          {/* Account Type */}
          <div>
            <Label className="text-xs font-medium">Account Type</Label>
            <Select value={role} onValueChange={setRole} disabled={loading}>
              <SelectTrigger className="h-10 mt-1 text-sm bg-input border border-primary rounded-full">
                <SelectValue placeholder="Select role" />
              </SelectTrigger>
              <SelectContent className="bg-card text-text">
                <SelectItem value="parent">Parent</SelectItem>
                <SelectItem value="doctor">Doctor</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Password */}
          <div>
            <Label className="text-xs font-medium">Password</Label>
            <div className="relative bg-input rounded-full border border-primary focus-within:ring-2 focus-within:ring-primary transition-all mt-1">
              <LockKeyhole className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-primary" />
              <Input
                type={showPassword ? "text" : "password"}
                placeholder="Min 6 characters"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setFormErrors((prev) => ({
                    ...prev,
                    password: validatePassword(e.target.value),
                    confirmPassword: validateConfirmPassword(confirmPassword),
                  }));
                }}
                className="h-10 pl-9 pr-9 text-sm bg-transparent rounded-full"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-primary"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {formErrors.password && (
              <p className="text-red-500 text-xs mt-1">{formErrors.password}</p>
            )}
          </div>

          {/* Confirm Password */}
          <div>
            <Label className="text-xs font-medium">Confirm Password</Label>
            <div className="relative bg-input rounded-full border border-primary focus-within:ring-2 focus-within:ring-primary transition-all mt-1">
              <LockKeyhole className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-primary" />
              <Input
                type={showConfirmPassword ? "text" : "password"}
                placeholder="Re-enter password"
                value={confirmPassword}
                onChange={(e) => {
                  setConfirmPassword(e.target.value);
                  setFormErrors((prev) => ({
                    ...prev,
                    confirmPassword: validateConfirmPassword(e.target.value),
                  }));
                }}
                className="h-10 pl-9 pr-9 text-sm bg-transparent rounded-full"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-primary"
              >
                {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {formErrors.confirmPassword && (
              <p className="text-red-500 text-xs mt-1">{formErrors.confirmPassword}</p>
            )}
          </div>

          {/* Privacy Policy */}
          <div className="flex items-start gap-2 py-1">
            <input
              type="checkbox"
              id="privacyPolicy"
              checked={acceptedPolicy}
              onChange={(e) => setAcceptedPolicy(e.target.checked)}
              className="mt-0.5 accent-primary w-4 h-4"
            />
            <label
              htmlFor="privacyPolicy"
              className="text-xs leading-tight cursor-pointer text-muted"
            >
              I accept the{" "}
              <a
                href="/privacy-policy.html"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary font-semibold underline"
              >
                Privacy Policy
              </a>{" "}
              and terms.
            </label>
          </div>
          {policyError && (
            <p className="text-red-500 text-xs text-center">{policyError}</p>
          )}

          {/* Error */}
          {error && (
            <p className="text-red-500 text-xs text-center animate-pulse">
              {error}
            </p>
          )}

          {/* Submit */}
          <Button
            type="submit"
            disabled={loading || !isFormValid}
            className="w-full h-11 rounded-full font-semibold text-base button-primary shadow-md hover:shadow-lg transition-all"
          >
            {loading ? "Creating Account..." : "Sign Up"}
          </Button>
        </form>

        <p className="text-center text-xs text-muted mt-4">
          Already have an account?{" "}
          <Link to="/login" className="text-secondary font-semibold hover:text-accent">
            Log In
          </Link>
        </p>
      </div>
    </div>
  );
}