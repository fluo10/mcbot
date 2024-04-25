import { StateBehavior, StateMachineTargets } from 'mineflayer-statemachine';
import { Bot } from 'mineflayer';
import { Entity } from 'prismarine-entity';
import { Item } from 'prismarine-item';
import {Movements, goals } from 'mineflayer-pathfinder';
import {OrderedStateMachineTargets} from '..';

//const pvp = require('mineflayer-pvp').plugin;


export class BehaviorMeleeAttackEntity implements StateBehavior {
  readonly bot: any;
  readonly targets: OrderedStateMachineTargets;
  stateName: string = "rangedAttackEntity";
  active: boolean = false
  x?: number;
  y?: number;

  constructor(bot: any, targets: OrderedStateMachineTargets) {
    this.bot =  bot;
    //bot.loadPlugin(pvp);
    this.targets = targets;
  }
  onStateEntered(): void {
    this.equipMeleeWeapon();
    this.bot.pvp.attack(this.targets.entity);
  }
  onStateExited(): void {
    this.bot.pvp.stop();
  }

  equipMeleeWeapon(): void {
    const items = this.bot.inventory.items();
      if (this.bot.registry.isNewerOrEqualTo('1.9') && this.bot.inventory.slots[45]) items.push(this.bot.inventory.slots[45]);
       const weapon = items.filter((item: Item) => {
         const weaponList = ["minecraft:stone_sword"];
         return weaponList.includes(item.name);
       })[0]
       if (weapon) {
         try {
           this.bot.equip(weapon, "hand")
           console.log(`Equipped ${weapon.name}`);
         } catch (err: any) {
           console.log(`Failed equip ${weapon.name}: ${err.message}`)
         }
      } else {
        console.log("Failed equip: No melee weapon found");
      }
  }
}
