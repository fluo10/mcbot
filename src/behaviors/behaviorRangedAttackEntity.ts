import { StateBehavior, StateMachineTargets } from 'mineflayer-statemachine';
import { Bot } from 'mineflayer';
import { Entity } from 'prismarine-entity';
import {Movements, goals } from 'mineflayer-pathfinder';
import {OrderedStateMachineTargets} from '..';
import {Item} from 'prismarine-item';

const minecraftHawkEye = require('minecrafthawkeye');

export class BehaviorRangedAttackEntity implements StateBehavior {
  readonly bot: any;
  readonly targets: OrderedStateMachineTargets;
  stateName: string = "rangedAttackEntity";
  active: boolean = false
  x?: number;
  y?: number;

  constructor(bot: any, targets: OrderedStateMachineTargets) {
    this.bot = bot;
    //bot.loadPlugin(minecraftHawkEye);
    this.targets = targets;
  }
  onStateEntered(): void {
    this.bot.hawkEye.autoAttack(this.targets.entity, this.targets.item );
  }
  onStateExited(): void {
    this.bot.hawkEye.stop();
  }
  setRangedWeapon(): void {
    let weapon = this.getRangedWeapon();
    if (weapon) {
    this.targets.item = weapon
    }
  }
  getRangedWeapon(): Item {
    const rangedWeapons = ["bow", "crossbow"];
    const bot = this.bot;
    const items = bot.inventory.items();
    if (bot.registry.isNewerOrEqualTo('1.9') && bot.inventory.slots[45]) items.push(bot.inventory.slots[45])
    return items.filter((item: Item) => {
      return rangedWeapons.includes(item.name)
    })[0];
  }
  hasRangedWeapon(): boolean {
    return !!this.getRangedWeapon()
  }
}
