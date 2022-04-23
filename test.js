function test(){
    gameLog("Gamelog is working");
    let result = "FAIL";
    let rsmessage;
    //get best troop count symbol => 300 outputs batallion
    if( getBestTroopCountSymbol(300) == "battalion") result = "PASS";
    rsmessage = "getBestTroopCountSymbol() has 300 troops test: " + result;
    gameLog(rsmessage);

    //Iscapital region 
    //using a6 to test
    if(isCapitalRegion("A6")) result = "PASS";
    else result = "FAIL";
    rsmessage = "isCapitalRegion() is A6 test: "+ result;
    gameLog(rsmessage);

    //GameUI => set region owner (test for of, bf, neutral)
    //use region a2 to test
    let savedowner = document.getElementById("a2").classList.item(1);
    GameUI.setRegionOwner("a2","of");
    if(document.getElementById("a2").classList.contains("of")) result = "PASS";
    else result = "FAIL";
    rsmessage = "setRegionOwner() test: "+result;
    gameLog(rsmessage);
    GameUI.setRegionOwner("a2", savedowner); //restore the "owner" of the region

    //Get units in region e0
    let test_unit = GameUI.getUnitsInRegion('b3');
    //get current E0 units info
    let inf_id = document.getElementById("e0").classList.item(1) + "_e0_infantry";
    let inf_count = document.getElementById(inf_id).dataset.count;
    let heli_id = document.getElementById("e0").classList.item(1) + "_e0_helicopter";
    let heli_count = document.getElementById(heli_id).dataset.count;
    let arm_id = document.getElementById("e0").classList.item(1) + "_e0_armor";
    let arm_count = document.getElementById(arm_id).dataset.count;
    //test based on the info
    //if (test_unit[0]._id == inf_id) 


    //force: alter force

    //current health of unit
    let inf_unit = GameUI.getUnitsInRegion("i2")[0];
    rmessage = "The current health of region i2 is " + inf_unit.health;
    gameLog(rmessage);
    //updated current health with 100
    inf_unit.updateHealth(100);
    rmessage = "The updated health of region i2 is " + inf_unit.health;
    gameLog(rmessage);

    //Battle: start 
    //Game: change turn, handle win, handle playermoves 
    if(changeTurn_cb() == true){
        result = "PASS";
    }
    rmessage = "Player turns have changed (as screen below shows) " + result;
    gameLog(rmessage);

}
