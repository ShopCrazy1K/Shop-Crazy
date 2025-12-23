import Stripe from "stripe";
import { NextResponse } from "next/server";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2023-10-16",
});

export async function POST(
  request: Request,
  { params }: { params: Promise<{ disputeId: string }> }
) {
  try {
    const { action } = await request.json();
    const { disputeId } = await params;

    if (action === "accept") {
      // Accept the dispute (lose the dispute)
      await stripe.disputes.update(disputeId, {
        metadata: {
          action: "accepted",
          acceptedAt: new Date().toISOString(),
        },
      });

      return NextResponse.json({
        success: true,
        message: "Dispute accepted",
      });
    } else if (action === "contest") {
      // Contest the dispute
      await stripe.disputes.update(disputeId, {
        evidence: {
          customer_communication: "We have provided all necessary documentation.",
        },
        metadata: {
          action: "contested",
          contestedAt: new Date().toISOString(),
        },
      });

      return NextResponse.json({
        success: true,
        message: "Dispute contested",
      });
    } else {
      return NextResponse.json(
        { error: "Invalid action. Use 'accept' or 'contest'" },
        { status: 400 }
      );
    }
  } catch (error: any) {
    console.error("Error handling dispute:", error);
    return NextResponse.json(
      { error: error.message || "Failed to handle dispute" },
      { status: 500 }
    );
  }
}

