export const BLOCK_SIZE = 9;
export const PLAYER_Y = 5;
export const CANVAS_SCALE = 0.8;

export const BLOCK_TYPE_WALL = "block_type_wall";
export const BLOCK_TYPE_DOOR = "block_type_door";
export const BLOCK_TYPE_ELEVATOR = "block_type_elevator";

export const CLASS_BLOCK = "block";
export const CLASS_CHAR = "character";
export const CLASS_FILE = "file";

export const BLOCK_CATALOG = [
  { id:1, name: "Concrete", type: BLOCK_TYPE_WALL, u: 0, v: 0 },
  { id:2, name: "Brick", type: BLOCK_TYPE_WALL, u: 2, v: 0 },
  { id:3, name: "Elevator", type: BLOCK_TYPE_ELEVATOR, u: 4, v: 0 },
  { id:4, name: "Grass", type: BLOCK_TYPE_WALL, u: 0, v: 1 },
];

export const DIRECTION_NORTH = 0;
export const DIRECTION_EAST = 1;
export const DIRECTION_SOUTH = 2;
export const DIRECTION_WEST = 3;

export const  INTERACTION_TYPE_ADD_BLOCK = "add_block";
export const  INTERACTION_TYPE_ADD_CHAR = "add_char";
export const  INTERACTION_TYPE_DELETE_BLOCK = "delete_block";
export const  INTERACTION_TYPE_ADD_FILE = "add_file";
export const  INTERACTION_TYPE_SCALE = "change_scale";
export const  INTERACTION_TYPE_ROTATE = "change_rotate";
export const  INTERACTION_TYPE_CHANGE_TEXTURE = "change_texture";
export const  INTERACTION_TYPE_ACTION = "launch_action";
export const  INTERACTION_TYPE_UPDATE_OBJECT = "update_object_action";



// export const TEXTURE_FILE_DEFAULT = "/assets/textures/block_texture_32_text.png";
// export const TEXTURE_GOUND_DEFAULT = "/assets/textures/ground_96_text.png";
export const TEXTURE_SKYBOX_DEFAULT = "/assets/textures/skybox_text";

export const TEXTURE_ITEM_DEFAULT = "/assets/textures/file_disquette_12x12.png";
export const TEXTURE_ITEM_MP3 = "/assets/textures/file_disk_12x12.png";
export const TEXTURE_ITEM_WEB = "/assets/textures/file_web_12x12.png";

export const TEXTURE_CHAR = "/assets/sprites/sprite_test2.png";


