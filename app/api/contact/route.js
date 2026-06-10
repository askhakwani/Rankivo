import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function POST(req) {
  const { name, email, subject, message } = await req.json()

  try {
    await resend.emails.send({
      from: 'Rankivo Contact <support@rankivo.co>',
      to: 'support@rankivo.co',
      replyTo: email,
      subject: subject || `New message from ${name}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #1B5FA8; border-bottom: 2px solid #0D9488; padding-bottom: 10px;">New Contact Form Submission</h2>
          <p><strong>Name:</strong> ${name}</p>
          <p><strong>Email:</strong> ${email}</p>
          <p><strong>Subject:</strong> ${subject || 'N/A'}</p>
          <p><strong>Message:</strong></p>
          <div style="background: #f5f5f5; padding: 15px; border-radius: 8px; margin-top: 5px;">${message}</div>
          <p style="color: #999; font-size: 12px; margin-top: 20px;">Sent from rankivo.co contact form</p>
        </div>
      `,
    })
    return Response.json({ success: true })
  } catch (err) {
    console.error(err)
    return Response.json({ error: 'Failed to send' }, { status: 500 })
  }
}
