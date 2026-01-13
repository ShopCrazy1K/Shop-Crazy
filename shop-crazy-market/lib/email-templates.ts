/**
 * Email templates for DMCA and copyright/IP notifications
 * These templates are ready to use with your email service provider
 */

export interface EmailTemplate {
  subject: string;
  html: string;
  text: string;
}

/**
 * DMCA Complaint Received - Sent to complainant
 */
export function dmcaComplaintReceivedTemplate(complaintId: string, listingTitle: string): EmailTemplate {
  return {
    subject: "DMCA Complaint Received - Shop Crazy Market",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>DMCA Complaint Received</h2>
        <p>Thank you for submitting your DMCA complaint. We have received your complaint and will review it promptly.</p>
        
        <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;">
          <p><strong>Complaint ID:</strong> ${complaintId}</p>
          <p><strong>Listing:</strong> ${listingTitle}</p>
        </div>
        
        <p>We will review your complaint and take appropriate action in accordance with our DMCA policy. You will receive an update once the review is complete.</p>
        
        <p>If you have any questions, please contact us at dmca@shopcrazymarket.com</p>
        
        <hr style="margin: 30px 0; border: none; border-top: 1px solid #ddd;" />
        <p style="color: #666; font-size: 12px;">
          This is an automated message. Please do not reply to this email.
        </p>
      </div>
    `,
    text: `
DMCA Complaint Received

Thank you for submitting your DMCA complaint. We have received your complaint and will review it promptly.

Complaint ID: ${complaintId}
Listing: ${listingTitle}

We will review your complaint and take appropriate action in accordance with our DMCA policy. You will receive an update once the review is complete.

If you have any questions, please contact us at dmca@shopcrazymarket.com
    `,
  };
}

/**
 * DMCA Complaint Validated - Sent to complainant
 */
export function dmcaComplaintValidatedTemplate(complaintId: string, listingTitle: string): EmailTemplate {
  return {
    subject: "DMCA Complaint Validated - Shop Crazy Market",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>DMCA Complaint Validated</h2>
        <p>Your DMCA complaint has been reviewed and validated by our team.</p>
        
        <div style="background-color: #e8f5e9; padding: 15px; border-radius: 5px; margin: 20px 0;">
          <p><strong>Complaint ID:</strong> ${complaintId}</p>
          <p><strong>Listing:</strong> ${listingTitle}</p>
          <p><strong>Status:</strong> Validated</p>
        </div>
        
        <p>The listing has been disabled and removed from public view. The seller has been notified and may submit a counter-notice if they believe the complaint was filed in error.</p>
        
        <p>If you have any questions, please contact us at dmca@shopcrazymarket.com</p>
        
        <hr style="margin: 30px 0; border: none; border-top: 1px solid #ddd;" />
        <p style="color: #666; font-size: 12px;">
          This is an automated message. Please do not reply to this email.
        </p>
      </div>
    `,
    text: `
DMCA Complaint Validated

Your DMCA complaint has been reviewed and validated by our team.

Complaint ID: ${complaintId}
Listing: ${listingTitle}
Status: Validated

The listing has been disabled and removed from public view. The seller has been notified and may submit a counter-notice if they believe the complaint was filed in error.

If you have any questions, please contact us at dmca@shopcrazymarket.com
    `,
  };
}

/**
 * DMCA Complaint Filed - Sent to seller
 */
export function dmcaComplaintFiledToSellerTemplate(complaintId: string, listingTitle: string, counterNoticeUrl: string): EmailTemplate {
  return {
    subject: "DMCA Complaint Filed Against Your Listing - Shop Crazy Market",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>DMCA Complaint Filed</h2>
        <p>A DMCA complaint has been filed against one of your listings.</p>
        
        <div style="background-color: #fff3cd; padding: 15px; border-radius: 5px; margin: 20px 0;">
          <p><strong>Complaint ID:</strong> ${complaintId}</p>
          <p><strong>Listing:</strong> ${listingTitle}</p>
        </div>
        
        <p>The listing has been temporarily disabled pending review. If you believe this complaint was filed in error, you may submit a counter-notice.</p>
        
        <div style="margin: 20px 0;">
          <a href="${counterNoticeUrl}" style="background-color: #007bff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">
            Submit Counter-Notice
          </a>
        </div>
        
        <p><strong>Important:</strong> Filing a false counter-notice may result in legal consequences. Please ensure you have the right to use the material before submitting a counter-notice.</p>
        
        <p>If you have any questions, please contact us at dmca@shopcrazymarket.com</p>
        
        <hr style="margin: 30px 0; border: none; border-top: 1px solid #ddd;" />
        <p style="color: #666; font-size: 12px;">
          This is an automated message. Please do not reply to this email.
        </p>
      </div>
    `,
    text: `
DMCA Complaint Filed

A DMCA complaint has been filed against one of your listings.

Complaint ID: ${complaintId}
Listing: ${listingTitle}

The listing has been temporarily disabled pending review. If you believe this complaint was filed in error, you may submit a counter-notice.

Submit Counter-Notice: ${counterNoticeUrl}

Important: Filing a false counter-notice may result in legal consequences. Please ensure you have the right to use the material before submitting a counter-notice.

If you have any questions, please contact us at dmca@shopcrazymarket.com
    `,
  };
}

/**
 * Counter-Notice Received - Sent to seller
 */
export function counterNoticeReceivedTemplate(counterNoticeId: string, listingTitle: string): EmailTemplate {
  return {
    subject: "Counter-Notice Received - Shop Crazy Market",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Counter-Notice Received</h2>
        <p>Thank you for submitting your counter-notice. We have received it and will review it promptly.</p>
        
        <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;">
          <p><strong>Counter-Notice ID:</strong> ${counterNoticeId}</p>
          <p><strong>Listing:</strong> ${listingTitle}</p>
        </div>
        
        <p>We will review your counter-notice and make a determination. If approved, your listing will be restored. The original complainant will be notified and may pursue legal action if they wish.</p>
        
        <p>If you have any questions, please contact us at dmca@shopcrazymarket.com</p>
        
        <hr style="margin: 30px 0; border: none; border-top: 1px solid #ddd;" />
        <p style="color: #666; font-size: 12px;">
          This is an automated message. Please do not reply to this email.
        </p>
      </div>
    `,
    text: `
Counter-Notice Received

Thank you for submitting your counter-notice. We have received it and will review it promptly.

Counter-Notice ID: ${counterNoticeId}
Listing: ${listingTitle}

We will review your counter-notice and make a determination. If approved, your listing will be restored. The original complainant will be notified and may pursue legal action if they wish.

If you have any questions, please contact us at dmca@shopcrazymarket.com
    `,
  };
}

/**
 * Listing Flagged - Sent to seller
 */
export function listingFlaggedTemplate(listingTitle: string, flaggedWords: string[], reason: string): EmailTemplate {
  return {
    subject: "Listing Flagged for Review - Shop Crazy Market",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Listing Flagged for Review</h2>
        <p>Your listing has been flagged for potential copyright or trademark violations.</p>
        
        <div style="background-color: #fff3cd; padding: 15px; border-radius: 5px; margin: 20px 0;">
          <p><strong>Listing:</strong> ${listingTitle}</p>
          <p><strong>Flagged Words:</strong> ${flaggedWords.join(", ")}</p>
        </div>
        
        <p><strong>Reason:</strong></p>
        <p style="background-color: #f5f5f5; padding: 10px; border-radius: 5px;">${reason}</p>
        
        <p>Your listing has been temporarily disabled pending review. Please ensure you have the rights to use any copyrighted or trademarked material in your listing.</p>
        
        <p>If you believe this flagging was in error, please contact us at support@shopcrazymarket.com</p>
        
        <hr style="margin: 30px 0; border: none; border-top: 1px solid #ddd;" />
        <p style="color: #666; font-size: 12px;">
          This is an automated message. Please do not reply to this email.
        </p>
      </div>
    `,
    text: `
Listing Flagged for Review

Your listing has been flagged for potential copyright or trademark violations.

Listing: ${listingTitle}
Flagged Words: ${flaggedWords.join(", ")}

Reason:
${reason}

Your listing has been temporarily disabled pending review. Please ensure you have the rights to use any copyrighted or trademarked material in your listing.

If you believe this flagging was in error, please contact us at support@shopcrazymarket.com
    `,
  };
}

/**
 * Strike Issued - Sent to seller
 */
export function strikeIssuedTemplate(strikeCount: number, reason: string, action: string): EmailTemplate {
  return {
    subject: `Copyright Violation Strike - Shop Crazy Market`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Copyright Violation Strike</h2>
        <p>You have received a strike for a copyright violation.</p>
        
        <div style="background-color: #f8d7da; padding: 15px; border-radius: 5px; margin: 20px 0;">
          <p><strong>Strike Count:</strong> ${strikeCount} of 3</p>
          <p><strong>Action:</strong> ${action}</p>
        </div>
        
        <p><strong>Reason:</strong></p>
        <p style="background-color: #f5f5f5; padding: 10px; border-radius: 5px;">${reason}</p>
        
        ${strikeCount >= 3 
          ? `<p style="color: #dc3545; font-weight: bold;">Your account has been permanently banned due to repeated copyright violations.</p>`
          : strikeCount >= 2
          ? `<p style="color: #dc3545; font-weight: bold;">Your account has been suspended due to multiple copyright violations. Please contact support to appeal.</p>`
          : `<p>You have received a warning. Further violations may result in account suspension or permanent ban.</p>`
        }
        
        <p>If you believe this strike was issued in error, please contact us at support@shopcrazymarket.com</p>
        
        <hr style="margin: 30px 0; border: none; border-top: 1px solid #ddd;" />
        <p style="color: #666; font-size: 12px;">
          This is an automated message. Please do not reply to this email.
        </p>
      </div>
    `,
    text: `
Copyright Violation Strike

You have received a strike for a copyright violation.

Strike Count: ${strikeCount} of 3
Action: ${action}

Reason:
${reason}

${strikeCount >= 3 
  ? "Your account has been permanently banned due to repeated copyright violations."
  : strikeCount >= 2
  ? "Your account has been suspended due to multiple copyright violations. Please contact support to appeal."
  : "You have received a warning. Further violations may result in account suspension or permanent ban."
}

If you believe this strike was issued in error, please contact us at support@shopcrazymarket.com
    `,
  };
}
