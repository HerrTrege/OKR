module.exports = async function (context, req) {
    try {
        // 1. Grab the context variables sent from your frontend
        const { industry, projectType, stream, phase, audience } = req.body;
        
        // 2. Load your secret API key from the environment
        const apiKey = process.env.GEMINI_API_KEY;

        if (!apiKey) {
            throw new Error("API key is missing!");
        }

        // 3. Build the highly specific prompt
        const prompt = `You are an expert Dynamics 365 Delivery Director. Generate 5 strategic OKRs.
        Context:
        - Industry: ${industry}
        - Project Type: ${projectType}
        - Stream: ${stream}
        - Phase: ${phase}
        - Audience: ${audience}

        Return strictly a JSON array of objects. Each object must have an 'objective' string and a 'kpis' array of strings. Do not include any markdown formatting like \`\`\`json.`;

        // 4. Call the Gemini API directly
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                contents: [{ parts: [{ text: prompt }] }],
                generationConfig: { responseMimeType: "application/json" } // Forces clean JSON output
            })
        });

        const data = await response.json();
        
        // Extract the text response from the API payload
        const generatedJSON = data.candidates[0].content.parts[0].text;

        // 5. Send the OKRs back to your frontend
        context.res = {
            status: 200,
            headers: { "Content-Type": "application/json" },
            body: generatedJSON
        };

    } catch (error) {
        context.log("Error generating OKRs:", error);
        context.res = {
            status: 500,
            body: { error: "Something went wrong generating the OKRs." }
        };
    }
};
