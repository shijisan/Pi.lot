// API for managing tasks at /api/organizations/[id]/task/route.jsx and /api/organizations/[id]/task/[taskId]/route.jsx

import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// GET all tasks for an organization and POST a new task
export async function GET(req, { params }) {
   const { id: organizationId } = await params;
   try {
      const tasks = await prisma.task.findMany({
         where: { organizationId },
         include: { assignedTo: true },
      });
      return NextResponse.json(tasks);
   } catch (error) {
      return NextResponse.json({ error: "Failed to fetch tasks" }, { status: 500 });
   }
}

export async function POST(req, { params }) {
   const { id: organizationId } = await params;
   const { title, description, status, dueDate, priority, assignedToId } = await req.json();
   
   // Validate input data
   if (!title || !description || !status || !priority || !assignedToId) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
   }
   
   try {
      const newTask = await prisma.task.create({
         data: {
            title,
            description,
            status, // Ensure this is a valid status
            dueDate: dueDate ? new Date(dueDate) : null, // Optional, based on schema
            priority, // Ensure this is a valid priority
            assignedToId: assignedToId || null, // Default to null if not assigned
            organizationId,
         },
      });
      return NextResponse.json(newTask, { status: 201 });
   } catch (error) {
      console.error(error); // Log error for debugging
      return NextResponse.json({ error: "Failed to create task" }, { status: 500 });
   }
}
