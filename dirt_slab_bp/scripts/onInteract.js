import {
  system,
  EquipmentSlot
} from "@minecraft/server";

class BlockToggleSlab {
  onPlayerInteract(event) {
    const { block, player, face } = event;
    if (!player) return;

    const equipment = player.getComponent("minecraft:equippable");
    if (!equipment) return;

    const heldItem = equipment.getEquipment(EquipmentSlot.Mainhand);

    if (!heldItem || heldItem.typeId !== block.typeId) return;

    const slabType = block.permutation.getState("myname:slab_type");
    if (slabType === "double") return;

    const validFace = ["Up", "Down", "North", "East", "South", "West"].includes(face);
    if (!validFace) return;

    if (player.getGameMode() !== "creative") {
      if (heldItem.amount > 1) {
        heldItem.amount -= 1;
        equipment.setEquipment(EquipmentSlot.Mainhand, heldItem);
      } else {
        equipment.setEquipment(EquipmentSlot.Mainhand, undefined);
      }
    }

    const playerPos = player.location;
    const { x: bx, y: by, z: bz } = block.location;

    // Small buffer for safety
    const insideBlock =
      playerPos.x >= bx && playerPos.x < bx + 1 &&
      playerPos.y >= by && playerPos.y < by + 1 &&
      playerPos.z >= bz && playerPos.z < bz + 1;

    if (insideBlock) {
      player.sendMessage("§cCan't upgrade slab while inside the block!");
      return;
    }

    // Change to double slab
    const newPerm = block.permutation.withState("myname:slab_type", "double");
    block.setPermutation(newPerm);

    // Force the block state to sync
    const refreshedBlock = block.dimension.getBlock(block.location);
    system.runTimeout(() => {
      refreshedBlock.setPermutation(refreshedBlock.permutation);
    }, 0);

    player.playSound("use.dirt_with_roots");
    player.sendMessage(`§a[Slab] Upgraded to double at (${bx}, ${by}, ${bz})`);

    // Check again and teleport if needed
    system.runTimeout(() => {
      const pos = player.location;
      const inside =
        pos.x >= bx && pos.x < bx + 1 &&
        pos.y >= by && pos.y < by + 1 &&
        pos.z >= bz && pos.z < bz + 1;

      if (inside) {
        player.teleport(
          { x: bx + 0.5, y: by + 1.01, z: bz + 0.5 },
          { facingLocation: player.getViewDirection() }
        );
      }
    }, 0);
  }
}

system.beforeEvents.startup.subscribe(init => {
  console.warn("✅ Registered myname:toggle_slab");
  init.blockComponentRegistry.registerCustomComponent("myname:toggle_slab", new BlockToggleSlab());
});
