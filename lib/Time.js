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

                try{
                    this.waitFunc[i].parent[this.waitFunc[i].funcName](...this.waitFunc[i].args);
                }
                catch{
                    console.log(this.waitFunc[i]);
                }
                this.waitFunc.splice(i, 1);
            }
        }
    }

    delayedFunction(parent, funcName, waitTime, args = []){
        const newElement = {
            parent, funcName, args,
            startTime: waitTime + this.runTime
        }
        this.waitFunc.push(newElement);
    }

    isWaiting(parent, funcName){
        return this.waitingFunctions(parent, funcName).length > 0;
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
        let list1 = this.waitFunc.filter(item => (funcName !== item.funcName && funcName) || (item.parent !== parent && parent));
        this.waitFunc = list1;
    }

    stopFunctionsWithKeyword(parent, keyword){
        // Called from line 274 in boss.js
        // Used to stop all functions from boss.js with the string shootBullet in them
        // Does that, but sometimes also deletes the next item in the list and scrambles the list
        // Either both scrambles and deletes an extra item or does niether

        let list1 = this.waitFunc.filter(item => (!keyword.test(item.funcName)) || (item.parent !== parent && parent));
        let list2 = [...list1]
        
        console.log(list1, list2, this.waitFunc, parent, keyword);
        this.waitFunc = list2;
        
        // Either list1 or list2 is guaranteed to be the correct list, but never both
        // It seems like they should be the same
    }


}