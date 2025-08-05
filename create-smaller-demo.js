import fs from 'fs';

console.log('Creating smaller demo dataset...');

// Read the large demo file
const largeDemoPath = '/Users/victoriano/claude-projects/chatgpt-analytics/public/demo-data.json';
const smallDemoPath = '/Users/victoriano/claude-projects/chatgpt-analytics/public/demo-data.json';

const conversations = JSON.parse(fs.readFileSync(largeDemoPath, 'utf8'));

console.log(`Original conversations: ${conversations.length}`);

// Take only the 50 most recent conversations and limit message content
const smallerDemo = conversations
  .sort((a, b) => b.create_time - a.create_time)
  .slice(0, 50)
  .map(conv => {
    // Limit message content to reduce file size
    const newMapping = {};
    Object.keys(conv.mapping).forEach(key => {
      const node = conv.mapping[key];
      if (node.message && node.message.content && node.message.content.parts) {
        // Truncate very long messages
        node.message.content.parts = node.message.content.parts.map(part => 
          typeof part === 'string' && part.length > 500 
            ? part.substring(0, 500) + '...'
            : part
        );
      }
      newMapping[key] = node;
    });
    
    return {
      ...conv,
      mapping: newMapping
    };
  });

console.log(`Smaller dataset: ${smallerDemo.length} conversations`);

// Write the smaller dataset
fs.writeFileSync(smallDemoPath, JSON.stringify(smallerDemo, null, 2));

const fileSize = fs.statSync(smallDemoPath).size;
console.log(`New file size: ${(fileSize / 1024 / 1024).toFixed(2)} MB`);