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
        this.type = 'BoxCollider';
    }

    update(startIndex = 0){

        for(let j = startIndex; j < scene.colliders.length; j++){ 
            if((this.isTrigger || scene.colliders[j].isTrigger) && scene.colliders[j] != this){
                // Here I handle trigger collisions
                if(scene.colliders[j].type == 'BoxCollider'){
                    this.boxBoxTriggerCollision(this, scene.colliders[j]);
                }
                else if (scene.colliders[j].type == 'CircleCollider'){
                    this.boxCircleTriggerCollision(this, scene.colliders[j]);
                }
            }
            // Non trigger collisions
            else if(scene.colliders[j].type == 'BoxCollider' && scene.colliders[j] != this){
                this.boxBoxCollision(this, scene.colliders[j]);
            }
            else if(scene.colliders[j].type == 'CircleCollider' && scene.colliders[j] != this){
                console.log('Circles are only trigger colliders!');
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

            try{ firstCollider.parent.onColliderCollision(secondCollider.parent); }
            catch{ }
            try{ secondCollider.parent.onColliderCollision(firstCollider.parent); } 
            catch{ } // These are just if thens, but I don't know how to check if an object has a function
            
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

    boxCircleTriggerCollision(firstCollider, secondCollider){
        let p1 = secondCollider.parent.position;
        let p2 = firstCollider.parent.position;

        let width = firstCollider.width;
        let height = firstCollider.height;
        let radius = secondCollider.radius;

        // which edge is closest?
        let test = new Vector(p2.x, p2.y);
        if (p1.x < p2.x - width/2)       test.x = p2.x - width/2;
        else if (p1.x > p2.x + width/2)  test.x = p2.x + width/2;
        if (p2.y < p2.y - height/2)      test.y = p2.y - height/2;
        else if (p2.y > p2.y + height/2) test.y = p2.y + height/2;

        // get distance from closest edges
        let distance = new Vector(p1.x-test.x, p1.y-test.y).magnitude;

        if(
            distance <= radius &&
            !(firstCollider.static && secondCollider.static) &&
            this.canCollide(firstCollider, secondCollider)
        ){
            // We have a collision!
            firstCollider.parent.onTriggerCollision(secondCollider.parent);
            secondCollider.parent.onTriggerCollision(firstCollider.parent);
        }
    }
}