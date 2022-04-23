function test(){
    gameLog("hello world");
    let result = "FAIL";
    let rsmessage;
    //get best troop count symbol => 300 outputs batallion
    if( getBestTroopCountSymbol(300) == "battalion") result = "PASS";
    rsmessage = "getBestTroopCountSymbol() test: " + result;
    gameLog(rsmessage);

    //Iscapital region 
    if(isCapitalRegion("A6")) result = "PASS";
    else result = "FAIL";
    rsmessage = "isCapitalRegion() test: "+ result;
    gameLog(rsmessage);

    //GameUI => set region owner (test for of, bf, neutral)
    let savedowner = document.getElementById("a2").classList.item(1);
    GameUI.setRegionOwner("a2","of");
    if(document.getElementById("a2").classList.contains("of")) result = "PASS";
    else result = "FAIL";
    rsmessage = "setRegionOwner() test: "+result;
    gameLog(rsmessage);
    GameUI.setRegionOwner("a2", savedowner); //restore the "owner" of the region

    //Get units in region e0
    if(GameUI.getUnitsInRegion("e0"))


    //draw movement arrow  
    //force: alter force, distribute damage side
    //Unit: update health alter units
    //Battle: start 
    //Game: change turn, handle win, handle playermoves 

}


 
//Tests
//Gamelog
//get best troop count symbol => 300 outputs batallion



