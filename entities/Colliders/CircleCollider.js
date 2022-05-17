class CircleCollider extends Collider{
    constructor(parent, offsetX, offsetY, radius){
        super(parent);

        this.offsetX = offsetX;
        this.offsetY = offsetY;
        this.radius = radius;

        this.mass = 1;
        
        this.isTrigger = false;
        this.static = false;
        this.layer = 'default';
        this.type = 'CircleCollider';
    }

    update(startIndex = 0){
        // This code is really spaggetified. 
        // What I need is a function that can detect collisions and another one to respond
        // That way I won't have to copy paste code for trigger collisions
        // If I ever make a more robust collider engine this will be in it.

        for(let j = startIndex; j < colliders.length; j++){ 
            if((this.isTrigger || colliders[j].isTrigger) && colliders[j] != this){
                // Here I handle trigger collisions
                if(colliders[j].type == 'CircleCollider'){
                    this.circleBoxTriggerCollision(this, colliders[j]);
                }
            }
            else if(colliders[j].type == 'BoxCollider' && colliders[j] != this){
                this.circleBoxCollision(this, colliders[j]);
            }
        }
    }

    circleBoxTriggerCollision(firstCollider, secondCollider){
        let p1 = firstCollider.parent.position;
        let p2 = secondCollider.parent.position;

        let width = secondCollider.width;
        let height = secondCollider.height;
        let radius = firstCollider.radius;

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

    circleBoxCollision(firstCollider, secondCollider){
        // Do nothing!
    }
}