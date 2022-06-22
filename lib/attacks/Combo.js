class Combo{
    constructor(attacks){
        this.attacks = attacks;
        this.isExcecuting = false;
        this.attackIndex;
    }

    canStart(){
        return this.attacks[0].canAttack();
    }

    start(){
        this.attackIndex = 0;
        this.startNextAttack();
    }

    startNextAttack(){
        console.assert(!this.currentAttack.isAttacking);
        this.currentAttack.attack();
        this.isExcecuting = true;
    }

    update(){
        if(this.isExcecuting && !this.currentAttack.isAttacking){

            this.attackIndex++;
            if(this.currentAttack && this.currentAttack.canAttack()) this.startNextAttack();
            else{ this.isExcecuting = false; }
        }
    }

    get currentAttack(){
        return this.attacks[this.attackIndex];
    }
}