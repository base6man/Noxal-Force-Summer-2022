class AnimationManager{
    /**
     * @param {Array} animations An array of animations, each with a name, animator, and canRun
     */

    constructor(animations){
        this.animations = animations;
        this.currentAnimation;
    }

    update(){
        // First animations take precedence
        let alreadyRunningAnAnimation = false;

        for(let i in this.animations){
            if(this.animations[i].canRun && this.animations[i].animation != this.currentAnimation){

                if(this.currentAnimation){
                    this.currentAnimation.stop();
                }
                
                alreadyRunningAnAnimation = true;
                this.animations[i].animation.run();
                this.currentAnimation = this.animations[i].animation;
            }
        }
    }

    draw(x, y, rotation = 'right'){
        this.currentAnimation.currentImage.draw(x, y, rotation);
    }
}