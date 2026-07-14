const openai = require("openai");
const {buildPrompt} = require("./promptBuilder");


const client= new openai.OpenAI({
  apiKey: process.env.DEEPSEEK_API_KEY,
  baseURL: "https://api.deepseek.com",
});


async function streamReview(code, language){
    const {systemPrompt, userMessage} = buildPrompt(code, language);

    const stream = await client.chat.completions.create({
        model:"deepseek-chat",
        messages:[
            {role:"system", content:systemPrompt},
            {role:"user", content:userMessage}
        ],
        stream:true,
        temperature:0.2,
    });

    return stream;
}

module.exports = {
    streamReview,
};