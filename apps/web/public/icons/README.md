# PWA Icon Setup Instructions

## Quick Setup: Use an Icon Generator

Visit **https://www.pwabuilder.com/imageGenerator** or **https://realfavicongenerator.net/**

1. Upload your ReplayHub logo (at least 512x512px)
2. Download the generated icons
3. Place all PNG files in `apps/web/public/icons/`

## Required Icon Sizes

- icon-72x72.png
- icon-96x96.png
- icon-128x128.png
- icon-144x144.png
- icon-152x152.png
- icon-192x192.png
- icon-384x384.png
- icon-512x512.png

## Manual Creation (ImageMagick)

If you have ImageMagick installed:

```bash
# From your logo file (replace logo.png with your file)
magick logo.png -resize 72x72 icon-72x72.png
magick logo.png -resize 96x96 icon-96x96.png
magick logo.png -resize 128x128 icon-128x128.png
magick logo.png -resize 144x144 icon-144x144.png
magick logo.png -resize 152x152 icon-152x152.png
magick logo.png -resize 192x192 icon-192x192.png
magick logo.png -resize 384x384 icon-384x384.png
magick logo.png -resize 512x512 icon-512x512.png
```

The PWA will still work without perfect icons - browsers will scale whatever you provide.
