function test(){
    gameLog("hello world");
    let result = "FAIL";
    let rsmessage;
    let totalmessage;
    //get best troop count symbol => 300 outputs batallion
    if( getBestTroopCountSymbol(300) == "battalion") result = "PASS";
    rsmessage = "getBestTroopCountSymbol() test: " + result;
    totalmessage += rsmessage + "\n";

    //Iscapital region 
    //using a6 to test
    if(isCapitalRegion("A6")) result = "PASS";
    else result = "FAIL";
    rsmessage = "isCapitalRegion() test: "+ result;
    totalmessage += rsmessage + "\n";

    //GameUI => set region owner (test for of, bf, neutral)
    //use region a2 to test
    let savedowner = document.getElementById("a2").classList.item(1);
    GameUI.setRegionOwner("a2","of");
    if(document.getElementById("a2").classList.contains("of")) result = "PASS";
    else result = "FAIL";
    rsmessage = "setRegionOwner() test: "+result;
    totalmessage += rsmessage + "\n";
    GameUI.setRegionOwner("a2", savedowner); //restore the "owner" of the region

    //Get units in region e0
    let test_units=[];
    //test_units.push(new Unit())
    gameLog(totalmessage);
    //if(GameUI.getUnitsInRegion("e0"))


    //draw movement arrow  
    //force: alter force, distribute damage side
    //Unit: update health alter units
    //Battle: start 
    //Game: change turn, handle win, handle playermoves 

}


 
//Tests
//Gamelog
//get best troop count symbol => 300 outputs batallion



