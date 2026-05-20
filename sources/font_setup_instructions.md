{\rtf1\ansi\ansicpg1252\cocoartf2869
\cocoatextscaling0\cocoaplatform0{\fonttbl\f0\fswiss\fcharset0 Helvetica;}
{\colortbl;\red255\green255\blue255;}
{\*\expandedcolortbl;;}
\paperw11900\paperh16840\margl1440\margr1440\vieww11520\viewh8400\viewkind0
\pard\tx720\tx1440\tx2160\tx2880\tx3600\tx4320\tx5040\tx5760\tx6480\tx7200\tx7920\tx8640\pardirnatural\partightenfactor0

\f0\fs24 \cf0 # PP Neue Montreal Font Setup Instructions\
\
## \uc0\u9989  Setup Complete!\
\
The font loading code has been added to your theme. Now you just need to upload the font files.\
\
## \uc0\u55357 \u56513  Step 1: Upload Font Files\
\
1. Copy all your `.otf` font files to:\
   ```\
   /wp-content/themes/hello-elementor-child/assets/fonts/\
   ```\
\
2. Make sure the files are named exactly as follows:\
   - `ppneuemontreal-thin.otf`\
   - `ppneuemontreal-book.otf`\
   - `ppneuemontreal-medium.otf`\
   - `ppneuemontreal-semibolditalic.otf`\
   - `ppneuemontreal-bold.otf`\
   - `ppneuemontreal-italic.otf`\
\
## \uc0\u55356 \u57256  Step 2: Using the Font\
\
### In Custom CSS\
You can now use the font in your custom CSS files:\
\
```css\
.my-custom-class \{\
    font-family: "PP Neue Montreal", sans-serif;\
    font-weight: 400; /* or 100, 500, 600, 700 */\
    font-style: normal; /* or italic */\
\}\
```\
\
### In Elementor Pro\
1. Go to any Elementor page editor\
2. Select any text element\
3. Go to Style tab \uc0\u8594  Typography\
4. In the Font Family dropdown, you should see **"PP Neue Montreal"**\
5. Select it and choose your desired font weight/style\
\
### Font Weights Available:\
- **100** - Thin (ppneuemontreal-thin.otf)\
- **400** - Book/Regular (ppneuemontreal-book.otf)\
- **400 italic** - Italic (ppneuemontreal-italic.otf)\
- **500** - Medium (ppneuemontreal-medium.otf)\
- **600 italic** - SemiBold Italic (ppneuemontreal-semibolditalic.otf)\
- **700** - Bold (ppneuemontreal-bold.otf)\
\
## \uc0\u55356 \u57104  Global Font Usage\
\
The font is already set as the default body font in `style.css`. To use it globally for all text elements, uncomment the code in `house-builder.css` (lines 1435-1443).\
\
## \uc0\u9989  Verification\
\
After uploading the files:\
1. Clear your browser cache\
2. Clear WordPress cache (if using a caching plugin)\
3. Check the page source - you should see @font-face declarations in the head\
4. In browser DevTools \uc0\u8594  Network tab, check that font files are loading\
\
## \uc0\u55357 \u56541  Files Modified\
\
- `functions.php` - Added font loading function\
- `style.css` - Added font to body default\
- Created `/assets/fonts/` directory\
\
## \uc0\u55357 \u56615  Troubleshooting\
\
If fonts don't appear:\
1. Check file paths are correct\
2. Verify file names match exactly (case-sensitive)\
3. Check file permissions (should be readable)\
4. Clear all caches\
5. Check browser console for 404 errors on font files\
\
}