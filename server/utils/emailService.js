import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

export const sendPaymentSuccessEmail = async (userEmail, userName, courseTitle, amount, purchaseId) => {
  try {
    const invoiceHTML = generateInvoiceHTML(userName, courseTitle, amount, purchaseId, 'Card/Online');

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: userEmail,
      subject: `Payment Successful - ${courseTitle} Course Enrollment`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #4F46E5;">Payment Successful! 🎉</h2>

          <p>Dear ${userName},</p>

          <p>Thank you for your purchase! Your payment has been successfully processed.</p>

          <div style="background-color: #F3F4F6; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="margin-top: 0; color: #1F2937;">Purchase Details:</h3>
            <p><strong>Course:</strong> ${courseTitle}</p>
            <p><strong>Amount:</strong> $${amount}</p>
            <p><strong>Transaction ID:</strong> ${purchaseId}</p>
            <p><strong>Date:</strong> ${new Date().toLocaleDateString()}</p>
          </div>

          <p>You can now access your course in the "My Enrollments" section of your dashboard.</p>

          <p>If you have any questions, please don't hesitate to contact our support team.</p>

          <p>Happy Learning!</p>
          <p><strong>Learnify Team</strong></p>

          <hr style="border: none; border-top: 1px solid #E5E7EB; margin: 30px 0;">
          <p style="font-size: 12px; color: #6B7280;">
            This is an automated email. Please do not reply to this message.
          </p>
        </div>
      `,
      attachments: [
        {
          filename: `invoice-${purchaseId}.html`,
          content: invoiceHTML,
          contentType: 'text/html'
        }
      ]
    };

    await transporter.sendMail(mailOptions);
    console.log(`✅ Payment success email sent to ${userEmail}`);
  } catch (error) {
    console.error('❌ Email sending failed:', error.message);
  }
};

export const generateInvoiceHTML = (userName, courseTitle, amount, purchaseId, paymentMethod) => {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #E5E7EB; border-radius: 8px; padding: 30px;">
      <div style="text-align: center; margin-bottom: 30px;">
        <h1 style="color: #4F46E5; margin: 0;">Learnify</h1>
        <p style="color: #6B7280; margin: 5px 0;">Learning Management System</p>
      </div>

      <h2 style="color: #1F2937; border-bottom: 2px solid #4F46E5; padding-bottom: 10px;">Invoice</h2>

      <div style="display: flex; justify-content: space-between; margin: 20px 0;">
        <div>
          <h3 style="margin: 0; color: #1F2937;">Bill To:</h3>
          <p style="margin: 5px 0; color: #374151;">${userName}</p>
        </div>
        <div style="text-align: right;">
          <h3 style="margin: 0; color: #1F2937;">Invoice Details:</h3>
          <p style="margin: 5px 0; color: #374151;">Invoice #: INV-${purchaseId.slice(-8).toUpperCase()}</p>
          <p style="margin: 5px 0; color: #374151;">Date: ${new Date().toLocaleDateString()}</p>
        </div>
      </div>

      <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
        <thead>
          <tr style="background-color: #F9FAFB;">
            <th style="border: 1px solid #E5E7EB; padding: 12px; text-align: left; color: #374151;">Description</th>
            <th style="border: 1px solid #E5E7EB; padding: 12px; text-align: center; color: #374151;">Qty</th>
            <th style="border: 1px solid #E5E7EB; padding: 12px; text-align: right; color: #374151;">Amount</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td style="border: 1px solid #E5E7EB; padding: 12px; color: #374151;">${courseTitle} - Course Enrollment</td>
            <td style="border: 1px solid #E5E7EB; padding: 12px; text-align: center; color: #374151;">1</td>
            <td style="border: 1px solid #E5E7EB; padding: 12px; text-align: right; color: #374151;">$${amount}</td>
          </tr>
        </tbody>
        <tfoot>
          <tr style="background-color: #F9FAFB;">
            <td colspan="2" style="border: 1px solid #E5E7EB; padding: 12px; text-align: right; font-weight: bold; color: #374151;">Total:</td>
            <td style="border: 1px solid #E5E7EB; padding: 12px; text-align: right; font-weight: bold; color: #374151;">$${amount}</td>
          </tr>
        </tfoot>
      </table>

      <div style="margin: 20px 0; padding: 15px; background-color: #F0F9FF; border-radius: 6px;">
        <h4 style="margin: 0 0 10px 0; color: #0369A1;">Payment Information:</h4>
        <p style="margin: 5px 0; color: #374151;"><strong>Payment Method:</strong> ${paymentMethod.toUpperCase()}</p>
        <p style="margin: 5px 0; color: #374151;"><strong>Transaction ID:</strong> ${purchaseId}</p>
        <p style="margin: 5px 0; color: #374151;"><strong>Status:</strong> <span style="color: #059669; font-weight: bold;">PAID</span></p>
      </div>

      <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #E5E7EB; text-align: center; color: #6B7280; font-size: 14px;">
        <p>Thank you for choosing Learnify!</p>
        <p>For support, contact us at support@learnify.com</p>
      </div>
    </div>
  `;
};