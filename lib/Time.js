class Time{

    constructor(parent = null){
        this.parent = parent;

        this.runTime = 0;
        this.frameCount = 0;
        this.deltaTime;

        this.waitFunc = [];

        this.maxTimeStep = 0.25;
    }

    update(){
        this.deltaTime = Math.min(deltaTime / 1000, this.maxTimeStep) * globalTimescale / steps;
        this.runTime += this.deltaTime;
        this.frameCount += 1 / steps;

        for(let i = this.waitFunc.length - 1; i >= 0; i--){
            if(this.waitFunc[i].startTime < this.runTime){

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
    }

    get frameRate(){
        return 1 / (this.deltaTime * steps);
    }

    delayedFunction(parent, funcName, waitTime, args = [], outsideOfScene = false){
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

        console.log(this.waitFunc);
        return removedList;
    }
}