# AI_Code_explainer_with_Ollama
 A full-stack app that uses ollama's llama3 model to explain code in plain language.

It Features:
- 🧠 local AI interface using ollama.
- ⚙️ Express.js to stream responses
- ⚡ React for UI

## Prerequisite
- **Node.js**,
-  **VS Code**,
- **Ollama** install locally
  → [Download ollama](https://ollama.com/download)

## 🏗️ Project Structure 

OLLAMA_APP/
├── server/
│   ├── node_modules
│   ├── package.json 
│   ├── package-lock.json 
│   └── server.js                 
├── ollama-client/      # React frontend app
├── .gitignore
└── README.md

## Setup Ollama
- after installation pull a model and check it is installed or not
```bash
ollama serve

ollama pull llama3

ollama list 

```
## Express server setup
In the project root
```bash
Inititae node project and install all dependencies
- npm init 
- npm install express node-fetch cors helmet


### server.js

- create express server using express
- create security middleware using helmet and cors.
- create endpoint for calling api to explain code .POST method is used 
chunk is a Buffer or Uint8Array
convert raw binary chunk to string and split into array of lines using newline as separator and filter out empty lines, as in js Boolean("") is false
                   
.toString()
'{"response":"Hello"}\n{"response":"World"}\n'

.split("\n")
[
  '{"response":"Hello world"}',
  '{"response":"!"}',
  ''
]

.filter(Boolean)[
  '{"response":"Hello world"}',
  '{"response":"!"}'
]




  