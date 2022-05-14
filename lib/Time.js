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
                this.waitFunc[i].parent[this.waitFunc[i].funcName](...this.waitFunc[i].args);
                this.waitFunc.splice(i, 1);
            }
        }
    }

    delayedFunction(parent = this.parent, funcName, waitTime, args = []){
        const newElement = {
            parent, funcName, args,
            startTime: waitTime + this.runTime
        }

        //newElement.args = args;
        this.waitFunc.push(newElement);
    }

    isWaiting(parent = null, funcName){
        let isWaiting = false;
        for(let i in this.waitFunc){
            if(this.waitFunc[i].funcName == funcName && (this.waitFunc[i].parent == parent || !parent)){
                isWaiting = true;
            }
        }
        return isWaiting;
    }

    stopFunctions(parent = null, funcName){
        let list = [];
        for(let i = 0; i < this.waitFunc.length; i++){
            if(funcName != this.waitFunc[i].funcName || this.waitFunc[i].parent != parent){
                list.push(this.waitFunc[i]);
            }
        }

        let tempList = [];
        for(let i in list){
            tempList.push(list[i]);
        }

        this.waitFunc = tempList;
    }

    stopFunctionsWithKeyword(parent = null, keyword){
        // Called from line 274 in boss.js
        // Used to stop all functions from boss.js with the string shootBullet in them
        // Does that, but sometimes also deletes the next item in the list and scrambles the list
        // Either both scrambles and deletes an extra item or does niether

        let list1 = this.waitFunc.filter(item => !keyword.test(item.funcName) || item.parent !== parent);
        let temp2 = [...list1];


        this.waitFunc = list1;
        //this.waitFunc = list2;

        // Either list1 or list2 is guaranteed to be the correct list, but never both
        // It seems like they should be the same
    }


}