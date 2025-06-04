import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import pool from "@/lib/db";
import { verifyPassword } from "@/lib/db";

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
          return null;
        }

        try {
          // Get the connection from the pool
          const connection = await pool.getConnection();
          
          try {            // Find the user in the database
            const [rows] = await connection.query<any[]>(
              "SELECT * FROM users WHERE username = ?",
              [credentials.username]
            );
            
            // If no user found, return null
            if (!rows || rows.length === 0) {
              console.log("User not found:", credentials.username);
              return null;
            }
            
            const user = rows[0];
            
            // Verify the password
            const isValid = verifyPassword(credentials.password, user.password);
            
            if (isValid) {
              // Return the user object that will be stored in JWT
              return {
                id: user.id.toString(),
                name: user.username,
                email: user.email,
                role: user.role,
              };
            }
            
            console.log("Password verification failed for user:", credentials.username);
            return null;
          } finally {
            // Release the connection back to the pool
            connection.release();
          }
        } catch (error) {
          console.error("Authentication error:", error);
          return null;
        }
      },
    }),
  ],
  pages: {
    signIn: "/login",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = (user as any).role || "admin";
      }
      return token;
    },
    async session({ session, token }) {
      if (session?.user) {
        (session.user as any).role = token.role;
      }
      return session;
    },
  },
  session: {
    strategy: "jwt",
  },
});

export { handler as GET, handler as POST };
