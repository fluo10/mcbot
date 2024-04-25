import { Bot, Player } from 'mineflayer'
import { EventEmitter } from 'events'
import { Entity } from 'prismarine-entity'
import { Vec3 } from 'vec3'
import { BehaviorLookAtEntity, NestedStateMachine,  StateMachineTargets, StateTransition } from 'mineflayer-statemachine'
import { BehaviorFollowPlayer} from '../behaviors';
import { OrderedStateMachineTargets } from '..';

export class FollowPlayerPhase extends NestedStateMachine {
  readonly bot: Bot;
  readonly targets: OrderedStateMachineTargets;
  readonly loop: boolean;

  constructor(bot: Bot, targets: StateMachineTargets, loop: boolean = true ) {
    const followPlayer = new BehaviorFollowPlayer(bot, targets);
    const lookAtPlayer = new BehaviorLookAtEntity(bot, targets);
    const transitions = [
      new StateTransition({
        parent: followPlayer,
        child: lookAtPlayer,
        shouldTransition: () => followPlayer.distanceToTarget() < 4,
      }),
        new StateTransition({
          parent: lookAtPlayer,
          child: followPlayer,
          shouldTransition: () => lookAtPlayer.distanceToTarget() >= 4,
        }),
    ];
    super(transitions, lookAtPlayer);
    this.targets = targets;
    this.loop = loop;
    this.bot = bot;
  }
}

