// src/constants/eventTypes.js
import { 
  PartyPopper, 
  Clock, 
  CalendarDays, 
  Sparkles, 
  Heart,
  GraduationCap,
  Stethoscope,
  Utensils
} from "lucide-react";

export const EVENT_TYPES = {
  birthday: {
    label: "Birthday",
    icon: PartyPopper,
    gradient: "bg-gradient-to-r from-pink-500 to-rose-500",
    light: "bg-pink-50 text-pink-600",
  },
  appointment: {
    label: "Appointment",
    icon: Clock,
    gradient: "bg-gradient-to-r from-blue-500 to-cyan-500",
    light: "bg-blue-50 text-blue-600",
  },
  holiday: {
    label: "Holiday",
    icon: CalendarDays,
    gradient: "bg-gradient-to-r from-emerald-500 to-green-500",
    light: "bg-emerald-50 text-emerald-600",
  },
  anniversary: {
    label: "Anniversary",
    icon: Heart,
    gradient: "bg-gradient-to-r from-red-500 to-pink-500",
    light: "bg-red-50 text-red-600",
  },
  school: {
    label: "School",
    icon: GraduationCap,
    gradient: "bg-gradient-to-r from-purple-500 to-indigo-500",
    light: "bg-purple-50 text-purple-600",
  },
  medical: {
    label: "Medical",
    icon: Stethoscope,
    gradient: "bg-gradient-to-r from-orange-500 to-amber-500",
    light: "bg-orange-50 text-orange-600",
  },
  meal: {
    label: "Meal",
    icon: Utensils,
    gradient: "bg-gradient-to-r from-amber-500 to-yellow-500",
    light: "bg-amber-50 text-amber-600",
  },
  custom: {
    label: "Custom",
    icon: Sparkles,
    gradient: "bg-gradient-to-r from-gray-500 to-slate-500",
    light: "bg-gray-50 text-gray-600",
  },
};