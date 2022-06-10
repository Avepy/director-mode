import * as alt from "alt-server";

alt.onClient("noclip:set", (player, x, y, z) => {
    player.pos = new alt.Vector3(x, y, z);
    player.visible = false;
})

alt.onClient("noclip:disabled", (player) => {
    player.visible = true;
})