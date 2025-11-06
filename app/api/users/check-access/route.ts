import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function GET() {
  const { userId } = auth();

  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const user = await prisma.user.findUnique({ where: { clerkId: userId } });
  if (!user) {
    return NextResponse.json({ canAccess: false, reason: 'User not found' });
  }

  const now = new Date();
  const trialActive = user.trialEndsAt && new Date(user.trialEndsAt) > now;
  const paidActive = ['active', 'trialing'].includes(user.subscriptionStatus);

  const canAccess = user.hasPaymentMethod && (trialActive || paidActive);

  return NextResponse.json({ canAccess });
}
