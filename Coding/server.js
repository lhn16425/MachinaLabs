const express = require('express');
const DnDEngine = require('./dnd-engine');

const port 	= 4000;

var dndEngine;

const app = express();
app.use(express.json()); // Middleware to parse JSON request bodies

/* 
ASSUMPTIONS:
-----------

1)  Return 404 and 400 for all API errors where appropriate.
2)  Coordinate value starts with 0.
3)  Destroying an element means setting its cell to empty (0), the element
    becomes DEAD, aka "not active, not available".
4)  A location is blocked if it has water, hole, tree, rock, or a wall.
5)  An entity (monster or character) is active if it's put on the board (map).
6)  An entity is available if it's not dead and not on the board.
7)  Once an entity has been put on the board, it can only come off it when it's 
    killed or destroyed.
8)  When an entity is killed/destroyed, its health level is 0.
9)  When rolling the dice, the modifier takes precedence over the other 2
    parameters if it's valid.  If the modifier is not valid, it will be ignored.
10) For update character and update monster, the updates object will replace 
    the original object.  No merging is taking place.

*/
// Define a route for GET requests to the root URL
app.get('/', (req, res) => {
  res.send('Dungeons and Dragons');
});

// MOVE
app.put('/api/move', (req, res) => {
	const newX = req.body.newX;
	const newY = req.body.newY;
	const entityId = req.body.entityId;
	const result = dndEngine.move(entityId, newX, newY);
	if (result != null)
	{
		res.json(result);
		return;
	}
	res.status(400).json({ error: 'Move failed.' });
});

// REPLACE
app.put('/api/replace', (req, res) => {
	const attackerId = req.body.attackerId;
	const targetId = req.body.targetId;
	const result = dndEngine.replace(attackerId, targetId);
	if (result != null)
	{
		res.json(result);
		return;
	}
	res.status(400).json({ error: 'Replace failed.' });
});

// GET ACTIVE CHARACTERS
app.get('/api/character/active', (req, res) => {
	const result = dndEngine.getActiveCharacters();
	res.json(result);
});

// GET AVAILABLE CHARACTERS
app.get('/api/character/available', (req, res) => {
	const result = dndEngine.getAvailableCharacters();
	res.json(result);
});

// GET CHARACTER
app.get('/api/character/:entityId', (req, res) => {
	const result = dndEngine.getCharacter(req.params.entityId);
	res.json(result);
});

// UPDATE CHARACTER
app.put('/api/character', (req, res) => {
	const result = dndEngine.updateEntity(req.body.entityId, req.body.updates);
	res.json(result);
});

// SPAWN CHARACTER
app.post('/api/character', (req, res) => {
	const result = dndEngine.spawnCharacter(req.body.characterId, req.body.x, req.body.y);
	res.json(result);
});

// GET ACTIVE MONSTERS
app.get('/api/monster/active', (req, res) => {
	const result = dndEngine.getActiveMonsters();
	res.json(result);
});

// GET AVAILABLE MONSTERS
app.get('/api/monster/available', (req, res) => {
	const result = dndEngine.getAvailableMonsters();
	res.json(result);
});

// GET MONSTER
app.get('/api/monster/:entityId', (req, res) => {
	const result = dndEngine.getMonster(req.params.entityId);
	res.json(result);
});

// UPDATE MONSTER
app.put('/api/monster', (req, res) => {
	const result = dndEngine.updateEntity(req.body.entityId, req.body.updates);
	res.json(result);
});

// SPAWN MONSTER
app.post('/api/monster', (req, res) => {
	const result = dndEngine.spawnMonster(req.body.x, req.body.y);
	res.json(result);
});

// ROLL DICE
app.post('/api/dice', (req, res) => {
	const sides = req.body.sides;
	const count = req.body.count;
	const modifier = req.body.modifier;
	const { newCount, newSides, result } = dndEngine.rollDice(count, sides, modifier);
	if (result >= 0)
	{
		res.json({ 'count': newCount, 'sides': newSides, 'result': result });
		return;
	}
	res.status(400).json({ error: 'Could not roll dice.  Please check input.' });
});

// GET MAP/CELL
app.get('/api/map', (req, res) => {
	const x = req.query.x;
	const y = req.query.y;
	const result = dndEngine.getMap(x, y);
	if (result != null)
	{
		res.json(result);
		return;
	}
	res.status(404).json({ error: 'World map is not initialized.' });
});

// DESTROY
app.delete('/api/map', (req, res) => {
	const x = req.body.x;
	const y = req.body.y;
	const result = dndEngine.destroy(x, y);
	res.json(result);
});

// SAVE GAME
app.post('/api/save', (req, res) => {
	dndEngine.saveGame();
	res.status(200).json({ message: 'Successfully saved game.' });
});

// RESTORE GAME
app.post('/api/restore', (req, res) => {
	dndEngine.restoreGame();
	res.status(200).json({ message: 'Successfully restored game.' });
});

/*
MAP: (40x80)
---

. : empty
~ : water
O : hole
T : tree
^ : rock
# : wall

T...^~#^~~...TTT~.O....TT~.O.~T.^......T#.~...T^........^T~..~..T.^.#..^.T^^^^~.
T..~~T..~~~..T.....~~~~.T~..TT#^^....^.T^...~#..TT.~^.~.#T#..~..T^T~##^.#.^.....
T..TT.^..~...#.....~~..^TO..TO^.T#^..^.^T.TT.~^T##.^^TT..#..~.TT~...T.^.~~.....#
.#T...^O~~#~~O.~~~~....^^.^.^^^.~~.O.^.~~....~.TO~~.^TTT~..^^~~~~...OO^.~~.~~O.#
.T.....^~~.##.~^O.~O..~.#.^.T.^~~~TOO..T#~.T^^..~~OO~~^^T~^^~~.~.~^~..~...^^~~~.
.T~.TT^~..#~O^T.T####.~~##O..~^...T~O^..#T~T.^..~...~.T^^~T^..^.^.TT..~O..^.~O~~
~..T...~...~O.T~#.#...~..T.O.O.^^.#T...~~..T#TT...^^~.TT.O^~~~TO.T.~.~.#..~T..~.
.^.^..~~..~.~O#T###.#..^TT^^.O.T.~...^.#TTO~#T~.T.^^~TT.~...T...^T.OTT~#.~~T.~O~
...^^....#...O###O.TT.O~.~~~..OO.~.....#.T.....~~^...T#.~.T~....^T~~..~.~.~~~.~O
.T.^^~.~^T#TTO~^^OO...#~.~.^.~~..~O^..~TT.#.~.T~~.T..O#^^.TTT.~~.^~##O~~..^~~..O
.~TT~^^..^##TT~.T.T...T.~..^^.~T^..^.O~~TT~.T.T~~~....^^^.TT~^^^.^^T#^...~^^^T..
.TTT##.##^##.TT......T#.~T.^^^T.^..T^.^.~T.T..T..~...#~.^OO^.T^....TTT..~~~~^T~.
.~.^....#^OO^^TT..T.O.TT^....T.TTT~~....~.TTO^~~.~..~T^.T...TT~.TTT~~~TTTT.~...^
..^O~~.O^^.O^..^##O~.T#T^^^TTT..T~~~##^~##~.O..O.~.^....T..~~.^.T.....T~TT...T..
O^..O~~.T.#.TTTT~^.~.^OOO#..~~~..~O~.~...~~....OO..~.O...T.^~...~.###~.OTTT...^.
^^~TT...T...T.TT~.T~..TO.^.^#...~~T.~~.^^~..^.TO~..O~^^O..T..~~.~.T#.^..^TT~~...
T.~...O.T^.^~T.T~~.~#.^....^O.TT..T#TT.~^~~~..~O#.#..^T^.^#~~~...^^.T~.TTT.~~T..
.T~T.T.T....^..#~..^..^..~T.O..T~..^^TT.^T~~..~O#...T..TT....~OOOOO.T.^~~~O.~OO^
#.TTT.TT....OOT.T.~TTT..~..TO..#...~OO..~~.~~^..T.#T~.....T..~.O....~~.~T~...#^^
.~.TTTO.T.#..O~#..~TT.#....#~.T~T^O.~TT~~~...#OOO~...~..#T^..TT#.~~~~~..TT..TT.T
..^T.TTT.^.T~~T^^T..T.O~T^^.TT.O~..~...^^~..#T^.~O..#^~.T.T...TT.~~..~^^^TO.T##~
T~....^..^^T^.T~~....~.TTT.TT...~~^^T.T^~~.OTTT~.~~.#.~~.O...^T.^^.T~.~^...O.^..
#~T^T^.~T.#.^^..~~~~#...TTOOO.~~.~^~T....~~^....O~O~#.....TTO..~^^TTTTT...^^.#~.
..T^^..O.O..O...O.OOO.^^TTO^TT~^.~..T..O.T~~...T.^TT#O.T~.~...T~....#......^^T.~
~~.T.T...T~.~....~.^.TT.^.TT.T..T.OT.OT~....~^......TO.....T..~~~.^.~OOOOT.~.T~~
.~T~.T..T.TT.#~.~TT.TO...TTT....TT......~T.^^..T.....O^T..T.^^.^T~~^^TTO...~^T.T
#^^^.~O.T^...^.....TTO.T~.^.T~..^..T..^..^O^T..~T...T.^.O...^.TT~~.^~OTT...~^^#.
##.#..O.~~~T..~#TTTOT.O~~O.^T~^~~^^...~..^T#O##.T..~.T^~OO^^..^^.~..~.TT.O#~####
O..###..~..TTT.^.^T~TTT.TT.##TT^~^.....~.O^^T..TTTT.^.O~~.T..T.^..~TT...^##~~#..
..~....^^~~.#~.^#^T..^^TT......^~^.#.TT^OO^^T.^#TTO.....TO....TT..TTT.#.~.~....^
TT..^##.^~.T^..^^^~..^^.~.~~.#~^T~~~~~T.T.~..^^TTTT^.TT.T.~~~.T......^......^^~.
T~~.T^.^^^....#^T^~~~^.TTT~..~~..TT.TT..^~~.^#..O##TT...~^#~.~T..TT.T.^^~.~..^^.
#.~.T...TT.TT..^TT~O~^^.O....#TT.#.......~~^.#......TTTT..O#....#.^.^#.~.TT~....
.T..TT~O^^^..~^^#T~..~.T~O.OOO...#.~..~~.~~~......~#.T.......^..~TTTT.#~^T..~.~^
...OT.T^.TTTT...O.~..T#~^...T.T~.^~~^.T.^..~~T..~~~~#T...TT.#O~OO..#T~T~~TT.~~..
T.TTT.~~O~T^#.T..^...~.~~T#.^.#~.TTTT~~~...O~^^^~...O.O.~^.TT.~^TT.T~~~TT~^~.##T
O.TT..T.^.TT.~.TT....~^..TOO..#~~~T.~TT.~TO.~.^.TO~T.~.TT.^..~~TTT^OT~.#T~~.^.~~
.T.T..^~OTT.T^.T.O...~#...^..TTT...T..^.~..^..^..O.~.~TT..~......^.O.T~.TT~.T.~#
~O..^^TT^.O~..~..O~O....^TTT...#.#~...~~TTT^^T~^^O...~TTT.....~~.~.T..~.^.....O#
~~.O..~TT.O.TT~~~...T..T...~~T.T....T.~^..#...~.^O.OOT.#O...^T..T......T^.T..OOO

*/

// Start the server
app.listen(port, () => {
	console.log(`Server running on http://localhost:${port}`);
	dndEngine = new DnDEngine();
});