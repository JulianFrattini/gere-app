const fs = require('fs')
const path = require('path')
const clone = require('git-clone')

const datapath = './../0-data'

module.exports = {

    clone: async function() {
        try {
            // delete all files in the current folder
            fs.readdir(datapath, (err, files) => {
                if (err) throw err;
              
                for (const file of files) {
                  fs.unlink(path.join(datapath, file), err => {
                    if (err) throw err;
                  });
                }
              });

            // clone the public repository containing all of the requirements quality factor extractions
            clone('https://github.com/JulianFrattini/requirements-quality-factors', datapath)

            return 1
        } catch(error) {
            return 0
        }
    }
}