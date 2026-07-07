import React, { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
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
  Calendar,
  Ruler,
  Scale,
  Pencil,
  Trash2,
  Plus,
  Lock,
} from "lucide-react";
import { intervalToDuration, isValid } from "date-fns";
import { UserContext } from "@/context/UserContext";
import {
  addGrowthRecord,
  getGrowthRecords,
  updateGrowthRecord,
  deleteGrowthRecord,
} from "@/api/Parents/growthTracker";
import { Bar, BarChart, XAxis, YAxis, CartesianGrid } from "recharts";

// Age calculation function
export const calculateCurrentAge = (dateOfBirth, currentDate = new Date()) => {
  if (!dateOfBirth || !isValid(new Date(dateOfBirth))) return "Unknown";

  const duration = intervalToDuration({
    start: new Date(dateOfBirth),
    end: new Date(currentDate),
  });

  const { years, months, days } = duration;

  let parts = [];
  if (years) parts.push(`${years} ${years === 1 ? "year" : "years"}`);
  if (months) parts.push(`${months} ${months === 1 ? "month" : "months"}`);
  if (days || (!years && !months))
    parts.push(`${days} ${days === 1 ? "day" : "days"}`);

  return parts.join(" ");
};

const GrowthTracker = () => {
  const navigate = useNavigate();
  const { selectedEntity, isDoctor, isReadOnly } = useContext(UserContext);
  const [age, setAge] = useState(
    selectedEntity?.dateOfBirth
      ? calculateCurrentAge(selectedEntity.dateOfBirth)
      : "Unknown"
  );
  const [height, setHeight] = useState("");
  const [weight, setWeight] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [records, setRecords] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editRecordId, setEditRecordId] = useState(null);
  const [headCircumference, setHeadCircumference] = useState("");

  const [alert, setAlert] = useState({
    open: false,
    message: "",
    onConfirm: null,
  });
  const [isSmallScreen, setIsSmallScreen] = useState(false);


  // Detect small screen height
  useEffect(() => {
    const checkDevice = () => {
      const smallScreen = window.innerHeight < 600;
      setIsSmallScreen(smallScreen);
    };
    checkDevice();
    window.addEventListener("resize", checkDevice);
    return () => window.removeEventListener("resize", checkDevice);
  }, []);

  // Permission Check for Doctor
  useEffect(() => {
    if (isDoctor && selectedEntity && !selectedEntity.permissions?.growth) {
      setAlert({
        open: true,
        message:
          "You do not have permission to access Growth Tracker for this patient.",
        onConfirm: () => navigate(-1),
      });
    }
  }, [isDoctor, selectedEntity, navigate]);

  useEffect(() => {
    if (selectedEntity) {
      setAge(
        selectedEntity.dateOfBirth
          ? calculateCurrentAge(selectedEntity.dateOfBirth)
          : "Unknown"
      );
      fetchRecords();
    }
  }, [selectedEntity]);

  // Fetch records
  const fetchRecords = async () => {
    try {
      const data = await getGrowthRecords(selectedEntity.subUserId);
      setRecords(data || []);
    } catch (error) {
      console.error("Error fetching growth records:", error);
      setAlert({ open: true, message: "Failed to fetch growth records." });
    }
  };

  // Update age when date changes
  const handleDateChange = (newDate) => {
    if (isReadOnly) return;
    setDate(newDate);
    if (selectedEntity?.dateOfBirth) {
      const newAge = calculateCurrentAge(selectedEntity.dateOfBirth, newDate);
      setAge(newAge);
    }
  };

  const handleSubmit = async () => {
    if (isReadOnly) return;

    if (!selectedEntity || !age || !height || !weight || !date) {
      setAlert({ open: true, message: "Please fill all required fields." });
      return;
    }

    const bmi = Number((weight / (height / 100) ** 2).toFixed(1));
    const recordData = {
      subUserId: selectedEntity.subUserId,
      age: calculateCurrentAge(selectedEntity.dateOfBirth, date),
      heightCm: Number(height),
      weightKg: Number(weight),
      bmi,
      recordDate: date,

      // ✅ ADD THIS
      headCircumferenceCm: headCircumference
        ? Number(headCircumference)
        : undefined,
    };

    try {
      if (editRecordId) {
        const updated = await updateGrowthRecord(editRecordId, recordData);
        setRecords(
          records.map((rec) => (rec.id === editRecordId ? updated : rec))
        );
        toast.success("Record updated", { className: "toast" });
      } else {
        const saved = await addGrowthRecord(recordData);
        setRecords([saved, ...records]);
        toast.success("Record added", { className: "toast" });
      }

      // Reset form
      setAge(
        selectedEntity.dateOfBirth
          ? calculateCurrentAge(selectedEntity.dateOfBirth)
          : "Unknown"
      );
      setHeight("");
      setWeight("");
      setHeadCircumference("");
      setDate(new Date().toISOString().split("T")[0]);
      setShowForm(false);
      setEditRecordId(null);
    } catch (error) {
      console.error("Error saving growth record:", error);
      setAlert({
        open: true,
        message: `Failed to ${editRecordId ? "update" : "add"} record.`,
      });
    }
  };

  const handleEdit = (record) => {
    if (isReadOnly) return;

    setEditRecordId(record.id);
    setAge(record.age);
    setHeight(record.heightCm.toString());
    setWeight(record.weightKg.toString());
    setHeadCircumference(record.headCircumferenceCm?.toString() || ""); // ✅ ADD
    setDate(record.recordDate);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (isReadOnly) return;
    try {
      await deleteGrowthRecord(id);
      setRecords(records.filter((rec) => rec.id !== id));
      toast.success("Record deleted", { className: "toast" });
    } catch (error) {
      console.error("Error deleting record:", error);
      setAlert({ open: true, message: "Failed to delete record." });
    }
  };

  // Prepare chart data in Shadcn format
  const chartData = records
    .slice()
    .sort((a, b) => new Date(a.recordDate) - new Date(b.recordDate))
    .map((rec) => ({
      date: new Date(rec.recordDate).toLocaleDateString(),
      height: rec.heightCm,
      weight: rec.weightKg,
      bmi: rec.bmi,
      headCircumference: rec.headCircumferenceCm,
    }));

  const chartConfig = {
    height: { label: "Height (cm)", color: "var(--color-primary)" },
    weight: { label: "Weight (kg)", color: "var(--color-secondary)" },
    bmi: { label: "BMI", color: "var(--color-accent)" },

    headCircumference: {
      label: "Head Circumference (cm)",
      color: "var(--color-warning)", 
    },
  };

  return (
    <div className="min-h-screen bg-gradient w-full">
      <div className=" mx-auto px-2 sm:px-4 md:px-6 lg:px-8 py-3 box-border">
        <Card className="mb-3 rounded-xl glass-card border border-primary shadow-soft w-full">
          <CardHeader>
            <CardTitle
              className={`text-sm sm:text-base md:text-lg font-semibold text-accent text-center ${
                isSmallScreen ? "text-base" : ""
              }`}
            >
              Growth Tracker for {selectedEntity?.name || "Child"}
            </CardTitle>
          </CardHeader>
        </Card>

        {/* VIEW-ONLY BANNER */}
        {isReadOnly && (
          <div className="bg-amber-50 border border-amber-300 text-amber-800 px-4 py-2.5 rounded-xl text-center text-sm font-medium flex items-center justify-center gap-2 mb-3">
            <Lock className="w-5 h-5" />
            <span>View Only — Editing is disabled</span>
          </div>
        )}

        {/* ADD BUTTON — HIDDEN IN READ-ONLY */}
        {!isReadOnly && !showForm && (
          <div className="flex justify-center my-3">
            <Button
              className={`button-primary text-accent text-xs sm:text-sm font-medium rounded-full px-5 py-2 shadow-soft hover:shadow-lg transition-all ${
                isSmallScreen ? "px-4 py-1.5" : ""
              }`}
              onClick={() => setShowForm(true)}
            >
              <Plus
                className={`w-4 h-4 mr-2 ${isSmallScreen ? "w-3 h-3" : ""}`}
              />
              Add Record
            </Button>
          </div>
        )}

        {/* FORM — HIDDEN IN READ-ONLY */}
        <Dialog open={showForm && !isReadOnly} onOpenChange={setShowForm}>
          <DialogContent
            className={`w-[95vw] max-w-md p-3 sm:p-4 glass-card border border-primary shadow-soft ${
              isSmallScreen ? "max-h-[80vh]" : "max-h-[90vh]"
            } overflow-y-auto`}
          >
            <DialogHeader>
              <DialogTitle
                className={`text-accent font-bold ${
                  isSmallScreen ? "text-base" : "text-lg"
                }`}
              >
                {editRecordId ? "Edit Record" : "Add Growth Record"}
              </DialogTitle>
              <DialogDescription
                className={`text-muted ${
                  isSmallScreen ? "text-xs" : "text-sm"
                }`}
              >
                {editRecordId
                  ? "Update the child's growth record by editing the fields below."
                  : "Fill out the fields below to add a new growth record for this child."}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-2">
              <div>
                <label
                  className={`text-xs sm:text-sm font-medium text-primary ${
                    isSmallScreen ? "text-xs" : ""
                  }`}
                >
                  Child
                </label>
                <Input
                  type="text"
                  value={selectedEntity?.name || ""}
                  disabled
                  className={`mt-1 bg-input text-xs sm:text-sm border border-primary text-accent w-full ${
                    isSmallScreen ? "p-2" : ""
                  }`}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <div>
                  <label
                    className={`text-xs sm:text-sm font-medium text-primary ${
                      isSmallScreen ? "text-xs" : ""
                    }`}
                  >
                    Age
                  </label>
                  <Input
                    type="text"
                    placeholder="Age (yrs, months, days)"
                    value={age}
                    disabled
                    className={`mt-1 bg-input text-xs sm:text-sm border border-primary text-accent w-full ${
                      isSmallScreen ? "p-2" : ""
                    }`}
                  />
                </div>
                <div>
                  <label
                    className={`text-xs sm:text-sm font-medium text-primary ${
                      isSmallScreen ? "text-xs" : ""
                    }`}
                  >
                    Date <span className="text-red-500">*</span>
                  </label>
                  <div
                    className={`flex items-center rounded-lg px-2 sm:px-3 mt-1 bg-input border border-primary w-full ${
                      isSmallScreen ? "p-2" : ""
                    }`}
                  >
                    <Calendar
                      className={`text-primary mr-2 ${
                        isSmallScreen ? "w-4 h-4" : "w-5 h-5"
                      }`}
                    />
                    <Input
                      type="date"
                      value={date}
                      min={selectedEntity?.dateOfBirth || undefined}
                      max={new Date().toISOString().split("T")[0]}
                      onChange={(e) => handleDateChange(e.target.value)}
                      className={`flex-1 bg-transparent p-0 text-xs sm:text-sm border-none text-accent focus:ring-0 ${
                        isSmallScreen ? "text-xs" : ""
                      }`}
                      required
                    />
                  </div>
                  {date &&
                    selectedEntity?.dateOfBirth &&
                    new Date(date) < new Date(selectedEntity.dateOfBirth) && (
                      <p className="text-red-500 text-xs mt-1 flex items-center">
                        Date cannot be before birth (
                        {new Date(
                          selectedEntity.dateOfBirth
                        ).toLocaleDateString()}
                        )
                      </p>
                    )}
                </div>

                <div>
                  <label
                    className={`text-xs sm:text-sm font-medium text-primary ${
                      isSmallScreen ? "text-xs" : ""
                    }`}
                  >
                    Height (cm)
                  </label>
                  <div
                    className={`flex items-center rounded-lg px-2 sm:px-3 mt-1 bg-input border border-primary w-full ${
                      isSmallScreen ? "p-2" : ""
                    }`}
                  >
                    <Ruler
                      className={`text-primary mr-2 ${
                        isSmallScreen ? "w-4 h-4" : "w-5 h-5"
                      }`}
                    />
                    <Input
                      type="number"
                      placeholder="Height (cm)"
                      value={height}
                      onChange={(e) => setHeight(e.target.value)}
                      className={`flex-1 bg-transparent p-0 text-xs sm:text-sm border-none text-accent focus:ring-0 ${
                        isSmallScreen ? "text-xs" : ""
                      }`}
                    />
                  </div>
                </div>

                <div>
                  <label
                    className={`text-xs sm:text-sm font-medium text-primary ${
                      isSmallScreen ? "text-xs" : ""
                    }`}
                  >
                    Weight (kg)
                  </label>
                  <div
                    className={`flex items-center rounded-lg px-2 sm:px-3 mt-1 bg-input border border-primary w-full ${
                      isSmallScreen ? "p-2" : ""
                    }`}
                  >
                    <Scale
                      className={`text-primary mr-2 ${
                        isSmallScreen ? "w-4 h-4" : "w-5 h-5"
                      }`}
                    />
                    <Input
                      type="number"
                      placeholder="Weight (kg)"
                      value={weight}
                      onChange={(e) => setWeight(e.target.value)}
                      className={`flex-1 bg-transparent p-0 text-xs sm:text-sm border-none text-accent focus:ring-0 ${
                        isSmallScreen ? "text-xs" : ""
                      }`}
                    />
                  </div>
                </div>
                <div>
                  <label className="text-xs sm:text-sm font-medium text-primary">
                    Head Circumference (cm)
                  </label>
                  <div className="flex items-center rounded-lg px-2 sm:px-3 mt-1 bg-input border border-primary w-full">
                    <Ruler className="text-primary mr-2 w-4 h-4" />
                    <Input
                      type="number"
                      placeholder="Head circumference (cm)"
                      value={headCircumference}
                      onChange={(e) => setHeadCircumference(e.target.value)}
                      className="flex-1 bg-transparent p-0 text-xs sm:text-sm border-none text-accent focus:ring-0"
                    />
                  </div>
                </div>
              </div>
            </div>

            <DialogFooter
              className={`mt-3 flex flex-col sm:flex-row gap-2 ${
                isSmallScreen ? "mt-2" : ""
              }`}
            >
              <Button
                onClick={handleSubmit}
                className={`button-primary text-accent text-xs sm:text-sm shadow-soft hover:shadow-lg transition-all ${
                  isSmallScreen ? "py-1.5" : ""
                }`}
              >
                {editRecordId ? "Update" : "Save"}
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setShowForm(false);
                  setEditRecordId(null);
                  setAge(
                    selectedEntity.dateOfBirth
                      ? calculateCurrentAge(selectedEntity.dateOfBirth)
                      : "Unknown"
                  );
                  setHeight("");
                  setWeight("");
                  setHeadCircumference("");
                  setDate(new Date().toISOString().split("T")[0]);
                }}
                className={`border-primary text-primary hover:bg-input text-xs sm:text-sm shadow-soft ${
                  isSmallScreen ? "py-1.5" : ""
                }`}
              >
                Cancel
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {records.length > 0 && (
          <div className="w-full">
            <h3
              className={`font-semibold text-accent mb-2 ${
                isSmallScreen ? "text-base" : "text-lg"
              }`}
            >
              Records ({selectedEntity?.name})
            </h3>
            <div className="overflow-x-auto rounded-lg shadow-soft w-full">
              <table className="min-w-full text-xs sm:text-sm divide-y divide-primary bg-card">
                <thead>
                  <tr className="button-primary text-accent text-center border border-primary">
                    <th className="px-2 sm:px-3 py-1 sm:py-2 whitespace-nowrap">
                      Age
                    </th>
                    <th className="px-2 sm:px-3 py-1 sm:py-2 whitespace-nowrap">
                      Height
                    </th>
                    <th className="px-2 sm:px-3 py-1 sm:py-2 whitespace-nowrap">
                      Weight
                    </th>
                    <th className="px-2 sm:px-3 py-1 sm:py-2 whitespace-nowrap">
                      Head Circ.
                    </th>
                    <th className="px-2 sm:px-3 py-1 sm:py-2 whitespace-nowrap">
                      BMI
                    </th>
                    <th className="px-2 sm:px-3 py-1 sm:py-2 whitespace-nowrap">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-primary">
                  {records.map((rec, i) => (
                    <tr
                      key={rec.id}
                      className={`${
                        i % 2 === 0 ? "bg-card" : "bg-input"
                      } text-center text-accent hover:bg-input transition-all`}
                    >
                      <td className="px-2 sm:px-3 py-1 sm:py-2 whitespace-nowrap">
                        {calculateCurrentAge(
                          rec?.subUser?.dateOfBirth,
                          rec?.recordDate
                        )}
                      </td>
                      <td className="px-2 sm:px-3 py-1 sm:py-2 whitespace-nowrap">
                        {rec.heightCm}
                      </td>
                      <td className="px-2 sm:px-3 py-1 sm:py-2 whitespace-nowrap">
                        {rec.weightKg}
                      </td>
                      <td className="px-2 sm:px-3 py-1 sm:py-2 whitespace-nowrap">
                        {rec.headCircumferenceCm ?? "-"}
                      </td>
                      <td className="px-2 sm:px-3 py-1 sm:py-2 text-accent font-semibold whitespace-nowrap">
                        {rec.bmi}
                      </td>
                      <td className="px-2 sm:px-3 py-1 sm:py-2 flex justify-center gap-2">
                        {!isReadOnly && (
                          <>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEdit(rec)}
                              className="text-primary hover:bg-input"
                            >
                              <Pencil
                                className={`text-primary ${
                                  isSmallScreen ? "w-4 h-4" : "w-5 h-5"
                                }`}
                              />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() =>
                                setAlert({
                                  open: true,
                                  message:
                                    "Are you sure you want to delete this record?",
                                  onConfirm: () => handleDelete(rec.id),
                                })
                              }
                              className="text-accent hover:bg-input"
                            >
                              <Trash2
                                className={`text-accent ${
                                  isSmallScreen ? "w-4 h-4" : "w-5 h-5"
                                }`}
                              />
                            </Button>
                          </>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Growth Trends with Three Charts */}
            <h3
              className={`font-semibold text-accent mt-3 mb-2 ${
                isSmallScreen ? "text-base" : "text-lg"
              }`}
            >
              Growth Trends
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
              {/* Height Chart */}
              <div
                className={`w-full ${
                  isSmallScreen ? "h-[220px]" : "h-[280px]"
                }`}
              >
                <ChartContainer
                  config={{ height: chartConfig.height }}
                  className="w-full h-full"
                >
                  <BarChart
                    data={chartData}
                    margin={{ top: 10, right: 10, left: -10, bottom: 10 }}
                  >
                    <CartesianGrid
                      stroke="var(--color-soft)"
                      strokeDasharray="3 3"
                    />
                    <XAxis
                      dataKey="date"
                      tickFormatter={(value) => value}
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
                      tick={{
                        fontSize: isSmallScreen ? 8 : 10,
                        fill: "var(--color-text)",
                      }}
                      tickMargin={5}
                      label={{
                        value: "Height (cm)",
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
                            chartConfig.height.label,
                          ]}
                          className="text-xs"
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
                      dataKey="height"
                      fill="var(--color-primary)"
                      radius={[4, 4, 0, 0]}
                      barSize={20}
                    />
                  </BarChart>
                </ChartContainer>
              </div>

              {/* Weight Chart */}
              <div
                className={`w-full ${
                  isSmallScreen ? "h-[220px]" : "h-[280px]"
                }`}
              >
                <ChartContainer
                  config={{ weight: chartConfig.weight }}
                  className="w-full h-full"
                >
                  <BarChart
                    data={chartData}
                    margin={{ top: 10, right: 10, left: -10, bottom: 10 }}
                  >
                    <CartesianGrid
                      stroke="var(--color-soft)"
                      strokeDasharray="3 3"
                    />
                    <XAxis
                      dataKey="date"
                      tickFormatter={(value) => value}
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
                      tick={{
                        fontSize: isSmallScreen ? 8 : 10,
                        fill: "var(--color-text)",
                      }}
                      tickMargin={5}
                      label={{
                        value: "Weight (kg)",
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
                            chartConfig.weight.label,
                          ]}
                          className="text-xs"
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
                      dataKey="weight"
                      fill="var(--color-secondary)"
                      radius={[4, 4, 0, 0]}
                      barSize={20}
                    />
                  </BarChart>
                </ChartContainer>
              </div>

              {/* Head Circumference Chart */}
              <div
                className={`w-full ${
                  isSmallScreen ? "h-[220px]" : "h-[280px]"
                }`}
              >
                <ChartContainer
                  config={{ headCircumference: chartConfig.headCircumference }}
                  className="w-full h-full"
                >
                  <BarChart
                    data={chartData}
                    margin={{ top: 10, right: 10, left: -10, bottom: 10 }}
                  >
                    <CartesianGrid
                      stroke="var(--color-soft)"
                      strokeDasharray="3 3"
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
                      tick={{
                        fontSize: isSmallScreen ? 8 : 10,
                        fill: "var(--color-text)",
                      }}
                      tickMargin={5}
                      label={{
                        value: "Head Circ. (cm)",
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
                          formatter={(value) => [
                            value,
                            chartConfig.headCircumference.label,
                          ]}
                          className="text-xs"
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
                      dataKey="headCircumference"
                      fill="var(--color-info)"
                      radius={[4, 4, 0, 0]}
                      barSize={20}
                    />
                  </BarChart>
                </ChartContainer>
              </div>

              {/* BMI Chart */}
              <div
                className={`w-full ${
                  isSmallScreen ? "h-[220px]" : "h-[280px]"
                }`}
              >
                <ChartContainer
                  config={{ bmi: chartConfig.bmi }}
                  className="w-full h-full"
                >
                  <BarChart
                    data={chartData}
                    margin={{ top: 10, right: 10, left: -10, bottom: 10 }}
                  >
                    <CartesianGrid
                      stroke="var(--color-soft)"
                      strokeDasharray="3 3"
                    />
                    <XAxis
                      dataKey="date"
                      tickFormatter={(value) => value}
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
                      tick={{
                        fontSize: isSmallScreen ? 8 : 10,
                        fill: "var(--color-text)",
                      }}
                      tickMargin={5}
                      label={{
                        value: "BMI",
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
                            chartConfig.bmi.label,
                          ]}
                          className="text-xs"
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
                      dataKey="bmi"
                      fill="var(--color-accent)"
                      radius={[4, 4, 0, 0]}
                      barSize={20}
                    />
                  </BarChart>
                </ChartContainer>
              </div>
            </div>
          </div>
        )}

        <AlertDialog
          open={alert.open}
          onOpenChange={() => setAlert({ ...alert, open: false })}
        >
          <AlertDialogContent
            className={`w-[90vw] max-w-sm glass-card border border-primary shadow-soft ${
              isSmallScreen ? "p-3" : "p-4"
            }`}
          >
            <AlertDialogHeader>
              <AlertDialogTitle
                className={`text-accent ${
                  isSmallScreen ? "text-base" : "text-lg"
                }`}
              >
                {alert.onConfirm ? "Confirm" : "Notice"}
              </AlertDialogTitle>
              <AlertDialogDescription
                className={`text-muted ${
                  isSmallScreen ? "text-xs" : "text-sm"
                }`}
              >
                {alert.message}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter
              className={`flex flex-col sm:flex-row gap-2 ${
                isSmallScreen ? "mt-2" : "mt-3"
              }`}
            >
              {alert.onConfirm ? (
                <>
                  <AlertDialogCancel
                    onClick={() => setAlert({ ...alert, open: false })}
                    className={`border-primary text-primary hover:bg-input text-xs sm:text-sm shadow-soft ${
                      isSmallScreen ? "py-1.5" : ""
                    }`}
                  >
                    Cancel
                  </AlertDialogCancel>
                  <AlertDialogAction
                    onClick={() => {
                      alert.onConfirm();
                      setAlert({ ...alert, open: false });
                    }}
                    className={`button-primary text-accent text-xs sm:text-sm shadow-soft hover:shadow-lg transition-all ${
                      isSmallScreen ? "py-1.5" : ""
                    }`}
                  >
                    Confirm
                  </AlertDialogAction>
                </>
              ) : (
                <AlertDialogAction
                  onClick={() => setAlert({ ...alert, open: false })}
                  className={`button-primary text-accent text-xs sm:text-sm shadow-soft hover:shadow-lg transition-all ${
                    isSmallScreen ? "py-1.5" : ""
                  }`}
                >
                  OK
                </AlertDialogAction>
              )}
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
};

export default GrowthTracker;
