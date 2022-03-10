const fs = require('fs')
const path = require('path')
const clone = require('git-clone')

const datapath = './data/raw'

module.exports = {

    clone: async function() {
        try {
            if(!fs.existsSync(datapath)) {
              fs.mkdirSync(datapath, {recursive: true});
            } else {
		    console.log(datapath + ' exists');
		}

            // delete all files in the current folder
            fs.readdir(datapath, (err, files) => {
                if (err) throw err;
              
                for (const file of files) {
                  fs.unlink(path.join(datapath, file), err => {
                    if (err) {
			    console.log(err);
			throw err;
			}
                  });
                }
              });

            // clone the public repository containing all of the requirements quality factor extractions
            clone('https://github.com/JulianFrattini/requirements-quality-factors', datapath)

            return 1
        } catch(error) {
		console.log(error);
            return 0
        }
    }
}
