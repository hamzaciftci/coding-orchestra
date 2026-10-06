import jwt from "jsonwebtoken";
import { cookies } from "next/headers";

const SECRET = process.env.JWT_SECRET || "dev-secret";

export type Session = { userId: string; role: "user" | "admin" };

export function signSession(session: Session) {
  return jwt.sign(session, SECRET);
}

export async function getSession(): Promise<Session | null> {
  const token = (await cookies()).get("session")?.value;
  if (!token) return null;
  return jwt.decode(token) as Session | null;
}
