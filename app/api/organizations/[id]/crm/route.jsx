import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { checkAuth } from "@/utils/checkAuth";

export async function GET(req, { params }) {
   const { id: organizationId } = params;
   
   // Check authentication first
   const userId = await checkAuth();
   if (userId instanceof NextResponse) {
      return userId; // Return the unauthorized response
   }

   try {
      const contacts = await prisma.contact.findMany({
         where: { organizationId },
         orderBy: { createdAt: 'desc' } // Optional: sort by most recently created
      });

      return NextResponse.json(contacts, { status: 200 });
   } catch (error) {
      console.error('Error fetching contacts:', error);
      return NextResponse.json({ error: "Failed to fetch contacts" }, { status: 500 });
   }
}

export async function POST(req, { params }) {
   const { id: organizationId } = params;
   const body = await req.json();
   
   // Check authentication first
   const userId = await checkAuth();
   if (userId instanceof NextResponse) {
      return userId; // Return the unauthorized response
   }

   try {
      const contact = await prisma.contact.create({
         data: { 
            ...body, 
            organizationId,
            // You might want to add additional validation or default values
            createdAt: new Date() 
         },
      });

      return NextResponse.json(contact, { status: 201 });
   } catch (error) {
      console.error('Error creating contact:', error);
      return NextResponse.json({ error: "Failed to create contact" }, { status: 500 });
   }
}