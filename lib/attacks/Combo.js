class Combo{
    /**
     * 
     * @param {Array} attacks List of lists of attacks
     */
    constructor(name, attacks){
        this.name = name;
        this.attacks = attacks;

        this.isExcecuting = false;
        this.attackIndex = 0;
        this.indexWithinCombo = 0;

        this.numAttacks;

        for(let i of this.attacks){
            for(let j of i){
                j.getCombo(this);
            }
        }

        this.canRepeat = false;
    }

    getParent(parent){
        this.parent = parent;
    }

    canStart(){
        if(this.parent.previousCombos[this.parent.previousCombos.length-1] == this && !this.canRepeat) {
            return false;
        }

        let canStart = false;
        
        for(let i in this.attacks[0]){
            if(this.attacks[0][i].canAttack() && !canStart) {
                canStart = true;
            }
        }

        return canStart;
    }

    canContinueCombo(index = 0){
        let canStart = false;
        
        for(let i in this.attacks[index]){
            if(this.attacks[index][i].canContinueCombo() && !canStart) {
                canStart = true;
            }
        }

        return canStart;
    }

    start(index = 0, isContinue = false){
        this.attackIndex = index;
        
        let canStart = false;
        for(let i in this.attacks[index]){
            if(!canStart && (
                (this.attacks[index][i].canAttack() && !isContinue) ||
                (this.attacks[index][i].canContinueCombo() && isContinue))
            ) {
                canStart = true;
                this.indexWithinCombo = parseInt(i);
            }
        }

        this.numAttacks = 0;
        console.assert(canStart, this.name);
        this.startNextAttack();
    }

    startNextAttack(){
        console.assert(!this.currentAttack.isAttacking, this.name);

        this.isExcecuting = true;
        this.numAttacks++;
        
        this.currentAttack.attack();
    }

    update(){
        console.assert(this.currentAttack, this.attackIndex, this.indexWithinCombo, this.name);
        if(this.isExcecuting && !this.currentAttack.isAttacking){

            if(this.currentAttack.differentComboDestination){
                this.parent.startComboWithName(this.currentAttack.differentComboDestination, this.currentAttack.destination);
                this.stop();
                return;
            }
            else if(isNumber(this.currentAttack.destination)) this.attackIndex = this.currentAttack.destination;
            else{ this.attackIndex++; }
            
            this.indexWithinCombo = 0;
            
            if(this.currentAttack)
            {
                let alreadyAttacking = false;
                for(let i in this.attacks[this.attackIndex]){

                    if(this.attacks[this.attackIndex][i].canContinueCombo() && !alreadyAttacking){
                        this.indexWithinCombo = parseInt(i);
                        this.startNextAttack();
                        alreadyAttacking = true;
                    }
                }
                
                if(!alreadyAttacking) this.stop();
            }
            else{ this.stop(); }
        }

        for(let i of this.attacks){
            for(let j of i){
                j.update();
            }
        }
    }

    stop(){
        if(this.currentAttack && this.currentAttack.isAttacking) this.currentAttack.stop();
        this.isExcecuting = false;
        this.attackIndex = 0;
        this.indexWithinCombo = 0;
    }

    get currentAttack(){
        if(this.attackIndex < this.attacks.length && this.indexWithinCombo < this.attacks[this.attackIndex].length){
            return this.attacks[this.attackIndex][this.indexWithinCombo];
        }
        else{ return null; }
    }

    kill(){
        this.stop();
        for(let i of this.attacks){
            for(let j of i) j.kill();
        }
    }
}