import os
import zipfile
from PIL import Image, ImageChops

docx_path = r'C:/Users/aryan/.gemini/antigravity/brain/35ff5b3f-dee4-480a-9275-3b474332ba8c/.user_uploaded/media_1791572253994.docx'
out_dir = r'D:/WeSakhi/assets/images/products'

# 1. Re-extract raw images from docx
with zipfile.ZipFile(docx_path, 'r') as docx:
    for item in docx.namelist():
        if item.startswith('word/media/'):
            filename = os.path.basename(item)
            out_path = os.path.join(out_dir, filename)
            with open(out_path, 'wb') as f:
                f.write(docx.read(item))

# 2. Normalize product scales into a 1536x1536 canvas with 85% inner bounding box
TARGET_CANVAS_SIZE = 1536
INNER_BOX_SIZE = 1300 # 85% of canvas size for 100% visual uniformity

for fname in os.listdir(out_dir):
    if not (fname.endswith('.jpg') or fname.endswith('.png')):
        continue
    filepath = os.path.join(out_dir, fname)
    with Image.open(filepath) as img:
        img = img.convert('RGB')
        
        # Trim white / near-white outer margins if any
        # Create a white background comparison image
        bg = Image.new('RGB', img.size, (255, 255, 255))
        diff = ImageChops.difference(img, bg)
        bbox = diff.getbbox()
        
        if bbox:
            # Crop to actual content
            cropped = img.crop(bbox)
        else:
            cropped = img
            
        cw, ch = cropped.size
        
        # Scale cropped product content so its largest dimension fits within INNER_BOX_SIZE
        scale = min(INNER_BOX_SIZE / cw, INNER_BOX_SIZE / ch)
        nw = int(cw * scale)
        nh = int(ch * scale)
        
        resized = cropped.resize((nw, nh), Image.Resampling.LANCZOS)
        
        # Create clean square canvas
        canvas = Image.new('RGB', (TARGET_CANVAS_SIZE, TARGET_CANVAS_SIZE), (255, 255, 255))
        offset = ((TARGET_CANVAS_SIZE - nw) // 2, (TARGET_CANVAS_SIZE - nh) // 2)
        canvas.paste(resized, offset)
        
        canvas.save(filepath, 'JPEG', quality=95)
        print(f"Normalized {fname}: subject resized from {cw}x{ch} to {nw}x{nh} on {TARGET_CANVAS_SIZE}x{TARGET_CANVAS_SIZE} canvas")
