# ModularDungeonWorld
A NodeJS project to take the base Dungeon World game and apply expansions and modifications to it.

## Installation

 - Install NodeJS
 - Download or clone this repository
 - Open up your console
 - Navigate to where this project is
 - Run `npm install`

## Creating a new DW Distribution Data Set

### Install the Modules You Want
Modules need to be installed with npm.


### Combine Your Modules
This will create a new JSON data file based on the modules you supply. It does not yet generate any pages, just data.

In the command line run this command: `npm run data -- --name [your-distribution-name] --module [module-1] --module [module-2]`

Example: `npm run data -- --name perilous-drives --module dw-perilous-wilds --module dw-drives`  

Note, those modules don't exist yet, and would need to be created first, and then also installed.
