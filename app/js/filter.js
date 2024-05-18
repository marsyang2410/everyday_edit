import * as cv from "@techstark/opencv-js";

const filter = {
    /**
     * Applies CLAHE (Contrast Limited Adaptive Histogram Equalization) to enhance the contrast of an image in the YUV color space.
     * @param {cv.Mat} src - The source image.
     * @returns {cv.Mat}
     */
    CLAHE: function(src) {
        // Convert the image to the YUV color space
        let yuv = new cv.Mat();
        cv.cvtColor(src, yuv, cv.COLOR_RGB2YUV);

        // Split the YUV image into its three channels
        let channels = new cv.MatVector();
        cv.split(yuv, channels);
        let yChannel = channels.get(0);

        // Apply CLAHE to the Y channel
        let clahe = new cv.CLAHE(2.0, new cv.Size(8, 8));  // Clip limit and grid size
        let enhancedYChannel = new cv.Mat();
        clahe.apply(yChannel, enhancedYChannel);

        // Replace the original Y channel with the enhanced Y channel
        channels.set(0, enhancedYChannel);

        // Merge the channels back together
        let enhancedYUV = new cv.Mat();
        cv.merge(channels, enhancedYUV);

        // Convert the enhanced YUV image back to the RGB color space
        let dst = new cv.Mat();
        cv.cvtColor(enhancedYUV, dst, cv.COLOR_YUV2RGB);

        // Clean up
        yuv.delete();
        yChannel.delete();
        enhancedYChannel.delete();
        channels.delete();
        enhancedYUV.delete();
        clahe.delete();

        return dst;
    }
};

export default filter;
