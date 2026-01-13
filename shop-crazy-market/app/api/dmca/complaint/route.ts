import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { checkBannedWords, DEFAULT_BANNED_WORDS } from "@/lib/banned-words";
import {
  sendDMCAComplaintReceivedEmail,
  sendDMCAComplaintFiledToSellerEmail,
} from "@/lib/email";

const dmcaComplaintSchema = z.object({
  listingId: z.string(),
  complainantName: z.string().min(1, "Name is required"),
  complainantEmail: z.string().email("Valid email is required"),
  complainantPhone: z.string().optional(),
  complainantAddress: z.string().min(1, "Physical address is required"),
  copyrightOwnerName: z.string().min(1, "Copyright owner name is required"),
  copyrightOwnerEmail: z.string().email().optional(),
  copyrightedWork: z.string().min(1, "Description of copyrighted work is required"),
  infringingWork: z.string().min(1, "Description of infringing material is required"),
  locationOfInfringement: z.string().min(1, "Location of infringement is required"),
  goodFaithStatement: z.string().min(1, "Good faith statement is required"),
  electronicSignature: z.string().min(1, "Electronic signature is required"),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const data = dmcaComplaintSchema.parse(body);
    
    // Verify listing exists
    const listing = await prisma.listing.findUnique({
      where: { id: data.listingId },
      include: { seller: true },
    });
    
    if (!listing) {
      return NextResponse.json(
        { error: "Listing not found" },
        { status: 404 }
      );
    }
    
    // Check for auto-flag words in the complaint
    const complaintText = [
      data.copyrightedWork,
      data.infringingWork,
      listing.title,
      listing.description,
    ].join(" ");
    
    const flaggedWords = checkBannedWords(complaintText, DEFAULT_BANNED_WORDS);
    const autoFlagged = flaggedWords.length > 0;
    
    // Create DMCA complaint
    const complaint = await prisma.dMCAComplaint.create({
      data: {
        listingId: data.listingId,
        complainantName: data.complainantName,
        complainantEmail: data.complainantEmail,
        complainantPhone: data.complainantPhone,
        complainantAddress: data.complainantAddress,
        copyrightOwnerName: data.copyrightOwnerName,
        copyrightOwnerEmail: data.copyrightOwnerEmail,
        copyrightedWork: data.copyrightedWork,
        infringingWork: data.infringingWork,
        locationOfInfringement: data.locationOfInfringement,
        goodFaithStatement: data.goodFaithStatement,
        electronicSignature: data.electronicSignature,
        status: autoFlagged ? "VALID" : "PENDING", // Auto-approve if flagged words found
        autoFlagged,
        flaggedWords: flaggedWords.map(w => w.word),
      },
    });
    
    // Auto-hide listing if valid complaint
    if (autoFlagged || complaint.status === "VALID") {
      await prisma.listing.update({
        where: { id: data.listingId },
        data: {
          copyrightStatus: "DMCA_COMPLAINT",
          isActive: false,
        },
      });
    } else {
      // Flag the listing
      await prisma.listing.update({
        where: { id: data.listingId },
        data: {
          copyrightStatus: "FLAGGED",
        },
      });
    }
    
    // Send email notifications
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://shopcrazymarket.com";
    const counterNoticeUrl = `${siteUrl}/dmca/counter-notice?complaintId=${complaint.id}&listingId=${data.listingId}`;
    
    // Email to complainant
    await sendDMCAComplaintReceivedEmail(
      data.complainantEmail,
      complaint.id,
      listing.title
    ).catch(err => console.error("Failed to send complainant email:", err));
    
    // Email to seller
    await sendDMCAComplaintFiledToSellerEmail(
      listing.seller.email,
      complaint.id,
      listing.title,
      counterNoticeUrl
    ).catch(err => console.error("Failed to send seller email:", err));
    
    return NextResponse.json({
      success: true,
      complaintId: complaint.id,
      message: "DMCA complaint submitted successfully. The listing has been flagged for review.",
    });
  } catch (error) {
    console.error("DMCA complaint error:", error);
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation error", details: error.issues },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: "Failed to submit DMCA complaint" },
      { status: 500 }
    );
  }
}
