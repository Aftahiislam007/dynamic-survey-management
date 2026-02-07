import * as nodemailer from 'nodemailer';
import * as dotenv from 'dotenv';

dotenv.config();

// Verify required environment variables
if (!process.env.USER_EMAIL || !process.env.EMAIL_APP_PASS) {
  console.error(
    'Missing required email configuration. Please check your .env file.',
  );
  process.exit(1); // Exit if critical config is missing
}

const transporterOptions = {
  host: 'smtp.gmail.com',
  port: 465,
  secure: true, // false for TLS - port 587, true for SSL - port 465
  requireTLS: false,
  auth: {
    user: process.env.USER_EMAIL,
    pass: process.env.EMAIL_APP_PASS,
  },
  tls: {
    rejectUnauthorized: false, // Helps in some environments with certificate issues
  },
  pool: true, // Use pooled connections for better performance
  maxConnections: 5, // Limit parallel connections
  maxMessages: 100, // Limit messages per connection
  connectionTimeout: 30000, // 30 seconds connection timeout
  greetingTimeout: 30000, // 30 seconds greeting timeout
  socketTimeout: 60000, // 60 seconds socket timeout
  // Enable debug only in development
  debug: process.env.NODE_ENV === 'development',
  logger: process.env.NODE_ENV === 'development',
};

// Create transporter instance (no immediate connection)
const transporter = nodemailer.createTransport(transporterOptions);

// Function to verify transporter only when needed
export const verifyTransporter = async (): Promise<boolean> => {
  try {
    await transporter.verify();
    console.log('SMTP transporter verified successfully');
    return true;
  } catch (error) {
    console.error('SMTP transporter verification failed:', error);
    return false;
  }
};

console.log('SMTP Transporter configured and ready for use');

export default transporter;
