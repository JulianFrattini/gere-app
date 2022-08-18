const fs = require('fs')
const path = require('path')

const datapath = './data/raw/'

module.exports = {
    readFile: function(filename) {
        if(fs.existsSync(datapath + filename)) {
            let rawdata = fs.readFileSync(datapath + filename);
            let json = JSON.parse(rawdata);
            return json;
        } else {
            console.error('Cannot find the file ' + datapath + filename)
            console.error('Files available in the root folder:')
            fs.readdir(process.cwd(), function(err, files) {
                files.forEach(function (file) {
                    console.error(' - ' + file); 
                });
            });
        }
        return null;
    },

    parseFiles: function(folder) {
        if(!fs.existsSync(datapath)) {
            return null;
        }

        return new Promise((resolve, reject) => {
            var rqftvs = []
            fs.readdir(datapath + folder, (err, files) => {
                if (err) throw reject();
              
                for (const file of files) {
                    json = module.exports.readFile(folder+'/'+file)

                    if(json != null) {
                        rqftvs.push(json);
                    }
                }
                resolve(rqftvs)
            });
        });
    },

    parseFilesToMap: function(folder) {
        if(!fs.existsSync(datapath)) {
            return null;
        }

        return new Promise((resolve, reject) => {
            var result = {}
            fs.readdir(datapath + folder, (err, files) => {
                if (err) throw reject();
              
                for (const file of files) {
                    json = module.exports.readFile(folder+'/'+file)
                    result[file.split('.')[0]] = json
                }
                resolve(result)
            });
        });
    }    
}