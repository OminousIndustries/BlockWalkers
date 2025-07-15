export const Utils = {
    getRandomColor(colors) {
        return colors[Math.floor(Math.random() * colors.length)];
    },

    clamp(value, min, max) {
        return Math.max(min, Math.min(max, value));
    }
};

export const CONSTANTS = {
    CITY_SIZE: 100,
    BLOCK_SIZE: 15,
    PLAYER_SPEED: 5.0, // Adjusted for a more reasonable walk speed
    NPC_COUNT: 15,
    NPC_SPEED_MIN: 2.0,
    NPC_SPEED_MAX: 4.0,
    CONVERSATION_DISTANCE: 4.0, // Increased distance
    BUILDING_COLORS: [0x4a4a4a, 0x6a6a6a, 0x8a8a8a, 0x2a2a2a, 0x5a5a5a],
    NPC_COLORS: [0xFF6B6B, 0x4ECDC4, 0x45B7D1, 0x96CEB4, 0xFECA57, 0xFF9FF3, 0x54A0FF, 0x48DBFB, 0x1DD1A1]
};
