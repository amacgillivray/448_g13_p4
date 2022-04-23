function test(){
    gameLog("Gamelog is working");
    let bool_result=true;
    let result = "FAILED";
    let rsmessage;
    //get best troop count symbol => 300 outputs batallion
    if( getBestTroopCountSymbol(300) == "battalion") result = "PASSED";
    rsmessage = "getBestTroopCountSymbol() test: " + result;
    gameLog(rsmessage);

    //Iscapital region 
    //using a6 to test
    if(isCapitalRegion("A6")) result = "PASSED";
    else result = "FAILED";
    rsmessage = "isCapitalRegion() test: "+ result;
    gameLog(rsmessage);

    //GameUI => set region owner (test for of, bf, neutral)
    //use region a2 to test
    GameUI.setRegionOwner("a2","of");
    if(document.getElementById("a2").classList.contains("of")) result = "PASSED";
    else result = "FAILED";
    rsmessage = "setRegionOwner() test: "+result;
    gameLog(rsmessage);

    //Get units'info in a region
    let test_reg = "i5"
    let test_unit = GameUI.getUnitsInRegion(test_reg);
    bool_result = true;
    //get units'info in region the game's map then compare
    if(test_unit[0] != null){
        //get unit's data from current map
        let inf_id = document.getElementById(test_reg).classList.item(1) + "_"+test_reg+"_infantry";
        let inf_count = document.getElementById(inf_id).dataset.count;
        //compares with the data returned from the function
        if (test_unit[0]._id != inf_id || test_unit[0].count != inf_count) bool_result=false;
    }
    if(test_unit[1] != null){
        let heli_id = document.getElementById(test_reg).classList.item(1) + "_"+test_reg+"_helicopter";
        let heli_count = document.getElementById(heli_id).dataset.count;
        if (test_unit[1]._id != heli_id || test_unit[1].count != heli_count) bool_result=false;
    }
    if(test_unit[2] != null){
        let arm_id = document.getElementById(test_reg).classList.item(1) + "_"+test_reg+"_armor";
        let arm_count = document.getElementById(arm_id).dataset.count;
        if (test_unit[2]._id != arm_id || test_unit[2].count != arm_count) bool_result=false;
    }
    result = (bool_result) ? "PASSED" : "FAILED";
    gameLog("getUnitsInRegion() test: "+ result);

    //force: alter force,
    let test_force_reg= "i3";
    let test_force_side=document.getElementById(test_force_reg).classList.item(1);
    //current data
    var inf_cnt = parseInt(document.getElementById(test_force_side+"_"+test_force_reg+"_infantry").dataset.count);
    if(isNaN(inf_cnt)) inf_cnt =0;
    var heli_cnt = parseInt(document.getElementById(test_force_side+"_"+test_force_reg+"_helicopter").dataset.count);
    if(isNaN(heli_cnt)) heli_cnt =0;
    var arm_cnt = parseInt(document.getElementById(test_force_side+"_"+test_force_reg+"_armor").dataset.count);
    if(isNaN(arm_cnt)) arm_cnt =0;

    //mock unit list to alter
    let mock_unitlist =[
        1400, // infantry
        20, // helicopter
        20 // armor
    ]
    let test_force = new Force(test_force_reg);
    test_force.alterForce(mock_unitlist);
    bool_result = true;
    if((inf_cnt+1400) != test_force.unitList[0].count ||
         (heli_cnt+20) != test_force.unitList[1].count ||
         (arm_cnt+20) != test_force.unitList[2].count) bool_result = false; 
    result = (bool_result) ? "PASSED" : "FAILED";
    gameLog("alterForce() test: "+ result);
    

    // distribute damage side

    //Unit: update health alter units
    let inf_unit = GameUI.getUnitsInRegion("i2")[0];//400
    inf_unit.updateHealth(100);//-100
    if( inf_unit.health == 300) result = "PASSED";
    else result = "FAILED";
    gameLog("updateHealth() test: "+result);

    //change turn done
    //Battle: start 
    //Game: change turn, handle win, handle playermoves 

    //change turn
    result = "PASSED";
    if(changeTurn_cb() == true){
        result = "PASS";
    }
    rmessage = "Player turns have changed (as screen below shows) " + result;
    gameLog(rmessage);

    //handle win screen
    game._handleWin("of");

}
