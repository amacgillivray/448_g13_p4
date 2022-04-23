function test(){
    gameLog("hello world");
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
    let savedowner = document.getElementById("a2").classList.item(1);
    GameUI.setRegionOwner("a2","of");
    if(document.getElementById("a2").classList.contains("of")) result = "PASSED";
    else result = "FAILED";
    rsmessage = "setRegionOwner() test: "+result;
    gameLog(rsmessage);
    GameUI.setRegionOwner("a2", savedowner); //restore the "owner" of the region

    //Get units'info in a region
    let test_reg = "i5"
    let test_unit = GameUI.getUnitsInRegion(test_reg);
    let bool_result = true;
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
    if(bool_result) result = "PASSED";
    else result = "FAILED";
    gameLog("getUnitsInRegion() test: "+ result);

    //force: alter force,
    
    let test_force_reg= "i3";
    let test_force_side=document.getElementById(test_force_reg).classList.item(1);
    //current data
    var inf_cnt = parseInt(document.getElementById(test_force_side+"_"+test_force_reg+"_infantry").dataset.count);
    if(inf_cnt === NaN) inf_cnt =0;
    var heli_cnt = parseInt(document.getElementById(test_force_side+"_"+test_force_reg+"_helicopter").dataset.count);
    if(heli_cnt === NaN) heli_cnt =0;
    var arm_cnt = parseInt(document.getElementById(test_force_side+"_"+test_force_reg+"_armor").dataset.count);
    if(arm_cnt === NaN) arm_cnt =0;
    console.log(inf_cnt+" "+heli_cnt+" "+arm_cnt);
    //mock unit list to alter
    let mock_unitlist =[
        1400, // infantry
        20, // helicopter
        20 // armor
    ]
    let test_force = new Force(test_force_reg);
    test_force.alterForce(mock_unitlist);
    bool_result = true;
    console.log(test_force.unitList)
    if((inf_cnt+1400) != test_force.unitList[0].count ||
         (heli_cnt+20) != test_force.unitList[1].count ||
         (arm_cnt+20) != test_force.unitList[2].count) bool_result = false; 
    result = (bool_result) ? "PASSED" : "FAILED";
    gameLog("alterForce() test: "+ result);
    






    // distribute damage side

    //Unit: update health alter units

    //get current health of a unit
    let inf_unit = GameUI.getUnitsInRegion("i2")[0];
    console.log(inf_unit.health); // 400
    //call function
    inf_unit.updateHealth(100);
    //after-dmg-health
    console.log(inf_unit.health);//should be 400-100 =300

    //if(currenthealt == after-dmg-health) result = PASSED

    //Battle: start 
    //Game: change turn, handle win, handle playermoves 

}


 
//Tests
//Gamelog
//get best troop count symbol => 300 outputs batallion



