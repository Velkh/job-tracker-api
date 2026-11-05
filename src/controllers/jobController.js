import { success } from "zod";
import prisma from "../lib/prisma.js";
import { stat } from "node:fs";

export const getJobs = async (req, res, next) => {
    try {
        const userId = req.user?.userId;
        const { page = 1, limit = 11, status, search, sortBy = 'appliedAt', order = 'desc' } = req.query;

        const skip = (Number(page) - 1) * Number(limit);
        const take = Number(limit);

        const where = {
            ...(userId && { userId: Number(userId)}),
            ...(status && {status}),
            ...(search &&{
                OR: [
                    { company: {contains: search}},
                    { position: {contains: search}}
                ]
            })
        };

        const [job, total] = await Promise.all([
            prisma.job.findMany({
                where,
                skip,
                take,
                orderBy: { [sortBy]: order },
                include: {
                    user: {
                        select: { id: true, name: true, email: true }
                    }
                }
            }),
            prisma.job.count ({ where })
        ]);
        res.json ({ success: true, data: job, pagination: {
            page: Number(page),
            limit: Number(limit),
            total,
            totalPages: Math.ceil(total / take)
        } 
    });

    } catch (error) {
        next ? next(error) : res.status(500).json({ success: false, message: error.message });
    }
}

export const getJobById = async (req, res, next) => {
    try {
        const { id } = req.params;
        const userId = req.user?.userId;

        const jobs = await prisma.job.findUnique({
            where : { id: Number(id)},
            include:{
                user:{
                    select:{ id: true, name: true, email: true }
                }
            },
        });

        if (!jobs) {
            return res.status(404).json ({ success: false, message:"Job Not Found" });
        }

        if (userId && jobs.userId != userId) {
            return res.status(403).json({ success: false, message: "Access Forbidden" })
        }

        res.json({success: true, data: jobs });
    } catch (error) {
        next ? next(error) : res.status(500).json({ success: false, message: error.message });
    }
};

export const createJob = async (req, res, next) => {
    try {
        const { company, position, status, location, salary, notes, appliedAt } = req.body;
        
        const targetUserId = req.user?.userId || req.body.userId;

        if (!targetUserId) {
            return res.status(400).json({ success: false, message: "User ID is required" });
        }

        const newJob = await prisma.job.create({
            data: {
                company,
                position,
                status: status || "APPLIED",
                location,
                salary,
                notes,
                appliedAt: appliedAt ? new Date(appliedAt) : undefined,
                userId: Number(targetUserId)
            }
        });

        res.status(201).json({ success: true, data: newJob });
    } catch (error) {
        next ? next(error) : res.status(400).json({ success: false, message: error.message });
    }
};

export const updateJob = async (req, res, next) => {
    try {
        const { id } = req.params;
        const userId = req.user?.userId;
        const { company, position, status, location, salary, notes, appliedAt } = req.body;

        const existingJob = await prisma.job.findUnique({ where: {id: Number(id)} });
        if (!existingJob) {
            return res.status(404).json({ success: false, message: "Job Not Found" })
        }
        if (userId && existingJob.userId !== userId) {
            return res.status(403).json ({ success: false, message: "Access Forbidden" })
        }

        const updatedJob = await  prisma.job.update({
            where: { id: Number(id) },
            data:{
                company,
                position,
                status,
                location,
                salary,
                notes,
                appliedAt: appliedAt ? new Date(appliedAt) : undefined
            }
        });
        res.json({  success: true, data: updatedJob})
    } catch (error) {
        next ? next(error) : res.status(400).json ({ success: false, message: error.message })
    }
};

export const updateJobStatus = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { status } = req.body;
        const userId = req.user?.userId;

        const existingJob = await prisma.job.findUnique({ where: {id: Number(id)} });
        
        if (!existingJob) {
            return res.status(404).json({ success: false, message: "Job Not Found" })
        }
        if (userId && existingJob.userId !== userId) {
            return res.status(403).json({ success: false, message: "Access Forbidden" })
        }
        const updatedJob = await prisma.job.update({
            where:{ id: Number(id) },
            data: {status}
        });

        res.json({ success: true, data: updatedJob });
    } catch (error) {
        next ? next(error) : res.status(400).json({ success: false, message: error.message })
    }
}

export const deleteJob = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user?.userId;

    const existingJob = await prisma.job.findUnique({ where: { id: Number(id) } });

    if (!existingJob) {
      return res.status(404).json({ success: false, message: "Job not found" });
    }

    if (userId && existingJob.userId !== userId) {
      return res.status(403).json({ success: false, message: "Access forbidden" });
    }

    await prisma.job.delete({ where: { id: Number(id) } });

    res.json({ success: true, message: "Job application deleted successfully" });
  } catch (error) {
    next ? next(error) : res.status(500).json({ success: false, message: error.message });
  }
};

export const getSummaryStats = async (req, res, next) => {
  try {
    const userId = req.user?.userId;

    const stats = await prisma.job.groupBy({
      by: ['status'],
      where: { ...(userId && { userId: Number(userId) }) },
      _count: { status: true }
    });

    const summary = stats.reduce((acc, curr) => {
      acc[curr.status] = curr._count.status;
      return acc;
    }, {});

    res.json({ success: true, data: summary });
  } catch (error) {
    next ? next(error) : res.status(500).json({ success: false, message: error.message });
  }
};