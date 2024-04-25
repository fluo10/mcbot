import { Bot, Player } from 'mineflayer'
import { EventEmitter } from 'events'
import { Entity } from 'prismarine-entity'
import { Vec3 } from 'vec3'
import { BehaviorLookAtEntity, NestedStateMachine,  StateMachineTargets, StateTransition } from 'mineflayer-statemachine'
import { BehaviorFollowPlayer, BehaviorMeleeAttackEntity, BehaviorRangedAttackEntity } from '../behaviors';
import { OrderedStateMachineTargets } from '..';

export class AttackEntityPhase extends NestedStateMachine {
  readonly bot: Bot;
  readonly targets: OrderedStateMachineTargets;
  readonly endTime: number;

  constructor(bot: Bot, targets: StateMachineTargets, duration: number = 1200 ) {
    const meleeAttackEntity = new BehaviorMeleeAttackEntity(bot, targets);
    const rangedAttackEntity = new BehaviorRangedAttackEntity(bot, targets);
    const lookAtEntity = new BehaviorLookAtEntity(bot, targets);
  
    const endTime = bot.time.time + duration;
    const transitions = [
      new StateTransition({
        parent: rangedAttackEntity,
        child: meleeAttackEntity,
        shouldTransition: () => lookAtEntity.distanceToTarget() < 2 || !rangedAttackEntity.hasRangedWeapon(),
      }),
        new StateTransition({
          parent: meleeAttackEntity,
          child: rangedAttackEntity,
          shouldTransition: () => lookAtEntity.distanceToTarget() >= 2 && rangedAttackEntity.hasRangedWeapon(),
        }),
    ];
    super(transitions, meleeAttackEntity);
    this.targets = targets;
    this.bot = bot;
    this.endTime = endTime;
  }
  shouldEnd(): boolean {
    return this.endTime <= this.bot.time.time;
  }
}

