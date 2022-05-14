class BoxCollider extends Collider{
    /**
     * 
     * @param {Object} parent  // The object the collider is attached to
     * @param {Number} offsetX // How much this collider is offset from the center of the parent, x value
     * @param {Number} offsetY // How much this collider is offset from the center of the parent, y value
     * @param {Number} width   // The collider's width
     * @param {Number} height  // The collider's height
     */
    constructor(parent, offsetX, offsetY, width, height){

        super(parent);

        this.offsetX = offsetX;
        this.offsetY = offsetY;
        this.width = width;
        this.height = height;

        this.mass = 1;

        this.isTrigger = false;
        this.static = false;
        this.layer = 'default';
        this.name = 'BoxCollider';
    }

    update(startIndex = 0){
        // This code is really spaggetified. 
        // What I need is a function that can detect collisions and another one to respond
        // That way I won't have to copy paste code for trigger collisions
        // If I ever make a more robust collider engine this will be in it.

        for(let j = startIndex; j < colliders.length; j++){ 
            if((this.isTrigger || colliders[j].isTrigger) && colliders[j] != this){
                // Here I handle trigger collisions
                this.boxBoxTriggerCollision(this, colliders[j]);
            }
            else if(colliders[j].name == 'BoxCollider' && colliders[j] != this){
                this.boxBoxCollision(this, colliders[j]);
            }
        }
    }

    boxBoxCollision(firstCollider, secondCollider){

        let p1 = firstCollider.parent.position;
        let p2 = secondCollider.parent.position;

        let width1 = firstCollider.width;
        let width2 = secondCollider.width;
        let height1 = firstCollider.height;
        let height2 = secondCollider.height;

        console.assert(p1 && p2, firstCollider.parent);

        if(
            Math.abs(p1.x - p2.x) < (width1 + width2)/2 && 
            Math.abs(p1.y - p2.y) < (height1 + height2)/2 &&
            !(firstCollider.static && secondCollider.static) &&
            this.canCollide(firstCollider, secondCollider)
        ) {

            // We have a collision!
            let m1 = firstCollider.mass;
            let m2 = secondCollider.mass;

            let overX = Math.abs(p1.x - p2.x) - (width1 + width2)/2;
            let overY = Math.abs(p1.y - p2.y) - (height1 + height2)/2;
            let overlap = Math.max(overX, overY);

            let direction;
            if(overlap == overX){
                if(p1.x > p2.x){ direction = new Vector(1, 0); }
                else{ direction = new Vector(-1, 0); }
            }
            else if (overlap == overY){
                if(p1.y > p2.y){ direction = new Vector(0, 1); }
                else{ direction = new Vector(0, -1); }
            }

            let out1 = new Vector(0, 0);
            let out2 = new Vector(0, 0);
            
            if(firstCollider.static){
                out2 = direction.multiply(overlap);
            }
            else if (secondCollider.static){
                out1 = direction.multiply(-overlap);
            }
            else{
                out1 = direction.multiply(-overlap).multiply(m2).divide(m1 + m2);
                out2 = direction.multiply(overlap).multiply(m1).divide(m1 + m2);
            }


            firstCollider.parent.position = p1.add(out1);
            secondCollider.parent.position = p2.add(out2);
        }
    }

    boxBoxTriggerCollision(firstCollider, secondCollider){
        let p1 = firstCollider.parent.position;
        let p2 = secondCollider.parent.position;

        let width1 = firstCollider.width;
        let width2 = secondCollider.width;
        let height1 = firstCollider.height;
        let height2 = secondCollider.height;

        console.assert(p1 && p2, firstCollider.parent);

        if(
            Math.abs(p1.x - p2.x) < (width1 + width2)/2 && 
            Math.abs(p1.y - p2.y) < (height1 + height2)/2 &&
            !(firstCollider.static && secondCollider.static) &&
            this.canCollide(firstCollider, secondCollider)
        ) {
            // We have a collision!
            firstCollider.parent.onTriggerCollision(secondCollider.parent);
            secondCollider.parent.onTriggerCollision(firstCollider.parent);
        }
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