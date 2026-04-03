import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { createToken, setSessionCookie } from "@/lib/auth";
import { compare } from "bcryptjs";

export async function POST(request: Request) {
  const { email, password } = await request.json();

  if (!email || !password) {
    return NextResponse.json({ error: "Email and password required" }, { status: 400 });
  }

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
  }

  const valid = await compare(password, user.passwordHash);
  if (!valid) {
    return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
  }

  const token = await createToken(user.id, user.email);
  await setSessionCookie(token);

  return NextResponse.json({ user: { id: user.id, name: user.name, email: user.email } });
}
