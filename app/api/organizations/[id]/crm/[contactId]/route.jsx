import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { checkAuth } from "@/utils/checkAuth";

export async function PATCH(req, { params }) {
   const { contactId } = params;
   const body = await req.json();

   // Check authentication first
   const userId = await checkAuth();
   if (userId instanceof NextResponse) {
      return userId; // Return the unauthorized response
   }

   try {
      const updatedContact = await prisma.contact.update({
         where: { id: contactId },
         data: {
            ...body,
            // Optional: track last updated time
            updatedAt: new Date()
         },
      });

      return NextResponse.json(updatedContact, { status: 200 });
   } catch (error) {
      console.error('Error updating contact:', error);
      return NextResponse.json({ error: "Failed to update contact" }, { status: 500 });
   }
}

export async function DELETE(req, { params }) {
   const { contactId } = params;

   // Check authentication first
   const userId = await checkAuth();
   if (userId instanceof NextResponse) {
      return userId; // Return the unauthorized response
   }

   try {
      await prisma.contact.delete({ where: { id: contactId } });

      return NextResponse.json({ message: "Deleted successfully" }, { status: 200 });
   } catch (error) {
      console.error('Error deleting contact:', error);
      return NextResponse.json({ error: "Failed to delete contact" }, { status: 500 });
   }
}