const fs = require('fs');

// Function to read and parse cookies from a file
function readCookiesFromFile(filePath) {
    try {
        const content = fs.readFileSync(filePath, 'utf-8');
        return JSON.parse(content);
    } catch (error) {
        console.error('Error reading cookies from file:', error.message);
        return [];
    }
}

module.exports = readCookiesFromFile;