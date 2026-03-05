import { NextApiRequest, NextApiResponse } from 'next';
import { updateUserPassword } from '../../lib/userService';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  const { userId, currentPassword, newPassword } = req.body;
  if (!userId || !currentPassword || !newPassword) {
    return res.status(400).json({ error: 'Missing required fields' });
  }
  try {
    const result = await updateUserPassword(userId, currentPassword, newPassword);
    if (result.success) {
      return res.status(200).json({ success: true });
    } else {
      return res.status(401).json({ success: false, error: result.error });
    }
  } catch (err) {
    console.error('Password update error:', err);
    return res.status(500).json({ error: 'Server error' });
  }
}
