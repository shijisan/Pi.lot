import { checkAuth } from "@/utils/checkAuth";
import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

// New route for /api/organizations/members
export async function GET() {
   const userId = await checkAuth();
 
   if (userId instanceof NextResponse) {
     return userId;
   }
 
   try {
     // Fetch organizations where user is a member
     const allMemberOrganizations = await prisma.organizationUser.findMany({
       where: {
         userId: userId
       },
       include: {
         organization: {
           include: {
             users: {
               select: {
                 role: true,
                 user: {
                   select: {
                     fullName: true,
                     email: true
                   }
                 }
               }
             }
           }
         }
       }
     });
 
     return NextResponse.json({ organizations: allMemberOrganizations });
   } catch (err) {
     console.error('Error fetching all member organizations:', err);
     return NextResponse.json(
       { error: 'Internal Server Error' },
       { status: 500 }
     );
   }
 }
 