class Time{

    constructor(parent = null){
        this.parent = parent;

        this.runTime = 0;
        this.frameCount = 0;
        this.deltaTime;

        this.waitFunc = [];

        this.maxTimeStep = 0.25;

        this.hitStopMultiplier = 1;
    }

    update(){
        this.deltaTime = Math.min(deltaTime / 1000, this.maxTimeStep) * globalTimescale * this.hitStopMultiplier / steps;
        this.runTime += this.deltaTime;
        this.frameCount += 1 / steps;
        
        this.isLooping = true;
        for(let i = this.waitFunc.length - 1; i >= 0; i--){
            this.loopIndex = i;

            // Sometimes some earlier items in the list get prematurely stopped
            // Usually by whoever called them in the first place
            // This can mess up the index
            // But it doesn't skip anything, it just skips it back
            // I think I can ignore it. If anything goes wrong, the index needs to be adjusted
            if(this.waitFunc[i] && this.waitFunc[i].startTime < this.runTime){

                let tempFunc = this.waitFunc[i];
                this.waitFunc.splice(i, 1);

                try{
                    tempFunc.parent[tempFunc.funcName](...tempFunc.args);
                }
                catch(e){
                    console.log(tempFunc.funcName, tempFunc, e);
                    throw(e);
                }
            }
        }
        this.isLooping = false;
    }

    get frameRate(){
        return 1 / (this.deltaTime * steps / globalTimescale / this.hitStopMultiplier);
    }

    delayedFunction(parent, funcName, waitTime, args = [], outsideOfScene = false){
        console.assert(isNumber(waitTime), parent, funcName, waitTime);
        const newElement = {
            parent, funcName, args, outsideOfScene,
            startTime: waitTime + this.runTime
        }
        return this.waitFunc.push(newElement);
    }

    isWaiting(parent, funcName){
        return this.waitingFunctions(parent, funcName).length > 0;
    }

    stop(waitfuncObj) {
        return this.waitFunc.splice(this.waitFunc.indexOf(waitfuncObj), 1);
    }

    waitingFunctions(parent, funcName){
        let newWaitFunc = [];
        for(let i in this.waitFunc){
            if((this.waitFunc[i].funcName == funcName || !funcName) && (this.waitFunc[i].parent == parent || !parent)){
                newWaitFunc.push(this.waitFunc[i]);
            }
        }
        return newWaitFunc;
    }

    stopFunctions(parent, funcName){
        let removedList = this.waitFunc.filter(item => (funcName == item.funcName || !funcName) && (item.parent == parent || !parent));
        this.waitFunc = this.waitFunc.filter(item => !((funcName == item.funcName || !funcName) && (item.parent == parent || !parent)));
        return removedList;
    }

    stopFunctionsWithKeyword(parent, keyword){

        let removedList = this.waitFunc.filter(item => keyword.test(item.funcName) && (item.parent == parent || parent));
        this.waitFunc = this.waitFunc.filter(item => !(keyword.test(item.funcName) && (item.parent == parent || parent)));
        return removedList;
    }

    stopAllFunctions(){
        let removedList = [...this.waitFunc];
        this.waitFunc = [];
        return removedList;
    }

    stopFunctionsWithinScene(){
        let removedList = this.waitFunc.filter(item => !item.outsideOfScene);
        this.waitFunc = this.waitFunc.filter(item => item.outsideOfScene);
        return removedList;
    }
    
    hitStop(time, speed = 0.01){
        this.hitStopMultiplier = speed;
        scene.mainCamera.freeze();
        this.delayedFunction(this, 'stopHitStop', time*speed);
    }

    stopHitStop(){
        this.hitStopMultiplier = 1;
        scene.mainCamera.unfreeze();
    }
}