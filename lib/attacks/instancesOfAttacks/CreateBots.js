class CreateBots extends Attack{
    
    // For reference only
    // Eventually this function will go away
    createBots(distance, startAngle, finalAngle, numBots){
        for(let i = startAngle; i < finalAngle; i += (finalAngle-startAngle) / numBots){
            let newBoss = new ArtisanBot(this.arenaCenter, this.arenaSize, this.difficulty);

            let newBossPosition = new Vector(distance, 0);
            newBossPosition.angle = i;
            newBoss.position = newBossPosition.add(this.position);

            newBoss.parent = this;
            newBoss.setIndex();

            this.myBots.push(newBoss);
        }
    }
}