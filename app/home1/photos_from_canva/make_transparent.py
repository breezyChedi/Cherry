
import sys
import os
from PIL import Image, ImageChops
import collections

def get_background_color(img, edge_depth=4):
    width, height = img.size
    pixels = img.load()
    
    edge_pixels = []
    
    # Top and Bottom edges
    for y in range(min(edge_depth, height)):
        for x in range(width):
            edge_pixels.append(pixels[x, y])
            edge_pixels.append(pixels[x, height - 1 - y])
            
    # Left and Right edges
    for x in range(min(edge_depth, width)):
        for y in range(height):
            edge_pixels.append(pixels[x, y])
            edge_pixels.append(pixels[width - 1 - x, y])
            
    # Filter out transparent pixels if image already has alpha
    if img.mode == 'RGBA':
        edge_pixels = [p for p in edge_pixels if p[3] != 0]
        
    if not edge_pixels:
        return None

    counter = collections.Counter(edge_pixels)
    most_common = counter.most_common(1)[0][0]
    return most_common

def mode1_flood_fill(img, bg_color, tolerance=10):
    # Add alpha channel if not present
    img = img.convert("RGBA")
    width, height = img.size
    pixels = img.load()
    
    # Create a mask for flood filling
    # 0 = unvisited, 1 = background to be removed
    visited = set()
    queue = []
    
    # Initialize queue with edge pixels that match background
    for x in range(width):
        for y in range(height):
            if x < 1 or x >= width - 1 or y < 1 or y >= height - 1:
                pixel = pixels[x, y]
                if is_color_match(pixel, bg_color, tolerance):
                    queue.append((x, y))
                    visited.add((x, y))
    
    # BFS Flood Fill
    while queue:
        x, y = queue.pop(0)
        pixels[x, y] = (0, 0, 0, 0) # Make transparent
        
        # Check neighbors
        for dx, dy in [(-1, 0), (1, 0), (0, -1), (0, 1)]:
            nx, ny = x + dx, y + dy
            
            if 0 <= nx < width and 0 <= ny < height:
                if (nx, ny) not in visited:
                    if is_color_match(pixels[nx, ny], bg_color, tolerance):
                        visited.add((nx, ny))
                        queue.append((nx, ny))
                        
    return img

def mode2_global_replace(img, bg_color, tolerance=10):
    img = img.convert("RGBA")
    datas = img.getdata()
    
    new_data = []
    for item in datas:
        if is_color_match(item, bg_color, tolerance):
            new_data.append((0, 0, 0, 0))
        else:
            new_data.append(item)
            
    img.putdata(new_data)
    return img

def is_color_match(c1, c2, tolerance):
    # c1 is pixel from image (might be RGBA), c2 is target color (might be RGB or RGBA)
    r1, g1, b1 = c1[:3]
    r2, g2, b2 = c2[:3]
    
    return abs(r1 - r2) <= tolerance and abs(g1 - g2) <= tolerance and abs(b1 - b2) <= tolerance

def process_image(file_path, mode=1):
    try:
        img = Image.open(file_path)
        bg_color = get_background_color(img)
        
        if bg_color is None:
            print(f"Could not determine background color for {file_path}")
            return

        print(f"Processing {file_path} with Mode {mode}. Background color detected: {bg_color}")
        
        if mode == 1:
            new_img = mode1_flood_fill(img, bg_color)
        else:
            new_img = mode2_global_replace(img, bg_color)
            
        # Save as PNG to preserve transparency
        filename, ext = os.path.splitext(file_path)
        output_path = f"{filename}_processed.png"
        new_img.save(output_path, "PNG")
        print(f"Saved processed image to {output_path}")
        
    except Exception as e:
        print(f"Error processing {file_path}: {e}")

if __name__ == "__main__":
    if len(sys.argv) < 3:
        print("Usage: python make_transparent.py <image_path> <mode>")
        sys.exit(1)
        
    file_path = sys.argv[1]
    mode = int(sys.argv[2])
    
    process_image(file_path, mode)
