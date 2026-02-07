import transporter, { verifyTransporter } from "../utils/transporter";


interface EmailResult {
  success: boolean;
  message: string;
  messageId?: string;
}

export const sendMail = async (
  email: string,
  subject: string,
  body: string,
): Promise<EmailResult> => {
  // Validate input parameters
  if (!email || !subject || !body) {
    return {
      success: false,
      message: 'Missing required parameters: email, subject, or body',
    };
  }

  // Validate email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return {
      success: false,
      message: 'Invalid email format',
    };
  }

  const mailOption = {
    from: process.env.USER_EMAIL,
    to: email,
    subject: subject,
    html: body,
  };

  try {
    console.log('Preparing to send email to:', email);

    // Verify transporter before sending
    const isVerified = await verifyTransporter();
    if (!isVerified) {
      return {
        success: false,
        message:
          'Failed to verify email transporter. Please check email configuration.',
      };
    }

    console.log('Sending email with options:', {
      to: mailOption.to,
      subject: mailOption.subject,
      from: mailOption.from,
    });

    // Send email with timeout
    const info: any = await Promise.race([
      transporter.sendMail(mailOption),
      new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Email sending timeout')), 30000),
      ),
    ]);

    console.log(
      'Email sent successfully:',
      info?.response || 'No response info',
    );
    return {
      success: true,
      message: 'Email sent successfully',
      messageId: info?.messageId || 'No message ID',
    };
  } catch (error) {
    console.error('Email sending error:', error);

    // Handle specific error types
    let errorMessage = 'Failed to send email';

    if (error instanceof Error) {
      if (error.message === 'Email sending timeout') {
        errorMessage = 'Email sending timed out. Please try again later.';
      } else if ((error as any).code === 'ECONNREFUSED') {
        errorMessage =
          'Unable to connect to email server. Please check your internet connection.';
      } else if ((error as any).code === 'EAUTH') {
        errorMessage =
          'Email authentication failed. Please check email credentials.';
      } else if ((error as any).responseCode === 550) {
        errorMessage = 'Invalid recipient email address.';
      } else if (error.message) {
        errorMessage = error.message;
      }
    }

    return {
      success: false,
      message: errorMessage,
    };
  }
};
