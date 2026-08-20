import { NextResponse } from 'next/server';
import { sendEmailViaSMTP } from '@/src/lib/mailer';

export async function POST(req: Request) {
  try {
    const { email, resetLink } = await req.json();

    if (!email || !email.trim()) {
      return NextResponse.json({ error: 'כתובת דוא״ל חסרה' }, { status: 400 });
    }

    const link = resetLink || 'http://localhost:3000/#type=recovery';

    const htmlContent = `
      <div dir="rtl" style="font-family: Arial, sans-serif; max-width: 560px; margin: 0 auto; padding: 24px; background-color: #ffffff; border-radius: 16px; border: 1px solid #e2e8f0; text-align: right; color: #1e293b;">
        <div style="background: linear-gradient(135deg, #f97316 0%, #f59e0b 100%); padding: 20px; border-radius: 12px; text-align: center; color: #ffffff; margin-bottom: 24px;">
          <h1 style="margin: 0; font-size: 22px; font-weight: 800;">מתכנן שבועי 🍳</h1>
          <p style="margin: 6px 0 0; font-size: 14px; opacity: 0.95;">שחזור ואיפוס סיסמה</p>
        </div>

        <p style="font-size: 16px; line-height: 1.6; margin-bottom: 16px;">שלום,</p>
        <p style="font-size: 15px; line-height: 1.6; color: #475569; margin-bottom: 24px;">
          קיבלנו בקשה לאיפוס הסיסמה לחשבונך באפליקציית המתכנן השבועי.
          לחץ על הכפתור למטה כדי להגדיר סיסמה חדשה:
        </p>

        <div style="text-align: center; margin: 32px 0;">
          <a href="${link}" style="display: inline-block; background: linear-gradient(135deg, #f97316 0%, #ea580c 100%); color: #ffffff; font-weight: 700; font-size: 15px; padding: 14px 32px; border-radius: 12px; text-decoration: none; box-shadow: 0 4px 12px rgba(249, 115, 22, 0.3);">
            🔑 לחץ כאן להגדרת סיסמה חדשה
          </a>
        </div>

        <p style="font-size: 12px; line-height: 1.5; color: #94a3b8; border-top: 1px solid #f1f5f9; padding-top: 16px; margin-top: 24px;">
          אם לא ביקשת לאפס את הסיסמה, תוכל להתעלם ממייל זה בבטחה. החשבון שלך מוגן.
        </p>
      </div>
    `;

    // 1. Primary Delivery: Gmail SMTP
    const smtpResult = await sendEmailViaSMTP({
      to: email.trim(),
      subject: 'איפוס סיסמה למתכנן השבועי 🔑',
      html: htmlContent,
      fromName: 'מתכנן שבועי'
    });

    if (smtpResult.success) {
      console.log('✅ Password reset email sent via Gmail SMTP to:', email.trim());
      return NextResponse.json({ success: true, method: 'smtp' });
    }

    console.warn('⚠️ SMTP send failed, falling back to Resend API:', smtpResult.error);

    // 2. Backup Delivery: Resend API
    const apiKey = process.env.RESEND_API_KEY;
    if (apiKey) {
      const res = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          from: 'מתכנן שבועי <onboarding@resend.dev>',
          to: [email.trim()],
          subject: 'איפוס סיסמה למתכנן השבועי 🔑',
          html: htmlContent
        })
      });

      const data = await res.json();
      if (res.ok) {
        return NextResponse.json({ success: true, method: 'resend', data });
      }
    }

    return NextResponse.json({ error: smtpResult.error || 'שגיאה בשליחת המייל' }, { status: 500 });
  } catch (err: any) {
    console.error('Server error sending reset email:', err);
    return NextResponse.json({ error: err?.message || 'שגיאה פנימית בשרת' }, { status: 500 });
  }
}
