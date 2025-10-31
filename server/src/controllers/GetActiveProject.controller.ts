// import Project from "../models/Project.model";

// export const getActiveProjects = async (req: Request, res: Response) => {
//   try {
//     const projects = await Project.find({ user: req.query.userId, status: "active" });
//     res.json({ success: true, data: projects });
//   } catch (err) {
//     res.status(500).json({ success: false, message: err.message });
//   }
// };
