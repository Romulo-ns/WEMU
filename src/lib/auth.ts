import { NextAuthOptions } from "next-auth";
import SpotifyProvider from "next-auth/providers/spotify";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import dbConnect from "@/lib/db";
import { User } from "@/lib/models/User";
import bcrypt from "bcryptjs";

export const authOptions: NextAuthOptions = {
  providers: [
    SpotifyProvider({
      clientId: process.env.SPOTIFY_CLIENT_ID as string,
      clientSecret: process.env.SPOTIFY_CLIENT_SECRET as string,
      authorization: {
        params: {
          scope:
            "user-read-email user-read-private user-top-read playlist-modify-private playlist-modify-public",
          show_dialog: true,
        },
      },
    }),

    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
    }),

    CredentialsProvider({
      name: "Email and Password",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Missing email or password");
        }

        await dbConnect();

        const user = await User.findOne({ email: credentials.email });

        if (!user || !user.password) {
          throw new Error("Invalid email or password");
        }

        const isValid = await bcrypt.compare(credentials.password, user.password);

        if (!isValid) {
          throw new Error("Invalid email or password");
        }

        return {
          id: user._id.toString(),
          name: user.name,
          email: user.email,
          image: user.image,
        };
      },
    }),
  ],

  callbacks: {
    async signIn({ user, account, profile }) {
      if (account?.provider === "spotify" || account?.provider === "google") {
        await dbConnect();

        const providerImage =
          user.image ||
          (profile as any)?.picture ||
          (profile as any)?.images?.[0]?.url ||
          "";

        const providerName =
          user.name ||
          (profile as any)?.name ||
          (profile as any)?.display_name ||
          "New User";

        let dbUser = await User.findOne({ email: user.email });

        if (!dbUser) {
          dbUser = await User.create({
            name: providerName,
            email: user.email || "",
            image: providerImage,
            spotifyId:
              account.provider === "spotify"
                ? account.providerAccountId
                : undefined,
            googleId:
              account.provider === "google"
                ? account.providerAccountId
                : undefined,
          });
        } else {
          let shouldSave = false;

          if (account.provider === "spotify" && !dbUser.spotifyId) {
            dbUser.spotifyId = account.providerAccountId;
            shouldSave = true;
          }

          if (account.provider === "google" && !dbUser.googleId) {
            dbUser.googleId = account.providerAccountId;
            shouldSave = true;
          }

          // Só define imagem do provider se o usuário ainda não tiver imagem no banco
          if (!dbUser.image && providerImage) {
            dbUser.image = providerImage;
            shouldSave = true;
          }

          // Só define nome se estiver vazio no banco
          if (!dbUser.name && providerName) {
            dbUser.name = providerName;
            shouldSave = true;
          }

          if (shouldSave) {
            await dbUser.save();
          }
        }

        // Muito importante: usar SEMPRE os dados do banco
        user.id = dbUser._id.toString();
        user.name = dbUser.name;
        user.email = dbUser.email;
        user.image = dbUser.image;
      }

      return true;
    },

    async jwt({ token, user, account, trigger, session }) {
      if (user) {
        token.id = user.id;
        token.name = user.name;
        token.email = user.email;
        token.image = user.image;
      }

      if (trigger === "update" && session) {
        if (session.name) token.name = session.name;
        if ((session as any).image) token.image = (session as any).image;
      }

      if (account?.provider === "spotify") {
        token.accessToken = account.access_token;
        token.refreshToken = account.refresh_token;
      }

      return token;
    },

    async session({ session, token }) {
      if (session.user) {
        (session.user as any).id = token.id;
        session.user.name = token.name as string;
        session.user.email = token.email as string;
        session.user.image = token.image as string;
        (session as any).accessToken = token.accessToken;
        (session as any).refreshToken = token.refreshToken;
      }

      return session;
    },
  },

  pages: {
    signIn: "/auth/signin",
  },

  session: {
    strategy: "jwt",
  },

  secret: process.env.NEXTAUTH_SECRET,
};