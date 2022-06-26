class Combo{
    /**
     * 
     * @param {Array} attacks List of lists of attacks
     */
    constructor(attacks){
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
    }

    canStart(){
        let canStart = false;
        
        for(let i in this.attacks[0]){
            if(this.attacks[0][i].canAttack() && !canStart) {
                canStart = true;
                this.attackIndex = 0;
                this.indexWithinCombo = parseInt(i);
            }
        }

        return canStart;
    }

    start(){
        this.numAttacks = 0;
        this.startNextAttack();
    }

    startNextAttack(){
        console.assert(!this.currentAttack.isAttacking);
        this.currentAttack.attack();

        this.isExcecuting = true;
        this.numAttacks++;
    }

    update(){
        if(this.isExcecuting && !this.currentAttack.isAttacking){

            if(isNumber(this.currentAttack.destination)) this.attackIndex = this.currentAttack.destination;
            else{ this.attackIndex++; }
            
            this.indexWithinCombo = 0;
            
            if(this.currentAttack)
            {
                let alreadyAttacking = false;
                for(let i in this.attacks[this.attackIndex]){

                    if(this.attacks[this.attackIndex][i].canContinueCombo() && !alreadyAttacking){
                        this.indexWithinCombo = i;
                        this.startNextAttack();
                        alreadyAttacking = true;
                    }
                }
                
                if(!alreadyAttacking) this.isExcecuting = false;
            }
            else{ this.isExcecuting = false; }
        }

        for(let i of this.attacks){
            for(let j of i){
                j.update();
            }
        }
    }

    stop(){
        this.currentAttack.stop();
        this.isExcecuting = false;
    }

    get currentAttack(){
        if(this.attackIndex < this.attacks.length && this.indexWithinCombo < this.attacks[this.attackIndex].length){
            return this.attacks[this.attackIndex][this.indexWithinCombo];
        }
        else{ return null; }
    }
}