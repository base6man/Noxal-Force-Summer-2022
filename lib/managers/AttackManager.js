class AttackManager{
    /**
     * @param {Boss} parent the parent, dude. If I find a shortcut to this, I don't know what I'll do
     */
    constructor(parent){
        this.parent = parent;
        this.agressiveness = this.parent.agressiveness;

        this.comboList;
        this.currentCombo;
        this.previousCombos = []

        this.comboCounter = 0;
        this.comboCooldownScale = 2;
        this.maxComboCounter = this.parent.maxComboCounter;

        this.canAttack = true;

        this.waitTime = 0;

        this.firstCombo;
    }
    
    /**
    * @param {Array} list an array of combos
    */
    addComboList(list){
        this.comboList = list;

        for(let i of this.comboList){
            i.getParent(this);
        }
    }
    
    update(){
        
        if(this.currentCombo && !this.currentCombo.isExcecuting){
            this.currentCombo = null;
            this.isAttacking = false;
        }

        for(let i of this.comboList) i.update();

        if(!this.currentCombo) this.decideCombo();
    }

    balanceAttacks(){
        let finalList = [];
        for(let i of this.comboList){

            if(
                (this.difficulty >= i.minDifficulty || typeof i.minDifficulty == 'undefined') &&
                (this.difficulty <= i.maxDifficulty || typeof i.maxDifficulty == 'undefined')
            ){
                finalList.push(i);
            }
        }

        this.comboList = finalList;
    }



    decideCombo(){
        this.decidingCombo = true;
        if((this.currentCombo && this.currentCombo.isExcecuting) || !this.canAttack) return;

        for(let i of this.comboList){
            for(let k of i.attacks){
                console.assert(!k.isAttacking, i, k);
            }
        }

        let startingAttack = false;
        for(let i in this.comboList){
            let combo = this.comboList[i];

            if(combo.canStart() && !startingAttack){
                startingAttack = true;
                this.startCombo(combo);
            }
        }

        if(!startingAttack){
            this.dontStartCombo();
        }
    }



    startComboWithName(comboName, startIndex = 0){
        let myCombo = this.findComboWithName(comboName);

        if(myCombo.canContinueCombo(startIndex)) this.startCombo(myCombo, startIndex);
        else{ this.dontStartCombo(); }
    }

    startCombo(combo, startIndex = 0){
        let temp = combo;
        this.comboList.splice(this.comboList.indexOf(combo), 1);
        this.comboList.push(temp);

        this.isAttacking = true;
        this.decidingCombo = false;
        this.currentCombo = combo;

        this.previousCombos.push(combo);
        
        combo.start(startIndex);
    }

    dontStartCombo(){
        this.parent.returnToRunSpeed();
        this.isAttacking = false;
        this.decrementComboCounter(time.deltaTime);
        this.currentCombo = null;
    }

    stopCombo(){
        this.isAttacking = false;
        if(this.currentCombo) this.currentCombo.stop();
    }

    findComboWithName(name){
        for(let i of this.comboList){
            if(i.name = name) return i;
        }
    }

    waitForSeconds(seconds){
        this.stopCombo();
        this.canAttack = false;
        this.decrementComboCounter(seconds);
        time.delayedFunction(this, 'startAttacking', seconds);
    }

    startAttacking(){
        this.canAttack = true;
        if(this.firstCombo) this.startCombo(this.firstCombo);
    }

    get attackDelay(){
        if(this.comboCounter <= this.maxComboCounter) return 0;

        return this.comboCounter / 2 / this.comboCooldownScale;
    }

    get currentAttack(){
        if(!this.currentCombo) return null;
        return this.currentCombo.currentAttack;
    }

    
    incrementComboCounter(comboAdd){
        console.assert(isNumber(comboAdd), comboAdd);
        this.comboCounter += comboAdd / this.agressiveness;
    }

    decrementComboCounter(comboSubtract){
        console.assert(isNumber(comboSubtract), comboSubtract);
        this.waitTime += comboSubtract * this.comboCooldownScale;
        this.comboCounter -= comboSubtract * this.comboCooldownScale;
    }

    // Isn't affected by agression or cooldownScale
    set comboCounter(_comboCounter){
        this.trueComboCounter = Math.max(0, _comboCounter);
    }
    
    get comboCounter(){
        return this.trueComboCounter;
    }
    
}