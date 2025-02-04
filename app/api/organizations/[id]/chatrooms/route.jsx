export async function GET() {
   const userId = await checkAuth();
 
   if (userId instanceof NextResponse) {
     return userId;
   }
 
   try {
     // Fetch organizations where user is a member but not the owner
     const memberOrganizations = await prisma.organizationUser.findMany({
       where: {
         userId: userId,
         organization: {
           ownerId: {
             not: userId // Exclude organizations where user is owner
           }
         }
       },
       include: {
         organization: { // Ensure this relationship is included
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
 
     return NextResponse.json({ organizations: memberOrganizations });
   } catch (err) {
     console.error('Error fetching member organizations:', err);
     return NextResponse.json(
       { error: 'Internal Server Error' },
       { status: 500 }
     );
   }
 }
 