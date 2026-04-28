import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import bcrypt from "bcryptjs";

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "your-secret-key-change-in-production"
);

// Admin credentials - in production, store these in environment variables or database
const ADMIN_EMAIL = "jebatahmad989@gmail.com";
const ADMIN_PASSWORD_HASH = bcrypt.hashSync("jebatahmad989@gmail.com", 10);

export interface User {
  email: string;
  role: "admin" | "user";
}

export async function verifyCredentials(
  email: string,
  password: string
): Promise<User | null> {
  // Check if credentials match admin
  if (email === ADMIN_EMAIL && bcrypt.compareSync(password, ADMIN_PASSWORD_HASH)) {
    return { email, role: "admin" };
  }
  return null;
}

export async function createSession(user: User): Promise<string> {
  const token = await new SignJWT({ email: user.email, role: user.role })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("24h")
    .sign(JWT_SECRET);

  return token;
}

export async function getSession(): Promise<User | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get("session")?.value;

  if (!token) return null;

  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    return {
      email: payload.email as string,
      role: payload.role as "admin" | "user",
    };
  } catch {
    return null;
  }
}

export async function deleteSession(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete("session");
}
