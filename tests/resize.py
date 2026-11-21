"""Scale only the full-browser capture to the competition's 1280px screenshot cap."""
from PIL import Image

path = 'screenshots/3-editor.jpg'
with Image.open(path) as image:
    image.thumbnail((1280, 1280), Image.Resampling.LANCZOS)
    image.save(path, quality=86, optimize=True)
    print(f'{path}: {image.width}x{image.height}')
