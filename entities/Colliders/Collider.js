class Collider{
    constructor(parent){
        this.parent = parent;
        this.index = colliders.length;
        colliders.push(this);
        this.name = 'colliders';
    }

    delete(){
        colliders.splice(this.index, 1);
        for(let i = this.index; i < colliders.length; i++){
            colliders[i].moveDownOneIndex();
        }
    }

    moveDownOneIndex(){
        this.index--;
    }
}