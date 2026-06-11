import { NextResponse } from 'next/server';
import sharp from 'sharp';
import path from 'path';

export async function GET() {
  try {
    const imgPath = path.join(process.cwd(), 'public/images/figma-room-1.jpg');
    const metadata = await sharp(imgPath).metadata();
    return NextResponse.json({ success: true, metadata });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message });
  }
}
