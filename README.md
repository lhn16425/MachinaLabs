# MachinaLabs Backend Exercise

## Design

1. ERD diagram is in **MachinaLabsDesign.png**
2. API discussion is in **MachinaLabsDesign.txt**

## Coding

Code is in the ./Coding subfolder.

### Assumptions

1. Return 404 and 400 for all API errors where appropriate.
2. Coordinate value starts with 0.
3. Destroying an element means setting its cell to empty (0), the element becomes DEAD, aka "not active, not available".
4. A location is blocked if it has water, hole, tree, rock, or a wall.
5. An entity (monster or character) is active if it's put on the board (map).
6. An entity is available if it's not dead and not on the board.
7. Once an entity has been put on the board, it can only come off it when it's killed or destroyed.
8. When an entity is killed/destroyed, its health level is 0.
9. When rolling the dice, the modifier takes precedence over the other 2 parameters if it's valid.  If the modifier is not valid, it will be ignored.
10. For update character and update monster, the updates object will replace the original object.  No merging is taking place.

### Game map (40x80)

#### Legends

- . : empty
- ~ : water
- O : hole
- T : tree
- ^ : rock
- # : wall

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


### How to run

1. The easiest way is if you have Node.js installed on your PC.  Just browse to
the ./Coding subfolder and run:
- `node server.js`

The base URL is `http://localhost:4000`

2. Browse to the ./Coding subfolder then build the docker image and run it through docker:
- `docker build -t machina-labs-dungeons-and-dragons .`
- `docker run -p 4000:4000 machina-labs-dungeons-and-dragons`

The base URL is the same.

3. Pull the docker image and run it on your machine:
- `docker run -dp 0.0.0.0:4000:4000 lhn16425/machina-labs`

The base URL is the same.