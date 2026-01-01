import { NextResponse } from "next/server";
import { createUser, getUserByEmail } from "@/lib/auth";
import { processReferral, generateReferralCode } from "@/lib/referrals";

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    const { email, username, password, referralCode } = await req.json();

    // Validation
    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required" },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: "Password must be at least 6 characters" },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existingUser = await getUserByEmail(email);
    if (existingUser) {
      return NextResponse.json(
        { error: "User with this email already exists" },
        { status: 400 }
      );
    }

    // Create user
    const user = await createUser({
      email,
      username,
      password,
    });

    // Process referral if code provided
    if (referralCode && typeof referralCode === "string") {
      try {
        const referralResult = await processReferral(user.id, referralCode);
        if (referralResult.success) {
          console.log(`[SIGNUP] Referral processed for new user ${user.id}`);
        } else {
          console.log(`[SIGNUP] Referral processing failed: ${referralResult.error}`);
          // Don't fail signup if referral fails
        }
      } catch (referralError) {
        console.error("[SIGNUP] Error processing referral:", referralError);
        // Don't fail signup if referral fails
      }
    }

    // Generate referral code for the new user
    try {
      await generateReferralCode(user.id);
    } catch (codeError) {
      console.error("[SIGNUP] Error generating referral code:", codeError);
      // Don't fail signup if code generation fails
    }

    return NextResponse.json({
      success: true,
      user,
      message: "Account created successfully",
    });
  } catch (error: any) {
    console.error("Signup error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to create account" },
      { status: 500 }
    );
  }
}

