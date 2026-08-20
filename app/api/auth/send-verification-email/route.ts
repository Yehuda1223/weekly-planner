import { NextResponse } from 'next/server';
import { sendEmailViaSMTP } from '@/src/lib/mailer';

export async function POST(request: Request) {
  try {
    const { email, displayName, verificationCode } = await request.json();

    if (!email || !verificationCode) {
      return NextResponse.json(
        { error: 'Email and verificationCode are required' },
        { status: 400 }
      );
    }

    const userName = displayName || email.split('@')[0];

    const htmlContent = `
      <!DOCTYPE html>
      <html dir="rtl" lang="he">
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f8fafc; margin: 0; padding: 20px; direction: rtl; text-align: right; }
            .container { max-width: 560px; margin: 0 auto; background: #ffffff; border-radius: 24px; padding: 40px; box-shadow: 0 10px 25px rgba(0,0,0,0.05); border: 1px solid #f1f5f9; }
            .header { text-align: center; margin-bottom: 25px; }
            .logo { font-size: 44px; margin-bottom: 10px; }
            .title { color: #0f172a; font-size: 22px; font-weight: 800; margin: 0 0 8px 0; }
            .subtitle { color: #64748b; font-size: 14px; margin: 0; }
            .content { color: #334155; font-size: 15px; line-height: 1.7; margin: 20px 0; }
            .code-box { background: linear-gradient(135deg, #fff7ed 0%, #ffedd5 100%); border: 2px dashed #f97316; border-radius: 20px; padding: 25px; text-align: center; margin: 30px 0; }
            .code-label { font-size: 13px; color: #9a3412; font-weight: 800; display: block; margin-bottom: 10px; letter-spacing: 0.5px; }
            .code-digits { font-size: 38px; font-weight: 900; letter-spacing: 10px; color: #ea580c; font-family: 'Courier New', Courier, monospace; display: inline-block; padding: 6px 16px; background: #ffffff; border-radius: 14px; box-shadow: 0 4px 10px rgba(249, 115, 22, 0.15); }
            .note { background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 14px; padding: 14px; font-size: 13px; color: #475569; margin-top: 25px; }
            .footer { text-align: center; margin-top: 35px; padding-top: 20px; border-top: 1px solid #f1f5f9; color: #94a3b8; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <div class="logo">👨‍🍳✨</div>
              <h1 class="title">ברוך הבא למתכנן השבועי!</h1>
              <p class="subtitle">ארוחות, כושר, דייטים וקניות משפחתיות</p>
            </div>
            
            <div class="content">
              <p>שלום <strong>${userName}</strong>,</p>
              <p>שמחים שהצטרפת אלינו! כדי להפעיל את החשבון שלך, הזן באפליקציה את קוד האימות הבא:</p>
            </div>

            <div class="code-box">
              <span class="code-label">קוד האימות שלך להפעלת החשבון:</span>
              <span class="code-digits">${verificationCode}</span>
            </div>

            <div class="note">
              🔒 <strong>לתשומת לבך:</strong> הקוד תקף להפעלת החשבון שלך. אנא הזן אותו באפליקציה כדי להשלים את ההרשמה ולהתחבר.
            </div>

            <div class="footer">
              <p>אם לא נרשמת לאפליקציה, ניתן להתעלם ממייל זה בבטחה.</p>
              <p>© ${new Date().getFullYear()} מתכנן שבועי. כל הזכויות שמורות.</p>
            </div>
          </div>
        </body>
      </html>
    `;

    // 1. Primary Delivery: High-Performance Gmail SMTP
    const smtpResult = await sendEmailViaSMTP({
      to: email.trim(),
      subject: `✨ קוד האימות שלך: ${verificationCode} (מתכנן שבועי)`,
      html: htmlContent,
      fromName: 'מתכנן שבועי'
    });

    if (smtpResult.success) {
      console.log('✅ 6-digit code delivered successfully via Gmail SMTP to:', email.trim());
      return NextResponse.json({
        success: true,
        method: 'smtp',
        messageId: smtpResult.messageId
      });
    }

    console.warn('⚠️ SMTP send failed, falling back to Resend API:', smtpResult.error);

    // 2. Backup Delivery: Resend API
    const resendApiKey = process.env.RESEND_API_KEY;
    if (resendApiKey) {
      const resendResponse = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${resendApiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          from: 'מתכנן שבועי <onboarding@resend.dev>',
          to: [email.trim()],
          subject: `✨ קוד האימות שלך: ${verificationCode} (מתכנן שבועי)`,
          html: htmlContent
        })
      });

      const resendData = await resendResponse.json();
      if (resendResponse.ok) {
        return NextResponse.json({
          success: true,
          method: 'resend',
          messageId: resendData.id
        });
      }
    }

    return NextResponse.json(
      { error: smtpResult.error || 'שגיאה בשליחת המייל' },
      { status: 500 }
    );
  } catch (error: any) {
    console.error('Send verification email route error:', error);
    return NextResponse.json(
      { error: error?.message || 'Internal Server Error' },
      { status: 500 }
    );
  }
}
