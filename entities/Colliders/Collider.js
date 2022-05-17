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
    
    canCollide(firstCollider, secondCollider){
        for(let i in layerMap){
            if(
                (layerMap[i].a == firstCollider.layer && layerMap[i].b == secondCollider.layer) ||
                (layerMap[i].b == firstCollider.layer && layerMap[i].a == secondCollider.layer)
            ){
                return true;
            }
        }

        return false;
    }
}