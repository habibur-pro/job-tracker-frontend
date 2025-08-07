import NextAuth from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import GoogleProvider from "next-auth/providers/google"
import GitHubProvider from "next-auth/providers/github"

// Simple in-memory user store (in production, use a real database)
const users = new Map()

const handler = NextAuth({
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
    }),
    GitHubProvider({
      clientId: process.env.GITHUB_ID || "",
      clientSecret: process.env.GITHUB_SECRET || "",
    }),
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email", placeholder: "your@email.com" },
        password: { label: "Password", type: "password" },
        action: { label: "Action", type: "hidden" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null
        }

        const action = credentials.action || 'signin'

        if (action === 'signup') {
          // Check if user already exists
          if (users.has(credentials.email)) {
            throw new Error("User already exists")
          }

          // Create new user (in production, hash the password)
          const newUser = {
            id: Date.now().toString(),
            email: credentials.email,
            password: credentials.password, // In production, hash this
            name: credentials.email.split('@')[0],
            createdAt: new Date().toISOString()
          }

          users.set(credentials.email, newUser)
          
          return {
            id: newUser.id,
            email: newUser.email,
            name: newUser.name,
          }
        } else {
          // Sign in
          const user = users.get(credentials.email)
          
          if (!user || user.password !== credentials.password) {
            return null
          }

          return {
            id: user.id,
            email: user.email,
            name: user.name,
          }
        }
      }
    })
  ],
  pages: {
    signIn: "/login",
  },
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async session({ session, token }) {
      if (token.provider) {
        session.provider = token.provider
      }
      return session
    },
    async jwt({ token, user, account }) {
      if (user) {
        token.id = user.id
      }
      if (account) {
        token.provider = account.provider
      }
      return token
    },
  },
  secret: process.env.NEXTAUTH_SECRET || "your-secret-key-here",
})

export { handler as GET, handler as POST }
