const ArgumentParser      = require('argparse').ArgumentParser;
const colors              = require('colors');
const fs                  = require('fs');
const pkg                 = require('../../package.json');
const dwd                 = require('dungeonworld-data');
const path                = require('path');

const parser = new ArgumentParser({
  version: pkg.version,
  addHelp: true,
  description: 'Combines the base Dungeon World data with the modules you pass in.\nExample: npm run data -- --name my-expansion --module first-module --module another-module'
});

parser.addArgument(['--name', '-n'], {
  help: 'The computer friendly name to give this combination of modules. Ex: ' + 'my-realistic-expansion'.bold + ' or ' + 'perilous-wilds-flags'.bold,
  defaultValue: false
});

parser.addArgument(['--module', '-m'], {
  help: 'The modules you want to include, in order. You can include multiple ones with more --module flags.',
  action: 'append',
  defaultValue: []
});

let args = parser.parseArgs();

//You need modules
if(args.module.length == 0) {
  console.log('Error:'.red.bgWhite + ' Include at least one module with the ' + '--module module-name'.bold + ' format.');
  process.exit();
}

//If no name is given, just combine the modules
if(!args.name) {
  args.name = args.module.join('-');
}

console.log('Creating a new expansion: ' + args.name.bold + ' with modules: ');
args.module.forEach((m) => {
  console.log('  ' + m.green);
});

//Grab the DungeonWorldData compiler
let rawCompiler = dwd.compilers.raw;

//Each module gets this compiler and does what they want with it
//Generally they'll be adding source folders and registering custom steps
args.module.forEach((m) => {
  const module = require(m);
  const instance = new module();
  instance.extendRawCompiler(rawCompiler);
});

rawCompiler.config.outputFiles = [path.join(__dirname, args.name + '.json')];
console.log('rawCompiler', rawCompiler);
rawCompiler.run();