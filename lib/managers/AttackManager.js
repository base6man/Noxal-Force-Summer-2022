class AttackManager{
    /**
     * @param {Boss} parent the parent, dude. If I find a shortcut to this, I don't know what I'll do
     */
    constructor(parent){
        this.parent = parent;
        this.agressiveness = this.parent.agressiveness;

        this.comboList;
        this.currentCombo;

        this.comboCounter = 0;
        this.canAttack = true;

        this.previousAttacks = [];
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
        }

        if(this.currentCombo) this.currentCombo.update();
        else{ this.decideCombo(); }
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
        for(let i of this.comboList){
            for(let j of i){
                for(let k of j.attacks){
                    console.assert(!k.isAttacking, j, k);
                }
            }
        }

        if((this.currentCombo && this.currentCombo.isExcecuting) || !this.canAttack) return;
        this.parent.returnToRunSpeed();

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
                    this.currentCombo = combo;

                    this.previousAttacks.push(combo);      // AAAAAAAAAAAAAAAh
                    if(combo.agression) this.incrementComboCounter(combo.agression);  // Deal with this later
                    else{ this.incrementComboCounter(1); }

                    combo.start();
                }
            }
        }

        if(!startingAttack){
            this.isAttacking = false;
            this.comboCounter -= time.deltaTime;
            this.currentCombo = null;
        }
    }

    incrementComboCounter(comboAdd){
        this.trueComboCounter += comboAdd / this.agressiveness;
    }

    // Isn't affected by agression, does exactly what it professes to
    set comboCounter(_comboCounter){
        this.trueComboCounter = _comboCounter;
    }
    
    get comboCounter(){
        return this.trueComboCounter;
    }
}