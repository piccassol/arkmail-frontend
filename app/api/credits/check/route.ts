import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function GET() {
  const { userId } = auth();
  if (!userId) return NextResponse.json({ credits: 0, canAccess: false });

  const user = await prisma.user.findUnique({
    where: { clerkId: userId },
    select: { credits: true },
  });

  const credits = user?.credits ?? 0;
  const canAccess = credits > 0 || credits === 999999; // 999999 = unlimited

  return NextResponse.json({ credits, canAccess });
}
