import profileRoutes from "./profile.routes";
import gigsRoutes from "./gigs.routes";
import proposalRoutes from "./proposal.routes";
import messageRoutes from "./message.routes";
import insightsRoutes from "./insights.routes";
import supportRoutes from "./support.routes";

router.use("/profile", profileRoutes);
router.use("/jobs", gigsRoutes);
router.use("/proposals", proposalRoutes);
router.use("/messages", messageRoutes);
router.use("/analytics", insightsRoutes);
router.use("/support", supportRoutes);
