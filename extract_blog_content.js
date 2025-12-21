const fs = require('fs');
const path = require('path');

const filePath = path.join(process.cwd(), 'blog5.html');
const content = fs.readFileSync(filePath, 'utf8');

// Regex to find title, excerpt, and content
// Looking for patterns like "title":"...", "excerpt":"...", "content":"..."
// The content might be escaped JSON strings.



const searchString = "Face-id";
const index = content.indexOf(searchString);

if (index !== -1) {
    const start = Math.max(0, index - 2000);
    const end = Math.min(content.length, index + 4000);
    const context = content.substring(start, end);
    fs.writeFileSync('blog5_context.txt', context);
    console.log("Context written to blog5_context.txt");
} else {
    console.log(`String '${searchString}' not found.`);
}
