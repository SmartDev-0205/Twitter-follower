const fs = require('fs');

function readCommentsFromFile(fileLocation){
    try {
        const content = fs.readFileSync(fileLocation, 'utf-8');
        const comments = [];

        for(let line of content.split('\n')){
            line = line.trim();

            if(line.length === 0 ){
                continue;
            }

            if(line.startsWith('#')){
                continue;
            }

            comments.push(line);
        }

        return comments;

    } catch (error) {
        console.error('Error reading comments from file:', error.message);
        return [];
    }
}

module.exports = readCommentsFromFile;
