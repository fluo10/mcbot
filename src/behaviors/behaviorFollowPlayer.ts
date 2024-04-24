import { StateBehavior, StateMachineTargets } from 'mineflayer-statemachine';
import { Bot } from 'mineflayer';
import { Entity } from 'prismarine-entity';
import {Movements, goals } from 'mineflayer-pathfinder';
import {OrderedStateMachineTargets} from '..';

export class BehaviorFollowPlayer implements StateBehavior {
  readonly bot: Bot;
  readonly targets: OrderedStateMachineTargets
  movements: Movements

  stateName: string = 'followPlayer'
  active: boolean = false;
  x?: number
  y?: number
  followDistance: number = 0

  constructor (bot: Bot, targets: OrderedStateMachineTargets) {
    this.bot = bot
    this.targets = targets;
    this.movements = new Movements(this.bot);
  }

  onStateEntered (): void {
    this.startMoving()
  }
  onStateExited(): void {
    this.stopMoving()
  }
  setFollowPlayer (player: any): void {
    if(this.targets.player === player) {return}
    this.targets.player = player;
    this.restart()
  }
  private stopMoving(): void {
    const pathfinder = this.bot.pathfinder
    pathfinder.setGoal(null);
  }

  private startMoving(): void {
    const player = this.targets.player;
    if (player == null) return
    const pathfinder = this.bot.pathfinder
  const goal = new goals.GoalFollow(player.entity, this.followDistance)
  pathfinder.setMovements(this.movements);
  pathfinder.setGoal(goal, true);
  }
  restart (): void{
    if (!this.active) {return }
    this.stopMoving();
    this.startMoving();
  }
  distanceToTarget(): number {
    const player = this.targets.player;
    if (player == null) return 0;
    return this.bot.entity.position.distanceTo(player.entity.position)
  }
}

