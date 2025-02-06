import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";


// API for specific task actions at /api/organizations/[id]/task/[taskId]/route.jsx

export async function GET(req, { params }) {
   const { taskId } = params;
   try {
      const task = await prisma.task.findUnique({
         where: { id: taskId },
         include: { assignedTo: true },
      });
      if (!task) return NextResponse.json({ error: "Task not found" }, { status: 404 });
      return NextResponse.json(task);
   } catch (error) {
      return NextResponse.json({ error: "Failed to fetch task" }, { status: 500 });
   }
}

export async function PATCH(req, { params }) {
   const { taskId } = params;
   const { title, description, status, dueDate, priority, assignedToId } = await req.json();
   
   try {
      const updatedTask = await prisma.task.update({
         where: { id: taskId },
         data: {
            title,
            description,
            status,
            dueDate: dueDate ? new Date(dueDate) : null, // Handle empty dates properly
            priority,
            assignedToId,
         },
      });
      return NextResponse.json(updatedTask);  // Return the updated task
   } catch (error) {
      return NextResponse.json({ error: "Failed to update task" }, { status: 500 });
   }
}

export async function DELETE(req, { params }) {
   const { taskId } = params;
   try {
      await prisma.task.delete({ where: { id: taskId } });
      return NextResponse.json({ message: "Task deleted" });
   } catch (error) {
      return NextResponse.json({ error: "Failed to delete task" }, { status: 500 });
   }
}
