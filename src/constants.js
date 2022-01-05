export const BLOCK_SIZE = 9;
export const PLAYER_Y = 4;
export const CANVAS_SCALE = 0.8;

/*
export const BLOCK_TEXTURES = [
  { name: "Texture ground+grass", u: 3, v: 0 },
  { name: "Texture stone", u: 0, v: 1 },
  { name: "Texture brick", u: 8, v: 0 },
  { name: "Texture wood", u: 4, v: 0 },
  { name: "Texture concrete", u: 6, v: 0 },
  { name: "Texture Diamond Green", u: 9, v: 1 },
  { name: "Texture Diamond Blood", u: 10, v: 1 },
];*/

export const BLOCK_TYPE_WALL = "block_type_wall";
export const BLOCK_TYPE_DOOR = "block_type_door";
export const BLOCK_TYPE_ELEVATOR = "block_type_elevator";

export const BLOCK_CATALOG = [
  { id:1, name: "Concrete", type: BLOCK_TYPE_WALL, u: 0, v: 0 },
  { id:2, name: "Brick", type: BLOCK_TYPE_WALL, u: 2, v: 0 },
  { id:3, name: "Elevator", type: BLOCK_TYPE_ELEVATOR, u: 4, v: 0 },
  { id:4, name: "Grass", type: BLOCK_TYPE_WALL, u: 0, v: 1 },
];

export const TEXTURE_FILE_DEFAULT = "/assets/textures/block_texture_32_text.png";
export const TEXTURE_GOUND_DEFAULT = "/assets/textures/ground_96_text.png";
export const TEXTURE_SKYBOX_DEFAULT = "/assets/textures/skybox_text";

export const TEXTURE_ITEM_DEFAULT = "/assets/textures/file_disquette_12x12.png";
export const TEXTURE_ITEM_MP3 = "/assets/textures/file_disk_12x12.png";
export const TEXTURE_ITEM_WEB = "/assets/textures/file_web_12x12.png";
