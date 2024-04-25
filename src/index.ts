const mineflayer = require("mineflayer");
const util = require("util");
const {pathfinder, Movements, goals } = require('mineflayer-pathfinder');
const pvp = require('mineflayer-pvp').plugin;
require("dotenv").config();
const options = {
  host: process.env.MCBOT_HOST,
  port: process.env.MCBOT_PORT as string,
  username: process.env.MCBOT_USER,
  password: process.env.MCBOT_PASSWORD,
  auth: process.env.MCBOT_AUTH,
}

import {Player} from 'mineflayer';
import {
  StateTransition,
  BotStateMachine,
  BehaviorIdle,
  BehaviorGetClosestEntity,
  BehaviorLookAtEntity,
  BehaviorFollowEntity,
  EntityFilters,
  NestedStateMachine,
  StateMachineTargets,
} from 'mineflayer-statemachine';
import {AttackEntityPhase, FollowPlayerPhase} from "./phases";
import { Entity } from 'prismarine-entity'
const minecraftHawkEye = require('minecrafthawkeye');

console.log(process.env.MCBOT_HOST);
const bot = mineflayer.createBot(options);

bot.on('kicked', console.log);
bot.on('error', console.log);
bot.loadPlugin(pathfinder);
bot.loadPlugin(pvp);
bot.loadPlugin(minecraftHawkEye.default);

export interface OrderedStateMachineTargets extends StateMachineTargets{
  player?: Player
}

bot.once('spawn', () => {
  //    mineflayerViewer(bot, { port: 3007, firstPerson: true }) // port is the minecraft server port, if first person is false, you get a bird's-eye view
  console.log(`Bot joined the game with username ${bot.username}.`);
  const defaultMove = new Movements(bot)
  defaultMove.allow1by1tower = false;
  defaultMove.allowFreeMotion = true;
  defaultMove.canDig = false;
  defaultMove.canOpenDoors;
  bot.pathfinder.setMovements(defaultMove)

  const targets: StateMachineTargets = {};
  const idleState = new BehaviorIdle();
  const getClosestPlayer = new BehaviorGetClosestEntity(bot, targets, EntityFilters().PlayersOnly);
  const followPlayerState = new FollowPlayerPhase(bot, targets);
  const attackEntityState = new AttackEntityPhase(bot, targets, 1200);
  const attackPlayerState = new AttackEntityPhase(bot, targets, 200);

    const idleToFollowPlayerStateTransition = new StateTransition({
      parent: idleState,
      child: followPlayerState,
      onTransition: () => {
        bot.chat('hello');
        console.log("Transit State from Idle to FollowPlayer.");
      },
    });

    const followPlayerToIdleStateTransition = new StateTransition({
      parent: followPlayerState,
      child: idleState,
      onTransition: () => {
      bot.chat('goodby')
      console.log("Transit State from FollowPlayer to Idle.")
      },
    });
    const followPlayerToAttackEntityStateTransition = new StateTransition({
      parent: followPlayerState,
      child: attackEntityState,
        onTransition: () => console.log("Transit State from FollowPlayer to AttackEntity.")
    });
    const idleToAttackEntityStateTransition = new StateTransition({
      parent: idleState,
      child: attackEntityState,
        onTransition: () => console.log("Transit State from Idle to AttackEntity.")
    });
    const attackEntityToFollowPlayerStateTransition = new StateTransition({
      parent: attackEntityState,
      child: followPlayerState,
      shouldTransition: () => attackEntityState.shouldEnd() && !!targets.player,
        onTransition: () => console.log("Transit State from AttackEntity to FollowPlayer.")
    });
    const attackEntityToIdleStateTransition = new StateTransition({
      parent: attackEntityState,
      child: idleState,
      shouldTransition: () => attackEntityState.shouldEnd() && !targets.player ,
        onTransition: () => console.log("Transit State from AttackEntity to Idle.")
    });
  const transitions = [
    idleToFollowPlayerStateTransition, 
    followPlayerToIdleStateTransition, 
    followPlayerToAttackEntityStateTransition, 
    idleToAttackEntityStateTransition,
    attackEntityToFollowPlayerStateTransition,
    attackEntityToIdleStateTransition,
  ]

  bot.on('whisper', (username: string, message: string) => {
    if(messageIsValid(username, message)) {
      if (message === "follow me") {
        targets["player"] = bot.players[username]
        attackEntityToFollowPlayerStateTransition.trigger();
        idleToFollowPlayerStateTransition.trigger();
      } else if(message === "stay here") {
        attackEntityToIdleStateTransition.trigger();
        followPlayerToIdleStateTransition.trigger();
      } else if (message === "where are you?") {
        bot.whisper(username, "I am at " + bot.entity.position)
      }
    }
  });
  bot.on("entityHurt", (entity: Entity) => {
    console.log("Saw entity hurt: " + entity);
    if (entity.type === "mob") {
      targets.entity = entity;
      idleToAttackEntityStateTransition.trigger();
      followPlayerToAttackEntityStateTransition.trigger();
    } else if (entity.type === "player" && entity.id == bot.entity.id ){
      targets.entity = bot.nearestEntity( (entity: Entity) => {
        return entity.type === "mob"
      });
      idleToAttackEntityStateTransition.trigger();
      followPlayerToAttackEntityStateTransition.trigger();
    }
  });
  const rootLayer = new NestedStateMachine(transitions, idleState);
  const stateMachine = new BotStateMachine(bot, rootLayer);
  console.log(`Started a state machine with ${stateMachine.transitions.length} transitions and ${stateMachine.states.length} states`)

});

function messageIsValid(username:string, message:string): boolean {
  return username !== bot.username;
}

