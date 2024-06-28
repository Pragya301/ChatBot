import "./App.css";
import { Chat } from "./Chat";
// import SpeechToTextButton from "./hooks/SpeechToTextButton";

function App() {
  return (
    <div className="App">
      <div className="py-2 h-[100vh]">
        <Chat />
      </div>
      {/* <SpeechToTextButton /> */}
    </div>
  );
}

export default App;
