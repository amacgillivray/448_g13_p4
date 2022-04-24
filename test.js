function test(){
    let bool_result=true;
    let rsmessage;
    let p = "<span class='ywtext'>PASSED</span>";
    let f = "<span class='redtext'>FAILED</span>";
    let result = f;

    //gameLog() test
    //no one should see the message in gamelog if the function is not working
    gameLog("Gamelog is working");

    //getBestTroopCountSymbol() test
    //getBestTroopCountSymbol(300) should re turn "battalion".
    if( getBestTroopCountSymbol(300) == "battalion") result = p;
    rsmessage = "getBestTroopCountSymbol() test: " + result;
    gameLog(rsmessage);

    //Iscapital() test
    //A6 is a capital and A5 is not a capital
    if(isCapitalRegion("A6") && !isCapitalRegion("A5")) result = p;
    else result = f;
    rsmessage = "isCapitalRegion() test: "+ result;
    gameLog(rsmessage);

    //GameUI.setRegionOwner() test
    //set region A2 to red.
    GameUI.setRegionOwner("a2","of");
    //if region A2 is red. The function works
    if(document.getElementById("a2").classList.contains("of")) result = p;
    else result = f;
    rsmessage = "setRegionOwner() test: "+result;
    gameLog(rsmessage);

    //GameUI.getUnitsInRegion() test
    let test_reg = "i5"
    //get units from a region by the funtion
    let test_unit = GameUI.getUnitsInRegion(test_reg);
    bool_result = true;
    if(test_unit[0] != null){
        //get unit's data from current map
        let inf_id = document.getElementById(test_reg).classList.item(1) + "_"+test_reg+"_infantry";
        let inf_count = document.getElementById(inf_id).dataset.count;
        //compares with the data from the function
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
    result = (bool_result) ? p : f;
    gameLog("getUnitsInRegion() test: "+ result);

    //Force.alterForce() test
    let test_force_reg= "i3";
    //get current data from the map
    let test_force_side=document.getElementById(test_force_reg).classList.item(1);
    var inf_cnt = parseInt(document.getElementById(test_force_side+"_"+test_force_reg+"_infantry").dataset.count);
    if(isNaN(inf_cnt)) inf_cnt =0;
    var heli_cnt = parseInt(document.getElementById(test_force_side+"_"+test_force_reg+"_helicopter").dataset.count);
    if(isNaN(heli_cnt)) heli_cnt =0;
    var arm_cnt = parseInt(document.getElementById(test_force_side+"_"+test_force_reg+"_armor").dataset.count);
    if(isNaN(arm_cnt)) arm_cnt =0;
    //mock units list to alter
    let mock_unitlist =[
        1400, // infantry
        20, // helicopter
        20 // armor
    ]
    let test_force = new Force(test_force_reg);
    //call the funtion
    test_force.alterForce(mock_unitlist);
    bool_result = true;
    //compare the force's data after function called to the calculated data
    //if they match, the function works
    if((inf_cnt+1400) != test_force.unitList[0].count ||
         (heli_cnt+20) != test_force.unitList[1].count ||
         (arm_cnt+20) != test_force.unitList[2].count) bool_result = false; 
    result = (bool_result) ? p : f;
    gameLog("alterForce() test: "+ result);

    //Unit.updateHealth() test
    //get the health before function call
    let inf_unit = GameUI.getUnitsInRegion("i2")[0];//400 
    //function call
    inf_unit.updateHealth(100);// -100
    //if the health after function called correct with the calculated health, the function works
    if( inf_unit.health == 300) result = p;
    else result = f;
    gameLog("updateHealth() test: "+result);

    //Game: change turn, handle win, handle playermoves 
    bool_result = true;
    //get current player's turn before function call
    let bf = game._currentPlayerTurn;
    //change turn
    changeTurn_cb();
    //get current player's turn after function call
    let af = game._currentPlayerTurn;
    //if the player's turn did not change, the function failed
    if(bf == af) bool_result = false;
    result = (bool_result) ? p : f;
    rsmessage = "Player turns have changed (as screen below shows). ChangeTurn test: " + result;
    gameLog(rsmessage);

    //handleWin() test
    //annouce red team win
    game._handleWin("of");
    let subreg = document.getElementById("subregions");
    //check if the whole map is red
    for(let reg = 0; reg<subreg.length; reg++)
        for(let area = 0; area<subreg[reg].length; area++) if (!subreg[reg][area].classList.contains("of")) bool_result = false;
    result = (bool_result) ? p : f;
    rsmessage = "handleWin() test: "+ result;
    gameLog(rsmessage);
}
