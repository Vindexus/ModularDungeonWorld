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

parser.addArgument(['--modules', '-ms'], {
  help: 'The modules you want to include, in order, separated by + signs. Ex: --modules dw-drives+module-2+third-module',
  defaultValue: false
});

let args = parser.parseArgs();

if(args.modules) {
  if(args.modules.indexOf(' ') >= 0) {
    console.wawrn('Warning:'.yellow.bgWhite + ' using --modules you should not have spaces.');
  }
  args.module = args.module.concat(args.modules.split('+'));
}

//You need modules
if(args.module.length == 0) {
  console.log('Error:'.red.bgWhite + ' Include at least one module with the ' + '--module module-name'.bold + ' format.');
  process.exit();
}

//Pretty up the modules
args.module = args.module.map(function (s) { return s.trim().toLowerCase() });

//If no name is given, just combine the modules
if(!args.name) {
  args.name = args.module.join('-');
}

console.log('Creating a new expansion: ' + args.name.bold + ' with modules: ');

const disDir = path.join(__dirname, '..', '..', 'distributions', args.name);
if (!fs.existsSync(disDir)){
    fs.mkdirSync(disDir);
}

args.module.forEach((m) => {
});

//Grab the DungeonWorldData compiler
let rawCompiler = dwd.compilers.raw;
let basicCompiler = dwd.compilers.basic;

//Create a JSON file to hold the information of this distribution
let distroInfo = {
  name: args.name,
  dateCompiled: new Date().toISOString(),
  modules: []
}

//Each module gets this compiler and does what they want with it
//Generally they'll be adding source folders and registering custom steps
args.module.forEach((m) => {
  var loaded = true;
  let module;
  try {
    module = require(m);
  }
  catch(e) {
    loaded = false
    m = false;
    if(e.code == 'MODULE_NOT_FOUND') {
      console.log('ERROR: '.red + ' could not load the module ' + m.red + '. Make sure you have it installed. Tutorial: ' + 'https://docs.npmjs.com/getting-started/installing-npm-packages-locally'.yellow);
    }
    else {
      console.log(e);
      process.exit();
    }
  }
  if(module && loaded) {
    const instance = new module();
    console.log('Loading... ' + m.green);
    instance.extendRawCompiler(rawCompiler);
    instance.extendBasicCompiler(basicCompiler);
    distroInfo.modules.push(m);
  }
});

fs.writeFileSync(path.join(disDir, args.name + '_info.json'), JSON.stringify(distroInfo, null, 2), 'utf8');

basicCompiler.config.outputFiles = [path.join(disDir, args.name + '_raw.json')];
basicCompiler.run();

rawCompiler.config.outputFiles = [path.join(disDir, args.name + '_basic.json')];
rawCompiler.run();