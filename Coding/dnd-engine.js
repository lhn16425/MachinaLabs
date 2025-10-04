const fs = require('fs');
const path = require('path');

const EMPTY = 0;
const WATER	= 1;
const HOLE	= 2;
const TREE	= 3;
const ROCK	= 4;
const WALL	= 5;

class DnDEngine
{
	constructor()
	{
		this.gameDataPath = __dirname + '/game_data/';

		this.mapFile = path.join(this.gameDataPath, 'map.json');
		this.charactersAndMonstersFile = path.join(this.gameDataPath, 'characters_and_monsters.json');

		this.savedMapFile = path.join(this.gameDataPath, 'map_saved.json');
		this.savedCharactersAndMonstersFile = path.join(this.gameDataPath, 'characters_and_monsters_saved.json');
		
		this.loadGameData(this.mapFile, this.charactersAndMonstersFile);
	}
	
	move(entityId, newX, newY)
	{
		const entity = this.getEntity(entityId);
		if (entity != null && this.isValidCoordinate(newX, newY) && this.isLocationEmpty(newX, newY))
		{
			if (entity.coordinate != null)
			{
				const oldX = entity.coordinate.x;
				const oldY = entity.coordinate.y;
				this.worldMap.grid[oldX][oldY] = EMPTY; // the old cell becomes empty/available
			}
			this.worldMap.grid[newX][newY] = entityId;
			entity.coordinate = { "x": newX, "y": newY };
			return entity;
		}
		return null;
	}
	
	replace(attackerId, targetId)
	{
		if (!this.isEntity(attackerId) ||
			!this.isEntity(targetId) ||
			!this.isAdjacent(attackerId, targetId))
		{
			return null;
		}
		const attacker = this.getEntity(attackerId);
		const target = this.getEntity(targetId);
		const newX = target.coordinate.x;
		const newY = target.coordinate.y;
		
		// move into the target's cell
		this.worldMap.grid[newX][newY] = attackerId;
		attacker.coordinate = target.coordinate;
		
		// the target is now dead and thrown off the board
		target.health = 0;
		target.coordinate = null;
		return 	{
					'coordinate': { 'x': newX, 'y': newY },
					'old-value': this.getEntityType(target),
					'new-value': this.getEntityType(attacker)
				};
	}
	
	getActiveCharacters()
	{
		const list = [];
		for (const character of this.charactersAndMonsters.characters)
		{
			if (character.coordinate != null)
			{
				list.push(character);
			}
		}
		return { 'active-characters': list };
	}
	
	getAvailableCharacters()
	{
		const list = [];
		for (const character of this.charactersAndMonsters.characters)
		{
			if (character.coordinate == null && character.health > 0)
			{
				list.push(character);
			}
		}
		return { 'available-characters': list };
	}
	
	getCharacter(entityId)
	{
		if (entityId >= 10 && entityId <= 99)
		{
			return this.charactersAndMonsters.characters[entityId - 10];
		}
		return {};
	}
	
	getActiveMonsters()
	{
		const list = [];
		for (const monster of this.charactersAndMonsters.monsters)
		{
			if (monster.coordinate != null)
			{
				list.push(monster);
			}
		}
		return { 'active-monsters': list };
	}
	
	getAvailableMonsterList()
	{
		const list = [];
		for (const monster of this.charactersAndMonsters.monsters)
		{
			if (monster.coordinate == null && monster.health > 0)
			{
				list.push(monster);
			}
		}
		return list;
	}
	
	getAvailableMonsters()
	{
		const list = this.getAvailableMonsterList();
		return { 'available-monsters': list };
	}
	
	getMonster(entityId)
	{
		if (entityId >= 100 && entityId <= 999)
		{
			return this.charactersAndMonsters.monsters[entityId - 100];
		}
		return {};
	}
	
	updateEntity(entityId, updatedEntity)
	{
		if (entityId >= 10 && entityId <= 99)
		{
			this.charactersAndMonsters.characters[entityId - 10] = updatedEntity;
			return updatedEntity;
		}
		else if (entityId >= 100 && entityId <= 999)
		{
			this.charactersAndMonsters.monsters[entityId - 100] = updatedEntity;
			return updatedEntity;
		}
		return {};
	}
	
	spawnCharacter(characterId, x, y)
	{
		if (characterId >= 10 && characterId <= 99)
		{
			const entity = this.getEntity(characterId);
			if (entity != null && entity.coordinate == null && entity.health > 0 &&
				this.isValidCoordinate(x, y) && this.isLocationEmpty(x, y))
			{
				entity.coordinate = { 'x': x, 'y': y };
				this.worldMap.grid[x][y] = characterId;
				return entity;
			}
		}
		return {};
	}
	
	spawnMonster(x, y)
	{
		const availableMonsters = this.getAvailableMonsterList();
		if (availableMonsters.length > 0 &&
			this.isValidCoordinate(x, y) && this.isLocationEmpty(x, y))
		{
			const index = this.getRandomInt(1, availableMonsters.length) - 1;
			const monster = availableMonsters[index];
			monster.coordinate = { 'x': x, 'y': y };
			const match = monster.kind.match(/^\w+ #(\d+)$/);
			const monsterId = Number(match[1]);
			this.worldMap.grid[x][y] = monsterId;
			return monster;
		}
		return {};
	}
	
	rollDice(count, sides, modifier)
	{
		let newCount = count;
		let newSides = sides;
		let adjustment = 0;
		if (modifier != null)
		{
			const match = modifier.match(/^(\d+)d(\d+)([\-+])(\d+)$/);
			if (match != null)
			{
				newCount = Number(match[1]);
				newSides = Number(match[2]);
				adjustment = Number(match[4]);
				if (match[3] == '-')
				{
					adjustment *= -1;
				}
			}
		}
		if (!this.isPositiveInt(newCount) || !this.isPositiveInt(newSides))
		{
			return -1;
		}
		let result = 0;
		for (let i = 0; i < newCount; i++)
		{
			result += this.getRandomInt(1, newSides);
		}
		result += adjustment;
		return { newCount, newSides, result };
	}
	
	getMap(x, y)
	{
		if (this.worldMap != null)
		{
			if (x != null && /^\d+$/.test(x) && x >= 0 && x < this.worldMap.grid.length &&
				y != null && /^\d+$/.test(y) && y >= 0 && y < this.worldMap.grid[x].length)
			{
				return { 'coordinate': { 'x': x, 'y': y }, 'value': this.worldMap.grid[x][y], 'description': this.getCellContentDescription(x, y) };
			}
			return this.worldMap;
		}
		return null;
	}
	
	destroy(x, y)
	{
		let err = '';	
		if (this.worldMap != null)
		{
			if (!this.isValidCoordinate(x, y))
			{
				err = `Invalid coordinate: [${x}, ${y}].`;
			}
			else if (this.worldMap.grid[x][y] >= EMPTY && this.worldMap.grid[x][y] <= HOLE)
			{
				err = 'Can\'t destroy an empty cell, a hole, or water';
			}	
		}
		else
		{
			err = 'World map is not initialized.';
		}
		if (err === '')
		{
			const entity = this.getEntity(this.worldMap.grid[x][y]);
			if (entity != null)
			{
				entity.health = 0; 		  // sorry you died!
				entity.coordinate = null; // and thrown off the map too :-)
			}
			const oldValue = this.getCellContentDescription(x, y);
			this.worldMap.grid[x][y] = EMPTY;
			return { 'coordinate': { 'x': x, 'y': y }, 'old-value': oldValue, 'new-value': 'Empty' };
		}
		return { 'error': err };
	}
	
	saveGame()
	{
		if (this.worldMap != null && this.charactersAndMonsters != null)
		{
			this.saveDataFile(this.savedMapFile, this.worldMap);
			this.saveDataFile(this.savedCharactersAndMonstersFile, this.charactersAndMonsters);
		}
	}
	
	restoreGame()
	{
		this.loadGameData(this.savedMapFile, this.savedCharactersAndMonstersFile);
	}
	
	loadGameData(mapFile, entityFile)
	{
		this.worldMap = this.loadDataFile(mapFile);
		this.charactersAndMonsters = this.loadDataFile(entityFile);
	}

	loadDataFile(filePath)
	{
		try
		{
			const data = fs.readFileSync(filePath, 'utf8');
			return JSON.parse(data);
		}
		catch (err)
		{
			console.error(`Error loading data file: ${filePath}`, err);
			return null;
		}
	}
	
	saveDataFile(filePath, jsonObj)
	{
		try
		{
			const jsonData = JSON.stringify(jsonObj, null, 2);
			fs.writeFileSync(filePath, jsonData, 'utf8');
		}
		catch (err)
		{
			console.error(`Error saving data file: ${filePath}`, err);
		}
	}
	
	getRandomInt(min, max)
	{
		min = Math.ceil(min);
		max = Math.floor(max);
		return Math.floor(Math.random() * (max - min + 1)) + min;
    }
	
	getCellContentDescription(x, y)
	{
		const cellContent = this.worldMap.grid[x][y];
		switch (cellContent)
		{
			case EMPTY: return "Empty";
			case WATER: return "Water";
			case HOLE:  return "Hole";
			case TREE:  return "Tree";
			case ROCK:  return "Rock";
			case WALL:  return "Wall";
			default:
				const entity = this.getEntity(cellContent);
				return entity.class != null ? entity.class : entity.kind;
		}
	}
	
	getEntityType(entity)
	{
		return entity.class != null ? entity.class : entity.kind;
	}
	
	isAdjacent(entityId1, entityId2)
	{
		const entity1 = this.getEntity(entityId1);
		const entity2 = this.getEntity(entityId2);
		if (entity1 == null || entity1.coordinate == null ||
			entity2 == null || entity2.coordinate == null ||
			entityId1 == entityId2)
		{
			return false;
		}
		const dx = Math.abs(entity1.coordinate.x - entity2.coordinate.x);
		const dy = Math.abs(entity1.coordinate.y - entity2.coordinate.y);
		return (dx <= 1 && dy <= 1) && !(dx === 0 && dy === 0);
	}
	
	getEntity(entityId)
	{
		if (entityId >= 10 && entityId <= 99)
		{
			return this.charactersAndMonsters.characters[entityId - 10];
		}
		else if (entityId >= 100 && entityId <= 999)
		{
			return this.charactersAndMonsters.monsters[entityId - 100];
		}
		return null;
	}
	
	isEntity(entityId)
	{
		return Number.isInteger(entityId) && entityId >= 10 && entityId <= 999;
	}
	
	isPositiveInt(value)
	{
		if (Number.isInteger(value))
		{
			return value > 0;
		}
		return false;
	}
	
	isValidCoordinate(x, y)
	{
		if (this.worldMap == null)
		{
			return false;
		}
		if (typeof x === 'number' && x >= 0 && x < this.worldMap.grid.length &&
			typeof y === 'number' && y >= 0 && y < this.worldMap.grid[x].length)
		{
			return true;
		}
		return false;
	}
	
	isLocationEmpty(x, y)
	{
		return this.worldMap.grid[x][y] == EMPTY;
	}
}

module.exports = DnDEngine;