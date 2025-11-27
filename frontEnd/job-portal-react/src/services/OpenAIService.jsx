const BASE_URL = 'https://free.churchless.tech/v1/chat/completions';

export const generateChatCompletion = async (messages) => {
    try {
        const response = await fetch(BASE_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                model: 'gpt-5',
                messages: messages,
                temperature: 0.7,
            }),
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        return data.choices[0].message;
    } catch (error) {
        console.error('Error calling OpenAI API:', error);
        throw error;
    }
};