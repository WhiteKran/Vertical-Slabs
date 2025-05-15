import { system, BlockPermutation, world } from "@minecraft/server";

class GrassSpreadComponent {
    onRandomTick(event) {
        const { block } = event;

        if (block.typeId !== "myname:grass_slab") return;

        const pos = block.location;
        const dim = block.dimension;

        for (let dx = -1; dx <= 1; dx++) {
            for (let dy = -1; dy <= 2; dy++) {
                for (let dz = -1; dz <= 1; dz++) {
                    const x = pos.x + dx;
                    const y = pos.y + dy;
                    const z = pos.z + dz;

                    const target = dim.getBlock({ x, y, z });
                    if (!target) continue;

                    const aboveTarget = dim.getBlock({ x, y: y + 1, z });
                    if (!aboveTarget || aboveTarget.typeId !== "minecraft:air") continue;

                    if (target.typeId === "myname:dirt_slab") {
                        const newPerm = BlockPermutation.resolve("myname:grass_slab", target.permutation.getAllStates());
                        target.setPermutation(newPerm);
                        world.sendMessage(`✅ Slab spread to (${x}, ${y}, ${z})`);
                        return;
                    }

                    if (target.typeId === "minecraft:dirt") {
                        target.setPermutation(BlockPermutation.resolve("minecraft:grass_block"));
                        world.sendMessage(`✅ Full block spread to (${x}, ${y}, ${z})`);
                        return;
                    }
                }
            }   
        }
    }
}

system.beforeEvents.startup.subscribe(init => {
  init.blockComponentRegistry.registerCustomComponent("myname:grass_spread", new GrassSpreadComponent());
});
