import os
import sys
from PIL import Image

def optimize_image(file_path):
    orig_size = os.path.getsize(file_path)
    ext = os.path.splitext(file_path)[1].lower()
    
    try:
        img = Image.open(file_path)
        
        if ext in ['.png']:
            # Convert to palette mode with transparency
            if img.mode in ['RGBA', 'LA'] or (img.mode == 'P' and 'transparency' in img.info):
                optimized_img = img.quantize(colors=256, method=Image.Quantize.FASTOCTREE)
            else:
                optimized_img = img.convert('P', palette=Image.Palette.ADAPTIVE, colors=256)
                
            optimized_img.save(file_path, 'PNG', optimize=True)
            
        elif ext in ['.jpg', '.jpeg']:
            # Compress JPG with quality=85
            img.save(file_path, 'JPEG', quality=85, optimize=True)
            
        new_size = os.path.getsize(file_path)
        savings = orig_size - new_size
        pct = (savings / orig_size) * 100 if orig_size > 0 else 0
        print(f"  Optimized {os.path.basename(file_path)}: {orig_size/(1024*1024):.2f}MB -> {new_size/(1024*1024):.2f}MB (-{pct:.1f}%)")
        return orig_size, new_size
    except Exception as e:
        print(f"  Error optimizing {file_path}: {e}")
        return orig_size, orig_size

def main():
    if len(sys.argv) < 2:
        print("Usage: python3 scripts/optimize-images.py <directory_path>")
        sys.exit(1)
        
    target_dir = sys.argv[1]
    if not os.path.isdir(target_dir):
        # Allow relative paths from root
        target_dir = os.path.join(os.getcwd(), target_dir)
        if not os.path.isdir(target_dir):
            print(f"Error: {target_dir} is not a directory.")
            sys.exit(1)
        
    print(f"Starting optimization in: {target_dir}\n")
    
    total_orig = 0
    total_new = 0
    
    for filename in os.listdir(target_dir):
        file_path = os.path.join(target_dir, filename)
        if os.path.isfile(file_path) and os.path.splitext(filename)[1].lower() in ['.png', '.jpg', '.jpeg']:
            orig, new = optimize_image(file_path)
            total_orig += orig
            total_new += new
            
    freed = total_orig - total_new
    freed_pct = (freed / total_orig) * 100 if total_orig > 0 else 0
    print(f"\nFinished!")
    print(f"Total Original Size: {total_orig/(1024*1024):.2f} MB")
    print(f"Total Optimized Size: {total_new/(1024*1024):.2f} MB")
    print(f"Total Saved Space: {freed/(1024*1024):.2f} MB (-{freed_pct:.1f}%)")

if __name__ == "__main__":
    main()
