class Textbox{
    // Terrible design
    // I don't know how I'll do speech. Perhpas subtitiles, but that seems stilted
    // They would have to have spoken lines.
    // That's hard
    //
    // A textbox should be made new each time it is changed
    // You can persist it through frames if you want, though
    // It will not persist between frames, nor will it build itself
    // I'll make a code for that later
    
    /**
     * @param {Array} quoteArray An array of the quote to be spoken, broken up by lines
     * @param {Number} x Starting x value of the quote
     * @param {Number} y Starting y value of the quote
     */
    constructor(quoteArray, x = null, y = null){
        this.quotes = quoteArray;
        this.position = new Vector(x, y);

        this.textSize = 64;
        textSize(this.textSize);

        this.maxHeight = this.quotes.length * (this.textSize + 2) + 6;
        this.maxWidth = 6;
        for(let i in this.quotes){
            if(textWidth(this.quotes[i]) > this.maxWidth){
                this.maxWidth = textWidth(this.quotes[i]) + 6;
            }
        }

        this.canvas = createGraphics(this.maxWidth, this.maxHeight);


    }

    updateImage(x = this.position.x, y = this.position.y){
        this.canvas.rect(0, 0, this.maxWidth*pixelSize, this.maxHeight*pixelSize);
        this.canvas.textSize(this.textSize);
        for(let i in this.quotes){
            this.canvas.text(this.quotes[i], 4, (parseInt(i) + 1) * (this.textSize + 2));
        }

        drawImage(x, y, this.canvas);
    }
}