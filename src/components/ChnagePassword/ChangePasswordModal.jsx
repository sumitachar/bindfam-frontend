import { UserContext } from "@/context/UserContext";
import React, { useContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import { NavItem } from "../NavigationBar/RightNavigationBar";
import { AnimatePresence, motion } from "framer-motion";
import { Lock, LockOpen, Phone } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

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

const ChangePasswordModal = () => {
  // ───────────── Hooks: Must be top-level ─────────────
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState(1); 
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [sessionId, setSessionId] = useState("");
  const [otp, setOtp] = useState("");
  const [newPass, setNewPass] = useState("");
  const [confirmPass, setConfirmPass] = useState("");
  const [countryCode, setCountryCode] = useState("+91"); 

  const { logout, user } = useContext(UserContext);
  const navigate = useNavigate();

  // Safe mobile extraction
  const mobile = user?.mobile || "";

  // ───────────── OTP request ─────────────
  const requestOtp = async () => {
    setLoading(true);
    setError("");
    setSuccess("");

    if (!mobile || mobile.length < 7) {
      setError("Invalid mobile number");
      setLoading(false);
      return;
    }

    const fullMobileNumber = countryCode.replace("+", "") + mobile;

    try {
      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/auth/change-password/request-otp`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
          },
          body: JSON.stringify({ mobile: fullMobileNumber }),
        }
      );

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to send OTP");

      setSessionId(data.sessionId);
      setStep(2);
      setSuccess("OTP sent to your mobile!");
    } catch (err) {
      setError(err.message || "Failed to send OTP");
    } finally {
      setLoading(false);
    }
  };

  // ───────────── Verify OTP & Change Password ─────────────
  const verifyAndChange = async () => {
    if (newPass !== confirmPass) {
      setError("Passwords don't match");
      return;
    }
    if (newPass.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    setLoading(true);
    setError("");
    setSuccess("");

    const fullMobileNumber = countryCode.replace("+", "") + mobile;

    try {
      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/auth/change-password/verify`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
          },
          body: JSON.stringify({
            mobile: fullMobileNumber,
            sessionId,
            otp,
            newPassword: newPass,
          }),
        }
      );

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed");

      setSuccess("Password changed successfully! Logging you out...");
      setTimeout(() => {
        logout();
        navigate("/login");
      }, 2000);
    } catch (err) {
      setError(err.message || "Invalid OTP or failed to change password");
    } finally {
      setLoading(false);
    }
  };

  // ───────────── Render ─────────────
  return (
    <>
      {/* Guard: Don't show modal if no user */}
      {user && (
        <>
          {/* Trigger Button */}
          <NavItem onClick={() => setOpen(true)} icon={Lock}>
            Change Password
          </NavItem>

          {/* Modal */}
          <AnimatePresence>
            {open && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
                onClick={() => setOpen(false)}
              >
                <motion.div
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.9, opacity: 0 }}
                  className="w-full max-w-md glass-card rounded-xl p-6 shadow-2xl"
                  onClick={(e) => e.stopPropagation()}
                >
                  {/* Header */}
                  <div className="flex justify-between items-center mb-5">
                    <h2 className="text-xl font-extrabold text-primary flex items-center gap-2">
                      <LockOpen className="w-5 h-5" />
                      {step === 1 ? "Change Password" : "Verify OTP"}
                    </h2>
                    <button
                      onClick={() => setOpen(false)}
                      className="text-2xl hover:text-red-500 transition-colors"
                    >
                      ×
                    </button>
                  </div>

                  {/* Step 1: Request OTP */}
                  {step === 1 ? (
                    <div className="space-y-5">
                      <div className="text-center">
                        <p className="text-muted mb-2">
                          We will send an OTP to your registered mobile number:
                        </p>
                        <div className="flex items-center justify-center gap-2 mb-4">
                          {/* Country Code Selector */}
                          <Select value={countryCode} onValueChange={setCountryCode}>
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

                          {/* Masked Mobile */}
                          <p className="text-lg font-bold text-primary flex items-center gap-2">
                            <Phone className="w-5 h-5" />
                            XXXXXX{mobile?.slice(-4) || "****"}
                          </p>
                        </div>
                      </div>

                      <Button
                        onClick={requestOtp}
                        disabled={loading || !mobile}
                        className="w-full py-3 rounded-full button-primary font-semibold"
                      >
                        {loading ? "Sending OTP..." : "Send OTP"}
                      </Button>
                    </div>
                  ) : (
                    /* Step 2: Verify & Change */
                    <div className="space-y-4">
                      <Input
                        placeholder="Enter 6-digit OTP"
                        value={otp}
                        onChange={(e) => {
                          const val = e.target.value.replace(/\D/g, "").slice(0, 6);
                          setOtp(val);
                        }}
                        maxLength={6}
                        className="text-center text-2xl tracking-widest font-mono rounded-full border-primary"
                      />

                      <Input
                        type="password"
                        placeholder="New Password (min 6 chars)"
                        value={newPass}
                        onChange={(e) => setNewPass(e.target.value)}
                        className="rounded-full border-primary"
                      />

                      <Input
                        type="password"
                        placeholder="Confirm New Password"
                        value={confirmPass}
                        onChange={(e) => setConfirmPass(e.target.value)}
                        className="rounded-full border-primary"
                      />

                      <div className="flex gap-3 mt-5">
                        <Button
                          variant="outline"
                          onClick={() => setStep(1)}
                          className="flex-1 rounded-full"
                        >
                          Back
                        </Button>
                        <Button
                          onClick={verifyAndChange}
                          disabled={loading}
                          className="flex-1 button-primary rounded-full font-semibold"
                        >
                          {loading ? "Changing..." : "Change Password"}
                        </Button>
                      </div>
                    </div>
                  )}

                  {/* Error & Success */}
                  {error && (
                    <p className="text-red-500 text-center text-sm mt-4 animate-pulse">
                      {error}
                    </p>
                  )}
                  {success && (
                    <p className="text-green-600 text-center text-sm mt-4 font-bold">
                      {success}
                    </p>
                  )}
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </>
      )}
    </>
  );
};

export default ChangePasswordModal;
