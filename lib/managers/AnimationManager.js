class AnimationManager{
    /**
     * @param {Array} animations An array of animations, each with a parent, name, animator, and canRun
     */

    constructor(animations){
        this.animations = animations;
        this.currentAnimation;
    }

    update(){
        // First animations take precedence
        let alreadyRunningAnAnimation = false;

        for(let i in this.animations){
            if(this.animations[i].canRun && !alreadyRunningAnAnimation){

                alreadyRunningAnAnimation = true;
                if(this.animations[i].animation != this.currentAnimation){
                    
                    if(this.currentAnimation){
                        this.currentAnimation.stop();
                    }
                    
                    this.animations[i].animation.run();
                    this.currentAnimation = this.animations[i].animation;
                }
            }
        }

        console.assert(this.currentAnimation);
    }

    draw(x, y, rotation = 'right'){
        if(!this.currentAnimation.canRotate) rotation = 'right';
        this.currentAnimation.currentImage.draw(x, y, rotation);
    }
}