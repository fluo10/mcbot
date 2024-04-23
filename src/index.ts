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
const {
  StateTransition,
  BotStateMachine,
  BehaviorIdle,
  BehaviorGetClosestEntity,
  BehaviorLookAtEntity,
  EntityFilters,
  NestedStateMachine,
} = require('mineflayer-statemachine');

console.log(process.env.MCBOT_HOST);
const bot = mineflayer.createBot(options);

bot.on('kicked', console.log);
bot.on('error', console.log);
bot.loadPlugin(pathfinder);
bot.loadPlugin(pvp);

bot.once('spawn', () => {
  //    mineflayerViewer(bot, { port: 3007, firstPerson: true }) // port is the minecraft server port, if first person is false, you get a bird's-eye view
  console.log(`Bot joined the game with username ${bot.username}.`);
  const defaultMove = new Movements(bot)
  defaultMove.allow1by1tower = false;
  defaultMove.allowFreeMotion = true;
  defaultMove.canDig = false;
  defaultMove.canOpenDoors;
  bot.pathfinder.setMovements(defaultMove)

  const targets = {};
  const idleState = new BehaviorIdle();
  const getClosestPlayer = new BehaviorGetClosestEntity(bot, targets, EntityFilters().PlayersOnly);
  const lookAtPlayersState = new BehaviorLookAtEntity(bot, targets);

  const transitions = [
    new StateTransition({
      parent: idleState,
      child: getClosestPlayer,
      onTransition: () => bot.chat('hello')
    }),
    new StateTransition( {
      parent: getClosestPlayer,
      child: lookAtPlayersState,
      onTransition: () => true
    }),
    new StateTransition({
      parent: lookAtPlayersState,
      child: idleState,
      onTransition: () => bot.chat('goodby')
    }),
  ]
  bot.on('whisper', (username: string, message: string) => {
    if(messageIsValid(username, message)) {
      if (message === "follow me") {
        transitions[0].trigger();
      } else if(message === "stay here") {
        transitions[2].trigger();
      }
    }
  });
  const rootLayer = new NestedStateMachine(transitions, idleState);
  const stateMachine = new BotStateMachine(bot, rootLayer);
  console.log(`Started a state machine with ${stateMachine.transitions.length} transitions and ${stateMachine.states.length} states`)

});

function messageIsValid(username:string, message:string): boolean {
  return username !== bot.username;
}

