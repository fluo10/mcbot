const mineflayer = require("mineflayer");
const util = require("util");
const {pathfinder, Movements, goals } = require('mineflayer-pathfinder');
const pvp = require('mineflayer-pvp').plugin;
require("dotenv").config();

const { mineflayer: mineflayerViewer } = require('prismarine-viewer')

const options = {
  host: process.env.MINECRAFT_HOST,
  port: parseInt(process.env.MINECRAFT_PORT as string, 27000),
  username: process.env.MINECRAFT_USER,
  auth: process.env.MINECRAFT_AUTH,
  password: process.env.MINECRAFT_PASSWORD,
}

const bot = mineflayer.createBot(options);

bot.on('kicked', console.log);
bot.on('error', console.log);

bot.loadPlugin(pathfinder);
bot.loadPlugin(pvp);

bot.once('spawn', () => {
    mineflayerViewer(bot, { port: 3007, firstPerson: true }) // port is the minecraft server port, if first person is false, you get a bird's-eye view
});

function parse_message(message: string): string[] | undefined {
  let args = message.split(" ");
  var index = args.indexOf("@" + bot.username);
  if (index === -1) {
    return undefined;
  } else {
    args.splice(index, 1);
  }
  return args
}



bot.targetPos = null;
bot.targetEntity = null;
bot.nearestEnemy = null;
bot.order = null;
bot.once('spawn', () => {
  bot.addChatPattern('echo', /echo/)
  bot.addChatPattern('follow', /follow/)
  bot.addChatPattern('stay', /stay/)
  const defaultMove = new Movements(bot)
  defaultMove.allow1by1tower = false;
  defaultMove.allowFreeMotion = true;
  defaultMove.canDig = false;
  defaultMove.canOpenDoors;
  bot.pathfinder.setMovements(defaultMove)
});

function messageIsValid(username:string, message:string): boolean {
  return username !== bot.username;
}

bot.on('whisper:echo', (username: string, message: string) => {
  if(messageIsValid(username, message)) {
    bot.whisper(username, message);
  }
});

bot.on('whisper:follow', (username: string, message: string) => {
  if(messageIsValid(username, message)){
    const player = bot.players[username]
    if (!player) {
      bot.whisper(username, "I can't see you.");
      return
    }
    bot.whisper(username, "I will follow you.");
    bot.targetEntity = player.entity;
  }
});


bot.on('physicsTick', () => {
  const filter = (e: any) => e.type === 'mob' && e.position.distanceTo(bot.entiry.position) < 1 && e.displayName !== 'Armor Stand';

  bot.nearestEnemy = bot.nearestEntity(filter);
  if (bot.shouldAttack) {
    bot.pvp.attack(bot.nearestEnemy);
  } else {
    bot.pvp.stopAttack
  }
  if (bot.shouldGoToBed) {
  }
});

bot.on('stoppedAttacking', () => {
  bot.resumeMovementToTarget()
});
bot.on('attackedTarget', () => {
  bot.pvp.attack(bot.pvp.target())
});

bot.resumeMovementToTarget = () => {
  if (bot.targetEntity) {
    bot.moveToTargerEntity(bot.targetEntity);
  } else if (bot.targetPos) {
    bot.moveToTargetPos(bot.targetPos);
  }
}

bot.moveToTargetPos = (entity: any) => {
  bot.pathfinder.setGoal(new goals.GoalFollow(entity, 8))
}
bot.moveToTargerEntity = (pos: any) =>{
  bot.pathfinder.setGoal(new goals.GoalBlock(pos.x, pos.y, pos.z, 8))
}


