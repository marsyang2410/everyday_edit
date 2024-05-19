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
    },

    createLookupTable: function (input, output) {
        let lut = new Uint8Array(256);
        let inputIndex = 0;
        for (let i = 0; i < 256; i++) {
            if (i > input[inputIndex + 1]) {
                inputIndex++;
            }
            let range = input[inputIndex + 1] - input[inputIndex];
            let valueRange = output[inputIndex + 1] - output[inputIndex];
            if (range == 0) {
                lut[i] = output[inputIndex];
            } else {
                lut[i] = output[inputIndex] + (i - input[inputIndex]) * valueRange / range;
            }
        }
        return lut;
    },
    
    Winter: function (img) {
        let increaseLookupTable = this.createLookupTable([0, 64, 128, 256], [0, 80, 160, 256]);
        let decreaseLookupTable = this.createLookupTable([0, 64, 128, 256], [0, 50, 100, 256]);
    
        // Split the channels
        let channels = new cv.MatVector();
        cv.split(img, channels);
        let blue_channel = channels.get(2);
        let green_channel = channels.get(1);
        let red_channel = channels.get(0);
    
        // Apply LUTs
        let blue_channel_enhanced = new cv.Mat();
        let red_channel_enhanced = new cv.Mat();
        cv.LUT(blue_channel, cv.matFromArray(256, 1, cv.CV_8U, increaseLookupTable), blue_channel_enhanced);
        cv.LUT(red_channel, cv.matFromArray(256, 1, cv.CV_8U, decreaseLookupTable), red_channel_enhanced);
    
        // Merge the channels back
        let win = new cv.Mat();
        channels.set(0, red_channel_enhanced);
        channels.set(1, green_channel);
        channels.set(2, blue_channel_enhanced);

        cv.merge(channels, win);
    
        // Clean up
        blue_channel.delete();
        green_channel.delete();
        red_channel.delete();
        blue_channel_enhanced.delete();
        red_channel_enhanced.delete();
        channels.delete();
    
        return win;
    },

    Summer: function (img) {
        let increaseLookupTable = this.createLookupTable([0, 64, 128, 256], [0, 80, 160, 256]);
        let decreaseLookupTable = this.createLookupTable([0, 64, 128, 256], [0, 50, 100, 256]);
    
        // Split the channels
        let channels = new cv.MatVector();
        cv.split(img, channels);
        let blue_channel = channels.get(2);
        let green_channel = channels.get(1);
        let red_channel = channels.get(0);
    
        // Apply LUTs
        let blue_channel_enhanced = new cv.Mat();
        let red_channel_enhanced = new cv.Mat();
        cv.LUT(red_channel, cv.matFromArray(256, 1, cv.CV_8U, increaseLookupTable), red_channel_enhanced);
        cv.LUT(blue_channel, cv.matFromArray(256, 1, cv.CV_8U, decreaseLookupTable), blue_channel_enhanced);
    
        // Merge the channels back
        let sum = new cv.Mat();
        channels.set(0, red_channel_enhanced);
        channels.set(1, green_channel);
        channels.set(2, blue_channel_enhanced);

        cv.merge(channels, sum);
    
        // Clean up
        blue_channel.delete();
        green_channel.delete();
        red_channel.delete();
        blue_channel_enhanced.delete();
        red_channel_enhanced.delete();
        channels.delete();
    
        return sum;
    },

    adjustColorTemperature: function (img, adjustment) {
        // Split the channels
        let channels = new cv.MatVector();
        cv.split(img, channels);
        let blue_channel = channels.get(0);
        let green_channel = channels.get(1);
        let red_channel = channels.get(2);
    
        // Create lookup tables
        let increaseLookupTable = this.createLookupTable([0, 64, 128, 256], [0, 64 + adjustment, 128 + adjustment, 256]);
        let decreaseLookupTable = this.createLookupTable([0, 64, 128, 256], [0, 64 - adjustment, 128 - adjustment, 256]);
    
        // Apply LUTs
        let blue_channel_adjusted = new cv.Mat();
        let red_channel_adjusted = new cv.Mat();
        cv.LUT(blue_channel, cv.matFromArray(256, 1, cv.CV_8U, increaseLookupTable), blue_channel_adjusted);
        cv.LUT(red_channel, cv.matFromArray(256, 1, cv.CV_8U, decreaseLookupTable), red_channel_adjusted);
    
        // Merge the channels back
        let adjustedImage = new cv.Mat();
        let mergedChannels = new cv.MatVector();
        mergedChannels.push_back(blue_channel_adjusted);
        mergedChannels.push_back(green_channel);
        mergedChannels.push_back(red_channel_adjusted);
        cv.merge(mergedChannels, adjustedImage);
    
        // Clean up
        blue_channel.delete();
        green_channel.delete();
        red_channel.delete();
        blue_channel_adjusted.delete();
        red_channel_adjusted.delete();
        channels.delete();
        mergedChannels.delete();
    
        return adjustedImage;
    }
    
};

export default filter;
