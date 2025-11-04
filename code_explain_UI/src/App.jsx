import ollamaLogo from './assets/ollama.svg'
import './App.css'
import CodeExplainer from './components/CodeExplainer.jsx'

function App() {
  return (
    <>
      <div>
        <a href="https://vite.dev" target="_blank">
          <img src={ollamaLogo} className="logo" alt="Ollama logo" />
        </a>
      </div>
      <h1>AI Code Explainer</h1>
      <div className="card">
        <CodeExplainer />
        <p>
          Enter code snippet and get explanation from Ollama LLM model!
        </p>
      </div>
    </>
  )
}

export default App
