export const sendEmail = async (to: string, subject: string, body: string) => {
  console.log(`Sending email to ${to} with subject ${subject} and body ${body}`);
  return { success: true, message: 'Email sent successfully (mocked)' };
};