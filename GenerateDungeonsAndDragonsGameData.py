import json
import random

# Some sample data pools
names = [
    "Thalindra Moonshadow", "Borin Ironfist", "Seraphina Dawnsong", "Kaelen Swiftstep",
    "Zyra Stormborn", "Darius Blackthorn", "Lyra Silverleaf", "Torin Stonehelm",
    "Evelyn Ashcroft", "Ragnar Bloodfang"
]

classes = ["Fighter", "Wizard", "Cleric", "Rogue", "Ranger", "Paladin", "Bard", "Sorcerer", "Warlock", "Druid"]
races = ["Human", "Elf", "Dwarf", "Halfling", "Dragonborn", "Tiefling", "Half-Orc", "Gnome"]

character_descriptions = [
    "A brave adventurer seeking glory.",
    "A mysterious wanderer with a troubled past.",
    "A loyal companion with a sharp wit.",
    "A cunning trickster who trusts no one.",
    "A scholar of ancient lore and forgotten magic.",
    "A hardened warrior with scars of many battles.",
    "A healer devoted to protecting the innocent.",
    "A reckless thrill-seeker chasing danger."
]

def character_random_stats():
    return {
        "strength": random.randint(8, 18),
        "dexterity": random.randint(8, 18),
        "constitution": random.randint(8, 18),
        "intelligence": random.randint(8, 18),
        "wisdom": random.randint(8, 18),
        "charisma": random.randint(8, 18)
    }

characters = []

for i in range(9, 98):
    character = {
        "name": random.choice(names) + f" #{i+1}",  # add number to avoid duplicates
        "class": random.choice(classes),
        "race": random.choice(races),
        "level": random.randint(1, 10),
        "xp": random.randint(0, 15000),
        "stats": character_random_stats(),
        "health": random.randint(10, 80),
        "description": random.choice(character_descriptions)
    }
    characters.append(character)

# Pools of data to randomize from
monster_kinds = [
    "Goblin", "Orc", "Dragon", "Zombie", "Skeleton", "Troll", "Kobold",
    "Giant Spider", "Vampire", "Werewolf", "Lich", "Mimic", "Ogre",
    "Gnoll", "Basilisk", "Hydra", "Golem", "Wraith", "Harpy", "Chimera"
]

monster_descriptions = [
    "A fearsome creature that lurks in the shadows.",
    "A cunning predator with a taste for adventurers.",
    "A mindless beast driven only by hunger.",
    "A magical entity bound to ancient curses.",
    "A towering brute with unmatched strength.",
    "A sly trickster that delights in ambushes.",
    "A relentless hunter that never gives up the chase.",
    "A corrupted being infused with dark magic."
]

def monster_random_stats():
    return {
        "strength": random.randint(6, 20),
        "dexterity": random.randint(6, 20),
        "constitution": random.randint(6, 20),
        "intelligence": random.randint(3, 18),
        "wisdom": random.randint(3, 18),
        "charisma": random.randint(3, 18)
    }

monsters = []

for i in range(99, 998):
    monster = {
        "kind": random.choice(monster_kinds) + f" #{i+1}",  # add number to avoid duplicates
        "stats": monster_random_stats(),
        "health": random.randint(5, 300),  # HP range for weak to very strong monsters
        "description": random.choice(monster_descriptions)
    }
    monsters.append(monster)

characters_and_monsters = {
    "characters": characters,
    "monsters": monsters
}

# Output as JSON
print(json.dumps(characters_and_monsters, indent=2))
