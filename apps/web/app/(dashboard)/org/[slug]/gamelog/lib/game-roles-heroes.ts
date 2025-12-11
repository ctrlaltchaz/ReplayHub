// Game-specific roles and heroes/characters/agents

export const GAME_ROLES: Record<string, string[]> = {
    "Valorant": ["Duelist", "Controller", "Initiator", "Sentinel"],
    "Counter-Strike 2": ["Entry Fragger", "AWPer", "Support", "Lurker", "IGL"],
    "League of Legends": ["Top", "Jungle", "Mid", "ADC", "Support"],
    "Dota 2": ["Carry", "Mid", "Offlane", "Support", "Hard Support"],
    "Overwatch": ["Tank", "Damage", "Support"],
    "Rocket League": ["Striker", "Midfielder", "Goalkeeper"],
    "Apex Legends": ["IGL", "Fragger", "Support"],
};

export const GAME_HEROES: Record<string, string[]> = {
    "Valorant": [
        "Astra", "Breach", "Brimstone", "Chamber", "Clove", "Cypher",
        "Deadlock", "Fade", "Gekko", "Harbor", "Iso", "Jett",
        "KAY/O", "Killjoy", "Neon", "Omen", "Phoenix", "Raze",
        "Reyna", "Sage", "Skye", "Sova", "Viper", "Vyse", "Yoru"
    ],
    "Counter-Strike 2": [], // CS2 doesn't have characters
    "League of Legends": [
        "Aatrox", "Ahri", "Akali", "Akshan", "Alistar", "Amumu", "Anivia", "Annie",
        "Aphelios", "Ashe", "Aurelion Sol", "Azir", "Bard", "Bel'Veth", "Blitzcrank",
        "Brand", "Braum", "Caitlyn", "Camille", "Cassiopeia", "Cho'Gath", "Corki",
        "Darius", "Diana", "Dr. Mundo", "Draven", "Ekko", "Elise", "Evelynn", "Ezreal",
        "Fiddlesticks", "Fiora", "Fizz", "Galio", "Gangplank", "Garen", "Gnar", "Gragas",
        "Graves", "Gwen", "Hecarim", "Heimerdinger", "Illaoi", "Irelia", "Ivern", "Janna",
        "Jarvan IV", "Jax", "Jayce", "Jhin", "Jinx", "K'Sante", "Kai'Sa", "Kalista",
        "Karma", "Karthus", "Kassadin", "Katarina", "Kayle", "Kayn", "Kennen", "Kha'Zix",
        "Kindred", "Kled", "Kog'Maw", "LeBlanc", "Lee Sin", "Leona", "Lillia", "Lissandra",
        "Lucian", "Lulu", "Lux", "Malphite", "Malzahar", "Maokai", "Master Yi", "Milio",
        "Miss Fortune", "Mordekaiser", "Morgana", "Naafiri", "Nami", "Nasus", "Nautilus",
        "Neeko", "Nidalee", "Nilah", "Nocturne", "Nunu & Willump", "Olaf", "Orianna",
        "Ornn", "Pantheon", "Poppy", "Pyke", "Qiyana", "Quinn", "Rakan", "Rammus",
        "Rek'Sai", "Rell", "Renata Glasc", "Renekton", "Rengar", "Riven", "Rumble",
        "Ryze", "Samira", "Sejuani", "Senna", "Seraphine", "Sett", "Shaco", "Shen",
        "Shyvana", "Singed", "Sion", "Sivir", "Skarner", "Smolder", "Sona", "Soraka",
        "Swain", "Sylas", "Syndra", "Tahm Kench", "Taliyah", "Talon", "Taric", "Teemo",
        "Thresh", "Tristana", "Trundle", "Tryndamere", "Twisted Fate", "Twitch", "Udyr",
        "Urgot", "Varus", "Vayne", "Veigar", "Vel'Koz", "Vex", "Vi", "Viego", "Viktor",
        "Vladimir", "Volibear", "Warwick", "Wukong", "Xayah", "Xerath", "Xin Zhao",
        "Yasuo", "Yone", "Yorick", "Yuumi", "Zac", "Zed", "Zeri", "Ziggs", "Zilean",
        "Zoe", "Zyra"
    ],
    "Dota 2": [
        "Abaddon", "Alchemist", "Ancient Apparition", "Anti-Mage", "Arc Warden", "Axe",
        "Bane", "Batrider", "Beastmaster", "Bloodseeker", "Bounty Hunter", "Brewmaster",
        "Bristleback", "Broodmother", "Centaur Warrunner", "Chaos Knight", "Chen", "Clinkz",
        "Clockwerk", "Crystal Maiden", "Dark Seer", "Dark Willow", "Dawnbreaker", "Dazzle",
        "Death Prophet", "Disruptor", "Doom", "Dragon Knight", "Drow Ranger", "Earth Spirit",
        "Earthshaker", "Elder Titan", "Ember Spirit", "Enchantress", "Enigma", "Faceless Void",
        "Grimstroke", "Gyrocopter", "Hoodwink", "Huskar", "Invoker", "Io", "Jakiro",
        "Juggernaut", "Keeper of the Light", "Kunkka", "Legion Commander", "Leshrac", "Lich",
        "Lifestealer", "Lina", "Lion", "Lone Druid", "Luna", "Lycan", "Magnus", "Marci",
        "Mars", "Medusa", "Meepo", "Mirana", "Monkey King", "Morphling", "Muerta", "Naga Siren",
        "Nature's Prophet", "Necrophos", "Night Stalker", "Nyx Assassin", "Ogre Magi",
        "Omniknight", "Oracle", "Outworld Destroyer", "Pangolier", "Phantom Assassin",
        "Phantom Lancer", "Phoenix", "Primal Beast", "Puck", "Pudge", "Pugna", "Queen of Pain",
        "Razor", "Riki", "Rubick", "Sand King", "Shadow Demon", "Shadow Fiend", "Shadow Shaman",
        "Silencer", "Skywrath Mage", "Slardar", "Slark", "Snapfire", "Sniper", "Spectre",
        "Spirit Breaker", "Storm Spirit", "Sven", "Techies", "Templar Assassin", "Terrorblade",
        "Tidehunter", "Timbersaw", "Tinker", "Tiny", "Treant Protector", "Troll Warlord",
        "Tusk", "Underlord", "Undying", "Ursa", "Vengeful Spirit", "Venomancer", "Viper",
        "Visage", "Void Spirit", "Warlock", "Weaver", "Windranger", "Winter Wyvern",
        "Witch Doctor", "Wraith King", "Zeus"
    ],
    "Overwatch": [
        "Ana", "Ashe", "Baptiste", "Bastion", "Brigitte", "Cassidy", "D.Va", "Doomfist",
        "Echo", "Genji", "Hanzo", "Illari", "Junker Queen", "Junkrat", "Kiriko", "Lifeweaver",
        "Lúcio", "Mauga", "Mei", "Mercy", "Moira", "Orisa", "Pharah", "Ramattra", "Reaper",
        "Reinhardt", "Roadhog", "Sigma", "Sojourn", "Soldier: 76", "Sombra", "Symmetra",
        "Torbjörn", "Tracer", "Venture", "Widowmaker", "Winston", "Wrecking Ball", "Zarya",
        "Zenyatta"
    ],
    "Rocket League": [], // Rocket League uses cars, not characters
    "Apex Legends": [
        "Ash", "Ballistic", "Bangalore", "Bloodhound", "Catalyst", "Caustic", "Conduit",
        "Crypto", "Fuse", "Gibraltar", "Horizon", "Lifeline", "Loba", "Mad Maggie",
        "Mirage", "Newcastle", "Octane", "Pathfinder", "Rampart", "Revenant", "Seer",
        "Valkyrie", "Vantage", "Wattson", "Wraith"
    ],
};

export function getGameRoles(game?: string): string[] {
    if (!game) return [];
    return GAME_ROLES[game] || [];
}

export function getGameHeroes(game?: string): string[] {
    if (!game) return [];
    return GAME_HEROES[game] || [];
}
