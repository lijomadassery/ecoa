import { prisma } from '../lib/prisma';



async function updateProfilePictures() {
  try {
    // Get all users
    const users = await prisma.user.findMany();
    
    console.log(`Found ${users.length} users to update`);

    // Update each user with a profile picture
    for (const user of users) {
      const profilePicture = `https://ui-avatars.com/api/?name=${user.firstName}+${user.lastName}&background=1976D2&color=fff&size=128`;
      
      await prisma.user.update({
        where: { id: user.id },
        data: { profilePicture }
      });

      console.log(`Updated profile picture for ${user.firstName} ${user.lastName}`);
    }

    console.log('Successfully updated all user profile pictures');
  } catch (error) {
    console.error('Error updating profile pictures:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the update
updateProfilePictures(); 