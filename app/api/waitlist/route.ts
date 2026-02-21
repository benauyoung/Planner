import { NextResponse } from 'next/server'
import { collection, addDoc, serverTimestamp } from 'firebase/firestore'
import { db } from '@/services/firebase'

export async function POST(req: Request) {
  try {
    const { email, prompt, appTitle } = await req.json()

    if (!email || !email.includes('@')) {
      return NextResponse.json({ error: 'Invalid email' }, { status: 400 })
    }

    // Store in Firestore waitlist collection
    if (db) {
      await addDoc(collection(db, 'waitlist'), {
        email,
        prompt: prompt || '',
        appTitle: appTitle || '',
        source: 'hero',
        createdAt: serverTimestamp(),
      })
    }

    // Optional: send welcome email via Resend
    const resendKey = process.env.RESEND_API_KEY
    if (resendKey) {
      try {
        const { Resend } = await import('resend')
        const resend = new Resend(resendKey)
        await resend.emails.send({
          from: 'TinyBaguette <hello@tinybaguette.com>',
          to: email,
          subject: "You're on the list — TinyBaguette",
          html: `
            <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto; padding: 40px 24px; color: #111;">
              <h1 style="font-size: 24px; font-weight: 700; margin-bottom: 8px;">You're in. 🎉</h1>
              <p style="color: #555; font-size: 16px; margin-bottom: 24px;">
                Thanks for joining the TinyBaguette waitlist${appTitle ? ` — we saw your idea for <strong>${appTitle}</strong>` : ''}. We'll reach out when your spot is ready.
              </p>
              <p style="color: #888; font-size: 13px;">
                In the meantime, reply to this email with any questions.<br/>
                — The TinyBaguette team
              </p>
            </div>
          `,
        })
      } catch (emailErr) {
        // Don't fail the request if welcome email fails
        console.error('Resend error:', emailErr)
      }
    }

    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error('Waitlist error:', error)
    return NextResponse.json({ error: 'Failed to join waitlist' }, { status: 500 })
  }
}
