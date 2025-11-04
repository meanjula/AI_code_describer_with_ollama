import React from 'react'
import { useState } from 'react';

export default function CodeExplainer() {
  const [code, setCode] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  console.log("setIsLoading", setIsLoading)
  return (
    <div>
      <textarea
          style={styles.textarea}
          rows="10"
          placeholder="Paste your code here..."
          value={code}
          onChange={(e) => setCode(e.target.value)}
        />

        <button type="submit" disabled={isLoading} style={styles.button}>
          {isLoading ? "Explaining..." : "Explain Code"}
        </button>
    </div>
  )
}
const styles = {
    textarea: {
    width: "100%",
    fontFamily: "monospace",
    fontSize: "14px",
    padding: "10px",
    borderRadius: "6px",
    border: "1px solid #ccc",
    resize: "vertical",
  },
  button: {
    padding: "10px",
    margin: "10px 0",
    backgroundColor: "#007bff",
    color: "white",
    border: "none",
    borderRadius: "4px",
    fontWeight: "bold",
    cursor: "pointer",
  },
}