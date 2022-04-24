# Code Review
## BATTLE WINDOW CODE

Fault 1: 
Undefined behavior when the user clicks “confirm” without allocating any (or all) troops
	Assignee: 	Andrew
	Fix: 		Check for # of available troop allocations after each allocation. Disable the confirm button until all troops have been allocated. (Disabled button indicated via grey background color);

Fault 2: 
Double-clicking troop icons doesn’t allow the unit to be reselected (cancel-operation breaks icon)
	Assignee: 	Andrew
	Fix:		removeEventListener for the allocation cancel event, in the allocation cancel event’s handler. 

Fault 3: 
When a troop type is not present, the icon is hidden but the word “COUNT” appears in its place
	Assignee:	Andrew
	Fix:		Remove the word “Count” from the HTML structure of the battle window

Fault 4: 
Allows the player to allow 0 troops to a flank
	Assignee: 	Andrew
	Fix: 		Add if condition to skip adding to flank when count is 0

Fault 5: 
Clicking an icon inside a flank, while allocating a troop, places the new troop inside of the existing icon rather than appending to the flank. As a result, the new icon will not appear and the Battle object will not be able to interpret the contents of the battle window.
	Assignees: 	Andrew & Nhat
	Fix: 		Add while loop to call parentElement on the event target until the flank root node is found
