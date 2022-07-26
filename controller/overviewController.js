const fs = require('fs');
const path = require('path');


module.exports = {
    landingPageGet: (req, res, next) => {
        try{
            //const membersFile = fs.readFileSync(path.resolve(__dirname, '../public/docs/members.json'));
            //const members = JSON.parse(membersFile);
    
            const papersFile = fs.readFileSync(path.resolve(__dirname, '../public/docs/publications.json'));
            const publications = JSON.parse(papersFile);
    
            res.render('index', {
                //members: members,
                publications: publications
            });
        } catch(error) {
            next(error);
        }
    }
}