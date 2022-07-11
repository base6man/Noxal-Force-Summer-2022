class Vector{
    /**
     * @Param {Number} x Vector's x value
     * @Param {Number} y Vector's y value
     */

    constructor(x, y){
        this.x = x;
        this.y = y;
    }

    add(other)     { return new Vector(this.x + other.x, this.y + other.y); }
    subtract(other){ return new Vector(this.x - other.x, this.y - other.y); }
    multiply(other){ return new Vector(this.x * other, this.y * other);     }
    divide(other)  { return new Vector(this.x / other, this.y / other);     }
    
    invert(){ 
        const newVector = new Vector(1/this.x, 1/this.y); 

        // If it was 0 it should now be infinity, but code doesn't like infinity
        if(newVector.x > 9999)  newVector.x = 9999;
        if(newVector.x < -9999) newVector.x = -9999;
        if(newVector.y > 9999)  newVector.y = 9999;
        if(newVector.y < -9999) newVector.y = -9999;

        return newVector;
    }

    addWithFriction(other, friction){
        return (this.add(other.multiply(friction))).divide(1 + friction);
    }

    toString(){
        return this.x + ', ' + this.y;
    }

    get magnitude(){
        return Math.sqrt(this.sqrMagnitude);
    }

    get sqrMagnitude(){
        return Math.pow(this.x, 2) + Math.pow(this.y, 2);
    }

    set magnitude(newMag){
        let currentMag = this.magnitude;

        if(currentMag){
            this.x *= newMag / currentMag;
            this.y *= newMag / currentMag;
        }
    }

    get angle(){
        let angle = Math.atan2(this.y, this.x);
        if(angle < 0) angle += 2*PI;
        return angle;
    }

    set angle(_angle){
        let currentMag = this.magnitude;

        if(currentMag){
            this.x = Math.cos(_angle) * currentMag;
            this.y = Math.sin(_angle) * currentMag;
        }
    }

    isVector(){
        return isNumber(this.x) && isNumber(this.y);
    }

    insideOf(firstCorner, secondCorner){
        return isBetween(this.x, firstCorner.x, secondCorner.x) && isBetween(this.y, firstCorner.y, secondCorner.y);
    }

    lerp(other, time){
        return new Vector(lerp(this.x, other.x, time), lerp(this.y, other.y, time));
    }

    copy(){
        return new Vector(this.x, this.y);
    }
}