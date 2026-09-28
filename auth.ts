import NextAuth from "next-auth";

import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcrypt";
import Google from "next-auth/providers/google";

import clientPromise from "@/lib/db/mongodb";
import authConfig from "./auth.config";

import Facebook from "next-auth/providers/facebook";

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,

  trustHost: true,

  providers: [
    Google({
      clientId: process.env.AUTH_GOOGLE_ID!,
      clientSecret: process.env.AUTH_GOOGLE_SECRET!,
    }),

    Facebook({
      clientId: process.env.AUTH_FACEBOOK_ID!,
      clientSecret: process.env.AUTH_FACEBOOK_SECRET!,
    }),

    Credentials({
      credentials: {
        email: {},
        password: {},
      },

      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        const client = await clientPromise;
        const db = client.db("dealup");

        const user = await db.collection("users").findOne({
          email: String(credentials.email).toLowerCase(),
        });

        if (!user) {
          return null;
        }

        const isPasswordValid = await bcrypt.compare(
          String(credentials.password),
          user.password,
        );

        if (!isPasswordValid) {
          return null;
        }

        return {
          id: user._id.toString(),

          name: user.name,

          email: user.email,

          role: user.role,

          provider: user.provider,

          isVerified: user.isVerified ?? false,

          image: user.image,

          phone: user.phone,

          isPhoneVerified: user.isPhoneVerified ?? false,

          // =====================================
          // Seller Verification
          // =====================================

          sellerVerification: user.sellerVerification ?? {
            status: "unverified",

            phoneVerified: user.isPhoneVerified ?? false,

            identityVerified: false,

            locationVerified: false,

            submittedAt: null,

            verifiedAt: null,

            rejectionReason: null,
          },

          // =====================================
          // Trust & Risk
          // =====================================

          trustScore: user.trustScore ?? 0,

          riskScore: user.riskScore ?? 0,

          address: user.address,

          language: user.language ?? "en",
        };
      },
    }),
  ],

  callbacks: {
    async signIn({ user, account }) {
      if (
        account?.provider !== "google" &&
        account?.provider !== "facebook"
      ) {
        return true;
      }

      if (!user.email) {
        return false;
      }

      const client = await clientPromise;
      const db = client.db("dealup");

      const existingUser = await db.collection("users").findOne({
        email: user.email.toLowerCase(),
      });

      // =====================================================
      // CREATE NEW SOCIAL USER
      // =====================================================

      if (!existingUser) {
        await db.collection("users").insertOne({
          name: user.name,

          email: user.email?.toLowerCase(),

          image: user.image ?? "",

          provider: account.provider,

          role: "user",

          isVerified: true,

          phone: "",

          isPhoneVerified: false,

          sellerVerification: {
            status: "unverified",

            phoneVerified: false,

            identityVerified: false,

            locationVerified: false,

            submittedAt: null,

            verifiedAt: null,

            rejectionReason: null,
          },

          trustScore: 0,

          riskScore: 0,

          address: {
            state: "",
            district: "",
            city: "",
          },

          language: "en",

          badges: [],

          createdAt: new Date(),

          updatedAt: new Date(),
        });
      } else {
        // =====================================================
        // UPDATE EXISTING SOCIAL PROFILE
        // =====================================================

        const updateData: Record<string, unknown> = {
          updatedAt: new Date(),
        };

        if (user.name) {
          updateData.name = user.name;
        }

        if (user.image) {
          updateData.image = user.image;
        }

        await db.collection("users").updateOne(
          {
            _id: existingUser._id,
          },
          {
            $set: updateData,
          },
        );
      }

      return true;
    },

    // =====================================================
    // JWT CALLBACK
    // =====================================================

    async jwt({ token, user, trigger }) {
      // =====================================================
      // Helper: Load fresh user data from MongoDB
      //
      // MongoDB is queried only when:
      // 1. User logs in
      // 2. Session update is explicitly triggered
      //
      // Normal JWT requests do NOT query MongoDB.
      // =====================================================

      const refreshUserFromDatabase = async () => {
        if (!token.email) {
          return;
        }

        const client = await clientPromise;
        const db = client.db("dealup");

        const dbUser = await db.collection("users").findOne(
          {
            email: String(token.email).toLowerCase(),
          },
          {
            projection: {
              password: 0,
            },
          },
        );

        if (!dbUser) {
          return;
        }

        // =====================================================
        // Basic User Information
        // =====================================================

        token.sub = dbUser._id.toString();

        token.id = dbUser._id.toString();

        token.name = dbUser.name;

        token.email = dbUser.email;

        token.role = dbUser.role;

        token.provider = dbUser.provider;

        token.isVerified = dbUser.isVerified ?? false;

        token.image = dbUser.image ?? "";

        token.phone = dbUser.phone ?? "";

        token.isPhoneVerified = dbUser.isPhoneVerified ?? false;

        // =====================================================
        // Seller Verification
        // =====================================================

        token.sellerVerification = dbUser.sellerVerification ?? {
          status: "unverified",

          phoneVerified: dbUser.isPhoneVerified ?? false,

          identityVerified: false,

          locationVerified: false,

          submittedAt: null,

          verifiedAt: null,

          rejectionReason: null,
        };

        // =====================================================
        // Trust & Risk
        // =====================================================

        token.trustScore = dbUser.trustScore ?? 0;

        token.riskScore = dbUser.riskScore ?? 0;

        // =====================================================
        // Address & Language
        // =====================================================

        token.address = dbUser.address;

        token.language = dbUser.language ?? "en";
      };

      // =====================================================
      // FIRST LOGIN
      // =====================================================

      if (user) {
        token.id = user.id;

        token.sub = user.id;

        token.name = user.name;

        token.email = user.email;

        token.role = (user as any).role;

        token.provider = (user as any).provider;

        token.isVerified = (user as any).isVerified ?? false;

        token.image = (user as any).image ?? "";

        token.phone = (user as any).phone ?? "";

        token.isPhoneVerified =
          (user as any).isPhoneVerified ?? false;

        token.sellerVerification =
          (user as any).sellerVerification ?? {
            status: "unverified",

            phoneVerified:
              (user as any).isPhoneVerified ?? false,

            identityVerified: false,

            locationVerified: false,

            submittedAt: null,

            verifiedAt: null,

            rejectionReason: null,
          };

        token.trustScore =
          (user as any).trustScore ?? 0;

        token.riskScore =
          (user as any).riskScore ?? 0;

        token.address = (user as any).address;

        token.language =
          (user as any).language ?? "en";

        // ===================================================
        // IMPORTANT
        //
        // First login must use fresh DB data.
        // This guarantees:
        // - Correct MongoDB user ID
        // - Latest verification information
        // - Latest social profile image
        // ===================================================

        await refreshUserFromDatabase();
      }

      // =====================================================
      // SESSION UPDATE
      //
      // When useSession().update() is called, refresh the
      // token from MongoDB instead of trusting client data.
      // =====================================================

      if (trigger === "update") {
        await refreshUserFromDatabase();
      }

      // =====================================================
      // NORMAL SESSION REQUEST
      //
      // IMPORTANT:
      // Do NOT query MongoDB here.
      //
      // Existing token already contains:
      // - id
      // - role
      // - provider
      // - verification
      // - trust/risk
      // - image
      // - phone
      // - address
      // - language
      // =====================================================

      return token;
    },

    // =====================================================
    // SESSION CALLBACK
    // =====================================================

    async session({ session, token }) {
      if (session.user) {
        (session.user as any).id = token.sub;

        session.user.name = token.name as string;

        session.user.email = token.email as string;

        (session.user as any).role = token.role;

        (session.user as any).provider = token.provider;

        (session.user as any).isVerified =
          token.isVerified;

        (session.user as any).image = token.image;

        (session.user as any).phone = token.phone;

        (session.user as any).isPhoneVerified =
          token.isPhoneVerified;

        // =====================================
        // Seller Verification
        // =====================================

        (session.user as any).sellerVerification =
          token.sellerVerification;

        (session.user as any).trustScore =
          token.trustScore;

        (session.user as any).riskScore =
          token.riskScore;

        (session.user as any).address =
          token.address;

        (session.user as any).language =
          token.language;
      }

      return session;
    },
  },
});