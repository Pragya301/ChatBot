import React, { useState, useEffect, useCallback } from "react";
import { FaMicrophone } from "react-icons/fa";

const SpeechToTextButton = ({ handleSendMessage }) => {
  const [isListening, setIsListening] = useState(false);
  const [recognition, setRecognition] = useState(null);

  // Memoize the handleSendMessage function
  const memoizedHandleSendMessage = useCallback(handleSendMessage, [
    handleSendMessage,
  ]);

  useEffect(() => {
    // Check if the SpeechRecognition API is available in the browser
    if ("SpeechRecognition" in window || "webkitSpeechRecognition" in window) {
      const SpeechRecognition =
        window.SpeechRecognition || window.webkitSpeechRecognition;
      const recognitionInstance = new SpeechRecognition();
      setRecognition(recognitionInstance);
    } else {
      console.error("Speech Recognition is not supported in this browser.");
    }
  }, []);

  useEffect(() => {
    if (recognition) {
      recognition.onstart = () => {
        setIsListening(true);
      };

      recognition.onresult = (event) => {
        memoizedHandleSendMessage(event.results[0][0].transcript);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognition.onerror = (event) => {
        console.error("Speech Recognition Error:", event.error);
        setIsListening(false);
      };
    }
  }, [memoizedHandleSendMessage, recognition]);

  const handleButtonClick = () => {
    if (recognition) {
      if (isListening) {
        recognition.stop();
      } else {
        recognition.start();
      }
    }
  };

  return (
    <button
      className="px-[10px] rounded-full mr-1 bg-blue-300"
      onClick={handleButtonClick}
      disabled={!recognition}
    >
      <FaMicrophone fontSize="20px" color="white" />
    </button>
  );
};

export default SpeechToTextButton;
