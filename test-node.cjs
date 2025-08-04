// Node.js test for datetime conversion
const fs = require('fs');

try {
    const conversations = JSON.parse(fs.readFileSync('test-conversations-sample.json', 'utf8'));
    
    console.log('Sample conversations loaded:', conversations.length);
    
    // Test first conversation
    const first = conversations[0];
    console.log('First conversation:');
    console.log('- ID:', first.id);
    console.log('- Title:', first.title);
    console.log('- Create time (unix):', first.create_time);
    console.log('- Create time (date):', new Date(first.create_time * 1000).toISOString());
    console.log('- Update time (unix):', first.update_time);
    console.log('- Update time (date):', new Date(first.update_time * 1000).toISOString());
    console.log('- Model:', first.default_model_slug);
    console.log('- Mapping keys:', Object.keys(first.mapping).length);
    
    // Test a few messages
    let messageCount = 0;
    for (const nodeId of Object.keys(first.mapping).slice(0, 5)) {
        const node = first.mapping[nodeId];
        if (node.message && node.message.author && node.message.content) {
            const message = node.message;
            console.log(`Message ${messageCount + 1}:`);
            console.log('- Role:', message.author.role);
            console.log('- Time:', message.create_time ? new Date(message.create_time * 1000).toISOString() : 'N/A');
            console.log('- Content type:', message.content.content_type);
            const content = message.content.parts ? message.content.parts.join(' ') : message.content.text || '';
            console.log('- Content preview:', content.substring(0, 100) + '...');
            messageCount++;
        }
    }
    
    console.log('\n✅ Sample data looks valid for processing');
    
} catch (error) {
    console.error('❌ Error:', error.message);
}