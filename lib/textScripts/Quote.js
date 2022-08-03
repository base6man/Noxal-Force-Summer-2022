class Quote{
    constructor(quote, quoteTime = 0, image, offset = new Vector(0, 0), velocity = new Vector(0, 0)){
        this.quote = quote;
        this.quoteTime = quoteTime;
        this.image = image;
        this.offset = offset;
        this.velocity = velocity;
    }
}