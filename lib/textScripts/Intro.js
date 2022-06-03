class Intro{
    /**
    * 
    * @param {Array} quoteList An array of strings, the intro text
    */
    constructor(quoteList){
        this.quoteList = quoteList;

        this.quote = '';
        this.makeNewQuote(0);
    }

    makeNewQuote(index){
        if(index < this.quoteList.length) {
            this.quote = this.quoteList[index];
            time.delayedFunction(this, 'makeNewQuote', 2.2, [index+1]);
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