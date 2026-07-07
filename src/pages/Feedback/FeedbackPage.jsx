// src/pages/Feedback/FeedbackPage.jsx
import React, { useState, useContext } from "react";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Send, Smile, Frown, MessageSquare, Meh } from "lucide-react";
import { motion } from "framer-motion";
import { UserContext } from "@/context/UserContext"; // ← Import UserContext

// Web3Forms Access Key (from .env)
const WEB3FORMS_ACCESS_KEY = import.meta.env.VITE_WEB3FORMS_ACCESS_KEY;

const SATISFACTION_OPTIONS = [
  {
    value: "very-satisfied",
    label: "Very Satisfied",
    icon: Smile,
    color: "text-emerald-500",
  },
  {
    value: "satisfied",
    label: "Satisfied",
    icon: Smile,
    color: "text-green-500",
  },
  {
    value: "neutral",
    label: "Neutral",
    icon: Meh,
    color: "text-gray-500",
  },
  {
    value: "dissatisfied",
    label: "Dissatisfied",
    icon: Frown,
    color: "text-orange-500",
  },
  {
    value: "very-dissatisfied",
    label: "Very Dissatisfied",
    icon: Frown,
    color: "text-red-500",
  },
];

const FEATURE_AREAS = [
  "Family Management",
  "Expenses Tracking",
  "Events & Calendar",
  "Child Safety / Monitoring",
  "Connection with Parents",
  "UI / Performance",
  "Other",
];

export default function FeedbackPage() {
  const { user } = useContext(UserContext); // ← Get logged-in user info

  const [satisfaction, setSatisfaction] = useState("");
  const [mainFeature, setMainFeature] = useState("");
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [mobile, setMobile] = useState(user?.mobile || ""); // Auto-fill if available
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!satisfaction || !message.trim()) {
      toast.error("Please select satisfaction level and write your feedback");
      return;
    }

    if (!WEB3FORMS_ACCESS_KEY) {
      toast.error(
        "Web3Forms Access Key is missing. Please add VITE_WEB3FORMS_ACCESS_KEY in .env file"
      );
      return;
    }

    const payload = {
      access_key: WEB3FORMS_ACCESS_KEY,
      from_name: user?.name || "Anonymous BindFam User",
      subject: title.trim() || "New Feedback from BindFam App",

      // New identification fields
      user_name: user?.name || "Not provided",
      user_role: user?.role || "Unknown",
      user_mobile: mobile.trim() || "Not provided",

      // Existing fields
      satisfaction_level: satisfaction,
      feature_area: mainFeature || "General",
      message: message.trim(),
      submitted_at: new Date().toISOString(),
    };

    setLoading(true);

    try {
      const response = await fetch("https://api.web3forms.com/submit", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify(payload),
      });

      const json = await response.json();

      if (json.success) {
        toast.success("Thank you! Your feedback has been sent successfully ❤️");

        // Reset form (except mobile - keep it for convenience)
        setSatisfaction("");
        setMainFeature("");
        setTitle("");
        setMessage("");
      } else {
        throw new Error(json.message || "Failed to send feedback");
      }
    } catch (err) {
      console.error("Feedback submission error:", err);
      toast.error("Failed to send feedback. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  return (
    // 1. Main container padding - better mobile experience
    <div className="min-h-[100dvh] bg-gradient-to-b from-white to-cyan-50/30">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="text-center mb-6 sm:mb-8"
        >
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold mb-2 flex justify-center gap-2">
            <MessageSquare className="w-8 h-8 sm:w-10 sm:h-10 text-cyan-600" />
            <span className="bg-gradient-to-r from-cyan-500 to-sky-400 bg-clip-text text-transparent">
              BindFam Feedback
            </span>
          </h1>

          <p className="text-sm sm:text-base text-gray-600 max-w-xl mx-auto">
            Help us improve BindFam for your family ❤️
          </p>
        </motion.div>
        {/* Card */}
        <Card className="rounded-xl shadow-lg border-0">
          <CardHeader className="pb-3 px-4 sm:px-6">
            <CardTitle className="text-xl sm:text-2xl font-bold text-cyan-700">
              Tell us what you think
            </CardTitle>
          </CardHeader>

          <CardContent className="px-4 sm:px-6 pb-6">
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* User Info */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-gray-50 p-4 rounded-lg border">
                <div>
                  <Label className="text-xs">Name</Label>
                  <Input disabled value={user?.name || "N/A"} className="h-9" />
                </div>

                <div>
                  <Label className="text-xs">Mobile</Label>
                  <Input
                    type="tel"
                    value={mobile}
                    onChange={(e) => setMobile(e.target.value)}
                    className="h-9"
                  />
                </div>

                <div>
                  <Label className="text-xs">Role</Label>
                  <Input
                    disabled
                    value={user?.role || "Unknown"}
                    className="h-9"
                  />
                </div>
              </div>

              {/* Satisfaction */}
              <div>
                <Label className="text-base font-medium text-cyan-700 block mb-2">
                  Overall satisfaction
                </Label>

                <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
                  {SATISFACTION_OPTIONS.map((option) => {
                    const Icon = option.icon;
                    const active = satisfaction === option.value;

                    return (
                      <button
                        key={option.value}
                        type="button"
                        onClick={() => setSatisfaction(option.value)}
                        className={`p-2 rounded-lg border text-center transition
                      ${
                        active
                          ? "border-cyan-500 bg-cyan-50"
                          : "border-gray-200 hover:bg-gray-50"
                      }`}
                      >
                        <Icon className={`w-6 h-6 mx-auto ${option.color}`} />
                        <span className="text-xs mt-1 block">
                          {option.label}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Feature */}
              <div>
                <Label className="text-base text-cyan-700 mb-1 block">
                  Feedback area
                </Label>
                <Select value={mainFeature} onValueChange={setMainFeature}>
                  <SelectTrigger className="h-10 text-sm">
                    <SelectValue placeholder="Select (optional)" />
                  </SelectTrigger>
                  <SelectContent className="bg-white">
                    {FEATURE_AREAS.map((area) => (
                      <SelectItem key={area} value={area}>
                        {area}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Title */}
              <div>
                <Label className="text-base text-cyan-700 mb-1 block">
                  Title (optional)
                </Label>
                <Input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="h-10"
                />
              </div>

              {/* Message */}
              <div>
                <Label className="text-base text-cyan-700 mb-1 block">
                  Feedback <span className="text-red-500">*</span>
                </Label>
                <Textarea
                  required
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="min-h-[120px]"
                />
              </div>

              {/* Buttons */}
              <div className="flex flex-col sm:flex-row gap-3 pt-2">
                <Button
                  type="submit"
                  disabled={loading || !satisfaction || !message.trim()}
                  className="flex-1 h-11 bg-gradient-to-r from-cyan-500 to-sky-400"
                >
                  {loading ? "Sending..." : "Send Feedback"}
                </Button>

                <Button
                  type="button"
                  variant="outline"
                  className="h-11 sm:w-32"
                  onClick={() => {
                    if (confirm("Discard feedback?")) {
                      setSatisfaction("");
                      setMainFeature("");
                      setTitle("");
                      setMessage("");
                    }
                  }}
                >
                  Cancel
                </Button>
              </div>

              <p className="text-center text-xs text-gray-500 pt-2">
                Thank you for helping us improve 🙏
              </p>
            </form>
          </CardContent>
        </Card>
        {/* Footer thank you */}{" "}
        <div className="text-center mt-10 sm:mt-12 text-gray-600 px-4">
          {" "}
          <p className="text-lg sm:text-xl font-medium mb-2">
            {" "}
            Your voice shapes our future{" "}
          </p>{" "}
          <p className="text-sm sm:text-base">
            {" "}
            Thank you for being part of the BindFam family ❤️{" "}
          </p>{" "}
        </div>
      </div>
    </div>
  );
}
