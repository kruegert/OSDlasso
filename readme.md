
# OpenSeaDragon Lasso 
This is a minimal example for a lasso based polygon area selection of image regions. The code also contains methods to compress and store the polygon to a string and decompress it back to the polygon data structure.

## Configuration/Run
1) Configure the path to your deepzoom image pyramid index (.dzi file) in index.js
2) Open index.html in browser.

## Usage
Click on the extra button to enable the lasso tool (disable the panning/zooming) and draw a plygon on the map.
Click on the button again to disable the lasso. 

## Dependencies
- d3.js
- openseadragon.js (openseadragon)
- openseadragion-svg-overlay.js (seadragon svg overlay plugin)
-lz-string.js (compression/encoding/decoding library)
- encrypt.js (some other encryption lib, currently not used)

