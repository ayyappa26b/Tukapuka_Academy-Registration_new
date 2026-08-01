// src/app/api/academy/register/status/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const email = req.nextUrl.searchParams.get("email")?.trim().toLowerCase();
  if (!email) {
    return NextResponse.json({ error: "Email is required" }, { status: 400 });
  }

  // Most recent tenant registered with this contact email.
  const tenant = await prisma.tenant.findFirst({
    where: { contactEmail: email },
    orderBy: { createdAt: "desc" },
    select: {
      name: true,
      reviewStatus: true,
      rejectionReason: true,
    },
  });

  if (!tenant) {
    return NextResponse.json(
      { error: "No registration found for that email" },
      { status: 404 }
    );
  }

  return NextResponse.json({
    academyName: tenant.name,
    reviewStatus: tenant.reviewStatus,
    rejectionReason: tenant.rejectionReason,
  });
}
