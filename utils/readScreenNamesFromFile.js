const fs = require('fs');

function readScreenNamesFromFile(filePath) {
    try {
        const content = fs.readFileSync(filePath, 'utf-8');
        const screenNames = [];

        for(let line of content.split('\n')){
            line = line.trim();

            if(line.length === 0 ){
                continue;
            }

            if(line.startsWith('#')){
                continue;
            }
            screenNames.push(line.trim());
        }

        return screenNames;

    } catch (error) {
        console.error('Error reading subscribers from file:', error.message);
        return [];
    }
}

module.exports = readScreenNamesFromFile;