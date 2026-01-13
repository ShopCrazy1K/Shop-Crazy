import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { sendCounterNoticeReceivedEmail } from "@/lib/email";

const counterNoticeSchema = z.object({
  complaintId: z.string(),
  respondentName: z.string().min(1, "Name is required"),
  respondentEmail: z.string().email("Valid email is required"),
  respondentPhone: z.string().optional(),
  respondentAddress: z.string().min(1, "Physical address is required"),
  statement: z.string().min(1, "Statement is required"),
  goodFaithStatement: z.string().min(1, "Good faith statement is required"),
  consentToJurisdiction: z.string().min(1, "Consent to jurisdiction is required"),
  electronicSignature: z.string().min(1, "Electronic signature is required"),
});

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }
    
    const body = await req.json();
    const data = counterNoticeSchema.parse(body);
    
    // Verify complaint exists and get listing
    const complaint = await prisma.dMCAComplaint.findUnique({
      where: { id: data.complaintId },
      include: { listing: true },
    });
    
    if (!complaint) {
      return NextResponse.json(
        { error: "DMCA complaint not found" },
        { status: 404 }
      );
    }
    
    // Verify user owns the listing
    if (complaint.listing.sellerId !== session.user.id) {
      return NextResponse.json(
        { error: "Unauthorized - you do not own this listing" },
        { status: 403 }
      );
    }
    
    // Check if counter-notice already exists
    const existingCounterNotice = await prisma.counterNotice.findUnique({
      where: { complaintId: data.complaintId },
    });
    
    if (existingCounterNotice) {
      return NextResponse.json(
        { error: "Counter-notice already submitted for this complaint" },
        { status: 400 }
      );
    }
    
    // Create counter-notice
    const counterNotice = await prisma.counterNotice.create({
      data: {
        complaintId: data.complaintId,
        listingId: complaint.listingId,
        sellerId: session.user.id,
        respondentName: data.respondentName,
        respondentEmail: data.respondentEmail,
        respondentPhone: data.respondentPhone,
        respondentAddress: data.respondentAddress,
        statement: data.statement,
        goodFaithStatement: data.goodFaithStatement,
        consentToJurisdiction: data.consentToJurisdiction,
        electronicSignature: data.electronicSignature,
        status: "PENDING",
      },
    });
    
    // Update complaint status
    await prisma.dMCAComplaint.update({
      where: { id: data.complaintId },
      data: {
        status: "COUNTER_NOTICED",
      },
    });
    
    // Restore listing (pending admin review)
    await prisma.listing.update({
      where: { id: complaint.listingId },
      data: {
        copyrightStatus: "FLAGGED", // Still flagged until admin reviews
      },
    });
    
    // Send email notification to seller
    await sendCounterNoticeReceivedEmail(
      data.respondentEmail,
      counterNotice.id,
      complaint.listing.title
    ).catch(err => console.error("Failed to send counter-notice email:", err));
    
    return NextResponse.json({
      success: true,
      counterNoticeId: counterNotice.id,
      message: "Counter-notice submitted successfully. Your listing will be reviewed by an administrator.",
    });
  } catch (error) {
    console.error("Counter-notice error:", error);
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation error", details: error.errors },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: "Failed to submit counter-notice" },
      { status: 500 }
    );
  }
}
