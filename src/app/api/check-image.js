import sharp from 'sharp';

async function checkImage() {
  try {
    const metadata = await sharp('c:/Users/USer/Desktop/Orienda Hospital/public/images/360-bg.jpg').metadata();
    console.log('360-bg.jpg Metadata:', JSON.stringify(metadata, null, 2));
  } catch (err) {
    console.error('Error reading image:', err);
  }
}

checkImage();
