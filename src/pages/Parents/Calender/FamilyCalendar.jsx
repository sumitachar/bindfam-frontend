// src/pages/Parents/Calender/FamilyCalendar.jsx
import React, {
  useState,
  useEffect,
  useMemo,
  useRef,
  useContext,
  useCallback,
} from "react";
import { createPortal } from "react-dom";
import { toast } from "sonner";
import {
  deleteEvent,
  createEvent,
  updateEvent,
  getAllEvents,
  getConnectedParents,
  suggestBestTime,
  respondToRSVP,
} from "@/api/Parents/familyEvents";
import { getSubUsers } from "@/api/Auth/auth";
import { format, toZonedTime } from "date-fns-tz";
import { UserContext } from "@/context/UserContext";
import EventFormModal from "./components/EventFormModal";
import { EVENT_TYPES } from "./components/eventTypes";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import {
  Calendar,
  Plus,
  RefreshCw,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Clock,
  MapPin,
  Users,
  Edit2,
  Trash2,
  Check,
  X,
  HelpCircle,
} from "lucide-react";

import { addDays } from "date-fns/addDays";
import { eachDayOfInterval } from "date-fns/eachDayOfInterval";
import { endOfMonth } from "date-fns/endOfMonth";
import { isSameDay } from "date-fns/isSameDay";
import { isSameMonth } from "date-fns/isSameMonth";
import { startOfMonth } from "date-fns/startOfMonth";
import { isToday } from "date-fns/isToday";
import { startOfDay } from "date-fns/startOfDay";

const TIMEZONE = "Asia/Kolkata";
const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;

const normaliseEvent = (ev) => ({
  id: ev.id || ev.eventId || ev.googleEventId || Math.random().toString(36).slice(2, 9),
  title: ev.title || ev.summary || "No title",
  date: ev.date || ev.start?.dateTime?.split("T")[0] || ev.start?.date || "",
  time: ev.time || ev.start?.dateTime?.split("T")[1]?.slice(0, 5) || "",
  type: ev.type || "custom",
  invitedMemberCodes: ev.invitedMemberCodes || ev.invitedMembers?.map((m) => m.userCode) || [],
  relatedChildId: ev.relatedChildId || null,
  notes: ev.notes || ev.description || "",
  recurrence: ev.recurrence || "none",
  reminderMinutes: ev.reminderMinutes || 15,
  location: ev.location || "",
  rsvps: ev.rsvps || [],
  invitedMembers: ev.invitedMembers || [],
  createdBy: ev.createdBy || { userCode: "" },
  googleEventId: ev.googleEventId || ev.google?.id || null,
});

export default function FamilyCalendar() {
  const todayIndia = toZonedTime(new Date(), TIMEZONE);
  const [currentMonth, setCurrentMonth] = useState(startOfMonth(todayIndia));
  const [selectedDate, setSelectedDate] = useState(todayIndia);
  const [events, setEvents] = useState([]);
  const [connectedParentsData, setConnectedParentsData] = useState(null);
  const [myChildren, setMyChildren] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);
  const [tooltip, setTooltip] = useState(null);

  const [googleToken, setGoogleToken] = useState(null);
  const [googleConnected, setGoogleConnected] = useState(false);
  const googleClientRef = useRef(null);
  const { user } = useContext(UserContext);

  const [newEvent, setNewEvent] = useState({
    title: "",
    time: "",
    type: "custom",
    invitedMemberCodes: [],
    relatedChildId: null,
    notes: "",
    recurrence: "none",
    reminderMinutes: 15,
    location: "",
  });

  /* ==================== GOOGLE AUTH ==================== */
  const GOOGLE_TOKEN_KEY = "family_calendar_google_token";

  const saveGoogleToken = (token) => {
    token
      ? localStorage.setItem(GOOGLE_TOKEN_KEY, token)
      : localStorage.removeItem(GOOGLE_TOKEN_KEY);
    setGoogleToken(token);
    setGoogleConnected(!!token);
  };

  const loadSavedGoogleToken = () => {
    const saved = localStorage.getItem(GOOGLE_TOKEN_KEY);
    if (saved) {
      setGoogleToken(saved);
      setGoogleConnected(true);
      return saved;
    }
    return null;
  };

  const validateGoogleToken = async (token) => {
    if (!token) return false;
    try {
      const res = await fetch(
        `https://www.googleapis.com/oauth2/v3/tokeninfo?access_token=${token}`
      );
      if (!res.ok) return false;
      const data = await res.json();
      return data.aud === GOOGLE_CLIENT_ID && data.scope?.includes("calendar");
    } catch {
      return false;
    }
  };

  const initializeGoogleSignIn = useCallback(async () => {
    if (
      !GOOGLE_CLIENT_ID ||
      googleClientRef.current ||
      !window?.google?.accounts?.oauth2
    )
      return;

    googleClientRef.current = window.google.accounts.oauth2.initTokenClient({
      client_id: GOOGLE_CLIENT_ID,
      scope:
        "https://www.googleapis.com/auth/calendar.events https://www.googleapis.com/auth/calendar.readonly",
      prompt: "",
      callback: async (resp) => {
        if (resp.error) {
          toast.error("Google sign-in failed");
          handleGoogleDisconnect();
          return;
        }
        saveGoogleToken(resp.access_token);
        toast.success("Connected to Google Calendar!");
        await fetchGoogleEvents();
      },
    });

    const saved = loadSavedGoogleToken();
    if (saved) {
      const valid = await validateGoogleToken(saved);
      valid
        ? (toast.success("Google Calendar reconnected"), await fetchGoogleEvents())
        : handleGoogleDisconnect();
    }
  }, []);

  const handleGoogleConnect = () =>
    googleClientRef.current?.requestAccessToken({ prompt: "consent" });
  const handleGoogleDisconnect = () => {
    if (googleToken) window.google?.accounts?.oauth2?.revoke?.(googleToken);
    saveGoogleToken(null);
    toast.success("Disconnected from Google Calendar");
  };

  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://accounts.google.com/gsi/client";
    script.async = true;
    script.defer = true;
    script.onload = initializeGoogleSignIn;
    document.body.appendChild(script);
    return () => script.parentNode && script.parentNode.removeChild(script);
  }, [initializeGoogleSignIn]);

  /* ==================== DATA FETCHING ==================== */
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [parentsRes, childrenRes, eventsRes] = await Promise.all([
          getConnectedParents(),
          getSubUsers(),
          getAllEvents({ headers: { "Cache-Control": "no-store" } }),
        ]);
        setConnectedParentsData(parentsRes || { accepted: [] });
        setMyChildren(childrenRes || []);
        setEvents((eventsRes || []).map(normaliseEvent));
      } catch (err) {
        console.error(err);
        toast.error("Failed to load calendar data");
      }
    };
    fetchData();
  }, []);

  /* ==================== GOOGLE SYNC ==================== */
  const toRFC3339 = (dateStr, timeStr) =>
    dateStr && timeStr ? `${dateStr}T${timeStr}:00+05:30` : null;

  const fetchGoogleEvents = useCallback(async () => {
    const token = googleToken || localStorage.getItem(GOOGLE_TOKEN_KEY);
    if (!token) return;

    try {
      const timeMin = new Date();
      timeMin.setFullYear(timeMin.getFullYear() - 1);
      const timeMax = new Date();
      timeMax.setFullYear(timeMax.getFullYear() + 1);

      const url = new URL(
        "https://www.googleapis.com/calendar/v3/calendars/primary/events"
      );
      url.searchParams.append("timeMin", timeMin.toISOString());
      url.searchParams.append("timeMax", timeMax.toISOString());
      url.searchParams.append("singleEvents", "true");
      url.searchParams.append("orderBy", "startTime");
      url.searchParams.append("maxResults", "2500");

      const res = await fetch(url.toString(), {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.status === 401) {
        toast.error("Google token expired");
        handleGoogleDisconnect();
        return;
      }
      if (!res.ok) throw new Error("Sync failed");

      const data = await res.json();
      const gEvents = (data.items || []).map((g) => {
        const dt = g.start?.dateTime || g.start?.date || "";
        const [date, time = ""] = dt.split("T");
        return normaliseEvent({
          id: `google_${g.id}`,
          title: g.summary || "(No title)",
          date,
          time: time.slice(0, 5),
          notes: g.description || "",
          location: g.location || "",
          googleEventId: g.id,
          type: "google",
          createdBy: { userCode: "google" },
        });
      });

      setEvents((prev) => {
        const googleMap = Object.fromEntries(
          prev.filter((e) => e.googleEventId).map((e) => [e.googleEventId, e])
        );
        const nonGoogle = prev.filter((e) => !e.googleEventId);
        const merged = [...nonGoogle];
        gEvents.forEach((g) =>
          merged.push(
            googleMap[g.googleEventId]
              ? { ...googleMap[g.googleEventId], ...g }
              : g
          )
        );
        return merged;
      });

      toast.success("Synced with Google Calendar");
    } catch (err) {
      console.error(err);
      toast.error("Failed to sync Google Calendar");
    }
  }, [googleToken]);

  const createGoogleEvent = async (payload) => {
    const token = googleToken || localStorage.getItem(GOOGLE_TOKEN_KEY);
    if (!token) return null;
    const start = toRFC3339(payload.date, payload.time);
    if (!start) return null;

    const googleEvent = {
      summary: payload.title,
      location: payload.location || undefined,
      description: payload.notes || undefined,
      start: { dateTime: start, timeZone: TIMEZONE },
      end: {
        dateTime: new Date(
          new Date(start).getTime() + 60 * 60 * 1000
        ).toISOString(),
        timeZone: TIMEZONE,
      },
      reminders: payload.reminderMinutes
        ? {
            useDefault: false,
            overrides: [{ method: "popup", minutes: payload.reminderMinutes }],
          }
        : undefined,
    };

    try {
      const res = await fetch(
        "https://www.googleapis.com/calendar/v3/calendars/primary/events",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(googleEvent),
        }
      );
      if (!res.ok) throw new Error();
      const data = await res.json();
      toast.success("Event synced to Google Calendar");
      return data;
    } catch {
      toast.error("Failed to sync with Google");
      return null;
    }
  };

  const deleteGoogleEvent = async (googleEventId) => {
    const token = googleToken || localStorage.getItem(GOOGLE_TOKEN_KEY);
    if (!token || !googleEventId) return;
    try {
      await fetch(
        `https://www.googleapis.com/calendar/v3/calendars/primary/events/${googleEventId}`,
        {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        }
      );
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    if (googleConnected) fetchGoogleEvents();
  }, [googleConnected, fetchGoogleEvents]);

  /* ==================== EVENT HANDLERS ==================== */
  const handleSaveEvent = async () => {
    if (!newEvent.title.trim()) return toast.error("Title is required");
    if (!newEvent.time.trim()) return toast.error("Time is required");

    const payload = {
      title: newEvent.title.trim(),
      date: format(toZonedTime(selectedDate, TIMEZONE), "yyyy-MM-dd"),
      time: newEvent.time.trim(),
      type: newEvent.type,
      notes: newEvent.notes?.trim(),
      location: newEvent.location?.trim(),
      invitedMemberCodes: newEvent.invitedMemberCodes.filter((c) => c !== "none"),
      relatedChildId: newEvent.relatedChildId || undefined,
      recurrence: newEvent.recurrence,
      reminderMinutes: newEvent.reminderMinutes,
    };

    try {
      const saved = editingEvent
        ? await updateEvent(editingEvent.id, payload)
        : await createEvent(payload);
      let normalized = normaliseEvent(saved);

      if (googleConnected && !editingEvent) {
        const gEvent = await createGoogleEvent(payload);
        if (gEvent?.id)
          normalized = { ...normalized, googleEventId: gEvent.id };
      }

      setEvents((prev) =>
        prev.some((e) => e.id === normalized.id)
          ? prev.map((e) => (e.id === normalized.id ? normalized : e))
          : [...prev, normalized]
      );

      toast.success(editingEvent ? "Event updated" : "Event created");
      setShowForm(false);
      setEditingEvent(null);
      setNewEvent({
        title: "",
        time: "",
        type: "custom",
        invitedMemberCodes: [],
        relatedChildId: null,
        notes: "",
        recurrence: "none",
        reminderMinutes: 15,
        location: "",
      });
    } catch (err) {
      console.error(err);
      toast.error("Failed to save event");
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Delete this event permanently?")) return;
    try {
      const ev = events.find((e) => e.id === id);
      await deleteEvent(id);
      if (googleConnected && ev?.googleEventId)
        await deleteGoogleEvent(ev.googleEventId);
      setEvents((prev) => prev.filter((e) => e.id !== id));
      toast.success("Event deleted");
    } catch {
      toast.error("Failed to delete event");
    }
  };

  const handleRSVP = async (eventId, status) => {
    try {
      await respondToRSVP(eventId, { status });
      toast.success(`RSVP: ${status}`);
      const updated = await getAllEvents();
      setEvents(updated.map(normaliseEvent));
    } catch {
      toast.error("Failed to update RSVP");
    }
  };

  const handleSuggestBestTime = async () => {
    const date = format(toZonedTime(selectedDate, TIMEZONE), "yyyy-MM-dd");
    const members = newEvent.invitedMemberCodes
      .filter((c) => c !== "none" && c !== user?.userCode)
      .join(",");
    if (!members) return toast.error("Invite someone to suggest time");

    try {
      const suggestions = await suggestBestTime(date, 60, members);
      if (!suggestions.length) return toast.info("No free slots found");
      setNewEvent((prev) => ({ ...prev, time: suggestions[0].start }));
      toast.success("Best time suggested!");
    } catch {
      toast.error("Could not suggest time");
    }
  };

  /* ==================== CALENDAR LOGIC ==================== */
  const normalizeDate = (d) => startOfDay(toZonedTime(d, TIMEZONE));
  const normalizedSelected = useMemo(() => normalizeDate(selectedDate), [selectedDate]);

  const calendarDays = useMemo(() => {
    const start = startOfMonth(currentMonth);
    const end = endOfMonth(currentMonth);
    const days = eachDayOfInterval({ start, end });
    const firstWeekday = start.getDay();
    const padding = Array.from({ length: firstWeekday }, (_, i) =>
      addDays(start, -firstWeekday + i)
    );
    let all = [...padding, ...days];
    while (all.length < 42) all.push(addDays(end, all.length - days.length));
    return all.map(normalizeDate);
  }, [currentMonth]);

  const miniCalendarDays = useMemo(() => {
    const start = startOfMonth(currentMonth);
    const firstWeekday = start.getDay();
    const padding = Array.from({ length: firstWeekday }, (_, i) =>
      addDays(start, -firstWeekday + i)
    );
    const monthDays = eachDayOfInterval({ start, end: endOfMonth(currentMonth) });
    return [...padding, ...monthDays].map(normalizeDate);
  }, [currentMonth]);

  const eventsOnDate = (date) => {
    const dateStr = format(toZonedTime(date, TIMEZONE), "yyyy-MM-dd");
    return events.filter((e) => e.date === dateStr);
  };

  const inviteableMembers = useMemo(
    () => [
      { userCode: "none", name: "None (Self Reminder)", type: "self" },
      ...(connectedParentsData?.accepted || []).map((p) => ({
        userCode: p.connectedParent.userCode,
        name: p.connectedParent.name || "Parent",
        type: "parent",
      })),
    ],
    [connectedParentsData]
  );

  return (
    <div className="min-h-screen pb-20 lg:pb-0">
      {/* Header */}
      <header className="bg-gradient-to-r from-teal-600 to-cyan-600 shadow-2xl sticky top-20 z-10">
        <div className="max-w-7xl mx-auto px-6 py-5 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Calendar className="w-8 h-8 text-white" />
            <h1 className="text-2xl font-bold text-white">Family Calendar</h1>
          </div>
          <Button
            onClick={() => {
              setNewEvent({
                title: "",
                time: "",
                type: "custom",
                invitedMemberCodes: [],
                relatedChildId: null,
                notes: "",
                recurrence: "none",
                reminderMinutes: 15,
                location: "",
              });
              setEditingEvent(null);
              setShowForm(true);
            }}
            className="bg-white text-teal-600 hover:bg-cyan-50 font-bold shadow-lg"
          >
            <Plus className="w-5 h-5 mr-2" /> New Event
          </Button>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Sidebar – Always Visible */}
          <div className="space-y-8">
            {/* Mini Calendar */}
            <Card className="glass-card rounded-3xl shadow-2xl overflow-hidden">
              <CardHeader className="bg-gradient-to-r from-teal-600 to-cyan-600 text-white">
                <CardTitle className="text-xl flex items-center justify-between">
                  {format(currentMonth, "MMMM yyyy")}
                  <div className="flex gap-2">
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => setCurrentMonth((m) => addDays(m, -30))}
                      className="h-8 w-8"
                    >
                      <ChevronLeft className="w-5 h-5" />
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => setCurrentMonth((m) => addDays(m, 30))}
                      className="h-8 w-8"
                    >
                      <ChevronRight className="w-5 h-5" />
                    </Button>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4">
                <div className="grid grid-cols-7 text-xs font-bold text-gray-500 mb-3">
                  {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
                    <div key={d} className="text-center">{d}</div>
                  ))}
                </div>
                <div className="grid grid-cols-7 gap-2">
                  {miniCalendarDays.map((day) => {
                    const dayEvents = eventsOnDate(day);
                    const isSelected = isSameDay(day, normalizedSelected);
                    const isTodayDate = isToday(day);

                    return (
                      <button
                        key={day.toString()}
                        onClick={() => setSelectedDate(day)}
                        className={`
                          relative h-10 w-10 rounded-full flex items-center justify-center text-sm font-medium transition-all
                          ${isTodayDate
                            ? "bg-teal-600 text-white ring-4 ring-teal-300"
                            : isSelected
                            ? "bg-cyan-600 text-white ring-4 ring-cyan-400 shadow-lg scale-110"
                            : "hover:bg-cyan-100 text-gray-700"
                          }
                          ${!isSameMonth(day, currentMonth) ? "text-gray-400" : ""}
                        `}
                      >
                        {format(day, "d")}
                        {dayEvents.length > 0 && !isSelected && !isTodayDate && (
                          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center animate-pulse">
                            {dayEvents.length}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Google Sync */}
            <Card className="glass-card rounded-3xl shadow-2xl">
              <CardHeader>
                <CardTitle className="flex items-center gap-3 text-2xl bg-gradient-to-r from-teal-600 to-cyan-600 bg-clip-text text-transparent">
                  <Calendar className="w-8 h-8" /> Google Calendar
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button
                  onClick={googleConnected ? handleGoogleDisconnect : handleGoogleConnect}
                  className={`w-full ${googleConnected ? "bg-emerald-600 hover:bg-emerald-700" : "bg-gradient-to-r from-teal-600 to-cyan-600"}`}
                >
                  {googleConnected ? (
                    <>Connected <LogOut className="ml-2 w-5 h-5" /></>
                  ) : (
                    "Connect Google Calendar"
                  )}
                </Button>
                {googleConnected && (
                  <Button variant="outline" onClick={fetchGoogleEvents} className="w-full">
                    <RefreshCw className="mr-2 w-4 h-4" /> Sync Now
                  </Button>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Right Side – Main Calendar + Events */}
          <div className="lg:col-span-2 space-y-8">
            {/* MAIN LARGE CALENDAR – ONLY ON DESKTOP */}
            <div className="hidden lg:block">
              <Card className="glass-card rounded-3xl shadow-2xl overflow-hidden">
                <CardHeader className="bg-gradient-to-r from-teal-600 to-cyan-600 text-white">
                  <CardTitle className="text-2xl">
                    {format(selectedDate, "EEEE, MMMM d, yyyy")}
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="grid grid-cols-7 gap-4 mb-6 text-center font-bold text-gray-600">
                    {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
                      <div key={d}>{d}</div>
                    ))}
                  </div>
                  <div className="grid grid-cols-7 gap-4">
                    {calendarDays.map((day) => {
                      const dayEvents = eventsOnDate(day);
                      const isTodayDate = isToday(day);
                      const isSelected = isSameDay(day, normalizedSelected);
                      const isCurrentMonth = isSameMonth(day, currentMonth);

                      return (
                        <div
                          key={day.toString()}
                          onClick={() => setSelectedDate(day)}
                          onMouseEnter={(e) => {
                            if (dayEvents.length > 0 && window.innerWidth >= 1024) {
                              const rect = e.currentTarget.getBoundingClientRect();
                              setTooltip({ day, events: dayEvents, rect });
                            }
                          }}
                          onMouseLeave={() => setTooltip(null)}
                          className={`min-h-32 rounded-2xl p-3 border-2 transition-all cursor-pointer relative group
                            ${isSelected ? "border-cyan-500 bg-cyan-50 shadow-xl ring-4 ring-cyan-300 text-black" : "border-transparent"}
                            ${isTodayDate && !isSelected ? "bg-teal-50 border-teal-300" : ""}
                            ${!isCurrentMonth ? "text-gray-400" : ""} hover:bg-cyan-50 hover:shadow-lg hover:text-black
                          `}
                        >
                          <div className="flex justify-between items-start mb-2">
                            <span className={`font-bold ${isTodayDate ? "bg-teal-600 text-white w-8 h-8 rounded-full flex items-center justify-center" : ""}`}>
                              {format(day, "d")}
                            </span>
                            {dayEvents.length > 0 && (
                              <Badge className="bg-cyan-600 text-white">
                                {dayEvents.length}
                              </Badge>
                            )}
                          </div>
                          <div className="space-y-1 text-xs">
                            {dayEvents.slice(0, 3).map((ev) => (
                              <div key={ev.id} className="bg-cyan-600 text-white px-2 py-1 rounded truncate font-medium">
                                {ev.time} {ev.title}
                              </div>
                            ))}
                            {dayEvents.length > 3 && (
                              <div className="text-cyan-700 font-bold">
                                +{dayEvents.length - 3} more
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Events List */}
            <Card className="glass-card rounded-3xl shadow-2xl">
              <CardHeader>
                <CardTitle className="text-3xl bg-gradient-to-r from-teal-600 to-cyan-600 bg-clip-text text-transparent">
                  Events for {format(selectedDate, "MMMM d")}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-96 overflow-y-auto pr-4">
                  {eventsOnDate(selectedDate).length === 0 ? (
                    <p className="text-center text-gray-500 py-16 text-xl">
                      No events today
                    </p>
                  ) : (
                    <div className="space-y-6">
                      {eventsOnDate(selectedDate).map((event) => {
                        const isCreator = event.createdBy?.userCode === user?.userCode;
                        const myRsvp = event.rsvps?.find((r) => r.user?.userCode === user?.userCode);

                        const counts = { accepted: 0, declined: 0, maybe: 0, pending: 0 };
                        event.rsvps?.forEach((r) => {
                          if (r.status === "accepted") counts.accepted++;
                          else if (r.status === "declined") counts.declined++;
                          else if (r.status === "maybe") counts.maybe++;
                          else counts.pending++;
                        });
                        event.invitedMemberCodes.forEach((code) => {
                          if (!event.rsvps?.some((r) => r.user?.userCode === code)) counts.pending++;
                        });

                        return (
                          <div key={event.id} className="glass-card rounded-2xl p-6 border-l-4 border-cyan-500 hover:shadow-2xl transition-all">
                            <div className="flex justify-between items-start">
                              <div className="flex-1">
                                <h4 className="text-2xl font-bold">{event.title}</h4>
                                <div className="flex flex-wrap items-center gap-4 mt-2 text-gray-700 text-sm">
                                  {event.time && (
                                    <span className="flex items-center gap-1 text-cyan-500">
                                      <Clock className="w-4 h-4" /> {event.time}
                                    </span>
                                  )}
                                  {event.location && (
                                    <span className="flex items-center gap-1 text-cyan-500">
                                      <MapPin className="w-4 h-4" /> {event.location}
                                    </span>
                                  )}
                                  {event.invitedMemberCodes.length > 0 && (
                                    <span className="flex items-center gap-1 text-cyan-700">
                                      <Users className="w-4 h-4" /> {event.invitedMemberCodes.length} invited
                                    </span>
                                  )}
                                </div>
                                {event.notes && (
                                  <p className="mt-3 text-green-500 italic">"{event.notes}"</p>
                                )}
                                {event.googleEventId && (
                                  <Badge className="mt-3 bg-emerald-100 text-emerald-700">
                                    Google Sync
                                  </Badge>
                                )}

                                {/* RSVP Summary */}
                                {event.invitedMemberCodes.length > 0 && (
                                  <div className="mt-4 flex gap-3 text-sm">
                                    {counts.accepted > 0 && (
                                      <Badge className="bg-green-100 text-green-800">
                                        {counts.accepted} Yes
                                      </Badge>
                                    )}
                                    {counts.declined > 0 && (
                                      <Badge variant="destructive">
                                        {counts.declined} No
                                      </Badge>
                                    )}
                                    {counts.maybe > 0 && (
                                      <Badge variant="secondary">
                                        {counts.maybe} Maybe
                                      </Badge>
                                    )}
                                    {counts.pending > 0 && (
                                      <Badge variant="outline">
                                        {counts.pending} Pending
                                      </Badge>
                                    )}
                                  </div>
                                )}

                                {/* Who's Going? List with Avatars */}
                                {event.invitedMemberCodes.length > 0 && (
                                  <div className="mt-6 pt-5 border-t border-gray-200">
                                    <h5 className="text-sm font-bold text-gray-700 mb-3 flex items-center gap-2">
                                      <Users className="w-5 h-5 text-cyan-600" />
                                      Who's Going?
                                    </h5>
                                    <div className="space-y-3">
                                      {event.invitedMemberCodes.map((code) => {
                                        const rsvp = event.rsvps?.find((r) => r.user?.userCode === code);
                                        const member = event.invitedMembers.find((m) => m.userCode === code) ||
                                          connectedParentsData?.accepted?.find((p) => p.connectedParent.userCode === code)?.connectedParent ||
                                          { name: code, profileImage: null };

                                        return (
                                          <div key={code} className="flex items-center justify-between bg-gray-50 rounded-lg px-4 py-3">
                                            <div className="flex items-center gap-3">
                                              <Avatar className="w-9 h-9">
                                                <AvatarImage src={member.profileImage} />
                                                <AvatarFallback>{member.name?.[0] || "?"}</AvatarFallback>
                                              </Avatar>
                                              <span className="font-medium text-gray-800">
                                                {member.name}
                                                {member.userCode === user?.userCode && " (You)"}
                                              </span>
                                            </div>
                                            <div>
                                              {rsvp?.status === "accepted" && (
                                                <Badge className="bg-green-100 text-green-800 border-green-300">
                                                  <Check className="w-3 h-3 mr-1" /> Yes
                                                </Badge>
                                              )}
                                              {rsvp?.status === "declined" && (
                                                <Badge variant="destructive">
                                                  <X className="w-3 h-3 mr-1" /> No
                                                </Badge>
                                              )}
                                              {rsvp?.status === "maybe" && (
                                                <Badge variant="secondary">
                                                  <HelpCircle className="w-3 h-3 mr-1" /> Maybe
                                                </Badge>
                                              )}
                                              {(!rsvp || rsvp?.status === "pending") && (
                                                <Badge variant="outline" className="text-gray-500">
                                                  Pending
                                                </Badge>
                                              )}
                                            </div>
                                          </div>
                                        );
                                      })}
                                    </div>
                                  </div>
                                )}

                                {/* Your RSVP Buttons */}
                                {!isCreator && event.invitedMemberCodes.includes(user?.userCode) && (
                                  <div className="flex flex-wrap items-center gap-3 mt-6">
                                    <Button
                                      size="sm"
                                      variant={myRsvp?.status === "accepted" ? "default" : "outline"}
                                      onClick={() => handleRSVP(event.id, "accepted")}
                                      disabled={myRsvp?.status === "accepted"}
                                    >
                                      <Check className="w-4 h-4 mr-1" /> Yes
                                    </Button>
                                    <Button
                                      size="sm"
                                      variant={myRsvp?.status === "declined" ? "destructive" : "outline"}
                                      onClick={() => handleRSVP(event.id, "declined")}
                                      disabled={myRsvp?.status === "declined"}
                                    >
                                      <X className="w-4 h-4 mr-1" /> No
                                    </Button>
                                    <Button
                                      size="sm"
                                      variant={myRsvp?.status === "maybe" ? "secondary" : "outline"}
                                      onClick={() => handleRSVP(event.id, "maybe")}
                                      disabled={myRsvp?.status === "maybe"}
                                    >
                                      <HelpCircle className="w-4 h-4 mr-1" /> Maybe
                                    </Button>

                                    {myRsvp && (
                                      <Badge
                                        variant={
                                          myRsvp.status === "accepted"
                                            ? "default"
                                            : myRsvp.status === "declined"
                                            ? "destructive"
                                            : "secondary"
                                        }
                                        className="ml-3 font-medium"
                                      >
                                        You: {myRsvp.status === "accepted" ? "YES" : myRsvp.status === "declined" ? "NO" : "MAYBE"}
                                      </Badge>
                                    )}
                                  </div>
                                )}
                              </div>

                              {/* Edit/Delete for Creator */}
                              {isCreator && (
                                <div className="flex gap-3 ml-6">
                                  <Button
                                    size="icon"
                                    variant="ghost"
                                    onClick={() => {
                                      setEditingEvent(event);
                                      setNewEvent({
                                        ...event,
                                        invitedMemberCodes: event.invitedMemberCodes || [],
                                      });
                                      setShowForm(true);
                                    }}
                                  >
                                    <Edit2 className="w-5 h-5 text-cyan-600" />
                                  </Button>
                                  <Button
                                    size="icon"
                                    variant="ghost"
                                    onClick={() => handleDelete(event.id)}
                                  >
                                    <Trash2 className="w-5 h-5 text-red-600" />
                                  </Button>
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Desktop Tooltip */}
      {tooltip && window.innerWidth >= 1024 && createPortal(
        <div className="fixed inset-0 pointer-events-none z-[9999]">
          <div
            className="absolute bg-black/95 backdrop-blur-sm text-white rounded-xl shadow-2xl p-5 w-80 text-xs border border-white/10"
            style={{
              left: tooltip.rect.left + tooltip.rect.width / 2,
              top: tooltip.rect.top,
              transform: `translateX(-50%) ${tooltip.rect.top > window.innerHeight * 0.6 ? "translateY(20px)" : "translateY(-105%)"}`,
            }}
          >
            <p className="font-bold text-cyan-400 text-sm mb-3">
              {format(toZonedTime(tooltip.day, TIMEZONE), "EEEE, MMMM d, yyyy")}
            </p>
            <div className="max-h-64 overflow-y-auto space-y-3">
              {tooltip.events.map((ev) => (
                <div key={ev.id} className="border-b border-gray-700 pb-3 last:border-0">
                  <p className="font-semibold">{ev.time} – {ev.title}</p>
                  {ev.location && <p className="text-gray-400 text-xs mt-1">Location: {ev.location}</p>}
                  {ev.notes && <p className="text-gray-300 text-xs italic mt-2 leading-tight">"{ev.notes}"</p>}
                </div>
              ))}
            </div>
            <div className={`absolute left-1/2 -translate-x-1/2 w-0 h-0 border-l-8 border-r-8 border-transparent
              ${tooltip.rect.top > window.innerHeight * 0.6 ? "border-t-8 border-t-black/95 -top-2" : "border-b-8 border-b-black/95 -bottom-2"}`}
            />
          </div>
        </div>,
        document.body
      )}

      {/* Event Form Modal */}
      <EventFormModal
        show={showForm}
        editingEvent={editingEvent}
        newEvent={newEvent}
        setNewEvent={setNewEvent}
        selectedDate={selectedDate}
        myChildren={myChildren}
        inviteableMembers={inviteableMembers}
        EVENT_TYPES={EVENT_TYPES}
        onSave={handleSaveEvent}
        onClose={() => {
          setShowForm(false);
          setEditingEvent(null);
        }}
        onSuggestBestTime={handleSuggestBestTime}
      />
    </div>
  );
}