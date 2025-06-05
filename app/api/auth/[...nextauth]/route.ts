import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import pool from "@/lib/db";
import bcrypt from "bcryptjs";
import { RowDataPacket } from "mysql2";

interface User extends RowDataPacket {
  id: number;
  username: string;
  password: string;
}

const handler = NextAuth({
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        username: { label: "Username", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.username || !credentials?.password) {
          console.log("Missing credentials");
          return null;
        }

        try {
          console.log("Attempting to authenticate user:", credentials.username);

          // Get user from database
          const [users] = await pool.query<User[]>(
            "SELECT * FROM users WHERE username = ?",
            [credentials.username]
          );

          console.log("Query result:", users);

          const user = users[0];

          if (!user) {
            console.log("User not found");
            return null;
          }

          // Verify password
          const isValid = await bcrypt.compare(
            credentials.password,
            user.password
          );

          console.log("Password verification result:", isValid);

          if (!isValid) {
            console.log("Invalid password");
            return null;
          }

          console.log("Authentication successful");
          return {
            id: user.id.toString(),
            name: user.username,
          };
        } catch (error) {
          console.error("Error during authentication:", error);
          return null;
        }
      },
    }),
  ],
  pages: {
    signIn: "/login",
  },
  session: {
    strategy: "jwt",
    maxAge: 30 * 60, // 30 minutes in seconds
  },
  debug: true, // Enable debug mode
});

export { handler as GET, handler as POST };
