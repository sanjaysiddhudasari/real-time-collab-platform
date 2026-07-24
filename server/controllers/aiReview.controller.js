const {streamReview}=require('../services/aiReviewService');

const SUPPORTED = [
    "javascript",
    "python",
    "java",
    "cpp",
    "typescript",
];

const streamController=async (req,res)=>{
    try{
        let {code, language}=req.body;
        if(!code || !language){
            return res.status(400).json({message:'Code and language are required'});
        }
        if(!SUPPORTED.includes(language.toLowerCase())){
            return res.status(400).json({message:`Language ${language} is not supported`});
        }


        const stream = await streamReview(code, language);

        res.setHeader("Content-Type", "text/event-stream");
        res.setHeader("Cache-Control", "no-cache");
        res.setHeader("Connection", "keep-alive");
        res.setHeader("X-Accel-Buffering", "no");

        res.flushHeaders();

        for await (const chunk of stream) {
            const token=chunk.choices[0]?.delta?.content||"";

            if(token){
                res.write(`data: ${token}\n\n`);
            }
        }
        res.write(`data: [DONE]\n\n`);
        res.end();

    }catch (error) {
        console.error('Error in streamController:', error);
        res.status(500).json({data:{message:'Internal server error', error: error.message}});
    }
}

module.exports={
    streamController,
};