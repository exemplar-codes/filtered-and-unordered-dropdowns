import { useState } from "react";
import reactLogo from "./assets/react.svg";
import viteLogo from "/vite.svg";
import "./App.css";
import FeatReal from "./pages/FeatReal";
import Feat from "./pages/Feat";
import FeatApproach2 from "./pages/FeatApproach2";

function App() {
  return (
    <div>
      {/* <Feat /> */}
      <h2>Filtered and unordered dropdowns</h2>
      <FeatApproach2 />
      <a
        href="https://github.com/exemplar-codes/filtered-and-unordered-dropdowns"
        target="_blank"
      >
        Source code (github repo)
      </a>
    </div>
  );
}

function App2() {
  const [count, setCount] = useState(0);

  return (
    <>
      <div>
        <a href="https://vitejs.dev" target="_blank">
          <img src={viteLogo} className="logo" alt="Vite logo" />
        </a>
        <a href="https://react.dev" target="_blank">
          <img src={reactLogo} className="logo react" alt="React logo" />
        </a>
      </div>
      <h1>Vite + React</h1>
      <div className="card">
        <button onClick={() => setCount((count) => count + 1)}>
          count is {count}
        </button>
        <p>
          Edit <code>src/App.jsx</code> and save to test HMR
        </p>
      </div>
      <p className="read-the-docs">
        Click on the Vite and React logos to learn more
      </p>
    </>
  );
}

export default App;
