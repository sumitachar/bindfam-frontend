import { intervalToDuration, isValid, isBefore, addDays, addWeeks, addMonths, addYears } from "date-fns";
import { useMemo } from "react";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

// Utility function to merge Tailwind classes
export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

// Parse age string into value and unit
export const parseAgeString = (ageString) => {
  if (!ageString) return { value: 0, unit: "days" };
  let cleanedAge = ageString.toLowerCase().replace(/\s*(month|year|week)\s*$/, "").trim();
  if (cleanedAge.startsWith("birth")) return { value: 0, unit: "days" };
  const match = cleanedAge.match(/^(\d+)\s*(days|weeks|months|years)$/);
  return match ? { value: parseInt(match[1], 10), unit: match[2] } : { value: 0, unit: "days" };
};

// Calculate due date based on age string and date of birth
export const calculateDueDate = (ageString, dateOfBirth) => {
  if (!dateOfBirth || !ageString) return "Unknown";
  const { value, unit } = parseAgeString(ageString);
  const unitMap = {
    days: addDays,
    weeks: addWeeks,
    months: addMonths,
    years: addYears,
  };
  const addFn = unitMap[unit] || addDays; // Default to addDays if unit is invalid
  return addFn(new Date(dateOfBirth), value).toISOString().split("T")[0];
};

// Get vaccine status based on records and due date
export const getVaccineStatus = (vaccine, records, dateOfBirth) => {
  const doseTaken = records.some(
    (rec) => rec.vaccineName === vaccine.vaccine && rec.doseNumber === vaccine.dose
  );
  if (doseTaken) return "taken";

  const dueDate = calculateDueDate(vaccine.age, dateOfBirth);
  if (dueDate === "Unknown") return "pending";
  return isBefore(new Date(dueDate), new Date()) ? "overdue" : "pending";
};

// Calculate current age from date of birth
export const calculateCurrentAge = (dateOfBirth, currentDate = new Date()) => {
  if (!dateOfBirth || !isValid(new Date(dateOfBirth))) return "Unknown";

  const duration = intervalToDuration({
    start: new Date(dateOfBirth),
    end: currentDate,
  });

  const { years, months, days } = duration;

  let parts = [];
  if (years) parts.push(`${years} ${years === 1 ? "year" : "years"}`);
  if (months) parts.push(`${months} ${months === 1 ? "month" : "months"}`);
  if (days || (!years && !months)) parts.push(`${days} ${days === 1 ? "day" : "days"}`);

  return parts.join(" ");
};

export const formatLocalDate = (date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

