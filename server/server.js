import express from 'express';
import cors from 'cors';
import helmet from 'helmet';


const app = express();
const corsOptions = {
    origin: "http://localhost:5173", // Allow requests from this origin
    credentials: true, // Allow cookies and credentials
};
app.use(cors(corsOptions));
app.use(helmet());
app.use(express.json());
// Health check route
app.get("/", (req, res) => {
  res.send("Server is running! Use POST /api/chat to interact.");
});

//
app.post("/api/explain-code",async (req,res) => { 
    try{
        const { code, language } = req.body;
        if(!code || !language){
            return res.status(400).json({ error: "Code and language are required" });
        }
        // Set up headers for NDJSON streaming
        res.setHeader("Content-Type", "application/x-ndjson; charset=utf-8");
        res.setHeader("Transfer-Encoding", "chunked");
        res.flushHeaders?.();
        
        //build prompt message
        const message=[
            {
                role: "user",
                content: `You are a senior ${language} developer and mentor.
                Explain the following ${language} code to a junior developer.
                Be accurate and concise, use Markdown formatting when useful.
                Question or request:
                Code: 
                \`\`\`${language}
                ${code}
                \`\`\``
            }
        ]
        const ollamaResponse = await fetch("http://localhost:11434/api/chat", {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            model: 'llama3',//llama3 model for cost-effective responses
            messages:message,//user prompt
            stream: true,//Enable streaming
            temperature: 0.3,//consistent withlow randomness of response
            max_tokens: 800,//Limit response character length
          })
         
        });
        console.log("Payload sent to Ollama:", message);

        if (!ollamaResponse.ok) {
            throw new Error(`Ollama API error: ${ollamaResponse.statusText}`);
        }
        //Stream Ollama's NDJSON response line by line to client
        let buffer = "";
        for await (const chunk of ollamaResponse.body) { //chunk is a Buffer or Uint8Array
            
            const lines = chunk.toString().split("\n").filter(Boolean);//convert raw binary chunk to string and split into array of lines using newline as separator and filter out empty lines, as in js Boolean("") is false
               console.log("lines",lines.toString());    
            for (const line of lines) {
                const data = JSON.parse(line);
                console.log(data)
                if (data.response) {
                // Stream partial tokens as NDJSON
                res.write(JSON.stringify({ type: "token", content: data.response }) + "\n");
                }

                if (data.done) {
                // Signal completion
                res.write(JSON.stringify({ type: "done" }) + "\n");
                res.end();
                }
            }
        }
    } catch (error) {
        console.error("API error", error);
        res.write(JSON.stringify({ type: "error", message: "Server error or Ollama not running." }) + "\n");
        res.end();
    }   
})


//Start server
const PORT = 3001;
app.listen(PORT, () => {
    console.log(`Server running on port http://localhost:${PORT}`);
}); 
