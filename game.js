/**
 * @file game.js
 * @brief Implements the game functionality.
 * 
 * @author Jarrod Grothusen
 * @author Andrew MacGillivray
 */

"use strict";

/**
 * @brief Name of the attribute that specifies how many troops are present in the region
 */
const troop_count_attr = "data-count";

/**
 * @brief troop type names as used in troop icon IDs in the game's SVG doc.
 */
const troop_type_names = [
    "infantry",
    "helicopter",
    "armor"
];

/**
 * @brief The maximum # of units that can be fighting in a zone at one time.
 * @note  Indices correspond to troop_type_names
 */
const troop_combat_width = [
    1000,
    20,
    40
    // useful for debugging combat 
    // 100,
    // 2,
    // 2
];

/**
 * @brief list of troop size names and the respective maximum troop count
 */
const troop_sizes = {
    fandm: 2,
    fireteam: 5,
    patrol: 10,
    section: 20,
    platoon: 40,
    company: 250, 
    battalion: 1000,
    regiment: 2000,
    brigade: 5000
};

const team_key = {
    bf: "<span class=\"bluetext\">NATO</span>",
    of: "<span class=\"redtext\">PACT</span>"
};

/**
 * @brief use these ids to select a regional polygon
 */
const region_polygon_ids = [
    "alpha",
    "bravo",
    "charlie",
    "delta",
    "echo",
    "foxtrot",
    "golf",
    "hotel"
];

const region_phonetic_key = {
    a: "alpha",
    b: "bravo",
    c: "charlie",
    d: "delta",
    e: "echo",
    f: "foxtrot",
    g: "golf",
    h: "hotel"
};

const regions_capitals_key = {
    a: "a6",
    b: "b5",
    c: "c4",
    d: "d2",
    e: "e3",
    f: "f4",
    g: "g4",
    h: "h1",
    i: "i5",
    j: "j2"
};

const regions_capitals = [
    "a6",
    "b5",
    "c4",
    "d2",
    "e3",
    "f4",
    "g4",
    "h1", 
    "i5",
    "j2"
];

const capitals_reinforcements = 
{
    // Each index is an array of numbers for how many troops the player is granted
    // each turn for controlling the region. Each index of the array pertains to the
    // same index of the troop_type_names array.
    a6: [40, 0, 1],
    b5: [20, 0, 0],
    c4: [0, 2, 0],
    d2: [40, 2, 1],
    e3: [40, 2, 1],
    f4: [40, 2, 0],
    g4: [40, 0, 1],
    h1: [20, 0, 0],
    i5: [0, 2, 0],
    j2: [40, 2, 0]
};

/**
 * @brief use these ids to select the entire region group node (including its name). 
 *        These are also used in troop node names 
 */
const region_group_ids = [
    "a0", "a1", "a2", "a3", "a4", "a5", "a6", "a7", "a8", "a9",
    "b0", "b1", "b2", "b3", "b4", "b5", "b6", "b7", "b8", "b9",
    "c0", "c1", "c2", "c3", "c4", "c5", "c6", "c7", "c8", "c9",
    "d0", "d1", "d2", "d3", "d4", "d5", "d6", "d7", "d8", "d9", 
    "e0", "e1", "e2", "e3", "e4", "e5", "e6", "e7", "e8", "e9", 
    "f0", "f1", "f2", "f3", "f4", "f5", "f6", "f7", "f8", "f9", 
    "g0", "g1", "g2", "g3", "g4", "g5", "g6", "g7", "g8", "g9", 
    "h0", "h1", "h2", "h3", "h4", "h5", "h6", "h7", "h8", "h9", 
    "i0", "i1", "i2", "i3", "i4", "i5", "i6", "i7", "i8", "i9", 
    "j0", "j1", "j2", "j3", "j4", "j5", "j6", "j7", "j8", "j9" 
];

/**
 * @brief using the region group id as an index, tells what regions are 
 *        connected to each other.
 */
const region_connections = {
    a0: ["a1", "a2", "a3"],
    a1: ["a0", "a2", "a3", "a9"],
    a2: ["a0", "a1", "a3", "a4", "a5", "a6", "a9"], 
    a3: ["a0", "a1", "a2", "a4", "a5", "a6"], 
    a4: ["a2", "a3", "a5", "a6"],
    a5: ["a2", "a3", "a4", "a6", "a7"],
    a6: ["a2", "a3", "a4", "a5", "a7", "a8", "a9"],
    a7: ["j0", "j1", "e1", "a8", "a6", "a5"],
    a8: ["a6", "a7", "a9", "j0", "e1", "e0", "b0"],
    a9: ["a1", "a2", "a6", "a8", "e0", "b0"],
    b0: ["a8", "a9", "e0", "d1", "b2", "b1"],
    b1: ["b0", "b2", "b3"],
    b2: ["b0", "b1", "b3", "b5", "c1", "c9", "d0", "d1"], 
    b3: ["b1", "b2", "b5", "b4"],
    b4: ["b3", "b5", "b8", "b9"],
    b5: ["b2", "b3", "b4", "b8", "b6", "c1"],
    b6: ["b5", "b7", "b8", "c1", "c0"],
    b7: ["c0", "b6", "b8"],
    b8: ["b4", "b5", "b6", "b7", "b9"],
    b9: ["b4", "b8"],
    c0: ["b6", "b7", "c1", "c2"],
    c1: ["b2", "b5", "b6", "c0", "c2", "c9", "d0"],
    c2: ["c0", "c1", "c9", "c4", "c3"],
    c3: ["c2", "c4", "c5"],
    c4: ["c1", "c2", "c3", "c5", "c6", "c7", "c8", "c9"],
    c5: ["c3", "c4", "c6"],
    c6: ["c4", "c5", "c7"],
    c7: ["d5", "d6", "d7", "c8", "c4", "c6"],
    c8: ["d0", "d5", "d6", "c7", "c4", "c9"],
    c9: ["b2", "d0", "c8", "c4", "c2", "c1"],
    d0: ["c1", "c9", "c8", "d5", "d2", "d1", "b2"],
    d1: ["b0", "b2", "d0", "d5", "d2", "e0", "e4"],
    d2: ["d0", "d1", "d3", "d4", "d5", "e4", "e5"],
    d3: ["d2", "d4", "e4", "e5", "e8", "e9"],
    d4: ["d2", "d3", "e8", "e9", "d8", "d6", "d5"],
    d5: ["d0", "d2", "d4", "d6", "c7", "c8"],
    d6: ["d4", "d5", "d7", "d8", "c7", "c8"],
    d7: ["d6", "d8", "d9", "f2", "f3"],
    d8: ["d4", "d6", "d7", "d9", "e9"],
    d9: ["d7", "d8", "e9", "f2"],
    e0: ["j0", "e1", "e3", "e4", "d1", "b0", "a8", "a9"],
    e1: ["a7", "a8", "e0", "e2", "e3", "e4", "j0", "j7", "j8"],
    e2: ["e1", "e3", "e5", "e6", "j7", "j8", "i0", "i1", "i2"], 
    e3: ["e0", "e1", "e2", "e4", "e5", "e6"],
    e4: ["e0", "e1", "e3", "e5", "d3", "d2", "d1"],
    e5: ["d2", "d3", "e3", "e4", "e2", "e6", "e7", "e8"],
    e6: ["e2", "e3", "e5", "e7", "e8", "i1", "i2", "g0", "g1"],
    e7: ["e6", "e5", "e8", "e9", "f0", "f1", "g1"],
    e8: ["d3", "d4", "e5", "e6", "e7", "e9"],
    e9: ["e7", "e8", "f1", "f2", "d9", "d8", "d4", "d3"],
    f0: ["e7", "g1", "g3", "f1", "f5", "f6"],
    f1: ["f0", "f2", "f3", "f4", "f5", "e7", "e9"],
    f2: ["e9", "f1", "f3", "f4", "f5", "d7", "d9"], 
    f3: ["d7", "f1", "f2", "f5", "f4"],
    f4: ["f3", "f2", "f1", "f5", "f7", "f9"],
    f5: ["f0", "f1", "f2", "f3", "f4", "f6", "f7"],
    f6: ["f0", "f5", "f7", "f8", "g4", "g3"],
    f7: ["f4", "f5", "f6", "f8", "f9"],
    f8: ["g4", "f6", "f7", "f9"],
    f9: ["f4", "f7", "f8"],
    g0: ["e6", "i2", "h0", "g1", "g2"],
    g1: ["e6", "e7", "f0", "g0", "g2", "g3"],
    g2: ["h0", "g0", "g1", "g3", "g5", "g6"], 
    g3: ["g1", "g2", "g5", "g4", "f6", "f0"],
    g4: ["g3", "g5", "g9", "f6", "f8"],
    g5: ["g3", "g2", "g4", "g6", "g7", "g9"],
    g6: ["h0", "h2", "g2", "g5", "g7"],
    g7: ["h2", "h6", "h7", "g5", "g6", "g8", "g9"],
    g8: ["h7", "h8", "g7", "g9"],
    g9: ["g4", "g5", "g7", "g8"],
    h0: ["g0", "g2", "g6", "h1", "h2", "i2"],
    h1: ["i2", "i6", "h4", "h3", "h2", "h0"],
    h2: ["h0", "h1", "h3", "h6", "g6", "g7"], 
    h3: ["h1", "h2", "h4", "h5", "h6"],
    h4: ["i6", "h1", "h3", "h5"],
    h5: ["h4", "h3", "h6", "h9"],
    h6: ["h2", "h3", "h5", "h7", "h9", "g7"],
    h7: ["g7", "h8", "h6", "h9", "h8"],
    h8: ["g8", "h7", "h9"],
    h9: ["h5", "h6", "h7", "h8"],
    i0: ["e2", "j8", "i1", "i3", "i4"],
    i1: ["e2", "e6", "i0", "i2", "i3"],
    i2: ["e2", "e6", "g0", "h0", "h1", "i1", "i3", "i6"], 
    i3: ["i0", "i1", "i2", "i4", "i5", "i6"],
    i4: ["j9", "j8", "i9", "i5", "i3", "i0"],
    i5: ["i3", "i4", "i9", "i8", "i7", "i6"],
    i6: ["i3", "i5", "i7", "i2", "h4", "h1"],
    i7: ["i5", "i6", "i8"],
    i8: ["j9", "i5", "i7", "i9"],
    i9: ["i8", "i5", "i4", "j8", "j9"],
    j0: ["a7", "a8", "e0", "e1", "j7", "j1", "j2"],
    j1: ["j0", "j2", "j7", "a7"],
    j2: ["j1", "j3", "j5", "j6", "j7"], 
    j3: ["j2", "j5", "j4"],
    j4: ["j3", "j3"],
    j5: ["j4", "j3", "j2", "j6", "j8", "j9"],
    j6: ["j2", "j5", "j9", "j8", "j7"],
    j7: ["e2", "e1", "j0", "j1", "j2", "j6", "j8"],
    j8: ["e1", "e2", "i0", "i4", "i9", "j9", "j5", "j6", "j7"],
    j9: ["j5", "j6", "j8", "i4", "i9", "i8"]
};

const region_terrain = {
    a0: {plains: 0.9, forest: 0, water: 0, urban:0 },
    a1: {plains: 0.6, forest: 0, water: 0, urban:0 },
    a2: {plains: 0, forest: 0.5, water: 0, urban:0 },
    a3: {plains: 0, forest: 0.3, water: 0, urban:0 },
    a4: {plains: 0, forest: 0.5, water: 0, urban:0 },
    a5: {plains: 0, forest: 0.5, water: 0, urban:0 },
    a6: {plains: 0, forest: 0.3, water: 0, urban:0 },
    a7: {plains: 0, forest: 0.5, water: 0.2, urban:0.5 },
    a8: {plains: 0.4, forest: 0.3, water: 0, urban:0 },
    a9: {plains: 0.5, forest: 0.4, water: 0, urban:0 },
    b0: {plains: 0.9, forest: 0.1, water: 0, urban:0 },
    b1: {plains: 0.5, forest: 0.1, water: 0, urban:0 },
    b2: {plains: 0.7, forest: 0.1, water: 0.1, urban:0 },
    b3: {plains: 0.8, forest: 0, water: 0, urban:0 },
    b4: {plains: 0, forest: 0, water: 0.1, urban:0 },
    b5: {plains: 0, forest: 0, water: 0.3, urban:0.6 },
    b6: {plains: 0, forest: 0, water: 0.3, urban:0.5 },
    b7: {plains: 0, forest: 0, water: 0.2, urban:0.8 },
    b8: {plains: 0, forest: 0, water: 0.2, urban:0.5 },
    b9: {plains: 0, forest: 0, water: 0.3, urban:0 },
    c0: {plains: 0, forest: 0, water: 0.4, urban:0 },
    c1: {plains: 0, forest: 0, water: 0.4, urban:0.5 },
    c2: {plains: 0, forest: 0, water: 0.2, urban:0.8 },
    c3: {plains: 0, forest: 0, water: 0.1, urban:0.9 },
    c4: {plains: 0, forest: 0, water: 0.1, urban:0.8 },
    c5: {plains: 0, forest: 0, water: 0.2, urban:0 },
    c6: {plains: 0, forest: 0.2, water: 0.2, urban:0 },
    c7: {plains: 0.3, forest: 0, water: 0, urban:0 },
    c8: {plains: 0, forest: 0, water: 0, urban:0.1 },
    c9: {plains: 0, forest: 0, water: 0.2, urban:0.2 },
    d0: {plains: 0, forest: 0, water: 0.2, urban:0 },
    d1: {plains: 0, forest: 0.3, water: 0, urban:0.2 },
    d2: {plains: 0, forest: 0.2, water: 0.2, urban:0.6 },
    d3: {plains: 0, forest: 0.2, water: 0.1, urban:0.5 },
    d4: {plains: 0, forest: 0, water: 0.1, urban:0 },
    d5: {plains: 0, forest: 0, water: 0, urban:0 },
    d6: {plains: 0.5, forest: 0, water: 0, urban:0 },
    d7: {plains: 0.8, forest: 0, water: 0, urban:0 },
    d8: {plains: 0, forest: 0, water: 0, urban:0 },
    d9: {plains: 0, forest: 0, water: 0, urban:0 },
    e0: {plains: 0.5, forest: 0, water: 0.2, urban:0 },
    e1: {plains: 0, forest: 0.5, water: 0.2, urban:0 },
    e2: {plains: 0.5, forest: 0.3, water: 0, urban:0 },
    e3: {plains: 0, forest: 0.2, water: 0, urban:0.5 },
    e4: {plains: 0, forest: 0.2, water: 0.2, urban:0.5 },
    e5: {plains: 0, forest: 0.2, water: 0.2, urban:0.5 },
    e6: {plains: 0, forest: 0.9, water: 0, urban:0 },
    e7: {plains: 0, forest: 0, water: 0, urban:0 },
    e8: {plains: 0, forest: 0, water: 0, urban:0 },
    e9: {plains: 0, forest: 0, water: 0, urban:0 },
    f0: {plains: 1, forest: 0, water: 0, urban:0 },
    f1: {plains: 0.7, forest: 0, water: 0.1, urban:0 },
    f2: {plains: 0, forest: 0, water: 0.2, urban:0 },
    f3: {plains: 0, forest: 0, water: 0.2, urban:0.4 },
    f4: {plains: 0, forest: 0, water: 0.2, urban:0.8 },
    f5: {plains: 0.3, forest: 0, water: 0.2, urban:0.3 },
    f6: {plains: 0.3, forest: 0, water: 0, urban:0 },
    f7: {plains: 0, forest: 0.3, water: 0.3, urban:0.4 },
    f8: {plains: 0, forest: 0.3, water: 0, urban:0 },
    f9: {plains: 0, forest: 0.6, water: 0.1, urban:0.3 },
    g0: {plains: 0, forest: 0.5, water: 0, urban:0 },
    g1: {plains: 0, forest: 0.3, water: 0, urban:0 },
    g2: {plains: 0, forest: 0.3, water: 0, urban:0 },
    g3: {plains: 0.7, forest: 0, water: 0, urban:0 },
    g4: {plains: 0.1, forest: 0, water: 0.1, urban:0 },
    g5: {plains: 0.2, forest: 0.1, water: 0, urban:0 },
    g6: {plains: 0, forest: 0.4, water: 0, urban:0 },
    g7: {plains: 0, forest: 1, water: 0, urban:0 },
    g8: {plains: 0.4, forest: 0.3, water: 0, urban:0 },
    g9: {plains: 0.7, forest: 0, water: 0.2, urban:0 },
    h0: {plains: 0, forest: 0, water: 0, urban:0 },
    h1: {plains: 0, forest: 0.3, water: 0, urban:0 },
    h2: {plains: 0.3, forest: 0, water: 0, urban:0 },
    h3: {plains: 0.5, forest: 0.1, water: 0, urban:0 },
    h4: {plains: 0, forest: 0.6, water: 0, urban:0 },
    h5: {plains: 0.2, forest: 0.5, water: 0, urban:0 },
    h6: {plains: 0.8, forest: 0, water: 0, urban:0 },
    h7: {plains: 0, forest: 1, water: 0, urban:0 },
    h8: {plains: 0, forest: 0.4, water: 0, urban:0 },
    h9: {plains: 0.5, forest: 0, water: 0, urban:0 },
    i0: {plains: 0.5, forest: 0.2, water: 0, urban:0 },
    i1: {plains: 0.5, forest: 0, water: 0.1, urban:0 },
    i2: {plains: 0, forest: 0, water: 0.2, urban:0 },
    i3: {plains: 0.3, forest: 0.4, water: 0.1, urban:0 },
    i4: {plains: 0, forest: 0.9, water: 0, urban:0 },
    i5: {plains: 0.5, forest: 0.2, water: 0, urban:0 },
    i6: {plains: 0.2, forest: 0.4, water: 0, urban:0 },
    i7: {plains: 0.3, forest: 0.5, water: 0, urban:0 },
    i8: {plains: 0.3, forest: 0.3, water: 0, urban:0 },
    i9: {plains: 0.4, forest: 0.5, water: 0, urban:0 },
    j0: {plains: 0, forest: 0.2, water: 0.2, urban:0.6 },
    j1: {plains: 0, forest: 0.5, water: 0, urban:0.2 },
    j2: {plains: 0, forest: 0.4, water: 0, urban:0 },
    j3: {plains: 0, forest: 0.4, water: 0, urban:0 },
    j4: {plains: 0, forest: 0.3, water: 0, urban:0 },
    j5: {plains: 0, forest: 0.7, water: 0, urban:0 },
    j6: {plains: 0, forest: 0.8, water: 0, urban:0 },
    j7: {plains: 0, forest: 0.6, water: 0, urban:0 },
    j8: {plains: 0.3, forest: 0.7, water: 0, urban:0 },
    j9: {plains: 0.2, forest: 0.8, water: 0, urban:0 },
};

const game_setup = {
    //{side: bf/of, troop:[infantry, helicopter, a
    a0: {side: "", troop: [0, 0, 0]},
    a1: {side: "", troop: [0, 0, 0]},
    a2: {side: "", troop: [0, 0, 0]},
    a3: {side: "", troop: [0, 0, 0]},
    a4: {side: "", troop: [0, 0, 0]},
    a5: {side: "", troop: [0, 0, 0]},
    a6: {side: "bf", troop: [1200, 2, 20]},
    a7: {side: "bf", troop: [225, 0, 6]},
    a8: {side: "bf", troop: [500, 0, 8]},
    a9: {side: "", troop: [0, 0, 0]},
    b0: {side: "", troop: [0, 0, 0]},
    b1: {side: "", troop: [0, 0, 0]},
    b2: {side: "", troop: [0, 0, 0]},
    b3: {side: "", troop: [0, 0, 0]},
    b4: {side: "", troop: [0, 0, 0]},
    b5: {side: "bf", troop: [850, 4, 12]},
    b6: {side: "", troop: [0, 0, 0]},
    b7: {side: "", troop: [0, 0, 0]},
    b8: {side: "", troop: [0, 0, 0]},
    b9: {side: "", troop: [0, 0, 0]},
    c0: {side: "", troop: [0, 0, 0]},
    c1: {side: "bf", troop: [120, 0, 4]},
    c2: {side: "", troop: [0, 0, 0]},
    c3: {side: "", troop: [0, 0, 0]},
    c4: {side: "bf", troop: [650, 6, 0]},
    c5: {side: "", troop: [0, 0, 0]},
    c6: {side: "", troop: [0, 0, 0]},
    c7: {side: "", troop: [0, 0, 0]},
    c8: {side: "", troop: [0, 0, 0]},
    c9: {side: "", troop: [40, 1, 0]},
    d0: {side: "", troop: [0, 0, 0]},
    d1: {side: "", troop: [0, 0, 0]},
    d2: {side: "bf", troop: [1850, 0, 38]},
    d3: {side: "of", troop: [250, 0, 12]},
    d4: {side: "bf", troop: [250, 0, 12]},
    d5: {side: "", troop: [0, 0, 0]},
    d6: {side: "", troop: [0, 0, 0]},
    d7: {side: "", troop: [0, 0, 0]},
    d8: {side: "bf", troop: [350, 8, 0]},
    d9: {side: "bf", troop: [200, 0, 8]},
    e0: {side: "bf", troop: [1500, 12, 28]},
    e1: {side: "of", troop: [1500, 12, 28]},
    e2: {side: "", troop: [0, 0, 0]},
    e3: {side: "of", troop: [1850, 0, 38]},
    e4: {side: "bf", troop: [350, 0, 14]},
    e5: {side: "of", troop: [350, 0, 14]},
    e6: {side: "", troop: [0, 0, 0]},
    e7: {side: "", troop: [0, 0, 0]},
    e8: {side: "of", troop: [350, 0, 18]},
    e9: {side: "of", troop: [350, 8, 0]},
    f0: {side: "", troop: [0, 0, 0]},
    f1: {side: "of", troop: [520, 6, 14]},
    f2: {side: "bf", troop: [520, 6, 14]},
    f3: {side: "bf", troop: [300, 0, 7]},
    f4: {side: "bf", troop: [1990, 0, 32]},
    f5: {side: "of", troop: [895, 0, 16]},
    f6: {side: "of", troop: [300, 0, 7]},
    f7: {side: "", troop: [0, 0, 0]},
    f8: {side: "", troop: [0, 0, 0]},
    f9: {side: "bf", troop: [450, 4, 10]},
    g0: {side: "", troop: [0, 0, 0]},
    g1: {side: "", troop: [0, 0, 0]},
    g2: {side: "", troop: [0, 0, 0]},
    g3: {side: "", troop: [0, 0, 0]},
    g4: {side: "of", troop: [450, 4, 10]},
    g5: {side: "", troop: [0, 0, 0]},
    g6: {side: "", troop: [0, 0, 0]},
    g7: {side: "", troop: [0, 0, 0]},
    g8: {side: "", troop: [0, 0, 0]},
    g9: {side: "", troop: [0, 0, 0]},
    h0: {side: "", troop: [0, 0, 0]},
    h1: {side: "of", troop: [650, 6, 0]},
    h2: {side: "", troop: [0, 0, 0]},
    h3: {side: "", troop: [0, 0, 0]},
    h4: {side: "", troop: [0, 0, 0]},
    h5: {side: "", troop: [0, 0, 0]},
    h6: {side: "", troop: [0, 0, 0]},
    h7: {side: "", troop: [0, 0, 0]},
    h8: {side: "", troop: [0, 0, 0]},
    h9: {side: "", troop: [0, 0, 0]},
    i0: {side: "", troop: [0, 0, 0]},
    i1: {side: "", troop: [0, 0, 0]},
    i2: {side: "of", troop: [40, 2, 0]},
    i3: {side: "of", troop: [120, 0, 4]},
    i4: {side: "", troop: [0, 0, 0]},
    i5: {side: "of", troop: [850, 4, 12]},
    i6: {side: "", troop: [0, 0, 0]},
    i7: {side: "", troop: [0, 0, 0]},
    i8: {side: "", troop: [0, 0, 0]},
    i9: {side: "", troop: [0, 0, 0]},
    j0: {side: "of", troop: [500, 0, 8]},
    j1: {side: "of", troop: [225, 0, 6]},
    j2: {side: "of", troop: [1200, 2, 20]},
    j3: {side: "", troop: [0, 0, 0]},
    j4: {side: "", troop: [0, 0, 0]},
    j5: {side: "", troop: [0, 0, 0]},
    j6: {side: "", troop: [0, 0, 0]},
    j7: {side: "", troop: [0, 0, 0]},
    j8: {side: "", troop: [0, 0, 0]},
    j9: {side: "of", troop: [500, 0, 8]},
};

/**
 * @brief Shorthand for "opfor" used in SVG node class names
 */
const opfor_prefix = "of";

/**
 * @brief Shorthand for "blufor" used in SVG node class names
 */
const blufor_prefix = "bf";


function gameLog( message, classlist = "" )
{
    let log = document.getElementById("log");
    let date = new Date;
    let dateStr = "";
    let container = document.createElement("p");
    if ( classlist != "" ) 
        container.setAttribute("class", classlist);
    container.setAttribute("id", "l" + log_entries);

    date.setTime(Date.now());
    dateStr = (date.getHours().toString().length < 2) ? "0" + date.getHours().toString() : date.getHours().toString();
    dateStr += ":"
    dateStr += (date.getMinutes().toString().length < 2) ? "0" + date.getMinutes().toString() : date.getMinutes().toString();
    dateStr += ":"
    dateStr += (date.getSeconds().toString().length < 2) ? "0" + date.getSeconds().toString() : date.getSeconds().toString();

    container.innerHTML = "<span class=\"date\">" + dateStr + "</span>" + message;

    if (log_entries-1 < 0)
        log.appendChild(container);
    else 
        log.insertBefore(container, document.getElementById("l" + (log_entries-1)));

    log_entries++;
}

function getBestTroopCountSymbol( size )
{
    let icon_sizes = [
        2,
        5,
        10,
        20,
        40,
        250,
        1000,
        2000,
        5000
    ];

    let icon_names = [
        "fandm",
        "fireteam",
        "patrol",
        "section",
        "platoon",
        "company",
        "battalion",
        "regiment",
        "brigade"
    ];

    for (let i = 0; i < icon_sizes.length; i++)
    {
        if (size <= icon_sizes[i]){
            return icon_names[i];
        }
    }

    // if no match is found, return the biggest supported troop symbol.
    return "brigade";
}

function gameRegionClickCallback( e )
{
    e.currentTarget.obj._regionClickHandler(e);
}

function gameSelectedRegionClickCallback( e )
{
    e.currentTarget.obj._moveCancelHandler(e);
}

function gameMoveRegionClickCallback( e )
{
    e.currentTarget.obj._moveHandler(e);
}

/**
 * @brief Determines if the given region is the capital
 * @param {string} region_id 
 *        The ID of the region as a two-character string, e.g. "A0".
 * @returns bool
 */
function isCapitalRegion( region_id )
{
    region_id = region_id.toLowerCase();
    return (region_id == regions_capitals_key[region_id[0]]);
}

function dist( a, b )
{
    let dx = Math.abs(a[0]-b[0]);
    let dy = Math.abs(a[1]-b[1]);

    return Math.sqrt(dx^2+dy^2);
}

function crater_cb( e )
{    
    document.getElementById(e.target.id).setAttribute("class", "crater_filled");
}

/**
 * @brief 
 * @param {*} e 
 */
function reinforcements_cb( e )
{
    game.reinforcement_handler(e);
}

function changeTurn_cb( e )
{
    game._changeTurn();
}

/**
 * @brief Class containing static methods to interact with the map
 */
class GameMap {

    /**
     * @brief update the ownership of a region
     * @note could replace parameters with just a force object, since force knows region and owner
     * @todo if kept this way, replace owner type with enum
     * @param {string} region_phonetic
     * @param {string} owner 
     *                 Should be "of", "bf", or "neutral"
     */
    static setRegionOwner( region_phonetic, owner )
    {
        // If the owner isn't neutral, set the owner class
        // Forcibly prevent neutral HQ regions
        if (!isCapitalRegion(region_phonetic) || owner != "neutral")
           document.getElementById(region_phonetic).setAttribute("class", "region " + owner);

        // Update the micro-icon for the region
        if (owner != "neutral") 
        {
            let os = (owner == "bf") ? "of" : "bf";

            // hide other-side ownership indicator
            document.getElementById("s-" + os + "-" + region_phonetic).classList.toggle("sh", true);
            
            // show current-side ownership indicator
            document.getElementById("s-" + owner + "-" + region_phonetic).classList.toggle("sh", false);
        } else {
            document.getElementById("s-bf-" + region_phonetic).classList.toggle("sh", true);
            document.getElementById("s-of-" + region_phonetic).classList.toggle("sh", true);
        }

        // Update the macro-icon if the region is a capital
        if (isCapitalRegion(region_phonetic)) 
        {
            let os = (owner == "bf") ? "of" : "bf";
            document.getElementById("s-" + os + "-" + region_phonetic[0]).classList.toggle("sh", true);
            document.getElementById("s-" + owner + "-" + region_phonetic[0]).classList.toggle("sh", false);
        }
        
        // If the region is a capital, update the HQ unit display
        if (isCapitalRegion(region_phonetic) && owner != "neutral")
        {
            let os = (owner == "bf") ? "of" : "bf";
            let hq = document.getElementById("hq_" + os + "_" + region_phonetic[0]);
            if (hq.classList.contains("hq"))
            {
                hq.classList.remove("hq");
                hq.classList.add("hq_np");
            }
            hq = document.getElementById("hq_" + owner + "_" + region_phonetic[0]);
            if (hq.classList.contains("hq_np"))
            {
                hq.classList.remove("hq_np");
                hq.classList.add("hq");
            }
        }
    }

    /**
     * @brief Returns an array of Unit objects based on the troops present in the region.
     * @param {string} region_letter 
     * @returns 
     */
    static getUnitsInRegion( region_letter )
    {
        region_letter = region_letter.toLowerCase();
        let units = [];
        let team = document.getElementById(region_letter).classList.item(1);
        
        // If the region is empty, return
        if (team == "neutral") return units;

        // otherwise, get the correct prefix for the team whose troops are present
        team = (team == "blufor") ? team = blufor_prefix : team = opfor_prefix;

        // then get each troop in the region
        troop_type_names.forEach((unitType) => {
            // node id format: [teamprefix]_[regionletter]_[trooptype]
            let selector = team + "_" + region_letter + "_" + unitType;
            // console.log(selector);
            let node = document.getElementById(selector);
            if (node.classList.contains("t"))
            {
                // parse the node into a unit object
                units.push( new Unit(unitType, region_letter, node.getAttribute("data-count"), team) );
            } else {
                units.push( null );
            }
        });
        
        return units;
    }

    static updateUnitDisplay(unit)
    {
        let node = unit.side + "_" + unit.region + "_" + unit.type;
        console.log(node);
        // node = document.getElementById(node);

        //console.log("Troop count: " + unit.count);
        document.getElementById(node).setAttribute("data-count", unit.count)

        // Hide or unhide the unit based on its count.
        if (unit.count <= 0) {
            // console.log("Hiding unit.");
            document.getElementById(node).setAttribute("class", "t_np");

            // make the troop count hidden as well
            let sz = document.getElementById(node).querySelector(".tc");
            if (sz != null){
                sz.classList.remove("tc");
                sz.classList.add("tc_h");
            }
        }
        else if (unit.count > 0){
            // console.log("Revealing unit.");
            document.getElementById(node).setAttribute("class", "t " + unit.side);

            // console.log(".tc_h." + getBestTroopCountSymbol(unit.count));

            // If the troop already existed, remove its old count indicator first
            let sz0 = document.getElementById(node).querySelector(".tc");
            if (sz0 != null) { 
                sz0.classList.remove("tc");
                sz0.classList.add("tc_h");
            }

            // Make the appropriate troop count icon visible
            let sz = document.getElementById(node).querySelector("." + getBestTroopCountSymbol(unit.count));
            if (sz == null ){
                // todo - test in project 4
                // alert("Unable to find size symbol for " + unit.side + " " + unit.type + " with count " + unit.count);
                return;
            }
            sz.classList.remove("tc_h");
            sz.classList.add("tc");
            //document.getElementById(node).querySelector("." + getBestTroopCountSymbol(unit.count)).setAttribute("class", "tc");
        }
    }

    /**
     * @brief WIP function to generate an animation showing the movement of troops from the src region to the dst region.
     * @warning not finished
     * @param {*} originForce 
     * @param {*} destinationForce 
     */
    static animateUnitMove( originForce, destinationForce )
    {

        if (0) {
        troop_type_names.forEach((unit) => {
            let node = originForce.side + "_" + originForce.region + "_" + unit;
                node = document.getElementById(node);

            // if the troop is present, add the animation to move it to the target region
            if (!(node.classList.contains("t_np")))
            {
                let target = destinationForce.side + "_" + destinationForce.region + "_" + unit;
                console.log("Target: " + target);
                    target = document.getElementById(target);
                    target = target.getBBox();

                let animation = document.createElement("animateTransform");
                    animation.setAttribute("attributeName", "transform");
                    animation.setAttribute("attributeType", "XML");
                    animation.setAttribute("type", "translate");
                    // animation.setAttribute("from", node.getBBox().x + " " + node.getBBox().y);
                    // animation.setAttribute("to", target.getBBox().x + " " + target.getBBox().y);
                    animation.setAttribute("from", "0 0");
                    animation.setAttribute("to", ((-1)*(node.getBBox().x - target.x)).toString() + " " + ((-1)*(node.getBBox().y - target.y)).toString());
                    animation.setAttribute("dur", "1s");
                    // animation.setAttribute("repeatCount", "indefinite");
                node.innerHTML += animation.outerHTML;
                // node.addEventListener("animation")
            }
        });
        } else {

        troop_type_names.forEach((unit) => {
            let node = destinationForce.side + "_" + destinationForce.region + "_" + unit;
                node = document.getElementById(node);

            // if the troop is present, add the animation to move it to the target region
            if (!(node.classList.contains("t_np")))
            {
                let target = originForce.side + "_" + originForce.region + "_" + unit;
                console.log("Target: " + target);
                    target = document.getElementById(target);
                    target = target.getBBox();

                let animation = document.createElement("animateTransform");
                    animation.setAttribute("attributeName", "transform");
                    animation.setAttribute("attributeType", "XML");
                    animation.setAttribute("type", "translate");
                    // animation.setAttribute("from", node.getBBox().x + " " + node.getBBox().y);
                    // animation.setAttribute("to", target.getBBox().x + " " + target.getBBox().y);
                    animation.setAttribute("from", ((-1)*(node.getBBox().x - target.x)).toString() + " " + ((-1)*(node.getBBox().y - target.y)).toString());
                    animation.setAttribute("to", "0 0");
                    animation.setAttribute("dur", "1s");
                    // animation.setAttribute("repeatCount", "i");
                
                node.innerHTML += animation.outerHTML;
            }
        });
        }
    }

    /**
     * 
     * @param {Unit}  source 
     * @param {array} targets
     *        Array of Unit objects that the source is firing at. 
     * @param {number} tick
     *        The tick # of the combat generating the animation. Used so that old animations can be removed.
     */
    static animateUnitCombat( source, targets, tick )
    {
        // let unitType = source._type;
        let container = document.getElementById("combat-layer");
        let craterctn = document.getElementById("crater-layer");

        let sbb = document.getElementById(source.id).getBBox();

        if (source._count == 0)
            return;
        
        let sx = sbb.x + (Math.random()*sbb.width);
        let sy = sbb.y + (Math.random()*sbb.height);

        // Remove old animations
        if (tick > 0)
        {
            let old_anims = document.getElementsByClassName("cbt_t_" + (tick-1).toString());
            for (let i = old_anims.length-1; i >= 0; i--)
                old_anims[i].remove();
        }

        let cl = 0;
        let reftgt = null;
        let refbb;
        let refx, refy, refw, refh; // this allows us to get the width and heigh just once, avoiding a reflow/repaint event
        let cg = document.createElement('g');
            cg.setAttribute("id", 'craters_' + battle_ct + '_' + tick + '_' + source.side + '_' + source._type);

        // Add firing animations for the source unit towards the enemy units
        for (let i = 0; i < 3; i++)
        {
            let tx, ty;

            if (targets[i] != null && targets[i].count > 0 && Math.random() > 0.5)
            {
                if (reftgt == null)
                {
                    reftgt = targets[i];
                    refbb = document.getElementById(reftgt.region + "r").getBBox();
                    refx = refbb.x; 
                    refy = refbb.y;
                    refw = refbb.width;
                    refh = refbb.height;
                }
                let  tbb = document.getElementById(targets[i].id).getBBox();

                tx = tbb.x + (Math.random() * tbb.width);
                ty = tbb.y + (Math.random() * tbb.height);

                // on rare occasions, make the animation visibly miss its target
                if (Math.random() < 0.2)
                {
                    let xs = (Math.random() > 0.5) ? (-1) : (1);
                    let ys = (Math.random() > 0.5) ? (-1) : (1);
                    let df = (Math.random() < 0.05) ? 2 : 6;

                    tx += (2*Math.random()*xs*tbb.width);
                    ty += (2*Math.random()*ys*tbb.height);
                }

                let fire = document.createElement("path");
                fire.setAttribute("d", 
                "M " + sx.toString() + " " + sy.toString() + " " + 
                "L " + tx.toString() + " " + ty.toString());
                fire.setAttribute("class", "cbtFire " + source._type + " " + source._side + " cbt_no_" + battle_ct + " cbt_t_" + tick);
                
                container.innerHTML += fire.outerHTML;
            }

            // Add craters to enemy region if the type is armor or helicopter
            // Note that craters are not removed at the end of combat
            if (reftgt != null && troop_type_names.indexOf(source._type) > 0)
            {
                let ct = Math.floor(2*Math.random());
                if (ct == 0) return;
                let cgid = "crater_c" + battle_ct + "_t" + tick + "_" + source._side + "_" + source.type;
                for (let i = 0; i < ct; i++)
                {
                    let circle = document.createElement("circle");
                    circle.setAttribute("cx", (refx + (Math.random() * refw)).toString());
                    circle.setAttribute("cy", (refy + (Math.random() * refh)).toString());
                    circle.setAttribute("r", (Math.random() * 6));
                    circle.setAttribute("class", "crater");
                    circle.setAttribute("style", "animation-delay: " + (0.5*Math.random()) + "s");
                    circle.setAttribute("id", cgid + "_" + i);
                    cg.appendChild(circle);
                    cl++;
                }
            }
        }

        if (cl > 0) {
            craterctn.innerHTML += cg.innerHTML;
        }

        let cc = document.getElementsByClassName("crater");
        for (let e = cc.length-1; e >= 0; e--)
        {
            cc[e].addEventListener("animationend", crater_cb, true);
            cc[e].addEventListener("animationiteration", crater_cb, true);
        }
    }

    static craterFix()
    {
        let cc = document.getElementsByClassName("crater");
        for (let e = cc.length-1; e >= 0; e--)
        {
            cc[e].setAttribute("class", "crater_filled");
        }
    }

    static removeCombatAnimations( battle_no ) 
    {
        let old_anims = document.getElementsByClassName("cbt_no_" + battle_no );
        for (let i = old_anims.length-1; i >= 0; i--)
            old_anims[i].remove();
    }

    /**
     * @brief Adds an arrow to the map indicating pending movement by a force from one region
     *        to another. Returns the ID of the arrow so that it can be removed later.
     * @todo Add global counter for # arrows and use it to determine unique IDs?
     * @param {string} side 
     *        Which team owns the force
     * @param {string} origin 
     *        The ID of the origin cell
     * @param {string} destination 
     *        The ID of the destination cell
     */
    static drawMovementArrow(side, origin, destination)
    {
        let container = document.getElementById("arrow-container");
        let o = document.getElementById(origin).getBBox();
        let d = document.getElementById(destination).getBBox();

        let fy = 0.75;
        let fx = 0.08;

        // 0 if left, 1 if right
        let orient_x = (d.x <= o.x) ? 0 : 1;


        // 0 if up, 1 if down
        let orient_y = (d.y <= o.y) ? 0 : 1; 

        // whether the biggest move is horizontal or vertical
        // 0 if horizontal, 1 if vertical
        let major_axis = (Math.abs(d.y-o.y) <= Math.abs(d.x-o.x)) ? 0 : 1; 

        // Center of origin and destination rectangles
        let oc = [(o.x + (o.width/2)), (o.y + (o.height/2))];
        let dc = [(d.x + (d.width/2)), (d.y + (d.height/2))];
        
        // Now, modify these values to make the arrow start/end closer to the intermediate border
        // todo - clean up this logic 
        // this works okay in most situations but isn't quite right
        if (major_axis == 0) {
            let fo = Math.abs(oc[1]-(o.y+o.height))/6;
            let fd = Math.abs(dc[1]-(d.y+d.height))/6;
            if (orient_x == 0)
            {
                oc[0] -= fo;
                dc[0] += fd;
            } else {
                oc[0] += fo;
                dc[0] -= fd;
            }
        } else {
            let fo = Math.abs(oc[0]-(o.x+o.width))/6;
            let fd = Math.abs(dc[0]-(d.x+d.width))/6;
            if (orient_y == 0)
            { 
                oc[1] -= fo;
                dc[1] += fo;
            } else {
                oc[1] += fo;
                dc[1] -= fo;
            }
        }
    
        // width and height of the arrow being drawn
        let w = Math.abs(dc[0]-oc[0]);
        let h = Math.abs(dc[1]-oc[1]);

        // endcap points
        let ecf = 0.25
        let cw = 8;
        // let ch = 12;
        // eco should be dc[1] - (length * 0.75)
        //               dc[0] - (width  * 0.75)
        // let eco = [
        //     ecf*dc[0], ecf*dc[1]
        // ];
        let eco, ec1, ec2, ecm;

        eco = [0,0];
            // left:  eco is to the right (+)
            // right: eco -  
        eco[0] = (orient_x == 0) ? (dc[0]+(ecf*w)) : (dc[0]-(ecf*w));
        eco[1] = (orient_y == 0) ? (dc[1]+(ecf*h)) : (dc[1]-(ecf*h));

        let eco1, eco2;

        if (major_axis==0){
            // if (orient_x == 0) {
                // left-right arrow, moving left
                // so the axis of the endcap is vertical
            // } else {
            //     // left-right arrow, moving right
            // }

            // axis of the endcap is vertical
            eco1 = [
                eco[0],
                eco[1]+cw/2
            ];
            eco2 = [
                eco[0],
                eco[1]-cw/2
            ];
            
            ec1 = [
                eco[0],
                eco[1]+cw
            ];
            ec2 = [
                eco[0],
                eco[1]-cw
            ];

            ecm = [
                dc[0],
                //eco[1]-cw
                dc[1]
            ];

            let mf = cw/h;

            // mv is the dy between the origin and the end
            let mv = Math.abs(ecm[1]-eco[1]);

            // Modify each endcap point with a horizontal offset
            if (orient_y == 1) {
                // left-right arrow, moving left
                // so the axis of the endcap is vertical
                eco1[0] -= (mf/2)*mv;
                eco2[0] += (mf/2)*mv;
                ec1[0]  -= mf*mv;
                ec2[0]  += mf*mv;
            } else {
                // left-right arrow, moving right
                eco1[0] += (mf/2)*mv;
                eco2[0] -= (mf/2)*mv;
                ec1[0] += mf*mv;
                ec2[0] -= mf*mv;
            }
        }
        else {
            // if (orient_y == 0)
            // {
            //     // up-down arrow, moving up
            // } else {
            //     // up-down arrow, moving up
            // }

            // axis of the endcap is horizontal
            // y-axis: should move up and down based
            eco1 = [
                eco[0]+cw/2,
                eco[1]
            ];
            eco2 = [
                eco[0]-cw/2,
                eco[1]
            ];

            ec1 = [
                eco[0]+cw,
                eco[1]
            ];
            ec2 = [
                eco[0]-cw,
                eco[1]
            ];
            ecm = [
                // eco[0],
                dc[0],
                dc[1]
            ];

            // let mf = dist(eco, ecm)/w;
            let mv = Math.abs(ecm[0]-eco[0]);
            let mf = mv/w;

            if (orient_x == 1) {
                eco1[1] -= (mf/2)*mv;
                eco2[1] += (mf/2)*mv;
                ec1[1] -= mf*mv;
                ec2[1] += mf*mv;
            } else {
                eco1[1] += (mf/2)*mv;
                eco2[1] -= (mf/2)*mv;
                ec1[1] += mf*mv;
                ec2[1] -= mf*mv;
            }

        }


        let arrow = document.createElement("path");

        arrow.setAttribute("d", 
        // move to origin center
                'M ' + oc[0] + ' ' 
                     + oc[1] + ' ' +
        // Line to the endcap origin 1
                'L ' + eco1[0] + ' '
                     + eco1[1] + ' ' +
        // Line to endcap pt 1
                'L ' + ec1[0] + ' '
                     + ec1[1] + ' ' +
        // Line to endcap middle
                'L ' + ecm[0] + ' ' 
                     + ecm[1] + ' ' + 
        // Line to endcap pt 2
                'L ' + ec2[0] + ' ' 
                     + ec2[1] + ' ' + 
        // Line to the endcap origin
                'L ' + eco2[0] + ' '
                     + eco2[1] + ' ' +
        // Line to origin center
                'Z'
        );

        arrow.setAttribute("class", "arrow " + side);
        container.innerHTML += arrow.outerHTML + "\n";
    }

    // todo - take array of cells to draw clouds in
    // tie into combat system; helicopters less effective in clouds
    static drawClouds()
    {
        // let max = 
        // todo - make a persistent max cloud variable and increase / decrease it 
        // every time the function is called, to effectively "weight" how many clouds
        // are drawn so that transitions from very cloudy to clear are smooth
        let ct = Math.floor(Math.random() * 23);
        let refbb = document.getElementById("countries-inert").getBBox();
        let rx = refbb.x;
        let ry = refbb.y;
        let rw = refbb.width;
        let rh = refbb.height;

        let max_dim = 25;

        let cloud_container = document.getElementById("clouds");

        // remove any old clouds
        cloud_container.innerHTML = "";

        // Generate new clouds
        for (let i = 0; i < ct; i++)
        {
            let nodect =  Math.floor(Math.random() * 15);
            let cx = rx + ( Math.random() * rw );
            let cy = ry + ( Math.random() * rh );
            let cw = Math.random() * max_dim; 
            let ch = Math.random() * max_dim;
            for ( let e = 0; e < nodect; e++ )
            {
                let xs = (Math.random() > 0.5) ? (-1) : (1);
                let ys = (Math.random() > 0.5) ? (-1) : (1);
                let node = document.createElement("ellipse");
                    node.setAttribute("cx", (cx + (xs * Math.random() * cw/4 * e)).toString());
                    node.setAttribute("cy", (cy + (ys * Math.random() * ch/4 * e)).toString());
                    // cw-=e;
                    // ch-=e;
                    node.setAttribute("rx", ((cw * Math.random())).toString());
                    node.setAttribute("ry", ((ch * Math.random())).toString());
                    node.setAttribute("transform", 
                                      'rotate(' + (360 * Math.random()).toString() + ' ' + cx + ' ' + cy + ')' );
                    node.setAttribute("fill", "#dedede55");
                    node.setAttribute("stroke", "none");
                cloud_container.innerHTML+=node.outerHTML;
            }
        }
    }
}

/**
 * @brief Represents the entirety of one team's troops (of multiple types) within a given region.
 * @note  make sure to prevent any addition of troops from the opposite side to a force when a battle 
 *        begins. Either make moving to an occupied region immediately begin a battle, or copy the 
 *        "side" variable from found units on startup and check when adding troops.
 */
class Force{
    
	constructor(region_group_id){
		this._region = region_group_id;
        this._unitList = GameMap.getUnitsInRegion(region_group_id);
        this._side = "neutral";
        this._determineSide();
	}

	//getters
	get side(){
        return this._side;
	}
	get region(){
		return this._region;
	}
    get region_phonetic(){
        return region_phonetic_key[this._region];
    }
	get unitList(){
		return this._unitList;
	}
	get infantry(){
		return this._unitList[0];
	}
	get helicopter(){
		return this._unitList[1];
	}
	get armor(){
		return this._unitList[2];
	}
	get infantryCount(){
		return (this._unitList[0] == null) ? 0 : this._unitList[0].count;
	}
	get helicopterCount(){
		return (this._unitList[1] == null) ? 0 : this._unitList[1].count;
	}
	get armorCount(){
		return (this._unitList[2] == null) ? 0 : this._unitList[2].count;
	}

    get totalCount() {
        return this.infantryCount + this.helicopterCount + this.armorCount;
    }

	//setters
	
    set region(p){
		this._region = p;
	}
	set unitList(uts){
		this._unitList = uts;
        this._determineSide();
	}
    // set side(newSide)
    // {
    //     this._side = newSide;
    //     document.getElementById(this._region).setAttribute("class", "region " + this._side);
    // }

	//methods
	alterForce(list){
		for(let i = 0; i < 3; i++){
			if(this._unitList[i] != null){
				this._unitList[i].alterUnits(list[i]);
                GameMap.updateUnitDisplay(this._unitList[i]);
			} else {
                // todo check later
                this._unitList[i] = new Unit(
                    troop_type_names[i],
                    this._region,
                    list[i],
                    this._side
                );
                console.log(this._unitList[i] + ": " + list[i]);
                GameMap.updateUnitDisplay(this._unitList[i]);
            }
		}

        // Remove empty units
        for(let i = 0; i < 3; i++){
			if(this._unitList[i].count == 0){
                this._unitList[i] = null;
            }
        }

        this._determineSide();
	}

    // Todo - make "damage" an array to tell what fraction is from inf, hel, armor,
    // and give the respective buffs / debuffs vs other units. 
    distributeDamage( damage )
    {

        let types_present = 0;
        // let fractional_damage = 0;
        let newIc = 0;
        let newHc = 0;
        let newAc = 0;
        let af = [ 0, 0, 0 ];

        // random number between 0 and 1 to determine how to distribute damage between infantry
        // and vehicles. Infantry damage is multiplied by balanceFactor, while vehicle damage 
        // is divided by it.
        let balanceFactor = Math.random();

        if (this.infantryCount > 0)
            types_present++;
        if (this.armorCount > 0)
            types_present++;
        if (this.helicopterCount > 0)
            types_present++;
        

        let damageMatrix = [
            balanceFactor * (this.infantryCount / this.totalCount),
            (1/balanceFactor) * (this.helicopterCount / this.totalCount),
            (1/balanceFactor) * (this.armorCount / this.totalCount)
        ];

        if (this.infantryCount > 0)
        {
            newIc = this.infantryCount - ((damageMatrix[0] * damage) / this.infantry.hpMod);
            if (newIc < 0) {
                newIc = 0;
            }
            af[0] = (newIc - this.infantryCount);
        }

        if (this.helicopterCount > 0)
        {
            newHc = this.helicopterCount - ((damageMatrix[1] * damage) / this.helicopter.hpMod);
            if (newHc < 0) {
                newHc = 0;
            }
            af[1] = (newHc - this.helicopterCount);
        }

        if (this.armorCount > 0)
        {
            newAc = this.armorCount - ((damageMatrix[2] * damage) / this.armor.hpMod);
            if (newAc < 0) {
                newAc = 0;
            }
            af[2] = (newAc - this.armorCount);
        }

        this.alterForce(af);
    }

    /**
     * @brief Determines which team the force belongs to. Optionally updates the region display.
     * @param {bool} updateRegionOwner = true
     *        When true, updates the region display to match the current owner using GameMap
     *        setRegionOwner(). When false, no changes are made to the map when the function is
     *        called.
     */
    _determineSide( updateRegionOwner = true )
    {
        // Track the previous side value
        let prev_side = this._side;

        // Default to "neutral"
        this._side = "neutral";
        
        // Determine the side based on the units in the region
        for (let i = 0; i < troop_type_names.length; i++)
            if (this._unitList[i] != null)
                this._side = this._unitList[i].side;

        // Preserve ownership of capitals even when they become empty
        if (this._side == "neutral" && isCapitalRegion(this._region) && prev_side != "neutral")
            this._side = prev_side;
        
        // Conditionally update the map display based on argument
        if (updateRegionOwner)
            GameMap.setRegionOwner(this._region, this._side);
    }
}

/**
 * @brief represents an individual troop type (infantry, helicopter, or armor)
 */
class Unit{

    constructor(type, region, count, side){

		this._side = side;
        this._id = side + "_" + region + "_" + type;

        switch (type) {
            case troop_type_names[0]:
                this.dmgMod = 2;
	    		this.hpMod = 10;
                break;
            case troop_type_names[1]: 
                this.dmgMod = 100;
                this.hpMod = 125;
                break;
            case troop_type_names[2]:
                this.dmgMod = 100;
                this.hpMod = 250;
        }

		this.health = this.hpMod * count;
		this.type = type;
		this.region = region;
		// this.movement = 
		// make a dom to attach to the visual element
	}

	//getters
	get hpMod(){
		return this._hpMod;
	}
	get dmgMod(){
		return this._dmgMod;
	}
	get side(){
		return this._side;
	}
	get type(){
		return this._type;
	}
	get region(){
		return this._region;
    }
    get region_phonetic(){
        return region_phonetic_key[this._region];
    }
	get health(){
		return this._health;
	}
	get count(){
		return (this.health > 0) ? Math.ceil((this.health) / (this.hpMod)) : 0;
	}
    get id()
    {
        return this._id;
    }

	//setters
	set health(hp){
		this._health = hp;
	}
	set region(pos){
		this._region = pos;
	}
	set count(ct){
		this._count = ct;
	}
	set side(sd){
		this._side = sd;
	}
	set dmgMod(dm){
		this._dmgMod = dm;
	}
	set hpMod(hm){
		this._hpMod = hm;
	}
	set type(t){
	    this._type = t;
	}
	
	//methods
	//movement calc(){
		// mov = movementFunction(region.terrain, this.type)
		// this.movement = mov;
	// }
	updateHealth(dmg){
		this.health = this.health - dmg; 
	}
	alterUnits(cnt){
        console.log("Adding " + cnt + " to " + this._id);
		this._health += (this.hpMod * cnt);
        document.getElementById(this._id).setAttribute("data-count", this.count);
	}
}

/**
 * @brief todo
 */
class Terrain{
	constructor(pos){
		this.type;
		this.region;		
	}
}

function battleCb( obj )
{
    obj._tick();
}

class Battle {

    /**
     * @brief Construct a battle using a defender and attacker.
     *        Battle takes place in the defending force's cell.
     * @param {*} defending_force 
     * @param {*} attacking_force 
     */
    constructor( defending_force, attacking_force )
    {
        GameMap.craterFix();

        this._battle_number = battle_ct;
        battle_ct++;

        this._off = attacking_force;
        this._offRefCt = [
            this._off.infantryCount,
            this._off.helicopterCount,
            this._off.armorCount
        ];

        this._def = defending_force;
        this._defRefCt = [
            this._def.infantryCount,
            this._def.helicopterCount,
            this._def.armorCount
        ];
        this._defRefTotal = this._def.totalCount;

        this._refSides = [
            this._off.side, 
            this._def.side
        ];

        // Choose a location for defender casualties to 
        // retreat to in case of defeat.
        this._defFb = null;
        let avail_fb = region_connections[this._def.region];
        for (let i = 0; i < avail_fb.length; i++)
        {
            for (let e = 0; e < game.forces.length; e++)
            {
                if (game.forces[e].region == avail_fb[i] && game.forces[e].side == this._def.side)
                    this._defFb = game.forces[e];
            }
        }

        // Set tick counter
        this._ticks = 0;

        this._off_mod = Math.random()/2;
        this._def_mod = Math.random()/2 + 0.05;


        // Put information about the battle in the game log
        gameLog( 
            team_key[this._off.side] + 
            " attacks " + this._def.region + 
            " from " + this._off.region + 
            "<br/><progress id=\"p_battle_" + this._battle_number + "\" class=\"battle\" max=\"100\" value=\"50\"></progress>"
        ); 
    }

    start()
    {
        game.battleIncrement();
        this._interval = setInterval(battleCb, [200], this);
    }


    // called by the move handler fn when opposing armies try to 
    // occupy the same cell. 
    end()
    {
        clearInterval(this._interval);
        game.battleDecrement();

        let winside = "";
        let verb = "";
        let troopLossRecord = "";

        if (this._off.totalCount == 0)
        {

            // partially restore casualties
            this._def.alterForce(
                [
                    Math.floor((this._defRefCt[0]-this._def.infantryCount)*Math.random()),
                    Math.floor((this._defRefCt[1]-this._def.helicopterCount)*Math.random()),
                    Math.floor((this._defRefCt[2]-this._def.armorCount)*Math.random())
                ]
            );
            this._off._side = this._refSides[0];
            this._off.alterForce(
                [
                    Math.floor((this._offRefCt[0]-this._off.infantryCount)*Math.random()),
                    Math.floor((this._offRefCt[1]-this._off.helicopterCount)*Math.random()),
                    Math.floor((this._offRefCt[2]-this._off.armorCount)*Math.random())
                ]
            );

            winside = team_key[this._def.side];
            verb = "maintains";
            troopLossRecord = 
            "<pre>" +
            "LOSSES:\n" +
            "-------\n" +
            "             ATTACKER" + "\n" +
            "INFANTRY:    " + (this._off.infantryCount - this._offRefCt[0]).toString() + "\n" +
            "HELICOPTER:  " + (this._off.helicopterCount - this._offRefCt[1]).toString() + "\n" +
            "ARMOR:       " + (this._off.helicopterCount - this._offRefCt[2]).toString() + "\n\n" +
            "             DEFENDER" + "\n" +
            "INFANTRY:    " + (this._def.infantryCount - this._defRefCt[0]).toString() + "\n" +
            "HELICOPTER:  " + (this._def.helicopterCount - this._defRefCt[1]).toString() + "\n" +
            "ARMOR:       " + (this._def.helicopterCount - this._defRefCt[2]).toString() +
            "</pre>";

        } else {
            winside = team_key[this._off.side];
            verb = "takes";

            // restore defender losses if a fallback position exists
            let def_restored = [
                Math.floor((this._defRefCt[0])*Math.random()/2),
                Math.floor((this._defRefCt[1])*Math.random()/2),
                Math.floor((this._defRefCt[1])*Math.random()/2)
            ];
            if (this._defFb != null)
                this._defFb.alterForce(def_restored);
            else 
                def_restored = [0,0,0];


            // restore attacker losses 
            this._off.alterForce(
                [
                    Math.floor((2/3)*(this._offRefCt[0]-this._off.infantryCount)*Math.random()),
                    Math.floor((2/3)*(this._offRefCt[1]-this._off.helicopterCount)*Math.random()),
                    Math.floor((2/3)*(this._offRefCt[1]-this._off.armorCount)*Math.random())
                ]
            );

            // create the loss record using the numbers from AFTER restorations are performed
            // provide notice of where the defenders routed to
            troopLossRecord = 
            "<pre>" +
            "LOSSES:\n" +
            "-------\n" +
            "             ATTACKER" + "\n" +
            "INFANTRY:    " + (this._off.infantryCount - this._offRefCt[0]).toString() + "\n" +
            "HELICOPTER:  " + (this._off.helicopterCount - this._offRefCt[1]).toString() + "\n" +
            "ARMOR:       " + (this._off.helicopterCount - this._offRefCt[2]).toString() + "\n\n" +
            "             DEFENDER" + "\n" +
            "INFANTRY:    " + -(this._defRefCt[0] - def_restored[0]).toString() + "\n" +
            "HELICOPTER:  " + -(this._defRefCt[1] - def_restored[1]).toString() + "\n" +
            "ARMOR:       " + -(this._defRefCt[2] - def_restored[2]).toString();
            if (this._defFb != null)
                troopLossRecord += "\n\n" + (def_restored[0]+def_restored[1]+def_restored[2]).toString() + " SURVIVING DEFENDERS\nROUTED TO " + this._defFb.region.toUpperCase();
            troopLossRecord += "</pre>";
            
            // Update the owner of the cell to be the attacker, and move their troops there.
            this._def._side = this._off.side;
            this._def.alterForce(
                [
                    this._off.infantryCount,
                    this._off.helicopterCount,
                    this._off.armorCount
                ]
            );

            this._off.alterForce(
                [
                    (-1)*this._off.infantryCount,
                    (-1)*this._off.helicopterCount,
                    (-1)*this._off.armorCount
                ]
            );

            

        }

        
        gameLog( winside + " " + verb + " control of " + this._def.region + "." + troopLossRecord);

        //battle_ct++;
        GameMap.removeCombatAnimations( this._battle_number );
        game.battleEndCb();

    	return;
    }

    /**
     * @brief called repeatedly until the battle ends.
     *        For now, should deal damage entirely at random
     *        Will later be updated to match specifications.
     */
    _tick()
    {
        const s = Date.now();
        let now = null;

        console.log("Tick #" + this._ticks);
        this._ticks++;
        this._drawProgress();

        if (this._off.side == this._def.side)
        {
            GameMap.removeCombatAnimations( this._battle_number );
            this._drawProgress();
            this.end();
            return;
        }


        // give defenders a small bonus if they are losing badly and have no fallback
        if (this._defFb == null && this._def.totalCount / this._defRefTotal < 0.3 )
            this._def_mod += 0.03;

        // let off_mod = Math.random();
        // let def_mod = Math.random();

        // Damage by attackers
        let dmgo = 0;

        // Damage by defenders
        let dmgd = 0;

        // Calculate dmgo
        if (this._off.infantry != null)
            dmgo += Math.min( this._off.infantryCount, troop_combat_width[0] ) * this._off.infantry.dmgMod * (Math.random()/2 + this._off_mod);
        if (this._off.helicopter != null)
            dmgo += Math.min( this._off.helicopterCount, troop_combat_width[1] ) * this._off.helicopter.dmgMod * (Math.random()/2 + this._off_mod);
        if (this._off.armor != null)
            dmgo += Math.min( this._off.armorCount, troop_combat_width[2] ) * this._off.armor.dmgMod * (Math.random()/2 + this._off_mod);

        // Calculate dmgd
        if (this._def.infantry != null)
            dmgd += Math.min( this._def.infantryCount, troop_combat_width[0] ) * this._def.infantry.dmgMod * (Math.random()/2 + this._def_mod);
        if (this._def.helicopter != null)
            dmgd += Math.min( this._def.helicopterCount, troop_combat_width[1] ) * this._def.helicopter.dmgMod * (Math.random()/2 + this._def_mod);
        if (this._def.armor != null)
            dmgd += Math.min( this._def.armorCount, troop_combat_width[2] ) * this._def.armor.dmgMod * (Math.random()/2 + this._def_mod);

        this._animateCombat();

        // Deal damage to offense
        this._off.distributeDamage(dmgd);

        // Deal damage to defense
        this._def.distributeDamage(dmgo);

        if ( this._off.totalCount <= 0 || this._def.totalCount <= 0 )
        {
            GameMap.removeCombatAnimations( this._battle_number );
            this._drawProgress();
            this.end();
        }

        return;
    }

    _animateCombat()
    {
        let off_target = [
            this._def.infantry,
            this._def.helicopter, 
            this._def.armor
        ];

        let def_target = [
            this._off.infantry,
            this._off.helicopter, 
            this._off.armor
        ];

        [this._off, this._def].forEach((side) => {
            troop_type_names.forEach((type) => {
                let tlist = (side == this._off) ? off_target : def_target;
                if (side[type] != null) 
                    GameMap.animateUnitCombat(side[type], tlist, this._ticks);
            });
        });
    }

    _drawProgress()
    {
        if (this._off.side == "of")
        {
            document.getElementById("p_battle_" + this._battle_number).setAttribute("value", (this._def.totalCount/(this._def.totalCount+this._off.totalCount+1))*100);
        } else {
            document.getElementById("p_battle_" + this._battle_number).setAttribute("value", (this._off.totalCount/(this._off.totalCount+this._def.totalCount+1))*100);
        }
    }

}

class Strike {

    constructor(strikeForce, target)
    {
        this._sf = strikeForce;
        this._tgt = target;
    }

    apply()
    {
        
    }

}


class Game{

    constructor()
    {
        this.forces = [];
        this._initialize_forces();
        this._initialize_listeners();
        this._state = "initial";
        this._currentPlayerTurn = "bf";
        this._currentPlayerForces = 0;

        this.forces.forEach((force) => {
            if (force.side == this._currentPlayerTurn)
                {
                    document.getElementById(force.region).classList.toggle("cpt", true);
                }
        });

        // this._bfqmv = [];
        // this._ofqmv = [];

        this._queuedMoves_bf = [];
        this._queuedMoves_of = [];
        this._battlect = 0;

        document.getElementById("turn-indicator").addEventListener("click", changeTurn_cb, [false, false]);
        this._changeTurn();
        this._changeTurn();

        GameMap.drawClouds();
        this._applyFogOfWar();
        this._applyReinforcements();
    }

    getRegionForce(region_letter)
    {
        for (let i = 0; i < this.forces.length; i++)
        {
            if (this.forces[i].region == region_letter)
                return this.forces[i];
            else 
                continue;
        }
        return null;
    }

    moveTroops(src, dst, count){
    	//assuming count is valid

    	let A = getRegionForce(src);
    	let B = getRegionForce(dst);
    	let removeCount = count.map(function(x){x * -1});

    	//some verification may be needed for both zones
    	if(A.side == B.side || A.side == "neutral" || B.side == "neutral"){
    		//reduce count in source and increase count in destination
	    	A.alterForce(removeCount);
	    	B.alterForce(count);
    	}else{
    		console.log("invalid src or dst");
    		return 0;
    	}

    	//check win

    	return 0;
	}

    _initialize_forces()
    {
        region_group_ids.forEach((region) => {
            this.forces.push( new Force(region) );
        });
        console.log(this.forces);
    }

    _initializeHeadquarters()
    {
        for (let i = 0; i < regions_capitals.length; i++)
        {
            let cap = regions_capitals[i];
            let side = this.getRegionForce(cap).side;
        }
    }

    _initialize_listeners()
    {
        // ADD LISTENER FOR REGION CLICK BY CURRENT PLAYER
        region_group_ids.forEach((id) => {
            console.log("Added event listener for " + id);
            document.getElementById(id).addEventListener(
                "click",
                gameRegionClickCallback,
                [false, false]
            );
            document.getElementById(id).obj = this;
        });
    }

    _changeTurn()
    {
        turn_ct++;

        if (turn_ct % 2 == 0)
            GameMap.drawClouds();

        this._currentPlayerForces = 0;

        this.forces.forEach((force) => {
            if (force.side == this._currentPlayerTurn) {
                document.getElementById(force.region).classList.toggle("cpt", false);
                this._currentPlayerForces++;
            }
        });
        
        // Apply queued moves from previous turn
        this._handlePlayerMoves();

        // troop counts
        let bf_tc = 0;
        let of_tc = 0;

        // region counts
        let bf_rc = 0;
        let of_rc = 0;

        for(let i = 0; i < this.forces.length; i++)
        {
            if (this.forces[i].side == "bf")
            {
                bf_tc += this.forces[i].totalCount;
                bf_rc++;
            }
            else if (this.forces[i].side == "of")
            {
                of_tc += this.forces[i].totalCount;
                of_rc++;
            }
        }

        document.getElementById("p_bfof").setAttribute("value", ((bf_tc)/(bf_tc+of_tc))*100);

        if (bf_rc == 0)
        {
            this._handleWin("of");
            return;
        } else if (of_rc == 0)
        {
            this._handleWin("bf");
            return;
        }

        // Rotate turns
        if(this._currentPlayerTurn == "bf"){
    		this._currentPlayerTurn = "of";
            document.getElementById("turn-indicator").setAttribute("class", "opfor");
            document.getElementById("team").innerHTML = "OPFOR (PACT)";
    	}else if(this._currentPlayerTurn == "of"){
    		this._currentPlayerTurn = "bf";
            document.getElementById("turn-indicator").setAttribute("class", "blufor");
            document.getElementById("team").innerHTML = "BLUFOR (NATO)";
    	}

        // Highlight current player's own forces
        this.forces.forEach((force) => {
            if (force.side == this._currentPlayerTurn)
                {
                    document.getElementById(force.region).classList.toggle("cpt", true);
                }
        });

        
        // Apply fog-of-war
        this._applyFogOfWar();

        // Apply reinforcements
        // Skip first two turns used to initialize the game
        if (turn_ct > 2)
           this._applyReinforcements();


        // need to make sure that this only happens after battles end
        let bc = document.getElementsByClassName("cbtFire");
        while (bc.length > 0)
        {
            bc[0].remove();
        }
    }

    _applyReinforcements()
    {
        // while (this._state != "initial")
        // {
        //     // wait
        // }

        this._state = "reinforcing";

        this._cptReinforcements = [0,0,0];

        for (let i = 0; i < regions_capitals.length; i++)
        {
            let capital = regions_capitals[i];
            if (this.getRegionForce(capital).side == this._currentPlayerTurn)
            {
                for (let e = 0; e < troop_type_names.length; e++)
                {
                    this._cptReinforcements[e] += capitals_reinforcements[capital][e];
                }
            }
        }

        gameLog(team_key[this._currentPlayerTurn] + " has reinforcements: " +
                "<pre>" 
                + troop_type_names[0].toUpperCase() + ":\t" + this._cptReinforcements[0] + "\n"
                + troop_type_names[1].toUpperCase() + ":\t" + this._cptReinforcements[1] + "\n"
                + troop_type_names[2].toUpperCase() + ":\t\t" + this._cptReinforcements[2] + "\n"
                + "</pre>"
        );

        let rc = document.getElementsByClassName("region " + this._currentPlayerTurn);
        for (let i = 0; i < rc.length; i++)
        {
            rc[i].classList.add("reinforceable");
            rc[i].addEventListener("click", reinforcements_cb, [false, false]);
        }
    }

    reinforcement_handler( e )
    {
        let node = e.target;
        while (node.id.length != 2)
        {
            node = node.parentElement;
        }

        // Todo - modal now to set the number of reinforcements to apply to the region.
        let appliedReinforcements = this._cptReinforcements;
        let haveMoreReinforcements = false;
        
        if (this.getRegionForce(node.id).side == this._currentPlayerTurn)
        {
           this.getRegionForce(node.id).alterForce(appliedReinforcements);
        } else {
            return;
        }

        for (let i = 0; i < troop_type_names.length; i++)
        {
            this._cptReinforcements[i] -= appliedReinforcements[i];
            if (this._cptReinforcements[i] > 0)
                haveMoreReinforcements = true;
        }

        if (!haveMoreReinforcements)
        {
            let rc = document.getElementsByClassName("reinforceable");
            for (let i = rc.length-1; i >= 0; i--)
            {
                rc[i].removeEventListener("click", reinforcements_cb, [false, false]);
                rc[i].classList.remove("reinforceable");
            }
            this._state = "waitForMoveSelect";
        }


        // console.log(node);
        // console.log(e.target);
    }

    _applyFogOfWar()
    {
        // Handle fog of war
        let fow = document.getElementsByClassName("fow");
        for (let i = fow.length-1; i >= 0; i--)
            fow[i].classList.toggle("fow", false);

        let visible_cells = [];
        for ( let i = 0; i < this.forces.length; i++)
        {
            let force = this.forces[i];
            if (force.side == this._currentPlayerTurn) {
                document.getElementById(force.region).classList.toggle("cpt", false);
                visible_cells.push(force.region);
                for (let e = 0; e < region_connections[force.region].length; e++)
                {
                    visible_cells.push(region_connections[force.region][e]);
                }
            }
        }
        for ( let i = 0; i < region_group_ids.length; i++)
        {
            if (!(visible_cells.includes(region_group_ids[i])))
            {
                document.getElementById(region_group_ids[i]).classList.toggle("fow", true);
                let force = this.getRegionForce(region_group_ids[i]);

                troop_type_names.forEach((troop_type) => {
                    if (force[troop_type] != null)
                    {
                        document.getElementById(force[troop_type].id).classList.add("fow");
                    }
                });
            }
        }
    }

    _handleWin( winteam )
    {
        let fow = document.getElementsByClassName("fow");
        for (let i = fow.length-1; i >= 0; i--)
            fow[i].classList.toggle("fow", false);

        this.forces.forEach((force) => { 
            document.getElementById(force.region).classList.toggle("neutral", false);
            document.getElementById(force.region).classList.toggle(winteam, true);
            document.getElementById("s-" + winteam + "-" + force.region).classList.toggle("sh", false);
        });

        document.getElementById("turn-indicator").innerHTML = team_key[winteam] + " VICTORY";

        gameLog(team_key[winteam] + " VICTORY.\nRefresh the page to play again!");

    }

    _regionClickHandler( e )
    {
        // Guard for state: ensure multiple regions cannot be selected
        // at once. 
        if (this._state == "waitForMoveSelect" || this._state == "battle") 
            return;
        this._state = "waitForMoveSelect";

        // use the realtarget variable to propagate up from whatever node 
        // was clicked to the node that is the group with the region-letter
        // as the id.
        let realtarget = e.currentTarget;
        while (realtarget.id.length != 2 && realtarget.nodeName != "svg")
            realtarget = realtarget.parentElement;

        // validate that the region is for the current player;
        // if not, reset state and return
        let clickedForce = this.getRegionForce(realtarget.id);
        if (clickedForce.side != this._currentPlayerTurn)
        {
            this._state = "initial";
            return;
        }

        // mark the region group as selected and add an event listener for
        // re-clicking on the region to cancel movement.
        realtarget.classList.add("selected");
        // ADD LISTENER FOR CANCEL MOVEMENT
        console.log("Added OTU event listener for " + realtarget + " click-to-cancel");
        realtarget.addEventListener(
            "click",
            gameSelectedRegionClickCallback,
            [false, true]
        );
        realtarget.obj = this;

        // mark valid moves and add event listeners for their selection.
        region_connections[realtarget.id].forEach((validMove) => {
            let node = document.getElementById(validMove);
            node.classList.add("validmove");

            // ADD LISTENER FOR MOVING TROOPS
            console.log("Added OTU event listener for " + realtarget + " move to " + validMove);
            node.addEventListener(
                "click",
                gameMoveRegionClickCallback,
                [false, true]
            );
            node.obj = this;
            node.oc = realtarget.id;
            node.cf = clickedForce;
        });
    }

    _moveCancelHandler( e )
    {
        if (this._state != "waitForMoveSelect") 
            return;
        this._state = "initial";

        e.currentTarget.classList.remove("selected");

        // REMOVE LISTENERS FOR VALIDMOVES
        region_connections[e.currentTarget.id].forEach((validMove) => {
            let node = document.getElementById(validMove);
            node.classList.remove("validmove");

            console.log("Removed OTU event listener for " + node.id + " move from " + e.currentTarget.id);
            node.removeEventListener(
                "click",
                gameMoveRegionClickCallback,
                [false, true]
            );
        });

        // REMOVE LISTENER FOR MOVING TROOPS
        console.log("Removed OTU event listener for " + e.currentTarget.id + " click-to-cancel");
        e.currentTarget.removeEventListener(
            "click",
            gameSelectedRegionClickCallback,
            [false, true]
        );

            
        // e.currentTarget.addEventListener(
        //     "click",
        //     gameRegionClickCallback,
        //     [false, false]
        // );
        // e.currentTarget.obj = this;
    }
    
    //set this._currentPlayerTurn to "of" then back to "bf" in an alternating manner

    _moveHandler( e )
    {

        if (this._state != "waitForMoveSelect") 
            return;
        this._state = "initial";

        e.currentTarget.classList.remove("selected");
        
        e.currentTarget.addEventListener(
            "click",
            gameRegionClickCallback,
            false
        );
        e.currentTarget.obj = this;

        // Remove "selected" class from origin
        document.getElementById(e.currentTarget.oc).classList.remove("selected");

        // Remove "validmove" class from move options
        region_connections[e.currentTarget.oc].forEach((validMove) => {
            let node = document.getElementById(validMove);
            node.classList.remove("validmove");
            // console.log("Removed OTU event listener for " + node.id + " move from " + e.currentTarget.oc);
            node.removeEventListener(
                "click",
                gameMoveRegionClickCallback,
                [false, true]
            );
        });

        // console.log("Removed OTU event listener for " + e.currentTarget.oc + " click-to-cancel");
        document.getElementById(e.currentTarget.oc).removeEventListener(
            "click",
            gameSelectedRegionClickCallback,
            [false, true]
        );

        //console.log(e.currentTarget.id);
        console.log("dst: " + e.currentTarget.id);
        let dstForce = this.getRegionForce(e.currentTarget.id);
        console.log("src: " + e.currentTarget.oc);
        let srcForce = this.getRegionForce(e.currentTarget.oc);

        // draw mvmt arrow: 
        // todo - add id to movement arrow so it can be removed
        GameMap.drawMovementArrow(srcForce.side, e.currentTarget.oc, e.currentTarget.id);

        let l = this["_queuedMoves_" + this._currentPlayerTurn].length;
        this["_queuedMoves_" + this._currentPlayerTurn][l] = [srcForce.side, srcForce, dstForce];

        // After player has made 3 moves, end their turn
        if (this["_queuedMoves_" + this._currentPlayerTurn].length > Math.min(2, this._currentPlayerForces))
        {
            this._changeTurn();
        } 
    }

    
    _handlePlayerMoves()
    {
        let move_list = this["_queuedMoves_" + this._currentPlayerTurn];

        // Get the modal
        var modal = document.getElementById("myModal");

        // Get the <span> element that closes the modal
        var span = document.getElementsByClassName("close")[0];

        modal.style.display = "block";

        // When the user clicks on <span> (x), close the modal
        span.onclick = function() {
          modal.style.display = "none";
        }
        
        for (let i = 0; i < move_list.length; i++)
        {
            // Ensure that the move is still valid
            if (move_list[i][0] != move_list[i][1].side)
                continue;

            let srcForce = move_list[i][1];
            let dstForce = move_list[i][2];

            // Allow transfer of troops if the target region is 
            // neutral or already owned by the current player.
            // Otherwise, start a battle and return
            if (dstForce.side == "neutral")
                dstForce._side = srcForce.side;
            else if (dstForce.side != this._currentPlayerTurn)
            {
                this._state = "battle";
                // this._battlect++;
                let battle = new Battle(dstForce, srcForce);
                battle.start();
                continue;
            }

            //log.innerHTML += "<p>" + this._currentPlayerTurn.toUpperCase() + " moved from " + srcForce.region_phonetic + " to " + dstForce.region_phonetic + "</p>\n";
            gameLog( team_key[this._currentPlayerTurn] + " moves from " + srcForce.region + " to " + dstForce.region );

            dstForce.alterForce([
                srcForce.infantryCount, 
                srcForce.helicopterCount,
                srcForce.armorCount
                ]
            );

            // GameMap.animateUnitMove(srcForce, dstForce);

            srcForce.alterForce(
                (-1)*srcForce.infantryCount, 
                (-1)*srcForce.helicopterCount,
                (-1)*srcForce.armorCount
            );

        }

        // Reset move list
        while (this["_queuedMoves_" + this._currentPlayerTurn].length > 0)
        {
            this["_queuedMoves_" + this._currentPlayerTurn].pop();
        }

        // Remove arrows 
        let ac = document.getElementsByClassName("arrow " + this._currentPlayerTurn);
        while (ac.length > 0)
        {
            ac[0].remove();
        }

        // this["_queuedMoves_" + this._currentPlayerTurn] = [];
    }

    battleIncrement()
    {
        this._battlect++;
    }

    battleDecrement()
    {
        this._battlect--;
    }


    battleEndCb()
    {
        if (this._state != "battle")
            return;

        if (this._battlect <= 0)
        {
            let bc = document.getElementsByClassName("cbtFire");
            while (bc.length > 0)
            {
                bc[0].remove();
            }
            this._state = "initial";
            this._changeTurn();
        }
    }

}

let log_entries = 0;
let battle_ct = 0;
let turn_ct = 0;
let game = new Game;
