class AttackManager{
    /**
     * @param {Boss} parent the parent, dude. If I find a shortcut to this, I don't know what I'll do
     */
    constructor(parent){
        this.parent = parent;
        this.timeBetweenCombos = this.parent.timeBetweenCombos;
        this.agressiveness = this.parent.agressiveness;

        this.comboList;
        this.currentCombo;

        // Do not use. Pointless!
        //this.comboCounter = 0;
        //this.comboCooldownScale = 0.5;

        this.canAttack = true;
        
        this.decidingCombo = false;
    }
    
    /**
    * @param {Array} list an array of arrays of Combo. For reference, check comboList in OldBoss.js
    */
    addComboList(list){
        this.comboList = list;
    }
    
    update(){
        if(this.currentCombo && !this.currentCombo.isExcecuting && this.canAttack){
            this.currentCombo = null;
            this.isAttacking = false;
        }

        if(this.currentCombo) this.currentCombo.update();
        else if(this.decidingCombo) this.decideCombo();

        else if(!time.isWaiting(this, 'decideCombo')){ 

            time.delayedFunction(this, 'decideCombo', this.timeBetweenCombos);
            //this.decrementComboCounter(this.timeBetweenCombos);
        }
    }

    balanceAttacks(){
        let finalList = [[]];
        for(let i in this.comboList){
            for(let j in this.comboList[i]){
                let combo = this.comboList[i][j];

                let attack;
                if(combo.parent) attack = combo.parent;
                else{ attack = combo.nextAttack; }

                let keepItem = true;
                for(let i in this.restrictedAttacks){
                    let myAttack = this.restrictedAttacks[i];
                    if(myAttack.name == attack && 
                        (myAttack.minDifficulty > this.difficulty || typeof myAttack.minDifficulty == 'undefined') &&
                        (myAttack.maxDifficulty < this.difficulty || typeof myAttack.maxDifficulty == 'undefined')
                    ){ 
                        keepItem = false;
                    }
                }

                if(keepItem) finalList[i].push(combo);
            }
            finalList.push([]);
        }

        for(let i = finalList.length-1; i >= 0; i--){
            if(finalList[i].length == 0) finalList.splice(i, 1);
        }

        this.comboList = finalList;
    }

    decideCombo(){
        this.decidingCombo = true;
        if((this.currentCombo && this.currentCombo.isExcecuting) || !this.canAttack) return;
        this.parent.returnToRunSpeed();

        for(let i of this.comboList){
            for(let j of i){
                for(let k of j.attacks){
                    console.assert(!k.isAttacking, j, k);
                }
            }
        }


        let startingAttack = false;
        for(let i in this.comboList){
            for(let j in this.comboList[i]){
                let combo = this.comboList[i][j];

                if(combo.canStart() && !startingAttack){
                    let temp = combo;
                    this.comboList[i].splice(j, 1);
                    this.comboList[i].push(temp);

                    startingAttack = true;
                    this.isAttacking = true;
                    this.decidingCombo = false;
                    this.currentCombo = combo;
                    
                    combo.start();
                }
            }
        }

        if(!startingAttack){
            this.isAttacking = false;
            //this.decrementComboCounter(time.deltaTime);
            this.currentCombo = null;
        }
    }

    stopCombo(){
        this.isAttacking = false;
        if(this.currentCombo) this.currentCombo.stop();
    }

    /*
    incrementComboCounter(comboAdd){
        this.comboCounter += comboAdd / this.agressiveness;
    }

    decrementComboCounter(comboSubtract){
        this.comboCounter -= comboSubtract * this.comboCooldownScale;
    }

    // Isn't affected by agression or cooldownScale
    set comboCounter(_comboCounter){
        this.trueComboCounter = Math.max(0, _comboCounter);
    }
    
    get comboCounter(){
        return this.trueComboCounter;
    }
    */
}