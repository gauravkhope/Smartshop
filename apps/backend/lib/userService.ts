import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

export async function verifyUserPassword(userId: string, password: string): Promise<boolean> {
  // Support email as userId
  const user = await prisma.user.findUnique({ where: { email: userId } });
  if (!user || !user.password) {
    // Throw error for user not found
    throw new Error('You have entered wrong Password');
  }
  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    // Throw error for wrong password
    throw new Error('You have entered wrong Password');
  }
  return true;
}

export async function updateUserPassword(userId: string, currentPassword: string, newPassword: string): Promise<{ success: boolean; error?: string }> {
  // Support email as userId
  const user = await prisma.user.findUnique({ where: { email: userId } });
  if (!user || !user.password) {
    return { success: false, error: 'User not found' };
  }
  const isMatch = await bcrypt.compare(currentPassword, user.password);
  if (!isMatch) {
    return { success: false, error: 'Current password is incorrect' };
  }
  const hashedPassword = await bcrypt.hash(newPassword, 10);
  await prisma.user.update({
    where: { email: userId },
    data: { password: hashedPassword },
  });
  return { success: true };
}
