import { Bot, Player } from 'mineflayer'
import { EventEmitter } from 'events'
import { Entity } from 'prismarine-entity'
import { Vec3 } from 'vec3'
import {BehaviorFollowEntity, BehaviorLookAtEntity,NestedStateMachine,  StateMachineTargets, StateTransition } from 'mineflayer-statemachine'

export class BehaviorFollowPlayerEntity extends NestedStateMachine {
  targets: StateMachineTargets;
  loop: boolean
  constructor(bot: Bot, targets: StateMachineTargets, loop: boolean ) {
    const followPlayer = new BehaviorFollowEntity(bot, targets);
    const lookAtPlayer = new BehaviorLookAtEntity(bot, targets);
    const transitions = [
      new StateTransition({
        parent: followPlayer,
        child: lookAtPlayer,
        shouldTransition: () => followPlayer.distanceToTarget() < 2,
      }),
        new StateTransition({
          parent: lookAtPlayer,
          child: followPlayer,
          shouldTransition: () => lookAtPlayer.distanceToTarget() >= 2,
        }),
    ];
    super(transitions, lookAtPlayer);
    this.targets = targets;
    this.loop = loop;
  }
}

