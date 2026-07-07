// utils/activityLogger.js
import api from "@/api/base";

export const logActivity = async ({
  user,
  path,
  selectedEntity,
  purpose = "page_view",
}) => {
  if (!user) return;

  try {
    await api.post("/user-activity", {
      userCode: user.userCode,
      role: user.role,
      module: path.replace("/", ""), // e.g. growth-tracker
      purpose,
      entityId: selectedEntity?.subUserId || null,
    });
  } catch (err) {
    console.warn("Activity log failed", err);
  }
};
