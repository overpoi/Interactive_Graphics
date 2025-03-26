// bgImg is the background image to be modified.
// fgImg is the foreground image.
// fgOpac is the opacity of the foreground image.
// fgPos is the position of the foreground image in pixels. It can be negative and (0,0) means the top-left pixels of the foreground and background are aligned.

function composite(bgImg, fgImg, fgOpac, fgPos) {
    let y = 0; 
    
    while (y < bgImg.height) {
        let x = 0; // Loop through every row/column
        
        while (x < bgImg.width) {
            // FGImg Position
            const fgImgX = x - fgPos.x;
            const fgImgY = y - fgPos.y;

            // Bounds check
            if (fgImgX >= 0 && fgImgX < fgImg.width && fgImgY >= 0 && fgImgY < fgImg.height) {

                // Pointers
                const bgImgStart = (y * bgImg.width + x) * 4;
                const fgImgStart= (fgImgY * fgImg.width + fgImgX) * 4;


                // Normalize RGBA values 
                const bgImgR = bgImg.data[bgImgStart] / 255;
                const bgImgG = bgImg.data[bgImgStart + 1] / 255;
                const bgImgB = bgImg.data[bgImgStart + 2] / 255;
                const bgImgA = bgImg.data[bgImgStart + 3] / 255;

                const fgImgR = fgImg.data[fgImgStart] / 255;
                const fgImgG = fgImg.data[fgImgStart + 1] / 255;
                const fgImgB = fgImg.data[fgImgStart + 2] / 255;
                const fgImgA = fgImg.data[fgImgStart + 3] / 255;

                // Debug Log
                //console.log('Foreground RGBA:', fgImgR, fgimgG, fgimgB, fgimgA);
                //console.log('Background RGBA:', bgImgR, bgImgG, bgImgB, bgImgA);

                

                // Alpha Blending
                const alpha = (fgImgA * fgOpac) + (1 - (fgImgA * fgOpac)) * bgImgA;
                const red = (fgImgR * (fgImgA * fgOpac) + bgImgR * bgImgA * (1 - (fgImgA * fgOpac))) / alpha;
                const green = (fgImgG * (fgImgA * fgOpac) + bgImgG * bgImgA * (1 - (fgImgA * fgOpac))) / alpha;
                const blue = (fgImgB * (fgImgA * fgOpac) + bgImgB * bgImgA * (1 - (fgImgA * fgOpac))) / alpha;

                // Debug Log
                //console.log('Blended RGBA:', red, green, blue, alpha);

                // Convert to 0-255
                const finalR = (red * 255);
                const finalG = (green * 255);
                const finalB = (blue * 255);
                const finalA = (alpha * 255);

                // Output 
                bgImg.data[bgImgStart] = finalR; // Red
                bgImg.data[bgImgStart + 1] = finalG; // Green
                bgImg.data[bgImgStart + 2] = finalB; // Blue
                bgImg.data[bgImgStart + 3] = finalA; // Alpha

            }

            x++; 
        }

        y++; 
    }
}
