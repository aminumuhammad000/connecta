import { Request, Response } from "express";
import Job from "../models/Job.model";

export const getMatchedGigs = async (req: Request, res: Response) => {
  try {
    const { skills, category } = req.body;

    // Example matching logic (adjust to your schema)
    const gigs = await Job.find({
      $or: [
        { skills: { $in: skills || [] } },
        { category: { $regex: category || "", $options: "i" } },
      ],
    }).limit(10);

    res.status(200).json({
      success: true,
      message: "Matched gigs retrieved successfully",
      data: gigs,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch matched gigs",
    });
  }
};
