import { Pool } from "@neondatabase/serverless";
import { betterAuth } from "better-auth";
import { nextCookies } from "better-auth/next-js";
import { emailOTP, jwt } from "better-auth/plugins";
import { PostgresDialect } from "kysely";
import { Resend } from "resend";

const globalForPool = globalThis as unknown as { authPool?: Pool };

const pool =
  globalForPool.authPool ??
  new Pool({ connectionString: process.env.DATABASE_URL, max: 5 });

if (process.env.NODE_ENV !== "production") globalForPool.authPool = pool;

const resend = new Resend(process.env.RESEND_API_KEY);

export const auth = betterAuth({
  appName: "Gnani",
  baseURL: process.env.BETTER_AUTH_URL,
  secret: process.env.BETTER_AUTH_SECRET,
  database: {
    // Neon's Pool mirrors pg.Pool at runtime; its types differ slightly.
    dialect: new PostgresDialect({ pool: pool as never }),
    type: "postgres",
    schemaName: "auth",
  },
  user: {
    additionalFields: {
      onboardingCompleted: {
        type: "boolean",
        required: false,
        defaultValue: false,
        input: false,
      },
    },
  },
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_SECRET as string,
    },
  },
  account: {
    accountLinking: { enabled: true, trustedProviders: ["google"] },
  },
  plugins: [
    emailOTP({
      otpLength: 6,
      expiresIn: 600,
      async sendVerificationOTP({ email, otp }) {
        if (process.env.NODE_ENV !== "production") {
          console.log(`[auth] OTP for ${email}: ${otp}`);
        }
        const { error } = await resend.emails.send({
          from: process.env.EMAIL_FROM ?? "onboarding@resend.dev",
          to: email,
          subject: `${otp} is your Gnani sign-in code`,
          html: `<div style="font-family:system-ui,sans-serif;max-width:420px;margin:auto;padding:24px"><h2 style="margin:0 0 8px">Your sign-in code</h2><p style="color:#555;margin:0 0 20px">Enter this code to continue to Gnani. It expires in 10 minutes.</p><div style="font-size:34px;letter-spacing:10px;font-weight:700;color:#191919">${otp}</div><p style="color:#888;font-size:12px;margin-top:24px">If you didn't request this, you can ignore this email.</p></div>`,
        });
        if (error) throw new Error(`Failed to send OTP email: ${error.message}`);
      },
    }),
    jwt(),
    nextCookies(),
  ],
});
