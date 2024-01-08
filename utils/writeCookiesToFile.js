const fs = require('fs');

// Function to write cookies to a file
function writeCookiesToFile(filePath, cookies) {
    try {
        fs.writeFileSync(filePath, JSON.stringify(cookies, null, 2), 'utf-8');
    } catch (error) {
        console.error('Error writing cookies to file:', error.message);
    }
}


module.exports = writeCookiesToFile;