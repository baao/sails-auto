# sails-auto
Generates models for your existing database mysql table

### Installation

    npm i -g sails-auto

### Usage

Basic usage:

    sails-auto --host=<HOST> --user=<USER> --password=<PASSWORD> --db=<DATABASE> --model=<MODEL>
    
Required Parameters: 

    --host || -h         DB HOST
    --user || -u         DB USER
    --password || -p     DB PASSWORD
    --db || -d           DATABASE
    --model || -m        DB TABLE / MODEL
    
Options: 
    
    --connection || -c   SAILS connection to use
    --tableName || -t    alternative Table name
    --createdAt          if provided, will create an alternative name for the createdAt column
    --updatedAt          if provided, will create an alternative name for the updatedAt column
    --out || -o          if provided, will create the file specified here. Provide full path!
    --ext || -e          defaults To '.js', may be changed to whatever extension you prefer
 
## TODO 

Auto generate associations

## Dependencies
    
[minimist](https://github.com/substack/minimist),
[mysql](https://github.com/felixge/node-mysql/)
    
## License 

MIT