import prisma from "../lib/prisma.js";

export const getJobs = async (req,res) => {
    try {
        const jobs = await prisma.job.findMany({
            include:{
                user:{
                    select:{ id: true, name: true, email: true }
                }
            },
            orderBy: { appliedAt: 'desc' }
        });
        res.json({success: true, data: jobs });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const createJob = async (req,res) => {
    try {
        const { company, position, location, salary, notes, userId  } = req.body;
        const newJob = await prisma.job.create({
            data: {
                company,
                position,
                location,
                salary,
                notes,
                userId: Number(userId)
            }
        });
        res.status(201).json ({ success: true, data: newJob });
    } catch (error) {
        res.status(400).json ({ success: false, message: error.message });
    }
};