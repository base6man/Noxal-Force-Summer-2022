class Canvas{
    /**
     * @param {Object} image The image associated with the canvas
     * @param {Number} width Box width if no image, does nothing if an image is provided
     * @param {Number} height Box height if no image, does nothing if an image is provided
     */
    constructor(image, width = 0, height = 0){
        this.image = image;
        if(this.image){
            this.width = this.image.width;
            this.height = this.image.height;
        }
        else{
            this.width = width;
            this.height = height;
        }
        this.canvas = createGraphics(this.width*pixelSize, this.height*pixelSize);
        this.name;
    }

    setup(){
        if(this.image){
            this.addImage(this.image, this.rotation);
        }
        else{
            this.addBox();
        }
    }

    draw(x, y, rotation = 'right'){
        drawImage(x, y, this.canvas, rotation, this.name);
    }

    addBox(){
        this.canvas.noStroke();
        this.canvas.fill(0);
        this.canvas.rect(0, 0, this.canvas.width, this.canvas.height);
    }

    addImage(img, rotation = 'right'){
        
        img.loadPixels();

        this.canvas.noStroke();
        let p = pixelSize; // I use this a ton, so I'm shortening it

        let x, y;
        // Iterate through both the image's height and width
        for(y = 0; y < this.height; y++){
            for(x = 0; x < this.width; x++){
                push();

                // Load pixels into a p5 color
                let r = img.pixels[y*this.width*4 + x*4];
                let g = img.pixels[y*this.width*4 + x*4+1];
                let b = img.pixels[y*this.width*4 + x*4+2];
                let a = img.pixels[y*this.width*4 + x*4+3];
                
                let clr = color(r, g, b, a);
                clr.setAlpha(a * 255);
                this.canvas.fill(clr);
                //fill(clr);
                
                let finalX, finalY;
                // Peraps I can import numerical directions; that would be nice
                // This is terrible code, but I don't know how to make it better
                switch(rotation){
                case 'up':
                    finalX = y*p;
                    finalY = -x*p + (width-1)*p;
                    //canvas.rect(y*p, -x*p + (img.width-1)*p, p);
                    break;
                case 'left':
                    finalX = -x*p + (width-1)*p;
                    finalY = -y*p + (height-1)*p;
                    //canvas.rect(-x*p + (img.width-1)*p, -y*p + (img.height-1)*p, p);
                    break;
                case 'down':
                    finalX = -y*p + (height-1)*p;
                    finalY = x*p;
                    //canvas.rect(-y*p + (img.height-1)*p, x*p, p);
                    break;
                case 'right':
                    finalX = x*p;
                    finalY = y*p;
                    //canvas.rect(x*p, y*p, p);
                    break;
                default:
                    console.log('Image rotation has reached an impossible state.');
                }

                this.canvas.rect(finalX, finalY, p);

                pop();
            }
        }
    }
}