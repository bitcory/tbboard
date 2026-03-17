import jwt from "jsonwebtoken";
import { cookies } from "next/headers";
import type { UserInfo } from "@/types";

const JWT_SECRET = process.env.JWT_SECRET || "tboard-jwt-secret";
const COOKIE_NAME = "tboard-token";

export function signToken(user: UserInfo): string {
  return jwt.sign(
    { id: user.id, username: user.username, name: user.name },
    JWT_SECRET,
    { expiresIn: "7d" }
  );
}

export function verifyToken(token: string): UserInfo | null {
  try {
    return jwt.verify(token, JWT_SECRET) as UserInfo;
  } catch {
    return null;
  }
}

export async function getCurrentUser(): Promise<UserInfo | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  if (!token) return null;
  return verifyToken(token);
}

export { COOKIE_NAME };
