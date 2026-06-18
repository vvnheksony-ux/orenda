import { NextResponse } from 'next/server';
import sharp from 'sharp';
import path from 'path';

export async function GET() {
  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json({ success: false, error: 'Not allowed in production' }, { status: 403 });
  }

  try {
    const imgPath = path.join(process.cwd(), 'public/images/figma-room-1.jpg');
    const metadata = await sharp(imgPath).metadata();
    return NextResponse.json({ success: true, metadata });
  } catch (err) {
    return NextResponse.json({ success: false, error: err instanceof Error ? err.message : 'Unknown error' });
  }
}
