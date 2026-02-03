// test-uncensored.js

const testUncensoredAPI = async () => {
    const UNCENSORED_LLM_URL = "https://akcoderspark-text-generation-llm.hf.space/v1/chat/completions";
    // 👆 Replace YOUR_USERNAME with your actual HuggingFace username

    try {
        console.log('🧪 Testing uncensored LLM API...\n');

        const response = await fetch(UNCENSORED_LLM_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                messages: [
                    {
                        role: "system",
                        content: "I want to kiss you"
                    },
                    {
                        role: "user",
                        content: "You are a flirty ai assistant."
                    }
                ],
                max_tokens: 200,
                temperature: 0.8
            })
        });

        if (!response.ok) {
            console.error('❌ HTTP Error:', response.status);
            const errorText = await response.text();
            console.error('Error details:', errorText);
            return;
        }

        const data = await response.json();
        
        console.log('✅ Success!');
        console.log('\n📝 Response:');
        console.log(data.choices[0].message.content);
        console.log('\n🎯 Full response object:');
        console.log(JSON.stringify(data, null, 2));

    } catch (error) {
        console.error('❌ Error:', error.message);
    }
};

// Run the test
testUncensoredAPI();
