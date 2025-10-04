import json
import random

# Map symbols for visualization
TERRAIN_SYMBOLS = {
    0: ".",  # empty
    1: "~",  # water
    2: "O",  # hole
    3: "T",  # tree
    4: "^",  # rock
    5: "#"   # wall
}

def generate_map(width=100, height=100):
    terrain_weights = {
        0: 50,  # empty
        1: 15,  # water
        2: 5,   # hole
        3: 15,  # tree
        4: 10,  # rock
        5: 5    # wall
    }

    grid = [[0 for _ in range(width)] for _ in range(height)]

    for y in range(height):
        for x in range(width):
            neighbors = []
            if x > 0:
                neighbors.append(grid[y][x-1])
            if y > 0:
                neighbors.append(grid[y-1][x])

            weights = terrain_weights.copy()
            for n in neighbors:
                if n != 0:
                    weights[n] += 20  # clustering boost

            terrain_types = []
            for t, w in weights.items():
                terrain_types.extend([t] * w)

            grid[y][x] = random.choice(terrain_types)

    return {
        "width": width,
        "height": height,
        "grid": grid
    }

def preview_map(map_data, rows=20, cols=50):
    """Prints an ASCII preview of the map (cropped for readability)."""
    for y in range(min(rows, map_data["height"])):
        row = map_data["grid"][y][:cols]
        print("".join(TERRAIN_SYMBOLS[cell] for cell in row))

# Generate clustered map
map_data = generate_map(80, 40)

# Save to file
with open("map.json", "w") as f:
    json.dump(map_data, f, indent=2)

print("Clustered map saved to map.json")
print("\nASCII Preview (40x80 slice):\n")
preview_map(map_data, rows=40, cols=80)
