import fs from 'fs';
import path from 'path';

// Calculate date 3 months ago from now
const threeMonthsAgo = new Date();
threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);
const threeMonthsAgoTimestamp = threeMonthsAgo.getTime() / 1000;

console.log(`Filtering conversations from ${threeMonthsAgo.toISOString()} onwards...`);

// Read the large conversations file
const inputPath = '/Users/victoriano/Downloads/13e37c7964f6fba75bc3239c84bbce4d1fc943cb09842f57a1def03a167723eb-2025-08-04-15-35-08-f1619d92ed524eb6bfe5cf5aca25e15d/conversations.json';
const outputPath = '/Users/victoriano/claude-projects/chatgpt-analytics/public/demo-data.json';

console.log('Reading conversations file...');
const conversations = JSON.parse(fs.readFileSync(inputPath, 'utf8'));

console.log(`Total conversations: ${conversations.length}`);

// Filter conversations from the last 3 months
const recentConversations = conversations.filter(conv => {
  return conv.create_time && conv.create_time >= threeMonthsAgoTimestamp;
});

console.log(`Recent conversations (last 3 months): ${recentConversations.length}`);

// Take a sample if there are too many (limit to ~200 conversations for demo)
const maxConversations = 200;
const sampledConversations = recentConversations.length > maxConversations 
  ? recentConversations
      .sort((a, b) => b.create_time - a.create_time) // Sort by newest first
      .slice(0, maxConversations)
  : recentConversations;

console.log(`Final demo dataset: ${sampledConversations.length} conversations`);

// Write the filtered data
fs.writeFileSync(outputPath, JSON.stringify(sampledConversations, null, 2));

console.log(`Demo data written to: ${outputPath}`);
console.log('File size:', (fs.statSync(outputPath).size / 1024 / 1024).toFixed(2) + ' MB');