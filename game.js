/**
 * @file   game.js
 * @brief  Implements the game.
 * @author Andrew MacGillivray
 * @author Jarrod Grothusen
 * @author Luke McCumber
 * @author Nhat Nyugen
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
    400,
    10,
    20
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

/**
 * @brief Indicates a more descriptive name for the blufor / opfor
 *        for display in the UI.
 */
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

// todo - can remove?
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

/**
 * @brief Indicates the capital of each region
 */
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

/**
 * @brief List of capitals, without index
 */
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

/**
 * @brief Sets the reinforcement bonus gained by controlling each capital
 */
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
    a0: ["a1", "a3"],
    a1: ["a0", "a2", "a9"],
    a2: ["a1", "a3", "a6", "a9"], 
    a3: ["a0", "a2", "a4", "a5", "a6"], 
    a4: ["a3", "a5"],
    a5: ["a4", "a6", "a7"],
    a6: ["a2", "a5", "a7", "a8", "a9"],
    a7: ["j0", "j1", "a8", "a6", "a5"],
    a8: ["a6", "a7", "a9", "e0"],
    a9: ["a1", "a2", "a6", "a8", "b0"],
    b0: ["a9", "e0", "d1", "b2", "b1"],
    b1: ["b0", "b2", "b3"],
    b2: ["b0", "b1", "b3", "b5", "c1", "d0", "d1"], 
    b3: ["b1", "b2", "b5", "b4"],
    b4: ["b3", "b5", "b8", "b9"],
    b5: ["b2", "b3", "b4", "b8", "b6", "c1"],
    b6: ["b5", "b7", "b8", "c1", "c0"],
    b7: ["b6", "b8"],
    b8: ["b4", "b5", "b6", "b7", "b9"],
    b9: ["b4", "b8"],
    c0: ["b6", "b7", "c1", "c2"],
    c1: ["b2", "b5", "b6", "c0", "c2", "c9"],
    c2: ["c0", "c1", "c4", "c3"],
    c3: ["c2", "c4", "c5"],
    c4: ["c2", "c3", "c5", "c6", "c7", "c8", "c9"],
    c5: ["c3", "c4", "c6"],
    c6: ["c4", "c5", "c7"],
    c7: ["d6", "c8", "c4", "c6"],
    c8: ["d0", "d5", "c7", "c4", "c9"],
    c9: ["b2", "d0", "c8", "c4", "c1"],
    d0: ["c9", "c8", "d5", "d2", "d1", "b2"],
    d1: ["b0", "b2", "d0", "d5", "d2", "e0", "e4"],
    d2: ["d0", "d1", "d3", "d4", "d5", "e4"],
    d3: ["d2", "d4", "e5", "e8"],
    d4: ["d2", "d3", "e9", "d8", "d6", "d5"],
    d5: ["d0", "d2", "d4", "d6", "c8"],
    d6: ["d4", "d5", "d7", "d8", "c7"],
    d7: ["d6", "d8", "d9", "f2", "f3"],
    d8: ["d4", "d6", "d7", "d9", "e9"],
    d9: ["d7", "d8", "e9", "f2"],
    e0: ["e1", "e4", "d1", "b0", "a8"],
    e1: ["a8", "e0", "e2", "e3", "j0", "j7"],
    e2: ["e1", "e3", "e6", "j8", "i0", "i1"], 
    e3: ["e1", "e2", "e4", "e5"],
    e4: ["e0", "e3", "e5", "d2", "d1"],
    e5: ["d3", "e3", "e4", "e6","e8"],
    e6: ["e2", "e5", "e7","i2", "g0", "g1"],
    e7: ["e6", "e8", "e9", "f0", "f1", "g1"],
    e8: ["d3", "e5", "e7", "e9"],
    e9: ["e7", "e8", "f1", "f2", "d9", "d8", "d4"],
    f0: ["e7", "g1", "g3", "f1", "f5", "f6"],
    f1: ["f0", "f2", "f5", "e7", "e9"],
    f2: ["e9", "f1", "f3", "d7", "d9"], 
    f3: ["d7", "f2",  "f4"],
    f4: ["f3", "f5", "f7", "f9"],
    f5: ["f0", "f1", "f3", "f4", "f6", "f7"],
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
    i1: ["e2", "i0", "i2", "i3"],
    i2: ["e6", "g0", "h0", "h1", "i1", "i3", "i6"], 
    i3: ["i0", "i1", "i2", "i4", "i5", "i6"],
    i4: ["j8", "i9", "i5", "i3", "i0"],
    i5: ["i3", "i4", "i9", "i8", "i7", "i6"],
    i6: ["i3", "i5", "i7", "i2", "h4", "h1"],
    i7: ["i5", "i6", "i8"],
    i8: ["j9", "i5", "i7", "i9"],
    i9: ["i8", "i5", "i4", "j9"],
    j0: ["a7", "e1", "j7", "j1"],
    j1: ["j0", "j2", "a7"],
    j2: ["j1", "j3", "j5", "j6", "j7"], 
    j3: ["j2", "j5", "j4"],
    j4: ["j3", "j3"],
    j5: ["j4", "j3", "j2", "j6", "j9"],
    j6: ["j2", "j5", "j8", "j7"],
    j7: ["e2", "e1", "j0", "j2", "j6", "j8"],
    j8: ["e2", "i0", "i4", "j9", "j6", "j7"],
    j9: ["j5", "j8", "i9", "i8"]
};

/**
 * @brief List of all possible terrain types
 */
const terrain_types = [
    "craters",
    "open",
    "plains",
    "forest",
    "water",
    "urban"
];

/**
 * @brief Describes the troop efficiency modifiers for each troop type within each terrain type.
 */
const terrain_mod = {
    craters: [
        1.4,
        1,
        0.7
    ],
    open: [
        1,
        1,
        1
    ],
    plains: [
        1,
        1.8,
        1.3
    ], 
    forest: [
        2,
        0.5,
        1.2
    ],
    water: [
        .9,
        2.2,
        .7
    ], 
    urban: [
        2.2,
        1.5,
        1
    ]
};

let region_terrain = {
    a0: {craters: 0, open: 0.3, plains: 0.9, forest: 0, water: 0, urban:0 },
    a1: {craters: 0, open: 0.3, plains: 0.6, forest: 0, water: 0, urban:0 },
    a2: {craters: 0, open: 0.3, plains: 0, forest: 0.5, water: 0, urban:0 },
    a3: {craters: 0, open: 0.3, plains: 0, forest: 0.3, water: 0, urban:0 },
    a4: {craters: 0, open: 0.3, plains: 0, forest: 0.5, water: 0, urban:0 },
    a5: {craters: 0, open: 0.3, plains: 0, forest: 0.5, water: 0, urban:0 },
    a6: {craters: 0, open: 0.3, plains: 0, forest: 0.3, water: 0, urban:0 },
    a7: {craters: 0, open: 0.3, plains: 0, forest: 0.5, water: 0.2, urban:0.5 },
    a8: {craters: 0, open: 0.3, plains: 0.4, forest: 0.3, water: 0, urban:0 },
    a9: {craters: 0, open: 0.3, plains: 0.5, forest: 0.4, water: 0, urban:0 },
    b0: {craters: 0, open: 0.3, plains: 0.9, forest: 0.1, water: 0, urban:0 },
    b1: {craters: 0, open: 0.3, plains: 0.5, forest: 0.1, water: 0, urban:0 },
    b2: {craters: 0, open: 0.3, plains: 0.7, forest: 0.1, water: 0.1, urban:0 },
    b3: {craters: 0, open: 0.3, plains: 0.8, forest: 0, water: 0, urban:0 },
    b4: {craters: 0, open: 0.3, plains: 0, forest: 0, water: 0.1, urban:0 },
    b5: {craters: 0, open: 0.3, plains: 0, forest: 0, water: 0.3, urban:0.6 },
    b6: {craters: 0, open: 0.3, plains: 0, forest: 0, water: 0.3, urban:0.5 },
    b7: {craters: 0, open: 0.3, plains: 0, forest: 0, water: 0.2, urban:0.8 },
    b8: {craters: 0, open: 0.3, plains: 0, forest: 0, water: 0.2, urban:0.5 },
    b9: {craters: 0, open: 0.3, plains: 0, forest: 0, water: 0.3, urban:0 },
    c0: {craters: 0, open: 0.3, plains: 0, forest: 0, water: 0.4, urban:0 },
    c1: {craters: 0, open: 0.3, plains: 0, forest: 0, water: 0.4, urban:0.5 },
    c2: {craters: 0, open: 0.3, plains: 0, forest: 0, water: 0.2, urban:0.8 },
    c3: {craters: 0, open: 0.3, plains: 0, forest: 0, water: 0.1, urban:0.9 },
    c4: {craters: 0, open: 0.3, plains: 0, forest: 0, water: 0.1, urban:0.8 },
    c5: {craters: 0, open: 0.3, plains: 0, forest: 0, water: 0.2, urban:0 },
    c6: {craters: 0, open: 0.3, plains: 0, forest: 0.2, water: 0.2, urban:0 },
    c7: {craters: 0, open: 0.3, plains: 0.3, forest: 0, water: 0, urban:0 },
    c8: {craters: 0, open: 0.3, plains: 0, forest: 0, water: 0, urban:0.1 },
    c9: {craters: 0, open: 0.3, plains: 0, forest: 0, water: 0.2, urban:0.2 },
    d0: {craters: 0, open: 0.3, plains: 0, forest: 0, water: 0.2, urban:0 },
    d1: {craters: 0, open: 0.3, plains: 0, forest: 0.3, water: 0, urban:0.2 },
    d2: {craters: 0, open: 0.3, plains: 0, forest: 0.2, water: 0.2, urban:0.6 },
    d3: {craters: 0, open: 0.3, plains: 0, forest: 0.2, water: 0.1, urban:0.5 },
    d4: {craters: 0, open: 0.3, plains: 0, forest: 0, water: 0.1, urban:0 },
    d5: {craters: 0, open: 1, plains: 0, forest: 0, water: 0, urban:0 },
    d6: {craters: 0, open: 0.3, plains: 0.5, forest: 0, water: 0, urban:0 },
    d7: {craters: 0, open: 0.3, plains: 0.8, forest: 0, water: 0, urban:0 },
    d8: {craters: 0, open: 1, plains: 0, forest: 0, water: 0, urban:0 },
    d9: {craters: 0, open: 1, plains: 0, forest: 0, water: 0, urban:0 },
    e0: {craters: 0, open: 0.3, plains: 0.5, forest: 0, water: 0.2, urban:0 },
    e1: {craters: 0, open: 0.3, plains: 0, forest: 0.5, water: 0.2, urban:0 },
    e2: {craters: 0, open: 0.3, plains: 0.5, forest: 0.3, water: 0, urban:0 },
    e3: {craters: 0, open: 0.3, plains: 0, forest: 0.2, water: 0, urban:0.5 },
    e4: {craters: 0, open: 0.3, plains: 0, forest: 0.2, water: 0.2, urban:0.5 },
    e5: {craters: 0, open: 0.3, plains: 0, forest: 0.2, water: 0.2, urban:0.5 },
    e6: {craters: 0, open: 0.3, plains: 0, forest: 0.9, water: 0, urban:0 },
    e7: {craters: 0, open: 1, plains: 0, forest: 0, water: 0, urban:0 },
    e8: {craters: 0, open: 1, plains: 0, forest: 0, water: 0, urban:0 },
    e9: {craters: 0, open: 1, plains: 0, forest: 0, water: 0, urban:0 },
    f0: {craters: 0, open: 1, plains: 0, forest: 0, water: 0, urban:0 },
    f1: {craters: 0, open: 0.3, plains: 0.7, forest: 0, water: 0.1, urban:0 },
    f2: {craters: 0, open: 0.3, plains: 0, forest: 0, water: 0.2, urban:0 },
    f3: {craters: 0, open: 0.3, plains: 0, forest: 0, water: 0.2, urban:0.4 },
    f4: {craters: 0, open: 0.3, plains: 0, forest: 0, water: 0.2, urban:0.8 },
    f5: {craters: 0, open: 0.3, plains: 0.3, forest: 0, water: 0.2, urban:0.3 },
    f6: {craters: 0, open: 0.3, plains: 0.3, forest: 0, water: 0, urban:0 },
    f7: {craters: 0, open: 0.3, plains: 0, forest: 0.3, water: 0.3, urban:0.4 },
    f8: {craters: 0, open: 0.3, plains: 0, forest: 0.3, water: 0, urban:0 },
    f9: {craters: 0, open: 0.3, plains: 0, forest: 0.6, water: 0.1, urban:0.3 },
    g0: {craters: 0, open: 0.3, plains: 0, forest: 0.5, water: 0, urban:0 },
    g1: {craters: 0, open: 0.3, plains: 0, forest: 0.3, water: 0, urban:0 },
    g2: {craters: 0, open: 0.3, plains: 0, forest: 0.3, water: 0, urban:0 },
    g3: {craters: 0, open: 0.3, plains: 0.7, forest: 0, water: 0, urban:0 },
    g4: {craters: 0, open: 0.3, plains: 0.1, forest: 0, water: 0.1, urban:0 },
    g5: {craters: 0, open: 0.3, plains: 0.2, forest: 0.1, water: 0, urban:0 },
    g6: {craters: 0, open: 0.3, plains: 0, forest: 0.4, water: 0, urban:0 },
    g7: {craters: 0, open: 0.3, plains: 0, forest: 1, water: 0, urban:0 },
    g8: {craters: 0, open: 0.3, plains: 0.4, forest: 0.3, water: 0, urban:0 },
    g9: {craters: 0, open: 0.3, plains: 0.7, forest: 0, water: 0.2, urban:0 },
    h0: {craters: 0, open: 1, plains: 0, forest: 0, water: 0, urban:0 },
    h1: {craters: 0, open: 0.3, plains: 0, forest: 0.3, water: 0, urban:0 },
    h2: {craters: 0, open: 0.3, plains: 0.3, forest: 0, water: 0, urban:0 },
    h3: {craters: 0, open: 0.3, plains: 0.5, forest: 0.1, water: 0, urban:0 },
    h4: {craters: 0, open: 0.3, plains: 0, forest: 0.6, water: 0, urban:0 },
    h5: {craters: 0, open: 0.3, plains: 0.2, forest: 0.5, water: 0, urban:0 },
    h6: {craters: 0, open: 0.3, plains: 0.8, forest: 0, water: 0, urban:0 },
    h7: {craters: 0, open: 0.3, plains: 0, forest: 1, water: 0, urban:0 },
    h8: {craters: 0, open: 0.3, plains: 0, forest: 0.4, water: 0, urban:0 },
    h9: {craters: 0, open: 0.3, plains: 0.5, forest: 0, water: 0, urban:0 },
    i0: {craters: 0, open: 0.3, plains: 0.5, forest: 0.2, water: 0, urban:0 },
    i1: {craters: 0, open: 0.3, plains: 0.5, forest: 0, water: 0.1, urban:0 },
    i2: {craters: 0, open: 0.3, plains: 0, forest: 0, water: 0.2, urban:0 },
    i3: {craters: 0, open: 0.3, plains: 0.3, forest: 0.4, water: 0.1, urban:0 },
    i4: {craters: 0, open: 0.3, plains: 0, forest: 0.9, water: 0, urban:0 },
    i5: {craters: 0, open: 0.3, plains: 0.5, forest: 0.2, water: 0, urban:0 },
    i6: {craters: 0, open: 0.3, plains: 0.2, forest: 0.4, water: 0, urban:0 },
    i7: {craters: 0, open: 0.3, plains: 0.3, forest: 0.5, water: 0, urban:0 },
    i8: {craters: 0, open: 0.3, plains: 0.3, forest: 0.3, water: 0, urban:0 },
    i9: {craters: 0, open: 0.3, plains: 0.4, forest: 0.5, water: 0, urban:0 },
    j0: {craters: 0, open: 0.3, plains: 0, forest: 0.2, water: 0.2, urban:0.6 },
    j1: {craters: 0, open: 0.3, plains: 0, forest: 0.5, water: 0, urban:0.2 },
    j2: {craters: 0, open: 0.3, plains: 0, forest: 0.4, water: 0, urban:0 },
    j3: {craters: 0, open: 0.3, plains: 0, forest: 0.4, water: 0, urban:0 },
    j4: {craters: 0, open: 0.3, plains: 0, forest: 0.3, water: 0, urban:0 },
    j5: {craters: 0, open: 0.3, plains: 0, forest: 0.7, water: 0, urban:0 },
    j6: {craters: 0, open: 0.3, plains: 0, forest: 0.8, water: 0, urban:0 },
    j7: {craters: 0, open: 0.3, plains: 0, forest: 0.6, water: 0, urban:0 },
    j8: {craters: 0, open: 0.3, plains: 0.3, forest: 0.7, water: 0, urban:0 },
    j9: {craters: 0, open: 0.3, plains: 0.2, forest: 0.8, water: 0, urban:0 },
};

/**
 * @brief Describes the state of ownership / troop presence in each region at the start 
 *        of the game. Used by the Game class to initialize all force objects.
 */
const game_setup = {
    //{side: bf/of, force:[infantry, helicopter, a
    a0: {side: "neutral", force: [0, 0, 0]},
    a1: {side: "neutral", force: [0, 0, 0]},
    a2: {side: "neutral", force: [0, 0, 0]},
    a3: {side: "neutral", force: [0, 0, 0]},
    a4: {side: "neutral", force: [0, 0, 0]},
    a5: {side: "neutral", force: [0, 0, 0]},
    a6: {side: "bf", force: [1200, 2, 20]},
    a7: {side: "bf", force: [225, 0, 6]},
    a8: {side: "bf", force: [500, 0, 8]},
    a9: {side: "neutral", force: [0, 0, 0]},
    b0: {side: "neutral", force: [0, 0, 0]},
    b1: {side: "neutral", force: [0, 0, 0]},
    b2: {side: "neutral", force: [0, 0, 0]},
    b3: {side: "neutral", force: [0, 0, 0]},
    b4: {side: "neutral", force: [0, 0, 0]},
    b5: {side: "bf", force: [850, 4, 12]},
    b6: {side: "neutral", force: [0, 0, 0]},
    b7: {side: "neutral", force: [0, 0, 0]},
    b8: {side: "neutral", force: [0, 0, 0]},
    b9: {side: "neutral", force: [0, 0, 0]},
    c0: {side: "neutral", force: [0, 0, 0]},
    c1: {side: "bf", force: [120, 0, 4]},
    c2: {side: "neutral", force: [0, 0, 0]},
    c3: {side: "neutral", force: [0, 0, 0]},
    c4: {side: "bf", force: [650, 6, 0]},
    c5: {side: "neutral", force: [0, 0, 0]},
    c6: {side: "neutral", force: [0, 0, 0]},
    c7: {side: "neutral", force: [0, 0, 0]},
    c8: {side: "neutral", force: [0, 0, 0]},
    c9: {side: "bf", force: [40, 1, 0]},
    d0: {side: "neutral", force: [0, 0, 0]},
    d1: {side: "neutral", force: [0, 0, 0]},
    d2: {side: "bf", force: [1850, 0, 38]},
    d3: {side: "of", force: [250, 0, 12]},
    d4: {side: "bf", force: [250, 0, 12]},
    d5: {side: "neutral", force: [0, 0, 0]},
    d6: {side: "neutral", force: [0, 0, 0]},
    d7: {side: "neutral", force: [0, 0, 0]},
    d8: {side: "bf", force: [350, 8, 0]},
    d9: {side: "bf", force: [200, 0, 8]},
    e0: {side: "bf", force: [1500, 12, 28]},
    e1: {side: "of", force: [1500, 12, 28]},
    e2: {side: "neutral", force: [0, 0, 0]},
    e3: {side: "of", force: [1850, 0, 38]},
    e4: {side: "bf", force: [350, 0, 14]},
    e5: {side: "of", force: [350, 0, 14]},
    e6: {side: "neutral", force: [0, 0, 0]},
    e7: {side: "neutral", force: [0, 0, 0]},
    e8: {side: "of", force: [350, 0, 18]},
    e9: {side: "of", force: [350, 8, 0]},
    f0: {side: "neutral", force: [0, 0, 0]},
    f1: {side: "of", force: [520, 6, 14]},
    f2: {side: "bf", force: [520, 6, 14]},
    f3: {side: "bf", force: [300, 0, 7]},
    f4: {side: "bf", force: [1990, 0, 32]},
    f5: {side: "of", force: [895, 0, 16]},
    f6: {side: "of", force: [300, 0, 7]},
    f7: {side: "neutral", force: [0, 0, 0]},
    f8: {side: "neutral", force: [0, 0, 0]},
    f9: {side: "bf", force: [450, 4, 10]},
    g0: {side: "neutral", force: [0, 0, 0]},
    g1: {side: "neutral", force: [0, 0, 0]},
    g2: {side: "neutral", force: [0, 0, 0]},
    g3: {side: "neutral", force: [0, 0, 0]},
    g4: {side: "of", force: [450, 4, 10]},
    g5: {side: "neutral", force: [0, 0, 0]},
    g6: {side: "neutral", force: [0, 0, 0]},
    g7: {side: "neutral", force: [0, 0, 0]},
    g8: {side: "neutral", force: [0, 0, 0]},
    g9: {side: "neutral", force: [0, 0, 0]},
    h0: {side: "neutral", force: [0, 0, 0]},
    h1: {side: "of", force: [650, 6, 0]},
    h2: {side: "neutral", force: [0, 0, 0]},
    h3: {side: "neutral", force: [0, 0, 0]},
    h4: {side: "neutral", force: [0, 0, 0]},
    h5: {side: "neutral", force: [0, 0, 0]},
    h6: {side: "neutral", force: [0, 0, 0]},
    h7: {side: "neutral", force: [0, 0, 0]},
    h8: {side: "neutral", force: [0, 0, 0]},
    h9: {side: "neutral", force: [0, 0, 0]},
    i0: {side: "neutral", force: [0, 0, 0]},
    i1: {side: "neutral", force: [0, 0, 0]},
    i2: {side: "of", force: [40, 2, 0]},
    i3: {side: "of", force: [120, 0, 4]},
    i4: {side: "neutral", force: [0, 0, 0]},
    i5: {side: "of", force: [850, 4, 12]},
    i6: {side: "neutral", force: [0, 0, 0]},
    i7: {side: "neutral", force: [0, 0, 0]},
    i8: {side: "neutral", force: [0, 0, 0]},
    i9: {side: "neutral", force: [0, 0, 0]},
    j0: {side: "of", force: [500, 0, 8]},
    j1: {side: "of", force: [225, 0, 6]},
    j2: {side: "of", force: [1200, 2, 20]},
    j3: {side: "neutral", force: [0, 0, 0]},
    j4: {side: "neutral", force: [0, 0, 0]},
    j5: {side: "neutral", force: [0, 0, 0]},
    j6: {side: "neutral", force: [0, 0, 0]},
    j7: {side: "neutral", force: [0, 0, 0]},
    j8: {side: "neutral", force: [0, 0, 0]},
    j9: {side: "of", force: [500, 0, 8]},
};

/**
 * @brief Shorthand for "opfor" used in SVG node class names
 */
const opfor_prefix = "of";

/**
 * @brief Shorthand for "blufor" used in SVG node class names
 */
const blufor_prefix = "bf";

/**
 * @brief Determines the class name of the troop-size indicator most appropriate 
 *        for the given number of troops.
 * @param {number} size 
 * @returns string 
 *          The name of the troop-size indicator that best fits the size.
 */
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


/**
 * @brief Class containing static methods to work with the game's user interface
 */
class GameUI {

    /**
     * @brief Posts the provided message to the game's log (UI component)
     */
    static log( message, classlist = "" )
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
        if (unit.side == "neutral")
            return;

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
     * @brief Creates combat animations to visually indicate a firefight between the source and target units.
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
                    region_terrain[reftgt.region]["craters"] += 0.003
                }
            }
        }

        if (cl > 0) {
            craterctn.innerHTML += cg.innerHTML;
        }

        let cc = document.getElementsByClassName("crater");
        for (let e = cc.length-1; e >= 0; e--)
        {
            cc[e].addEventListener("animationend", GameUI.craterCb, true);
            cc[e].addEventListener("animationiteration", GameUI.craterCb, true);
        }
    }

    /**
     * @brief Removes the animation class from the crater
     * @param {Event} e 
     */
    static craterCb( e )
    {    
        document.getElementById(e.target.id).setAttribute("class", "crater_filled");
    }

    /**
     * @brief Replaces the "crater" class with "crater_filled", ending any active animations.
     *        Useful if called at the end of combat, to ensure old craters do not replay their
     *        "explosion" animation when new combat begins.
     */
    static craterFix()
    {
        let cc = document.getElementsByClassName("crater");
        for (let e = cc.length-1; e >= 0; e--)
        {
            cc[e].setAttribute("class", "crater_filled");
        }
    }

    /**
     * @brief Removes combat animations from the specified battle number
     * @param {number} battle_no 
     */
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
                dc[0],
                dc[1]
            ];

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

    /**
     * @brief Draws clouds on the map. 
     * @todo tie into combat system; helicopters less effective when clouds present
     */
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

    /**
     * @brief Displays a modal for moving troops. 
     * @param {array} unit_cts 
     *        Array of numbers indicating how many troops of each type are available to 
     *        the current player for the current action. Indexes pertain to troop_type_names.
     * @param {*} callback 
     *        A callback function to call with cbparms after the user submits the modal.
     *        The callback will be given the values of the modal, as an array, in addition
     *        to cbparms.
     * @param {*} cbparms 
     *        Additional parameters for the callback function
     */
    static troopSplitModal( unit_cts, callback, cbparms )
    {
        let modal = document.getElementById("troopSplitter");
        let content = document.getElementById("ts_content");
        let close = document.getElementById("ts_close").outerHTML;
        let fields = [];
        // let inputs = [];
        
        console.log(unit_cts);
        content.innerHTML = "";

        for ( let i = 0; i < troop_type_names.length; i++ )
        {
            if (unit_cts[i] > 0) {
                content.innerHTML += '<p class="ts_p">' + 
                                '<label for="' + troop_type_names[i] + '">' + troop_type_names[i] + '</label>' +
                                '<input name="' + troop_type_names[i] + '" id="' + troop_type_names[i] + '" type="number" value="' + unit_cts[i] + '" data-max="' + unit_cts[i] + '" />' +
                                '</p>';
                fields.push(troop_type_names[i]);
            }
        }

        content.innerHTML += close;
        modal.style.display = "block";
        close = document.getElementById("ts_close");
        close.addEventListener("click", GameUI.troopSplitModalCB, [false, true]);
        close.fields = fields;
        close.callback = callback;
        close.cbparms = cbparms;
    }

    /**
     * @brief Callback for the troopSplit modal window. Captures values then 
     *        executes the provided callback function.
     * @param {*} e 
     */
    static troopSplitModalCB( e )
    {
        let fields = e.currentTarget.fields;
        let callback = e.currentTarget.callback;
        let cbparms = e.currentTarget.cbparms;
        let values = [];

        for (let i = 0; i < troop_type_names.length; i++)
        {
            values[i] = 0;
        }

        for (let e = 0; e < fields.length; e++)
        {
            let i = troop_type_names.indexOf(fields[e]);
            let input = document.getElementById(fields[e]);
            let max = parseInt(Number(input.getAttribute("data-max")));
            values[i] = parseInt(Number(input.value));
            if (values[i] >= max)
                values[i] = max;
            if (values[i] < 0)
                values[i] = 0;
            if (isNaN(values[i]))
                values[i] = 0;
        }

        callback(values, cbparms);

        let modal = document.getElementById("troopSplitter");
        let close = document.getElementById("ts_close");
            modal.innerHtml = close;
        
        modal.style.display = "none";

        e.preventDefault();

        ts++;
    }

    /**
     * @brief takes a message and puts it in the notification modal, which is
     *        then displayed on the screen for the player.
     * @note hacky solution to reinforcement popup every turn: hard-coded check
     *       of msg content controls some behavior
     */
    static notification(message){
        // Get the modal
        let modal = document.getElementById("notif");

        document.getElementById("notif-item").innerHTML = message;

        // Get the <span> element that closes the modal
        let span = document.getElementById("notif-close");
        modal.style.display = "block";

        let optional = document.getElementById("notif-ignore");

        // if this is for reinforcements, do custom behavior
        if (message.substr(0, "You have recieved".length) == "You have recieved")
        {
            optional.onclick = function() {
                game.ignoreReinforcementsNotif();
                modal.style.display = "none";
            }   
        } else {
            optional.remove();
        }

        // When the user clicks on <span> (x), close the modal
        span.onclick = function() {
          modal.style.display = "none";
        }
    }

    /**
     * @brief Changes HQ icons to show medic + headquarters instead of 
     *        artillery + headquarters, reflecting their true functionality. 
     * @returns void
     */
    static fixHeadQuarters()
    {
        for ( let i = 0; i < regions_capitals.length; i++)
        {
            let ids = ["hq_bf_" + regions_capitals[i][0],
                       "hq_of_" + regions_capitals[i][0]];
            for (let e = 0; e < ids.length; e++)
            {
                let id = ids[e];
                let icon = document.getElementById(id);
                let ref_class = icon.getAttribute("class");
                icon.innerHTML = icon.innerHTML.replace(/<circle.*\<\/circle\>/i, "");

                console.log(id);
                console.log(icon);

                if (icon.classList.contains("hq_np"))
                {
                    icon.classList.toggle("hq_np", false);
                    icon.classList.toggle("hq", true);
                }
                
                let bb = icon.getBBox();

                let mx = bb.x + bb.width/2;
                let my = bb.y + bb.height/2;

                icon.innerHTML += '<line class="cls-4 ' + id.substr(3,2) + 
                                  '" x1="' + mx + '" y1="' + bb.y + '"' +
                                   ' x2="' + mx + '" y2="' + (bb.y+bb.height) + '" />';

                icon.innerHTML += '<line class="cls-4 ' + id.substr(3,2) + 
                                  '" x1="' + bb.x + '" y1="' + my + '"' +
                                   ' x2="' + (bb.x + bb.width) + '" y2="' + my + '" />';

                icon.setAttribute("class", ref_class);
            }
        }
        return;
    }
}

/**
 * @brief represents an individual troop type (infantry, helicopter, or armor)
 * 
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
	
    /**
     * @brief Applies the given amount of damage to the unit's health.
     * @note  Converted to absolute value for safety; always detracts from health.
     * @param {Number} dmg 
     */
	updateHealth(dmg){
		this.health = this.health - Math.abs(dmg); 
	}

    /**
     * @brief Directly modifies the number of troops in this unit, based on count.
     * @details The health of the unit is increased by the hpMod (health-per-unit)
     *          times the given count (number of units to add).
     * @param {Number} cnt 
     */
	alterUnits(cnt){
        // console.log("Adding " + cnt + " to " + this._id);
		this._health += (this.hpMod * cnt);
        if (document.getElementById(this._id) == null)
            debugger;
        document.getElementById(this._id).setAttribute("data-count", this.count);
	}
}

/**
 * @brief Represents the entirety of one team's troops (of multiple types) within a given region.
 */
class Force{
    
	constructor(region_id){
		this._region = region_id;
        this._side = game_setup[region_id]["side"];
        this._unitList = [];
        let units = game_setup[region_id]["force"];

        troop_type_names.forEach((unitType) => {
            if (units[troop_type_names.indexOf(unitType)] > 0) {
                this._unitList.push( new Unit(unitType, this._region, units[troop_type_names.indexOf(unitType)], this._side ) );
                GameUI.updateUnitDisplay( this.unitList[troop_type_names.indexOf(unitType)] );
            } else
                this._unitList.push( null );
        });

        GameUI.setRegionOwner(this.region, this.side);
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

	/**
     * @brief Uses the provided list to update the units in the force.
     *        Then, calls determineSide() to ensure the region owner is correct.
     * @param {array} list 
     */
	alterForce(list){
		for(let i = 0; i < 3; i++){
			if(this._unitList[i] != null){
				this._unitList[i].alterUnits(list[i]);
                GameUI.updateUnitDisplay(this._unitList[i]);
			} else {
                this._unitList[i] = new Unit(
                    troop_type_names[i],
                    this._region,
                    list[i],
                    this._side
                );
                GameUI.updateUnitDisplay(this._unitList[i]);
            }
		}

        // Remove empty units
        for(let i = 0; i < this._unitList.length; i++){
			if(this._unitList[i].count == 0){
                this._unitList[i] = null;
            }
        }

        this._determineSide();
	}

    /**
     * @brief Given a number, distribute that amount of damage to the units in the force.
     *        Applies a balancing factor to split damage between infantry and vehicles.
     * @param {Number} damage 
     * @todo   make "damage" an array to tell what fraction is from inf, hel, armor,
     *         and give the respective buffs / debuffs vs other units. 
     */
    distributeDamage( damage )
    {

        let types_present = 0;
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
     *        When true, updates the region display to match the current owner using GameUI
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
            GameUI.setRegionOwner(this._region, this._side);
    }
}

/**
 * @brief Using two opposing forces, provided to the constructor, conducts a
 *        battle until one of the forces is defeated.
 */
class Battle {

    /**
     * @brief Construct a battle using a defender and attacker.
     *        Battle takes place in the defending force's cell.
     * @param {*} defending_force 
     * @param {*} attacking_force 
     */
    constructor( defending_force, attacking_force )
    {
        this.state = "initial";
        
        GameUI.craterFix();

        this._battle_number = battle_ct;
        battle_ct++;

        this._tickInterval = [200];

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

        // Track whether or not the defending region is a capital
        // If so, combat and casualty advantages are applied.
        this._defIsCapital = isCapitalRegion(this._def.region);

        this._refSides = [
            this._off.side, 
            this._def.side
        ];

        // Choose a location for defender casualties to 
        // retreat to in case of defeat.
        this._defFb = null;
        let avail_fb = region_connections[this._def.region];
        let i;
        for (i = 0; i < avail_fb.length; i++)
        {
            let candidate = game.getRegionForce(avail_fb[i]);
            if (candidate.side == this._def.side)
            {
                this._defFb = candidate;
                // add some randomness to the choice of whether or not to keep looking
                if (Math.random() > 0.5)
                    break;
            }
        }

        // choose terrain types for the battle
        this.terrain = [];
        let terrain_possible = region_terrain[this._def.region];

        i = 0;
        while (this.terrain.length < 3)
        {
            for (let e = 0; e < terrain_types.length; e++)
            {

                if (terrain_possible[terrain_types[e]] > 0) {
                    // for the first few tries, apply probability
                    if ( Math.random() < terrain_possible[terrain_types[e]])
                    {
                        this.terrain[i] = terrain_types[e];
                        i++;
                    }
                }
            }
        }
        // console.log(this.terrain);

        // Set tick counter
        this._ticks = 0;

        this._off_mod = Math.random()/2;
        this._def_mod = Math.random()/2 + 0.05;

        // Add additional defender bonus if the region is a capital
        if (this._defIsCapital) 
            this._def_mod += 0.05;

        // Battle.drawBattleWindow( this );

        // Put information about the battle in the game log
        GameUI.log( 
            team_key[this._off.side] + 
            " attacks " + this._def.region + 
            " from " + this._off.region + 
            "<br/><progress id=\"p_battle_" + this._battle_number + "\" class=\"battle\" max=\"100\" value=\"50\"></progress>"
        ); 

        // Add flanks
        this._flanks = {
            left: {
                attacker: [],
                defender: []
            },
            middle: {
                attacker: [],
                defender: []
            },
            right: {
                attacker: [],
                defender: []
            }
        };
        // Initialize flanks to 0 for # of troop types
        ["left", "middle", "right"].forEach((flank) => {
            for ( let tt = 0; tt < troop_type_names.length; tt++ )
            {
                this._flanks[flank]["attacker"][tt] = 0;
                this._flanks[flank]["defender"][tt] = 0;
            }
        });
        // Generate the defender's flanks using AI 
        this._defenderFlanksAi();

        // Get the attacker's flanks using the battle window
        this._drawBattleWindow();
    }

    /**
     * @brief Function that calls the battle's "_tick" method to perform a single 
     *        "round" of combat. Intended to be called using Battle.start()
     * @param {*} battle 
     */
    static run_battle( battle )
    {
        battle._tick();
    }

    /**
     * @brief Begins the battle by setting "_tick()" to be called at a fixed 
     *        interval. 
     * @details Once called, nothing else needs to be done to this object 
     *          externally. The battle will run until one side has been defeated.
     */
    start()
    {
        this._interval = setInterval(Battle.run_battle, this._tickInterval, this);
    }

    /**
     * @brief Handles the end of the battle.
     * @details
     *  Upon the battle end, determines the amount of casualties regained by each
     *  side and posts a log message describing the battle's costs. Then, alters
     *  the participating forces accordingly. Finally, posts the winner to the log
     *  and calls game.battleIncrement() to either start the next battle or end 
     *  the current player's turn.
     * 
     * @returns void
     */
    end()
    {
        clearInterval(this._interval);

        let winside = "";
        let verb = "";
        let troopLossRecord = "";

        let defCasualtyBonus = (this._defIsCapital) ? Math.random() : 0;

        if (this._off.totalCount == 0)
        {
            // partially restore casualties
            this._def.alterForce(
                [
                    Math.floor((this._defRefCt[0]-this._def.infantryCount)*Math.min(1, Math.random() + defCasualtyBonus)),
                    Math.floor((this._defRefCt[1]-this._def.helicopterCount)*Math.min(1, Math.random() + defCasualtyBonus)),
                    Math.floor((this._defRefCt[2]-this._def.armorCount)*Math.min(1, Math.random() + defCasualtyBonus))
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
            "ARMOR:       " + (this._off.armorCount - this._offRefCt[2]).toString() + "\n\n" +
            "             DEFENDER" + "\n" +
            "INFANTRY:    " + (this._def.infantryCount - this._defRefCt[0]).toString() + "\n" +
            "HELICOPTER:  " + (this._def.helicopterCount - this._defRefCt[1]).toString() + "\n" +
            "ARMOR:       " + (this._def.armorCount - this._defRefCt[2]).toString() +
            "</pre>";

        } else {
            winside = team_key[this._off.side];
            verb = "takes";

            // restore defender losses if a fallback position exists
            let def_restored = [
                Math.floor((this._defRefCt[0])*Math.min(1, Math.random() + defCasualtyBonus)/2),
                Math.floor((this._defRefCt[1])*Math.min(1, Math.random() + defCasualtyBonus)/2),
                Math.floor((this._defRefCt[1])*Math.min(1, Math.random() + defCasualtyBonus)/2)
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
                    Math.floor((2/3)*(this._offRefCt[2]-this._off.armorCount)*Math.random())
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
            "ARMOR:       " + (this._off.armorCount - this._offRefCt[2]).toString() + "\n\n" +
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

        GameUI.log( winside + " " + verb + " control of " + this._def.region + "." + troopLossRecord);
        GameUI.removeCombatAnimations( this._battle_number );
        game.battleIncrement();
    	return;
    }

    /**
     * @brief called repeatedly until the battle ends.
     *        For now, should deal damage entirely at random
     *        Will later be updated to match specifications.
     */
    _tick()
    {

        console.log("Tick #" + this._ticks);
        this._ticks++;
        this._drawProgress();
        let fl = ["left", "middle", "right"];

        if (this._off.side == this._def.side)
        {
            GameUI.removeCombatAnimations( this._battle_number );
            this._drawProgress();
            this.end();
            return;
        }


        // give defenders a small bonus if they are losing badly and have no fallback
        if (this._defFb == null && this._def.totalCount / this._defRefTotal < 0.3 )
            this._def_mod += 0.03;

        // let off_mod = Math.random();
        // let def_mod = Math.random();


        // If the opposing flank is empty, move troops to the best candidate flank where 
        // enemies are still present.
        for (let i = 0; i < fl.length; i++) {
            let f = fl[i];
            
            let attacker_sz = this._flanks[f]["attacker"].reduce((sum, idx) => sum + idx, 0);
            let defender_sz = this._flanks[f]["defender"].reduce((sum, idx) => sum + idx, 0);

            let mvTo = "";
            let mvFm = [];
            if (attacker_sz == 0 && defender_sz > 0)
            {
                mvTo = this._findCandidateFlank( f, "defender" );
                mvFm = this._flanks[f]["defender"];
                console.log("Moving defender from " + f + " flank to " + mvTo );
            } else if ( attacker_sz > 0 && defender_sz == 0 ) {
                mvTo = this._findCandidateFlank( f, "attacker" );
                mvFm = this._flanks[f]["attacker"];
                console.log("Moving attacker from " + f + " flank to " + mvTo );
            }

            if ( mvTo != "" && mvTo != f )
            {
                mvTo = this._flanks[mvTo]
                for (let e = 0; e < troop_type_names.length; e++)
                {
                    mvTo[e] += mvFm[e];
                    mvFm[e] = 0;
                }
                console.log(this._flanks);
            }
        }

        this._animateCombat();

        // Damage by attackers
        let dmgo = [];
        let oref = [];
        let omax = [];

        // Damage by defenders
        let dmgd = [];
        let dref = [];
        let dmax = [];

        for (let i = 0; i < troop_type_names.length; i++)
        {
            dmgo[i] = 0;
            oref[i] = [];
            omax[i] = 0;

            dmgd[i] = 0;
            dref[i] = [];
            dmax[i] = 0;
        }

        for (let i = 0; i < fl.length; i++) {
            let f = fl[i];
            let off = this._flanks[f]["attacker"];
            let def = this._flanks[f]["defender"];

            // infantry
            for (let e = 0; e < troop_type_names.length; e++)
            {
                oref[i].push( off[e] );
                dref[i].push( def[e] );

                // console.log(this._def[troop_type_names[e]].dmgMod);
                // console.log(Math.min(def[e], troop_combat_width[e]));
                // console.log((Math.random()/2) + this._off_mod + terrain_mod[this.terrain[i]][e]);

                // debugger;
                if (this._off[troop_type_names[e]] != null) {
                    omax[i] += def[e] * this._off[troop_type_names[e]].hpMod;
                    dmgo[i] += Math.min(off[e], troop_combat_width[e]) * 
                            this._off[troop_type_names[e]].dmgMod *
                            (Math.random()/2 + this._off_mod + terrain_mod[this.terrain[i]][e]);
                }

                if (this._def[troop_type_names[e]] != null) {
                    dmax[i] += def[e] * this._def[troop_type_names[e]].hpMod;
                    dmgd[i] += Math.min(def[e], troop_combat_width[e]) * 
                            this._def[troop_type_names[e]].dmgMod * 
                            (Math.random()/2 + this._def_mod + terrain_mod[this.terrain[i]][e]);
                }
            }

            // Limit the damage to the total health of the current flank
            if (dmgd[i] > omax[i]) 
                dmgd[i] = omax[i];
            if (dmgo[i] > dmax[i]) 
                dmgo[i] = dmax[i];

            console.log("Attacker " + f + " Deals Dmg: " + dmgo[i]);
            console.log("Defender " + f + " Deals Dmg: " + dmgd[i]);

            this._off.distributeDamage(dmgd[i]);
            this._def.distributeDamage(dmgo[i]);

            for (let e = 0; e < troop_type_names; e++)
            {
                oref[i][e] -= off[e];
                dref[i][e] -= def[e];
                this._flanks[f]["attacker"][e] -= oref[i][e];
                this._flanks[f]["defender"][e] -= dref[i][e];
            }
        }

        if ( this._off.totalCount <= 0 || this._def.totalCount <= 0 )
        {
            GameUI.removeCombatAnimations( this._battle_number );
            this._drawProgress();
            this.end();
        }

        return;
    }

    /**
     * @brief When the origin flank is opposed by an empty flank, finds a
     *        new candidate flank such that the origin can move there and 
     *        fight enemies.
     * @param {string} originFlank
     *        Left, right, or middle 
     * @param {string} side
     *        Attacker or defender.
     */
    _findCandidateFlank( originFlank, side )
    {
        let flanks = ["left", "middle", "right"];
        let candidates = [];
        let target_side = (side == "attacker") ? "defender" : "attacker";
        let fc = "";

        for (let i = 0; i < flanks.length; i++)
        {
            let f = flanks[i];
            if (f == originFlank)
                continue;
            let f_sz = this._flanks[f][target_side].reduce((sum, idx) => sum + idx, 0);
            if (f_sz > 0)
                candidates.push(f);
        }

        // Case 0: 
        // if there are no valid places to move, combat is about to end,
        // and the origin can stay where it is
        //
        // Case 1: 
        // If there is only one candidate, that's the best candidate
        //
        // Case 2:
        // There are 2 candidates. Choose the one with the fewest enemy 
        // troops remaining first.
        if ( candidates.length == 0)
                fc = originFlank;
        else if (candidates.length == 1)
                fc = candidates[0];
        else {
            let sz = [this._flanks[candidates[0]][target_side].reduce((sum, idx) => sum + idx, 0),
                      this._flanks[candidates[1]][target_side].reduce((sum, idx) => sum + idx, 0)];
            fc = candidates[sz.indexOf(Math.min(sz[0], sz[1]))];
        }

        return fc;
    }

    /**
     * @brief Calls GameUI.animateUnitCombat() with the appropriate parameters, 
     *        based on the units currently engaged in combat.
     */
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
                    GameUI.animateUnitCombat(side[type], tlist, this._ticks);
            });
        });
    }

    /**
     * @brief Updates the battle progress indicator in the game log (UI element)
     *        to reflect total troop counts at the end of the tick.
     * @note  May be more indicative to draw progress based on health than total count
     *        but then "comebacks" would be rarer.
     */
    _drawProgress()
    {
        if (this._off.side == "of")
        {
            document.getElementById("p_battle_" + this._battle_number).setAttribute("value", (this._def.totalCount/(this._def.totalCount+this._off.totalCount+1))*100);
        } else {
            document.getElementById("p_battle_" + this._battle_number).setAttribute("value", (this._off.totalCount/(this._off.totalCount+this._def.totalCount+1))*100);
        }
    }

    /**
     * @brief Draws a modal where the user determines how their troops should be
     *        organized into flanks at the start of the battle.
     * 
     * @post  BattleWindow is visible
     * @post  BattleWindow has icons and count indicators matching starting force
     * @post  Icon GAINS EventListener("click", Battle.startAllocCB, [false, true]);
     */
    _drawBattleWindow() 
    {
        const drawBattleDisplay = true;
        
        // Generate the window by inserting HTML from bwContent const (from index.html)
        let modal = document.getElementById("battleWindow");
            modal.innerHTML = bwContent;

        // Get window controls
        let span = document.getElementById("bw_close");
        let spenser = document.getElementById("bw_auto");
        let display = document.getElementById("bw_display");

        let attackers = this._off;
        let defender  = this._def;

        let flank_titles = [
            document.getElementById("bw_fl_t"),
            document.getElementById("bw_fm_t"),
            document.getElementById("bw_fr_t")
        ];

        // Set the flank titles to reflect their respective terrain type.
        for (let i = 0; i < flank_titles.length; i++)
        {
            flank_titles[i].innerHTML = this.terrain[i].toUpperCase();
        }

        // Clone the attacking and defending region elements to the display
        if (drawBattleDisplay) {
            let ar = document.getElementById(attackers._region);
            let dr = document.getElementById(defender._region );
            ["countries-inert", "regions", "plains", "forest", "urban-dense", "water", "crater-layer", "arrow-container", "clouds"].forEach(
                (terrain) => {
                    let t_n = document.getElementById(terrain);
                    let clone = t_n.cloneNode(true);
                    clone.setAttribute("id", clone.getAttribute("id") + "_bw_display");
                    display.innerHTML+=clone.outerHTML.replace(/id\=\"..\"/gi, "");
                }
            );
            [ar, dr].forEach( (rgn) => {
                let clone = rgn.cloneNode(true);
                clone.setAttribute("id", clone.getAttribute("id") + "_bw_display");
                display.innerHTML+=clone.outerHTML.replace(/id\=\"..r\"|reinforceable|cpt/gi, "");
                rgn = document.getElementById(rgn.getAttribute("id") + "_bw_display");
            });

            // Set display box viewport to zoom in on affected regions
            ar = ar.getBBox();
            dr = dr.getBBox();
            let xmin = Math.min( ar.x, dr.x ) - Math.max( ar.width, dr.width );
            // let xmax = xmin + Math.max( ar.width, dr.width ) - Math.min( ar.width, dr.width ) - 15;
            // let xmax = xmin + 10;
            let xmax = xmin + 2*Math.max( ar.width, dr.width );

            let ymin = Math.min( ar.y, dr.y ) - Math.max( ar.height, dr.height );
            // let ymax = ymin + 10;
            // let ymax = ymin + Math.max( ar.height, dr.height ) - Math.min( ar.height, dr.height ) - 15;
            let ymax = ymin + 2*Math.max( ar.height, dr.height );

            display.setAttribute("viewBox", xmin + ' ' + ymin + ' ' + xmax + ' ' + ymax);
        }

        // Show the attacking and defending troop icons & their counts
        ["off", "def"].forEach((prefix) => 
        {
            let side = (prefix[0] == "o") ? attackers : defender;
            let tt_ct = 1; // troop type count (how many types have been filled)

            for (let i = 0; i < troop_type_names.length; i++) 
            {
                if (side[troop_type_names[i] + "Count"] > 0)
                {
                    // console.log(prefix + "_a" + tt_ct + "_" + troop_type_names[i] + "_" + side.side );
                    let icon = document.getElementById(prefix + "_a" + tt_ct + "_" + troop_type_names[i] + "_" + side.side );
                               document.getElementById(prefix + "_alloc_" + tt_ct).innerHTML = icon.outerHTML;
                    
                    icon = document.getElementById(prefix + "_a" + tt_ct + "_" + troop_type_names[i] + "_" + side.side );

                    icon.classList.toggle("t_np", false);
                    icon.classList.toggle("t", true);
                    icon.classList.toggle("available", true);
                    icon.setAttribute("data-type", troop_type_names[i]);
                    icon.setAttribute("data-count", side[troop_type_names[i] + "Count"]);
                    // console.log(prefix + "_alloc_" + tt_ct + "_text");
                    let text = document.getElementById(prefix + "_alloc_" + tt_ct + "_text");
                        text.innerHTML = "<b>" + troop_type_names[i] + "</b><br/>"; 
                    if (prefix[0] == "o") {
                        icon.addEventListener("click", Battle.startAllocCB, [false, true]);
                        icon.obj = this;
                        text.innerHTML += side[troop_type_names[i] + "Count"]; 
                    } else {
                        text.innerHTML += troop_sizes[getBestTroopCountSymbol( side[troop_type_names[i] + "Count"]) ]; 
                    }

                    tt_ct++;
                }

                // todo - set innerhtml to blank if no troop present for an icon
            }
        });

        // Reveal the window after setting its content
        modal.style.display = "block";

        // todo - right event listener options?
        
        // Add event listener for close/confirm button
        span.addEventListener("click", Battle.closeWindowCB, [true, true]);
        span.obj = this;

        // Add event listener for auto-distribute button
        spenser.addEventListener("click", Battle._offenseFlanksAi, [true, true]);
        spenser.obj = this;
    }

    /**
     * @brief When the user clicks one of their available troop allocation icons, highlight the flanks and allow them
     *        to place the troops there
     * @param {Event} e 
     * 
     * @post  Icon LOSES EventListener("click", Battle.startAllocCB, [false, true]);
     * @post  Icon GAINS EventListener("click", Battle.cancelAllocCB, [false, true]);
     * @post  Flank GAINS EventListener("click", Battle.promptAllocCb, [false, true] );
     */
    static startAllocCB( e )
    {
        let battle = e.currentTarget.obj;
        let icon = e.currentTarget;
        let fl = document.getElementById("fl"),
            fm = document.getElementById("fm"),
            fr = document.getElementById("fr");

        // Ignore if a different troop is already being moved
        if (battle.state == "allocWait")
            return;
        battle.state = "allocWait";

        while (!icon.classList.contains("t"))
        {
            // if we went too far, give up
            if (icon.classList.contains("alloc"))
                return;

            icon = icon.parentElement;
        }
        icon.classList.toggle("selected", true);
        icon.classList.toggle("available", false);
        icon.addEventListener("click", Battle.cancelAllocCB, [false, true]);
        icon.obj = battle;

        // Display selected troop type's effectiveness bonus, in each flank, to the user
        let tt_name = icon.getAttribute("data-type");
        ["fl","fm","fr"].forEach((flank) => {
            let fn = ["fl", "fm", "fr"].indexOf(flank);
            let advantageDisplay = document.getElementById("bw_"+flank+"_a");
            advantageDisplay.innerHTML = tt_name + " Effectiveness:<br/> x" + terrain_mod[battle.terrain[fn]][troop_type_names.indexOf(tt_name)];
        });

        // Add event listener to each flank, to prompt for how many troops to add when clicked
        [fl, fm, fr].forEach((flank) => {
            flank.classList.toggle("validalloc", true);
            flank.addEventListener("click", Battle.promptAllocCb, [false, true] );
            flank.obj = battle;
            flank.toAdd = icon;
        });
    }

    /**
     * @brief If a selected icon is clicked again, cancel the movement.
     * @param {Event} e 
     * @returns void
     * 
     * @post Icon LOSES EventListener("click", Battle.cancelAllocCB, [false, true]);
     * @post Icon GAINS EventListener("click", Battle.startAllocCB, [false, true]);
     * @post Flank LOSES flank.removeEventListener("click", Battle.applyAllocCB, [false, true]);
     */
    static cancelAllocCB( e )
    {
        let battle = e.currentTarget.obj;
        let icon = e.target;
        let fl = document.getElementById("fl"),
            fm = document.getElementById("fm"),
            fr = document.getElementById("fr");

        while (!icon.classList.contains("t"))
        {
            // if we went too far, give up
            if (icon.classList.contains("alloc"))
                return;

            icon = icon.parentElement;
        }

        if (battle.state != "allocWait")
            return;
        battle.state = "initial";

        // Reset icon
        icon.removeEventListener("click", Battle.cancelAllocCB, [false, true]);
        icon.addEventListener("click", Battle.startAllocCB, [false, true]);
        icon.classList.toggle("selected", false);
        icon.classList.toggle("available", true);
        icon.obj = battle;

        // Remove efficiency information
        ["fl","fm","fr"].forEach((flank) => {
            let advantageDisplay = document.getElementById("bw_"+flank+"_a");
            advantageDisplay.innerHTML = "-";
        });

        // Remove listeners on the flanks
        [fl, fm, fr].forEach((flank) => {
            flank.classList.toggle("validalloc", false);
            flank.removeEventListener("click", Battle.applyAllocCB, [false, true]);
            flank.obj = null;
            flank.toAdd = null;
        });
    }

    /**
     * @brief Called when a flank is clicked to allocate the selected icon's troop type
     * @param {Event} e 
     * @returns void
     * 
     * @post Troop split modal is opened with Battle.applyIndep as callback
     * @post Icon LOSES EventListener("click", Battle.cancelAllocCB, [false, true]);
     * @post Flank LOSES EventListener("click", Battle.applyAllocCB, [false, true]);
     * @post Await ApplyIndep
     */
    static promptAllocCb( e )
    {
        console.log(e);

        let battle = e.currentTarget.obj;
        let icon = e.currentTarget.toAdd;
        let flank = e.target;
        let fl = document.getElementById("fl"),
            fm = document.getElementById("fm"),
            fr = document.getElementById("fr");

        if (icon == null)
            return;

        while (!icon.classList.contains("t"))
        {
            // if we went too far, give up
            if (icon.classList.contains("alloc"))
                return;

            icon = icon.parentElement;
        }

        // Remove cancel listener on the icon
        icon.classList.toggle("selected", false);
        icon.removeEventListener("click", Battle.cancelAllocCB, [false, true]);

        // Remove listeners on the flanks
        [fl, fm, fr].forEach((flank) => {
            flank.classList.toggle("validalloc", false);
            flank.removeEventListener("click", Battle.applyAllocCB, [false, true]);
            flank.obj = null;
            flank.toAdd = null;
        });

        let unit_ct = [];

        for ( let i = 0; i < troop_type_names.length; i++ )
        {
            if (troop_type_names[i] == icon.getAttribute("data-type"))
            {
                unit_ct[i] = icon.getAttribute("data-count");
            } else {
                unit_ct[i] = 0;
            }
        }
        
        GameUI.troopSplitModal( unit_ct, Battle.applyIndep, [battle, icon, flank] );
    }

    /**
     * @brief Applies the allocation
     * @param {array} unit_cts
     *        Array of unit counts, provided by GameUI.troopSplitModal handler
     * @param {*} params 
     *        Params forwarded from Battle.promptAllocCb by GameUI troopSplitModal handler
     * @returns void
     * 
     * @post Icon GAINS EventListener("click", Battle.startAllocCB, [false, true]); if still
     *       present on allocation sidebar.
     */
    static applyIndep( unit_cts, params )
    {
        console.log(unit_cts);
        console.log(params);

        let battle = params[0];
        let icon = params[1];
        let icon_refsz = parseInt(icon.getAttribute("data-count"));
        let icon_refid = icon.getAttribute("id");
        let remaining_sz = 0;
        let new_sz = 0;
        let flank = params[2];

        if (battle.state != "allocWait")
            return;
        battle.state = "initial";

        for ( let i = 0; i < troop_type_names.length; i++ )
        {
            if (troop_type_names[i] == icon.getAttribute("data-type"))
            {
                remaining_sz = icon_refsz - unit_cts[i];
                new_sz = unit_cts[i];
            }
        }

        icon.classList.toggle("selected", false);
        icon.classList.toggle("allocated", true);
        icon.setAttribute("data-count", remaining_sz);
        
        let remaining = document.getElementById("off_alloc_" + icon_refid[5] + "_text");
            remaining.innerHTML = "<b>" + icon.getAttribute("data-type") + "</b><br/>" + remaining_sz; 
        
        icon = icon.parentElement;
        flank.innerHTML += icon.outerHTML.replace(/id\=\"/gi, "id=\"ts" + ts + "_");
        document.getElementById("ts" + ts + "_" + icon_refid).setAttribute("data-count", new_sz);

        if (remaining_sz == 0)
            icon.remove();
        else {
            icon.addEventListener("click", Battle.startAllocCB, [false, true]);
            icon.obj = battle;
        }
    }

    /**
     * @brief When the user confirms their troop placements, collect the information and start the battle
     * @param {Event} e 
     * @post Attacker flanks set using battle.setAttackerFlanks
     */
    static closeWindowCB( e )
    {
        // let battle = e.obj;
        let battle = e.currentTarget.obj;
        let modal = document.getElementById("battleWindow");
        let flanks = {
            fl: [],
            fm: [],
            fr: []
        };

        for (let i = 0; i < troop_type_names.length; i++)
        {
            flanks["fl"][i] = 0;
            flanks["fm"][i] = 0;
            flanks["fr"][i] = 0;
        }


        let troops = document.getElementsByClassName("allocated");
        while (troops.length > 0)
        {
            let flank = troops[0].parentElement.parentElement.getAttribute("id");
            flanks[flank][troop_type_names.indexOf(troops[0].getAttribute("data-type"))] += parseInt(troops[0].getAttribute("data-count"));
            troops[0].remove();
        }

        // Hide the window and start the battle
        modal.style.display = "none";        
        modal.innerHTML = "";
        battle.setAttackerFlanks( flanks );
    }

    /**
     * @brief sets attacker flanks based on the provided flanks object
     * @param {*} flanks 
     */
    setAttackerFlanks( flanks )
    {
        console.log(flanks);

        ["left", "middle", "right"].forEach((flank) => {
            this._flanks[flank]["attacker"] = flanks["f" + flank[0]];
        });
        console.log(this);
        this.start();
    }

    /**
     * @brief Sets attacker flanks using the same algorithm as used for the 
     *        defender's flanks.
     * @param {Event} e 
     */
    static _offenseFlanksAi( e )
    {
        let battle = e.currentTarget.obj;
        let modal = document.getElementById("battleWindow");
        let flank_key = [
            "left",
            "middle",
            "right"
        ];

        let offAlloc = [...battle._offRefCt];
        for (let i = 0; i < troop_type_names.length; i++)
        {
            // let firstPass = true;
            let min_buff = 1;

            while (offAlloc[i] > 0)
            {
                for (let f = 0; f < 3; f++)
                {
                    let alloc = Math.ceil(Math.random() * offAlloc[i]);
                    if (offAlloc[i] - alloc < 0)
                        alloc = offAlloc[i];

                    // Prioritize bonuses but be open to all terrain types
                    if (terrain_mod[battle.terrain[f]][i] > min_buff)
                    {
                        battle._flanks[flank_key[f]]["attacker"][i] += alloc;
                        offAlloc[i] -= alloc;
                        if (offAlloc[i] == 0)
                            break;
                    }
                }
                // firstPass = false;
                min_buff-=0.2;
            } 
        }

        // Hide the window and start the battle
        modal.style.display = "none";
        modal.innerHTML = "";
        battle.start();
    }

    /**
     * @brief Algorithmically determines defender's flanks
     */
    _defenderFlanksAi()
    {
        let flank_key = [
            "left",
            "middle",
            "right"
        ];

        let defenderAlloc = [...this._defRefCt];
        for (let i = 0; i < troop_type_names.length; i++)
        {
            // let firstPass = true;
            let min_buff = 1;

            while (defenderAlloc[i] > 0)
            {
                for (let f = 0; f < 3; f++)
                {
                    let alloc = Math.ceil(Math.random() * defenderAlloc[i]);
                    if (defenderAlloc[i] - alloc < 0)
                        alloc = defenderAlloc[i];

                    // Prioritize bonuses but be open to all terrain types
                    if (terrain_mod[this.terrain[f]][i] > min_buff)
                    {
                        this._flanks[flank_key[f]]["defender"][i] += alloc;
                        defenderAlloc[i] -= alloc;
                        if (defenderAlloc[i] == 0)
                            break;
                    }
                }
                // firstPass = false;
                min_buff-=0.2;
            } 
        }
    }
}

/**
 * @brief Handles core game logic (players, turns, etc).
 */
class Game
{

    static changeTurn_cb( e )
    {
        game._changeTurn();
    }

    /**
     * @brief 
     * @param {*} e 
     */
    static reinforcements_cb( e )
    {
        game.reinforcement_handler(e);
    }

    static moveStartCb( e )
    {
        e.currentTarget.obj._regionClickHandler(e);
    }

    static moveRegionCb( e )
    {
        e.currentTarget.obj._moveHandler(e);
    }

    static moveCancelCb( e )
    {
        e.currentTarget.obj._moveCancelHandler(e);
    }

    /**
     * @brief constructs a game object
     */
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

        this._queuedActions_bf = [];
        this._queuedActions_of = [];
        this._battlect = 0;

        this._showReinforcementsNotif = {
            bf: true,
            of: true
        };

        document.getElementById("turn-indicator").addEventListener("click", Game.changeTurn_cb, [false, false]);
        this._changeTurn();
        this._changeTurn();

        GameUI.drawClouds();
        this._applyFogOfWar();
        this._applyReinforcements();
    }

    /**
     * @brief Returns the force for the requested region
     * @param {*} region_letter 
     * @returns 
     */
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

    /**
     * @brief Initializes forces by crawling region_group_ids
     * @details Forces initialize themselves using game_setup
     */
    _initialize_forces()
    {
        region_group_ids.forEach((region) => {
            this.forces.push( new Force(region) );
        });

        GameUI.fixHeadQuarters();
    }

    /**
     * @brief Adds event listeners to the current players regions. Should be
     *        called after turns rotate.
     */
    _initialize_listeners()
    {
        region_group_ids.forEach((id) => {
            document.getElementById(id).addEventListener(
                "click",
                Game.moveStartCb,
                [false, false]
            );
            document.getElementById(id).obj = this;
        });
    }

    /**
     * @brief Prepares to change the turn. Handles queued actions by the current
     *        player. Note that turns don't change until _rotateTurn() is called
     * @returns void
     * 
     * @todo rename
     */
    _changeTurn()
    {
        turn_ct++;

        if (turn_ct % 2 == 0)
            GameUI.drawClouds();

        this._currentPlayerForces = 0;

        this.forces.forEach((force) => {
            if (force.side == this._currentPlayerTurn) {
                document.getElementById(force.region).classList.toggle("cpt", false);
                this._currentPlayerForces++;
            }
        });
        
        // Apply queued moves from previous turn
        this._handlePlayerActions();

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
    }

    /**
     * @brief Changes the current turn.
     */
    _rotateTurn()
    {
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

    /**
     * @brief Applies appropriate reinforcements to the current player.
     */
    _applyReinforcements()
    {
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

        if (this._showReinforcementsNotif[this._currentPlayerTurn])
            GameUI.notification("You have recieved " + this._cptReinforcements[0] + " infantry, " + this._cptReinforcements[1] + " helicopter, and " + this._cptReinforcements[2] + " armored vehicle reinforcements from your controlled capitals.<br/>&nbsp;<br/>These troops will be deployed to the next region you select.<br/><br/><small>Click don't show again and this message will only appear in the log to the right.</small>");

        GameUI.log(team_key[this._currentPlayerTurn] + " has reinforcements: " +
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
            rc[i].addEventListener("click", Game.reinforcements_cb, [false, false]);
        }
    }

    ignoreReinforcementsNotif()
    {
        this._showReinforcementsNotif[this._currentPlayerTurn] = false;
    }

    /**
     * @brief When reinforcing, handles a region click by applying reinforcements 
     *        to that region.
     * @param {Event} e 
     * @returns 
     */
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
                rc[i].removeEventListener("click", Game.reinforcements_cb, [false, false]);
                rc[i].classList.remove("reinforceable");
            }
            this._state = "waitForMoveSelect";
        }
    }

    /**
     * @brief Applies fog of war to the map
     * @details Current player can see their controlled territories as well
     *          as all regions that are valid moves from those territories.
     */
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
                        console.log(force[troop_type].id);
                        document.getElementById(force[troop_type].id).classList.add("fow");
                    }
                });
            }
        }
    }

    /** 
     * @brief Places all territories in control of the winteam, then displays 
     *        a victory message.
     * @param winteam {string}
     *        Of or bf
     */
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
        GameUI.notification(team_key[winteam] + " VICTORY.\nRefresh the page to play again!");
        GameUI.log(team_key[winteam] + " VICTORY.\nRefresh the page to play again!");
    }

    /**
     * @brief Handles a click by the current player on a region that they own. 
     * @param {*} e 
     * @returns void
     * 
     * @post Clicked region GAINS event listener (Game.moveCancelCb)
     * @post Valid moves GAINS event listener (Game.moveRegionCb)
     */
    _regionClickHandler( e )
    {
        // Guard for state: ensure multiple regions cannot be selected
        // at once. 
        if (this._state == "waitForMoveSelect" || this._state == "battle") 
            return;

        // use the realtarget variable to propagate up from whatever node 
        // was clicked to the node that is the group with the region-letter
        // as the id.
        let realtarget = e.currentTarget;
        while (realtarget.id.length != 2 && realtarget.nodeName != "svg")
            realtarget = realtarget.parentElement;

        // If the force has already been moved, don't allow it to be moved again
        if (realtarget.classList.contains("moved"))
            return;

        // validate that the region is for the current player;
        // if not, return
        let clickedForce = this.getRegionForce(realtarget.id);
        if (clickedForce.side != this._currentPlayerTurn)
            return;

        // Set the state
        this._state = "waitForMoveSelect";

        // mark the region group as selected and add an event listener for
        // re-clicking on the region to cancel movement.
        realtarget.classList.add("selected");
        realtarget.addEventListener(
            "click",
            Game.moveCancelCb,
            [false, true]
        );
        realtarget.obj = this;

        // mark valid moves and add event listeners for their selection.
        region_connections[realtarget.id].forEach((validMove) => {
            let node = document.getElementById(validMove);
            if(node.classList.contains("invalid")){

            }else{
                node.classList.add("validmove");

                // ADD LISTENER FOR MOVING TROOPS
                node.addEventListener(
                    "click",
                    Game.moveRegionCb,
                    [false, true]
                );
                node.obj = this;
                node.oc = realtarget.id;
                node.cf = clickedForce;
            }
            
        });
    }

    /**
     * @brief When the player clicks the selected region again, cancels the move
     * @param {Event} e 
     * @returns void
     * 
     * @post Valid moves LOSES EventListener
     * @post Region LOSES EventListener
     */
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

            node.removeEventListener(
                "click",
                Game.moveRegionCb,
                [false, true]
            );
        });
        
        // Remove cancel handler
        e.currentTarget.removeEventListener(
            "click",
            Game.moveCancelCb,
            [false, true]
        );
    }

    /**
     * @brief When player clicks validmove, move the troops from the selected 
     *        region to that region
     * @param {Event} e 
     * @returns void
     * 
     * @post Removes selected class from selected cell
     * @post Removes validmove class from valid moves
     * @post Valid Moves LOSES click listener 
     * @post Selected Region LOSES cancel listener
     */
    _moveHandler( e )
    {

        let origin = document.getElementById(e.currentTarget.oc);

        if (this._state != "waitForMoveSelect") 
            return;
        this._state = "initial";

        e.currentTarget.classList.remove("selected");
        
        e.currentTarget.addEventListener(
            "click",
            Game.moveStartCb,
            false
        );
        e.currentTarget.obj = this;

        // Remove "selected" class from origin, mark as moved
        origin.classList.remove("selected");
        origin.classList.add("moved");

        let dstForce = this.getRegionForce(e.currentTarget.id);
        let srcForce = this.getRegionForce(e.currentTarget.oc);

        if(dstForce._side != srcForce._side && dstForce._side != "neutral"){
            e.currentTarget.classList.add("invalid");
        }

        // Remove "validmove" class from move options
        region_connections[e.currentTarget.oc].forEach((validMove) => {
            let node = document.getElementById(validMove);
            node.classList.remove("validmove");
            
            node.removeEventListener(
                "click",
                Game.moveRegionCb,
                [false, true]
            );
        });

        // console.log("Removed OTU event listener for " + e.currentTarget.oc + " click-to-cancel");
        document.getElementById(e.currentTarget.oc).removeEventListener(
            "click",
            Game.moveCancelCb,
            [false, true]
        );

        //console.log(e.currentTarget.id);
        console.log("dst: " + e.currentTarget.id);
        console.log("src: " + e.currentTarget.oc);

        // draw mvmt arrow: 
        GameUI.drawMovementArrow(srcForce.side, e.currentTarget.oc, e.currentTarget.id);

        let l = this["_queuedActions_" + this._currentPlayerTurn].length;
        this["_queuedActions_" + this._currentPlayerTurn][l] = [srcForce.side, srcForce, dstForce];

        // After player has made 3 moves, end their turn
        let tf_ct = this._currentPlayerForces;
        for (let i = 0; i < regions_capitals.length; i++)
        {
            // let force = document.getElementById(regions_capitals[i]);
            let force = this.getRegionForce( regions_capitals[i] );
            if ( ( force.side == this._currentPlayerTurn ) && ( force.totalCount == 0 ) )
                tf_ct--;
        
        }
        if (this["_queuedActions_" + this._currentPlayerTurn].length >= Math.min(3, tf_ct))
        {
            // debugger;
            console.log("tf_ct: " + tf_ct);
            console.log("cpfs:" + this._currentPlayerForces );
            this._changeTurn();
        }
    }

    /**
     * @brief Sort actions into moves and battles. Then call handlePlayerMoves / handlePlayerBattles
     */
    _handlePlayerActions()
    {
        let actions = this["_queuedActions_" + this._currentPlayerTurn];
        let moves = [];
        let battles = [];

        // remove all "moved" classes
        let moved_cc = document.getElementsByClassName("moved");
        for (let i = moved_cc.length-1; i >=0; i--)
        {
            moved_cc[i].classList.remove("moved");
        }

        while (actions.length > 0)
        {
            let srcForce = actions[0][1];
            let dstForce = actions[0][2];
            if ( srcForce.side == dstForce.side || dstForce.side == "neutral" )
                moves[moves.length] = actions.shift();
            else 
                battles[battles.length] = actions.shift();
        }

        this._handleMoves(moves);
        this._handleBattles(battles);

        while(document.getElementsByClassName("invalid").length > 0){
            document.getElementsByClassName("invalid")[0].classList.remove("invalid");
        }
    }
    
    /**
     * @brief Applies queued moves
     * @param {array} move_list 
     */
    _handleMoves( move_list )
    {
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

            //log.innerHTML += "<p>" + this._currentPlayerTurn.toUpperCase() + " moved from " + srcForce.region_phonetic + " to " + dstForce.region_phonetic + "</p>\n";
            GameUI.log( team_key[this._currentPlayerTurn] + " moves from " + srcForce.region + " to " + dstForce.region );

            // Add the units to the destination, remove them from the source
            let units = [];
            for (let i = 0; i < troop_type_names.length; i++)
                units.push(srcForce[troop_type_names[i] + "Count"]);
            dstForce.alterForce( units );
            units = units.map(function(x){x * -1});
            srcForce.alterForce( units );
        }

        // Reset move list
        while (this["_queuedActions_" + this._currentPlayerTurn].length > 0)
        {
            this["_queuedActions_" + this._currentPlayerTurn].pop();
        }
    }

    /**
     * @brief Handles queued battles 
     * @param {array} battle_list 
     * @post Battle increment called until all battles complete.
     *       If no battles or all battles complete, rotates turns via battleEndCb().
     */
    _handleBattles( battle_list )
    {
        this._state = "battle";
        for (let i = 0; i < battle_list.length; i++)
        {
            // Ensure that the move is still valid
            if (battle_list[i][0] != battle_list[i][1].side)
                continue;
            else {
                this["_queuedActions_" + this._currentPlayerTurn].push( battle_list[i] );
            }
            // battle.start();
        }
        if (this["_queuedActions_" + this._currentPlayerTurn].length > 0)
            this.battleIncrement();
        else 
            this.battleEndCb();
    }

    /**
     * @brief Start the next queued battle, if it exists
     */
    battleIncrement()
    {
        let bc = document.getElementsByClassName("cbtFire");
        while (bc.length > 0)
        {
            bc[0].remove();
        }

        if ( this["_queuedActions_" + this._currentPlayerTurn].length > 0 ) 
        {
            this._battlect++;
            let srcForce = this["_queuedActions_" + this._currentPlayerTurn][0][1];
            let dstForce = this["_queuedActions_" + this._currentPlayerTurn][0][2];
            this["_queuedActions_" + this._currentPlayerTurn].shift();
            let battle = new Battle(dstForce, srcForce);
        } else {
            this.battleEndCb();
        }
    }

    /**
     * @brief Clean up after battles, then rotate turns
     * @returns void
     */
    battleEndCb()
    {
        if (this._state != "battle")
            return;

        // Remove arrows 
        let ac = document.getElementsByClassName("arrow " + this._currentPlayerTurn);
        while (ac.length > 0)
        {
            ac[0].remove();
        }

        // Do next turn
        this._state = "initial";
        this._rotateTurn();
    }
}

let log_entries = 0;
let battle_ct = 0;
let turn_ct = 0;
let ts = 0;
let game = new Game;

