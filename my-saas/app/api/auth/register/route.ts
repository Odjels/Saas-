import prisma from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { NextResponse } from 'next/server';
import { registerSchema } from '@/lib/validations'; // 1. Use the shared schema

export async function POST(req: Request) {
  try {
    const body = await req.json();

    // 2. Server-side Validation
    const validation = registerSchema.safeParse(body);
    
    if (!validation.success) {
      // Return the specific error message from Zod (e.g., "Password too short")
      return NextResponse.json(
        { error: validation.error.issues[0].message }, 
        { status: 400 }
      );
    }

    const { name, email, password } = validation.data;

    // 3. Check for existing user
    const existing = await prisma.user.findUnique({ 
      where: { email: email.toLowerCase() } // Normalize email
    });
    
    if (existing) {
      return NextResponse.json({ error: 'User with this email already exists' }, { status: 409 });
    }

    // 4. Hash the password
    const hashed = await bcrypt.hash(password, 12); // Increased salt rounds for better security

    // 5. Create user within a try/catch specifically for DB errors
    const user = await prisma.user.create({
      data: { 
        name, 
        email: email.toLowerCase(), 
        password: hashed,
        isPremium: false // Explicitly set default
      },
      select: { id: true, email: true, name: true },
    });

    return NextResponse.json({ 
      ok: true, 
      message: "Registration successful", 
      userId: user.id 
    });

  } catch (err) {
    // 6. Sanitize server logs - don't leak database info to the client
    console.error("Registration error:", err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}