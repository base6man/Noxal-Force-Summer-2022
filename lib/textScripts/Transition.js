class Transition{
    /**
    * 
    * @param {Array} quoteList An array of strings, the intro text
    */
    constructor(quoteList){
        this.quoteList = quoteList;

        this.quote = '';
        if(this.quoteList.length > 0) this.makeNewQuote(0);
    }

    addQuote(newQuote){
        this.quoteList.push(newQuote);
        // If this is the first quote
        if(this.quoteList.length == 1) this.makeNewQuote(0);
    }

    makeNewQuote(index){
        if(index < this.quoteList.length) {
            this.quote = this.quoteList[index];
            let quoteTime = 1.3 + this.quote.length / 30;
            time.delayedFunction(this, 'makeNewQuote', quoteTime, [index+1], true);
            console.log('Quote time = ' + quoteTime);
        }
        else{
            this.quote = ''
            createScene();
        }
    }

    update(){
        textAlign(CENTER, CENTER);
        textSize(60);
        fill(255);
        noStroke();
        text(this.quote, width/2, height/2);
    }
}