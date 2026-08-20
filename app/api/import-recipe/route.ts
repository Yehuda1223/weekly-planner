import { NextResponse } from 'next/server';

export async function POST() {
  return NextResponse.json(
    { error: 'אפשרות ייבוא מתכונים מקישורים חיצוניים הוסרה.' },
    { status: 404 }
  );
}
