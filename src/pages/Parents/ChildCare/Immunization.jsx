import React, {
  useState,
  useEffect,
  useContext,
  useCallback,
  useMemo,
} from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogAction,
  AlertDialogCancel,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
} from "@/components/ui/chart";
import {
  Syringe,
  Hash,
  Calendar,
  FileText,
  Plus,
  Trash2,
  Lock,
} from "lucide-react";
import {
  AreaChart,
  Area,
  CartesianGrid,
  XAxis,
  YAxis,
  BarChart,
  Legend,
  Bar,
} from "recharts";
import {
  addDays,
  addWeeks,
  addMonths,
  addYears,
  format,
  differenceInYears,
  isValid,
} from "date-fns";
import { UserContext } from "@/context/UserContext";
import {
  getImmunizations,
  deleteImmunization,
  getPredefinedVaccinesGroupedByAge,
} from "@/api/Parents/immunizations";
import VaccineStats from "./components/VaccineStats";
import VaccineGroup from "./components/VaccineGroup";
import VaccineTimeline from "./components/VaccineTimeline";
import ImmunizationForm from "./components/ImmunizationForm";
import VaccineForm from "./components/VaccineForm";
import ImmunizationRecordsTable from "./components/ImmunizationRecordsTable";
import ImmunizationReportButton from "./components/ImmunizationReportButton";

// Utility functions (unchanged)
const parseAgeString = (ageString) => {
  if (!ageString || typeof ageString !== "string") {
    return { value: 0, unit: "days" };
  }

  let cleanedAge = ageString
    .toLowerCase()
    .replace(/\s*(month|year|week)\s*$/, "")
    .trim();

  if (cleanedAge.toLowerCase().startsWith("birth")) {
    return { value: 0, unit: "days" };
  }

  const rangeMatch = cleanedAge.match(
    /^(\d+)\s*–\s*(\d+)\s*(days|weeks|months|years)$/
  );
  if (rangeMatch) {
    const [, start, , unit] = rangeMatch;
    return { value: parseInt(start, 10), unit };
  }

  const singleMatch = cleanedAge.match(/^(\d+)\s*(days|weeks|months|years)$/);
  if (singleMatch) {
    const [, value, unit] = singleMatch;
    return { value: parseInt(value, 10), unit };
  }

  if (cleanedAge.startsWith("every")) {
    return { value: 1, unit: "years" };
  } else if (cleanedAge.startsWith(">")) {
    const match = cleanedAge.match(/^>(\d+)\s*(years)$/);
    if (match) {
      return { value: parseInt(match[1], 10), unit: match[2] };
    }
  }

  console.warn(`Unparseable age string: ${ageString}`);
  return { value: 0, unit: "days" };
};

const calculateDueDate = (ageString, dateOfBirth) => {
  if (!dateOfBirth || !ageString) {
    console.warn(
      `Invalid input: ageString=${ageString}, dateOfBirth=${dateOfBirth}`
    );
    return "Unknown";
  }
  const { value, unit } = parseAgeString(ageString);
  const birthDate = new Date(dateOfBirth);
  const unitMap = {
    days: addDays,
    weeks: addWeeks,
    months: addMonths,
    years: addYears,
  };
  const addFn = unitMap[unit] || addDays;
  const dueDate = format(addFn(birthDate, value), "yyyy-MM-dd");
  return dueDate;
};

const calculateCurrentAge = (dateOfBirth, currentDate = new Date()) => {
  if (!dateOfBirth || !isValid(new Date(dateOfBirth))) return "Unknown";
  const diff = differenceInYears(new Date(currentDate), new Date(dateOfBirth));
  return `${diff} ${diff === 1 ? "year" : "years"}`;
};

const Immunization = () => {
  const navigate = useNavigate();
  const { selectedEntity, isDoctor, isReadOnly } = useContext(UserContext);
  const [state, setState] = useState({
    selectedVaccine: "",
    doseNumber: "",
    selectedAgeGroup: "",
    date: new Date().toISOString().split("T")[0],
    notes: "",
    records: [],
    isLoading: false,
    showForm: false,
    editRecordId: null,
    vaccineList: [],
    showVaccineForm: false,
    errorMessage: "",
    activeTab: "schedule",
    newVaccine: {
      name: "",
      totalDoses: 1,
      ageRanges: [{ dose: 1, value: 0, unit: "days" }],
    },
  });
  const [isSmallScreen, setIsSmallScreen] = useState(false);

  // Responsive check
  useEffect(() => {
    const checkDevice = () => {
      setIsSmallScreen(window.innerHeight < 600);
    };
    checkDevice();
    window.addEventListener("resize", checkDevice);
    return () => window.removeEventListener("resize", checkDevice);
  }, []);

  // Permission Check for Doctor
  useEffect(() => {
    if (
      isDoctor &&
      selectedEntity &&
      !selectedEntity.permissions?.vaccination
    ) {
      setAlert({
        open: true,
        message:
          "You do not have permission to access Immunizations for this patient.",
        onConfirm: () => navigate(-1),
      });
    }
  }, [isDoctor, selectedEntity, navigate]);

  const { subUserId, dateOfBirth } = selectedEntity || {};
  const age = useMemo(() => calculateCurrentAge(dateOfBirth), [dateOfBirth]);
  const [alert, setAlert] = useState({
    open: false,
    message: "",
    onConfirm: null,
  });

  const fetchRecords = useCallback(async () => {
    if (!subUserId) return;
    setState((prev) => ({ ...prev, isLoading: true, errorMessage: "" }));
    try {
      const data = await getImmunizations(subUserId, false);
      setState((prev) => ({ ...prev, records: data || [], isLoading: false }));
    } catch (error) {
      const message =
        error.response?.data?.message || "Failed to load immunization records";
      setState((prev) => ({
        ...prev,
        errorMessage: message,
        isLoading: false,
      }));
      setAlert({ open: true, message });
    }
  }, [subUserId]);

  const fetchVaccines = useCallback(async () => {
    try {
      const data = await getPredefinedVaccinesGroupedByAge();
      const augmentedData = data.map((group) => ({
        age: group.age
          .toLowerCase()
          .replace(/\s*(month|year|week)\s*$/, (match, unit) => ` ${unit}s`)
          .replace("birth – 1 month", "0–1 months")
          .trim(),
        vaccines: group.vaccines.map((v) => ({ ...v, age: group.age })),
      }));
      setState((prev) => ({ ...prev, vaccineList: augmentedData || [] }));
    } catch (error) {
      const message =
        error.response?.data?.message || "Failed to load vaccine list";
      setState((prev) => ({ ...prev, errorMessage: message }));
      setAlert({ open: true, message });
    }
  }, []);

  useEffect(() => {
    if (subUserId && dateOfBirth) {
      fetchRecords();
      fetchVaccines();
    } else if (selectedEntity) {
      const message =
        "Invalid subuser data or date of birth. Please select a valid user.";
      setState((prev) => ({ ...prev, errorMessage: message }));
      setAlert({ open: true, message });
    }
  }, [subUserId, dateOfBirth, fetchRecords, fetchVaccines, selectedEntity]);

  const handleVaccineSelect = useCallback(
    (vaccineName, dose, ageGroup) => {
      if (isReadOnly) return;
      setState((prev) => ({
        ...prev,
        selectedVaccine: vaccineName,
        doseNumber: dose.toString(),
        selectedAgeGroup: ageGroup,
        showForm: true,
      }));
    },
    [isReadOnly]
  );

  const handleEdit = useCallback(
    (record) => {
      if (isReadOnly) return;
      setState((prev) => ({
        ...prev,
        showForm: true,
        editRecordId: record.id,
        selectedVaccine: record.vaccineName,
        doseNumber: record.doseNumber.toString(),
        selectedAgeGroup: record.recommendedAge || "",
        date: record.date,
        notes: record.notes || "",
      }));
    },
    [isReadOnly]
  );

  const handleDelete = useCallback(
    async (id) => {
      if (isReadOnly) return;
      setAlert({
        open: true,
        message: "Are you sure you want to delete this record?",
        onConfirm: async () => {
          try {
            await deleteImmunization(id);
            await fetchRecords();
            toast.success("Record deleted successfully", {
              className: "toast",
            });
          } catch (error) {
            setAlert({ open: true, message: "Failed to delete record." });
          }
        },
      });
    },
    [fetchRecords, isReadOnly]
  );

  const normalizedVaccineList = useMemo(
    () => state.vaccineList,
    [state.vaccineList]
  );

  // Chart configuration for analytics
  const chartConfig = {
    doseNumber: { label: "Dose Number", color: "var(--color-primary)" },
    doses: { label: "Number of Doses", color: "var(--color-primary)" },
  };

  return (
    <motion.div
      className="min-h-scree w-full"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <div
        className={` mx-auto px-1.5 sm:px-3 md:px-4 lg:px-6 py-3 box-border ${
          isSmallScreen ? "px-1" : ""
        }`}
      >
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <Card
            className={`mb-3 rounded-xl shadow-soft bg-glass-card border border-primary w-full ${
              isSmallScreen ? "mb-2" : ""
            }`}
          >
            <CardHeader>
              <CardTitle
                className={`text-accent font-semibold text-center ${
                  isSmallScreen ? "text-sm" : "text-base"
                }`}
              >
                Immunization for {selectedEntity?.name || "Child"}
              </CardTitle>
            </CardHeader>
          </Card>
        </motion.div>

        {/* VIEW-ONLY BANNER */}
        {isReadOnly && (
          <div className="bg-amber-50 border border-amber-300 text-amber-800 px-4 py-2.5 rounded-xl text-center text-sm font-medium flex items-center justify-center gap-2 mb-3">
            <Lock className="w-5 h-5" />
            <span>View Only — Editing is disabled</span>
          </div>
        )}

        {state.errorMessage && (
          <motion.div
            className={`text-center text-accent ${
              isSmallScreen ? "text-xs" : "text-sm"
            }`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
          >
            {state.errorMessage}
          </motion.div>
        )}

        <VaccineStats
          vaccineList={normalizedVaccineList}
          records={state.records}
        />

        <motion.div
          className={`flex border-b border-primary/20 mb-3 ${
            isSmallScreen ? "mb-2" : ""
          }`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          {["schedule", "records", "analytics"].map((tab) => (
            <Button
              key={tab}
              variant="ghost"
              className={`px-1.5 py-0.5 font-medium ${
                state.activeTab === tab
                  ? "text-primary border-b-2 border-primary"
                  : "text-muted hover:text-accent"
              } ${isSmallScreen ? "text-xs py-0.5" : "text-sm"}`}
              onClick={() => setState((prev) => ({ ...prev, activeTab: tab }))}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </Button>
          ))}
        </motion.div>

        <AnimatePresence mode="wait">
          {state.activeTab === "schedule" && (
            <motion.div
              key="schedule"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <div
                className={`flex justify-between items-center mb-3 ${
                  isSmallScreen ? "mb-2" : ""
                }`}
              >
                <h3
                  className={`font-semibold text-accent ${
                    isSmallScreen ? "text-sm" : "text-base"
                  }`}
                >
                  Vaccine Schedule for {age}
                </h3>
                {!isReadOnly && (
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Button
                      className={`button-primary text-accent text-xs font-medium rounded-xl shadow-soft hover:shadow-lg transition-all ${
                        isSmallScreen ? "text-xs py-1" : "text-sm"
                      }`}
                      onClick={() =>
                        setState((prev) => ({ ...prev, showVaccineForm: true }))
                      }
                    >
                      <Plus
                        className={`mr-1 ${
                          isSmallScreen ? "w-3 h-3" : "w-4 h-4"
                        }`}
                      />
                      Add Vaccine
                    </Button>
                  </motion.div>
                )}
                {/* Add the ImmunizationReportButton here */}
                <ImmunizationReportButton
                  subUser={selectedEntity}
                  records={state.records}
                  vaccineSchedule={normalizedVaccineList} // ← This is your fetched & processed vaccine list
                  isSmallScreen={isSmallScreen}
                />
              </div>
              {state.isLoading ? (
                <div
                  className={`text-center text-muted ${
                    isSmallScreen ? "text-xs" : "text-sm"
                  }`}
                >
                  Loading vaccine data...
                </div>
              ) : normalizedVaccineList.length > 0 ? (
                normalizedVaccineList.map((group, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: idx * 0.1 }}
                  >
                    <VaccineGroup
                      age={group.age}
                      vaccines={group.vaccines}
                      records={state.records}
                      onSelect={handleVaccineSelect}
                      dateOfBirth={dateOfBirth}
                      isReadOnly={isReadOnly}
                    />
                  </motion.div>
                ))
              ) : (
                <div
                  className={`text-center text-muted ${
                    isSmallScreen ? "text-xs" : "text-sm"
                  }`}
                >
                  <p>
                    No vaccines available. Try refreshing or contact support.
                  </p>
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Button
                      className={`button-primary text-accent text-xs mt-1.5 rounded-xl shadow-soft hover:shadow-lg transition-all ${
                        isSmallScreen ? "text-xs py-1" : "text-sm"
                      }`}
                      onClick={fetchVaccines}
                    >
                      Refresh
                    </Button>
                  </motion.div>
                </div>
              )}
              <VaccineTimeline
                vaccineList={normalizedVaccineList}
                records={state.records}
                dateOfBirth={dateOfBirth}
              />
            </motion.div>
          )}

          {state.activeTab === "records" && (
            <motion.div
              key="records"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <ImmunizationRecordsTable
                records={state.records}
                isLoading={state.isLoading}
                onEdit={handleEdit}
                onDelete={handleDelete}
                isReadOnly={isReadOnly}
              />
            </motion.div>
          )}

          {state.activeTab === "analytics" && (
            <motion.div
              key="analytics"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <h3
                className={`font-semibold text-accent ${
                  isSmallScreen ? "text-sm" : "text-base"
                } mb-3`}
              >
                Immunization Analytics
              </h3>
              {state.records.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div
                    className={`w-full ${
                      isSmallScreen ? "h-[200px]" : "h-[250px]"
                    }`}
                  >
                    <ChartContainer
                      config={{ doseNumber: chartConfig.doseNumber }}
                      className="w-full h-full bg-card"
                    >
                      <AreaChart
                        data={[...state.records].sort(
                          (a, b) => new Date(a.date) - new Date(b.date)
                        )}
                        margin={{
                          top: isSmallScreen ? 5 : 10,
                          right: isSmallScreen ? 5 : 10,
                          left: isSmallScreen ? -5 : -10,
                          bottom: isSmallScreen ? 5 : 10,
                        }}
                      >
                        <defs>
                          <linearGradient
                            id="colorDose"
                            x1="0"
                            y1="0"
                            x2="0"
                            y2="1"
                          >
                            <stop
                              offset="5%"
                              stopColor="var(--color-primary)"
                              stopOpacity={0.8}
                            />
                            <stop
                              offset="95%"
                              stopColor="var(--color-primary)"
                              stopOpacity={0}
                            />
                          </linearGradient>
                        </defs>
                        <CartesianGrid
                          strokeDasharray="3 3"
                          stroke="var(--color-primary/20)"
                        />
                        <XAxis
                          dataKey="date"
                          tick={{
                            fontSize: isSmallScreen ? 8 : 10,
                            fill: "var(--color-text)",
                          }}
                          tickMargin={5}
                          label={{
                            value: "Date",
                            position: "insideBottom",
                            offset: -5,
                            fill: "var(--color-text)",
                            fontSize: isSmallScreen ? 10 : 12,
                          }}
                        />
                        <YAxis
                          allowDecimals={false}
                          tick={{
                            fontSize: isSmallScreen ? 8 : 10,
                            fill: "var(--color-text)",
                          }}
                          tickMargin={5}
                          label={{
                            value: "Dose #",
                            angle: -90,
                            position: "insideLeft",
                            fill: "var(--color-text)",
                            fontSize: isSmallScreen ? 10 : 12,
                          }}
                        />
                        <ChartTooltip
                          content={
                            <ChartTooltipContent
                              labelFormatter={(value) => `Date: ${value}`}
                              formatter={(value, name) => [
                                value,
                                chartConfig.doseNumber.label,
                              ]}
                              className={`text-xs bg-card text-accent ${
                                isSmallScreen ? "text-xs" : ""
                              }`}
                            />
                          }
                        />
                        <ChartLegend
                          content={<ChartLegendContent />}
                          layout="horizontal"
                          verticalAlign="bottom"
                          align="center"
                          wrapperStyle={{
                            fontSize: isSmallScreen ? 10 : 12,
                            paddingTop: 8,
                          }}
                        />
                        <Area
                          type="monotone"
                          dataKey="doseNumber"
                          stroke="var(--color-primary)"
                          fillOpacity={1}
                          fill="url(#colorDose)"
                          name="Dose Number"
                        />
                      </AreaChart>
                    </ChartContainer>
                  </div>
                  <div
                    className={`w-full ${
                      isSmallScreen ? "h-[200px]" : "h-[250px]"
                    }`}
                  >
                    <ChartContainer
                      config={{ doses: chartConfig.doses }}
                      className="w-full h-full bg-card"
                    >
                      <BarChart
                        data={normalizedVaccineList
                          .flatMap((group) => group.vaccines)
                          .map((vaccine) => ({
                            name: vaccine.vaccine,
                            doses: state.records.filter(
                              (rec) => rec.vaccineName === vaccine.vaccine
                            ).length,
                          }))}
                        margin={{
                          top: isSmallScreen ? 5 : 10,
                          right: isSmallScreen ? 5 : 10,
                          left: isSmallScreen ? -5 : -10,
                          bottom: isSmallScreen ? 5 : 10,
                        }}
                      >
                        <CartesianGrid
                          strokeDasharray="3 3"
                          stroke="var(--color-primary/20)"
                        />
                        <XAxis
                          dataKey="name"
                          tick={{
                            fontSize: isSmallScreen ? 8 : 10,
                            fill: "var(--color-text)",
                          }}
                          tickMargin={5}
                          label={{
                            value: "Vaccine",
                            position: "insideBottom",
                            offset: -5,
                            fill: "var(--color-text)",
                            fontSize: isSmallScreen ? 10 : 12,
                          }}
                        />
                        <YAxis
                          allowDecimals={false}
                          tick={{
                            fontSize: isSmallScreen ? 8 : 10,
                            fill: "var(--color-text)",
                          }}
                          tickMargin={5}
                          label={{
                            value: "Doses",
                            angle: -90,
                            position: "insideLeft",
                            fill: "var(--color-text)",
                            fontSize: isSmallScreen ? 10 : 12,
                          }}
                        />
                        <ChartTooltip
                          content={
                            <ChartTooltipContent
                              labelFormatter={(value) => `Vaccine: ${value}`}
                              formatter={(value, name) => [
                                value,
                                chartConfig.doses.label,
                              ]}
                              className={`text-xs bg-card text-accent ${
                                isSmallScreen ? "text-xs" : ""
                              }`}
                            />
                          }
                        />
                        <ChartLegend
                          content={<ChartLegendContent />}
                          layout="horizontal"
                          verticalAlign="bottom"
                          align="center"
                          wrapperStyle={{
                            fontSize: isSmallScreen ? 10 : 12,
                            paddingTop: 8,
                          }}
                        />
                        <Bar
                          dataKey="doses"
                          fill="var(--color-primary)"
                          radius={[4, 4, 0, 0]}
                          barSize={20}
                          name="Number of Doses"
                        />
                      </BarChart>
                    </ChartContainer>
                  </div>
                </div>
              ) : (
                <p
                  className={`text-muted ${
                    isSmallScreen ? "text-xs" : "text-sm"
                  }`}
                >
                  No records available for analytics.
                </p>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* ADD VACCINE FORM — HIDDEN IN READ-ONLY */}
        <Dialog
          open={state.showVaccineForm && !isReadOnly}
          onOpenChange={(open) =>
            setState((prev) => ({ ...prev, showVaccineForm: open }))
          }
        >
          <DialogContent
            className={`w-[95vw] max-w-sm p-2 sm:p-3 glass-card border border-primary shadow-soft ${
              isSmallScreen ? "max-h-[80vh]" : "max-h-[90vh]"
            } overflow-y-auto`}
          >
            <DialogHeader>
              <DialogTitle
                className={`text-accent font-bold ${
                  isSmallScreen ? "text-sm" : "text-base"
                }`}
              >
                Add Vaccine
              </DialogTitle>
              <DialogDescription
                className={`text-muted ${
                  isSmallScreen ? "text-xs" : "text-sm"
                }`}
              >
                Fill out the fields below to add a new vaccine.
              </DialogDescription>
            </DialogHeader>
            <VaccineForm
              state={state}
              setState={setState}
              fetchVaccines={fetchVaccines}
            />
          </DialogContent>
        </Dialog>

        {/* IMMUNIZATION FORM — HIDDEN IN READ-ONLY */}
        <Dialog
          open={state.showForm && !isReadOnly}
          onOpenChange={(open) =>
            setState((prev) => ({ ...prev, showForm: open }))
          }
        >
          <DialogContent
            className={`w-[95vw] max-w-sm p-2 sm:p-3 glass-card border border-primary shadow-soft ${
              isSmallScreen ? "max-h-[80vh]" : "max-h-[90vh]"
            } overflow-y-auto`}
          >
            <DialogHeader>
              <DialogTitle
                className={`text-accent font-bold ${
                  isSmallScreen ? "text-sm" : "text-base"
                }`}
              >
                {state.editRecordId ? "Edit Immunization" : "Add Immunization"}
              </DialogTitle>
              <DialogDescription
                className={`text-muted ${
                  isSmallScreen ? "text-xs" : "text-sm"
                }`}
              >
                {state.editRecordId
                  ? "Update the immunization record by editing the fields below."
                  : "Fill out the fields below to add a new immunization record."}
              </DialogDescription>
            </DialogHeader>
            <ImmunizationForm
              state={state}
              setState={setState}
              dateOfBirth={dateOfBirth}
              subUserId={subUserId}
              fetchRecords={fetchRecords}
            />
          </DialogContent>
        </Dialog>

        <AlertDialog
          open={alert.open}
          onOpenChange={() => setAlert({ ...alert, open: false })}
        >
          <AlertDialogContent
            className={`w-[90vw] max-w-sm glass-card border border-primary shadow-soft ${
              isSmallScreen ? "p-1.5" : "p-2 sm:p-3"
            }`}
          >
            <AlertDialogHeader>
              <AlertDialogTitle
                className={`text-accent ${
                  isSmallScreen ? "text-sm" : "text-base"
                }`}
              >
                {alert.onConfirm ? "Confirm" : "Notice"}
              </AlertDialogTitle>
              <AlertDialogDescription
                className={`text-primary ${
                  isSmallScreen ? "text-xs" : "text-sm"
                }`}
              >
                {alert.message}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter
              className={`flex flex-col sm:flex-row gap-2 ${
                isSmallScreen ? "gap-1.5" : ""
              }`}
            >
              {alert.onConfirm ? (
                <>
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <AlertDialogCancel
                      onClick={() => setAlert({ ...alert, open: false })}
                      className={`border-primary text-primary hover:bg-input text-xs shadow-soft ${
                        isSmallScreen ? "text-xs py-1" : "text-sm"
                      }`}
                    >
                      Cancel
                    </AlertDialogCancel>
                  </motion.div>
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <AlertDialogAction
                      onClick={() => {
                        alert.onConfirm();
                        setAlert({ ...alert, open: false });
                      }}
                      className={`button-primary text-accent text-xs shadow-soft hover:shadow-lg transition-all ${
                        isSmallScreen ? "text-xs py-1" : "text-sm"
                      }`}
                    >
                      Confirm
                    </AlertDialogAction>
                  </motion.div>
                </>
              ) : (
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <AlertDialogAction
                    onClick={() => setAlert({ ...alert, open: false })}
                    className={`button-primary text-accent text-xs shadow-soft hover:shadow-lg transition-all ${
                      isSmallScreen ? "text-xs py-1" : "text-sm"
                    }`}
                  >
                    OK
                  </AlertDialogAction>
                </motion.div>
              )}
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </motion.div>
  );
};

export default Immunization;
