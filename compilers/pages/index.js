const ArgumentParser            = require('argparse').ArgumentParser;
const Parser                    = require('rpgparser-pages');
const parser                    = new Parser();
const path                      = require('path');
const toMarkdown                = require('to-markdown');
const pkg                       = require('../../package.json');
const dwdata                    = require('dungeonworld-data');
const fs                        = require('fs');

const argparser = new ArgumentParser({
  version: pkg.version,
  addHelp: true,
  description: 'Compiles all the pages using the game data from a previously compiled distribution.'
});

argparser.addArgument(['--distribution', '-d'], {
  help: 'The name of the distribution to compile pages for.',
  defaultValue: false
});

let args = argparser.parseArgs();
const distroDir = path.join(__dirname, '..', '..', 'distributions', args.distribution);
const distroPagesDir = path.join(distroDir, 'pages');

if (!fs.existsSync(distroPagesDir)){
  fs.mkdirSync(distroPagesDir);
}

const distroInfo = require(path.join(distroDir, args.distribution + '_info.json'));

let config = {
  gameDataFile: path.resolve(path.join(distroDir, args.distribution + '_basic.json')),
  pagesDir: path.resolve(path.join(__dirname, '..', '..','pages')),
  pagesAsPartials: true,
}

config.outputExtension = 'md'
config.outputDir = distroPagesDir;

//The DungeonWorldData module has some useful Handlebars helpers for use in the templates
let fun = (handlebars, data) => {
  dwdata.handlebarsHelpers(handlebars, data);
}
parser.registerHelper(fun)

parser.init(config)
parser.registerStep(function (content, name, config, done) {
  var md = toMarkdown(content, {
    converters: [{
      filter: function (node) {
        return node.nodeName == 'DIV' && node.className.indexOf('explanation') > -1
      },
      replacement: function (c) {
        c.trim()
        return ">" + c.split("\n").join("\n>")
      }
    }, {
      filter: function (node) {
        return node.nodeName == 'DIV'
      },
      replacement: function (c) {
        return c
      }
    }],
    ghf: true 
  })
  done(md)
});

//Load up all the modules from this distribution and let them extend the parser
//They will often call "registerStep" to add a new step to the parser
distroInfo.modules.forEach((m) => {
  let loaded = true;
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
    if(typeof(instance.extendPagesCompiler) == 'function') {
      console.log('Extending page compiler with ' + m.green)
      instance.extendPagesCompiler(parser);
    }
    else {
      console.log('No page compiler found for ' + m.yellow);
    }
  }
});


parser.run(() => {
  console.log('Pages saved to: ' + distroPagesDir.green);
});