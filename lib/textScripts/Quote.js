// The boss and the King use this. Reserved for characters who speak in the textbox
class Quote{
    /**
     * 
     * @param {String} quote Do a string, or I'll convert whatever you put in to one, and the boss will say that 
     * @param {Array} restrictions An array of objects, with string 'name' indicating the name of the functions and array 'param' indicating its parameters
     * @param {Object} parent The parent of the quote. Determines what person to use during checks, as well as text color
     * @param {Number} firstNum The first point at which the quote can be said, measured in previoius quotes
     * @param {Number} lastNum The point at which the quote can no longer be said
     */
    constructor(parent, quote, restrictions, firstNum = null, lastNum = null){
        this.quote = quote;
        this.restrictions = restrictions;
        this.parent = parent;
        if(!firstNum && !lastNum){
            this.firstNum = 1;
            this.lastNum = Infinity
        }
        else if (!lastNum){
            this.firstNum = firstNum;
            this.lastNum = firstNum;
        }
        else{
            this.firstNum = firstNum;
            this.lastNum = lastNum;
        }
    }

    canExcecute(){
        if(!this.quoteListIsTheRightLength()) return false;

        let canCurrentlyExcecute = true;
        for(let i in this.restrictions){
            let myFunction = this.restrictions[i];
            if(myFunction.param){
                if(!this[myFunction.name](myFunction.param)){
                    canCurrentlyExcecute = false;
                }
            }
            else{
                if(!this[myFunction.name]()){
                    canCurrentlyExcecute = false;
                }
            }
        }

        return canCurrentlyExcecute;
    }

    quoteListIsTheRightLength(){ return this.parent.previousQuotes.length.betweenInclusive(this.firstNum-1, this.lastNum-1); }
    comboGreaterThan(num){ return this.parent.comboCounter >= num; }
    comboLessThan(num){ return this.parent.comboCounter <= num; }

    difficultyIs(num){ console.log(difficulty, num); return difficulty == num; }
    difficultyIsBetween(num1, num2){ return difficulty.between(num1, num2); }
}