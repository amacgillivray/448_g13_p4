function test(){
    gameLog("hello world");
    let result = "FAIL";
    //get best troop count symbol => 300 outputs batallion
    if( getBestTroopCountSymbol(300) == "battalion") result = "PASS";
    let rsmessage = "getBestTroopCountSymbol " + result;
    gameLog(rsmessage);

    //Iscapital region 
    result = "FAIL";
    
    //GameUI => set region owner (test for of, bf, neutral)
    //Get units in region 
    //draw movement arrow  
    //force: alter force, distribute damage side
    //Unit: update health alter units
    //Battle: start 
    //Game: change turn, handle win, handle playermoves 
}


 
//Tests
//Gamelog
//get best troop count symbol => 300 outputs batallion



