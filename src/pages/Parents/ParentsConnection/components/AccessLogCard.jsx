import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Info } from "lucide-react";

const AccessLogCard = ({ log }) => {
  const [isSmallScreen, setIsSmallScreen] = useState(false);

  useEffect(() => {
    const checkDevice = () => setIsSmallScreen(window.innerHeight < 600);
    checkDevice();
    window.addEventListener("resize", checkDevice);
    return () => window.removeEventListener("resize", checkDevice);
  }, []);

  const actorName = log.doctor?.name || log.parent?.name || "Unknown";

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }}>
      <Card className={`glass-card border border-primary rounded-lg shadow-soft ${isSmallScreen ? "p-1.5" : "p-2"}`}>
        <CardContent className={`p-2 flex items-start justify-between ${isSmallScreen ? "p-1.5" : ""}`}>
          <div className="flex-1 min-w-0">
            <h3 className={`font-semibold text-text text-sm truncate ${isSmallScreen ? "text-xs" : ""}`}>
              {log.subUser?.name || "Unknown Patient"}
            </h3>
            <p className={`text-muted mt-1 ${isSmallScreen ? "text-xs" : "text-sm"}`}>
              <span className="font-medium">Action:</span> {log.action} by {actorName}
            </p>
            <p className={`text-muted mt-1 ${isSmallScreen ? "text-xs" : "text-sm"}`}>
              {new Date(log.accessedAt).toLocaleString()}
            </p>
          </div>
          <Info className={`text-muted ml-1.5 mt-0.5 shrink-0 ${isSmallScreen ? "w-3 h-3" : "w-4 h-4"}`} />
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default AccessLogCard;