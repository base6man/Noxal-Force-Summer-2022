class Transition{
    /**
    * 
    * @param {Array} quoteList An array of strings, the intro text
    */
    constructor(quoteList){
        this.quoteList = quoteList;

        this.quote = '';
        this.image;
        this.imageOffset;

        this.quoteTimeMultiplier = 1.5;

        this.index;

        this.startingShadowStrength = 255;
        this.minimumShadowStrength = 110;
        this.shadowStrengthChangePerSecond = 200;

        this.quoteTime;
        this.timeOfLastQuote;

        
        if(this.quoteList.length > 0) this.makeNewQuote(0);
    }

    addQuote(newQuote){
        this.quoteList.push(newQuote);
        // If this is the first quote
        if(this.quoteList.length == 1) this.makeNewQuote(0);
    }

    makeNewQuote(index){
        if(index < this.quoteList.length) {

            /*
            let lastImageIndex = this.imageIndex;
            this.imageIndex = index;
            if(this.images[this.imageIndex] != this.images[lastImageIndex]){
                this.shadowStrength = this.startingShadowStrength;
            }
            */

            this.index = index;

            this.quote = this.quoteList[index].quote;
            this.image = this.quoteList[index].image;
            this.imageOffset = this.quoteList[index].offset;
            this.imageVelocity = this.quoteList[index].velocity;

            console.assert(this.quote, this.quoteList, index);

            if(this.quoteList[index].quoteTime) this.quoteTime = this.quoteList[index].quoteTime / introSpeed;
            else{ this.quoteTime = this.quoteTimeMultiplier * (1.3 + this.quote.length / 30) / introSpeed; }

            time.delayedFunction(this, 'makeNewQuote', this.quoteTime, [index+1], true);

            if(time.songTime) this.lastSongTime = time.songTime;
            else{   this.lastSongTime = 0; }

            this.timeOfLastQuote = time.runTime;
        }
        else{
            this.quote = ''
            createScene();
        }
    }

    get timeSinceLastQuote(){
        if(this.lastImageWasTheSame()) return 999;
        return time.runTime - this.timeOfLastQuote;
    }

    get timeUntilNextQuote(){
        if(this.nextImageIsTheSame()) return 999;
        return this.quoteTime - (time.runTime - this.timeOfLastQuote);
    }

    get shadowStrength(){
        let shadow = this.startingShadowStrength - this.shadowStrengthChangePerSecond*Math.min(this.timeSinceLastQuote, this.timeUntilNextQuote)
        return Math.max(this.minimumShadowStrength, shadow);
    }

    nextImageIsTheSame(){
        if(!this.quoteList[this.index+1]) return false;
        return this.quoteList[this.index].image == this.quoteList[this.index+1].image;
    }

    lastImageWasTheSame(){
        if(!this.quoteList[this.index-1]) return false;
        return this.quoteList[this.index].image == this.quoteList[this.index-1].image;
    }

    update(){
        /*
        if(this.shadowStrength > this.minimumShadowStrength + this.shadowStrengthChangePerSecond * time.deltaTime){
            this.shadowStrength -= this.shadowStrengthChangePerSecond * time.deltaTime;
        }
        */

        if(this.imageVelocity)
            this.imageOffset = this.imageOffset.add(this.imageVelocity.multiply(time.deltaTime));
        
        if(this.image)  {
            imageMode(CENTER);
            image(this.image, width/2 + this.imageOffset.x, height/2 - this.imageOffset.y);
            imageMode(CORNER);
        }

        push();
        {
            console.log(this.shadowStrength);
            fill(0, 0, 0, this.shadowStrength);
            noStroke();
            rect(0, 0, width, height);
        }
        pop();

        textAlign(CENTER, CENTER);
        textSize(40);
        textLeading(80);
        fill(255);
        noStroke();
        textFont(transitionFont);
        text(this.quote, width/2, height-100);

    }
}