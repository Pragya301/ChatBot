import React, { useState } from "react";
import "./Chat.css";
import Message from "./Message";
// import { Button } from "./Assests/Button";
// import { collgeList } from "./Assests/Constants";
import { IoIosHelpCircle } from "react-icons/io";
import { RiSendPlaneFill } from "react-icons/ri";
import SpeechToTextButton from "./hooks/SpeechToTextButton";
import { RiDeleteBin5Fill } from "react-icons/ri";
import { MdOutlineFeedback } from "react-icons/md";


const typewriterEffect = (text, setMessage) => {
  let displayedText = "";
  let i = 0;
  const delay = 50;

  function typeNextChar() {
    if (i < text.length) {
      displayedText += text[i];
      setMessage((prevMessages) => [
        ...prevMessages.slice(0, prevMessages.length - 1),
        { text: displayedText, sender: "assistant" },
      ]);
      i++;
      setTimeout(typeNextChar, delay);
    }
  }
  typeNextChar();
};

export const Chat = () => {
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState("");
  const [paymentBtn, setPaymentBtnBtn] = useState(false);
  // const [helpBtn, setHelpbtn] = useState(false);
  // const [helpSubBtn, setHelpSubBtn] = useState("");
  const [selectedBtn, setSelectedBtn] = useState("");
  const [issueBtn, setIssueBtn] = useState("");
  const [initialMsg, setInitialMsg] = useState(false);
  // const [clgList, setClgList] = useState(false);
  const [userId, setUserId] = useState("");
  const [loading, setLoading] = useState(false);
  const [isDropdownOpen, setDropdownOpen] = useState(false);
  const [feedback, setFeedBack] = useState("");
  const [feedbackState, setFeedBackState] = useState(false);
  const [user, setUser] = useState({
    name: "",
    email: "",
  });


  // Function to handle button click and send POST request
  const handleButtonClick = async (buttonText) => {
    try {
      const response = await fetch('http://192.168.88.170:5000/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ buttonClicked: buttonText })
      });

      if (!response.ok) {
        throw new Error('Network response was not ok');
      }

      const data = await response.json();
      console.log('POST request successful', data);
    } catch (error) {
      console.log('Error:', error);
    }
  };

  const handleSendMessage = async (input) => {
    if (!input) {
      if (inputText.trim() === "") return;
    }

    const userMessage = { text: input ? input : inputText, sender: "user" };
    setMessages((prevMessages) => [...prevMessages, userMessage]);
    setLoading(true);

    try {
      const url = "http://192.168.88.170:5000/webhook";
      const data = {
        message: {
          text: input ? input : inputText,
        },
        user_email: user.email, // Add this line to include user_email in the payload

        user_id: userId,
      };

      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error(`Network response was not ok: ${response.statusText}`);
      }

      const responseData = await response.json();
      const assistantMessage = {
        text: responseData.message.trim(),
        sender: "assistant",
      };
      if (assistantMessage.text === "Choose Payment purpose:-") {
        setPaymentBtnBtn(true);
      }
      // if (
      //   assistantMessage.text ===
      //   "I can help you with your to solve your querry about university. You can ask me things like:"
      // ) {
      //   setHelpSubBtn("");
      //   setHelpbtn(true);
      // } else {
      //   setHelpbtn(false);
      // }
      if (
        assistantMessage.text ===
        "Thanks for providing your name and email. You can now start the chat!"
      ) {
        setInitialMsg(true);
      }
      if (
        assistantMessage.text ===
        "Please provide a valid name and email to start the chat."
      ) {
        setInitialMsg("invalid");
      }
      setMessages((prevMessages) => [
        ...prevMessages,
        { text: assistantMessage.text, sender: "assistant" },
      ]);

      // Apply typewriter effect to assistant message
      typewriterEffect(assistantMessage.text, setMessages);
    } catch (error) {
      console.error("Error:", error.message);
    }

    setLoading(false);
    setInputText("");
  };

  const handleFeedback = async () => {
    const data = {
      user_id: userId,
      feedback_message: feedback,
    };
    const response = await fetch("http://192.168.88.201:5000/feedback", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    if (response.status === 200) {
      setFeedBackState(false);
      const responseData = await response.json();
      setMessages((prevMessages) => [
        ...prevMessages,
        { text: responseData.message, sender: "assistant" },
      ]);
    }
  };
  console.log(feedback);
  const handleFirstMsg = async () => {
    try {
      const url = "http://192.168.88.201:5000/start_chat";
      const data = {
        user_name: user.name,
        user_email: user.email,
      };

      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });
      const responseData = await response.json();

      if (response.status === 400) {
        window.alert(responseData.error);
      }

      if (
        responseData.message === `Hey, ${user.name} How can I assist you today?`
      ) {
        setInitialMsg(true);
        // setHelpSubBtn("");
        // setHelpbtn(true);
        setUserId(responseData.user_id);
        setMessages((prevMessages) => [
          ...prevMessages,
          { text: responseData.message, sender: "assistant" },
        ]);
      }
      if (
        responseData.message ===
        `Hey, ${user.name} Welcome back! I'm here to help. Feel free to ask me anything.`
      ) {
        setInitialMsg(true);
        // setHelpSubBtn("");
        // setHelpbtn(true);
        setUserId(responseData.user_id);
        setMessages((prevMessages) => [
          ...prevMessages,
          { text: responseData.message, sender: "assistant" },
        ]);
      }
    } catch (error) {
      console.log("Error:", error.message);
    }
  };
  return (
    <div className="max-w-md mx-auto p-2 pb-0 bg-gray-100 rounded-md shadow-md flex flex-col h-full">
      <div className="bg-white pt-2 pb-2">
        <h1 className="text-4xl font-semibold mb-4 text-center text-purple-700">
          AssistantX
        </h1>
        <div className="mb-4 text-sm text-gray-600 text-center">
          Please ask about the education domain only.
        </div>
      </div>
      <div className="message-container max-h-[400px] overflow-y-scroll p-2">
        {initialMsg !== true && (
          <div className="flex container flex-col w-full bg-[#f4f6f6] rounded-lg p-3 box-border">
            <span className="my-1">
              Hey! How can I help you today? Please provide your email and name.
            </span>
            <input
              className="my-1 border p-1 border-[#e6ebea] rounded-md"
              type="text"
              value={user.name}
              onChange={(e) => {
                setUser((prevData) => ({
                  ...prevData,
                  name: e.target.value,
                }));
              }}
              placeholder="Name"
            />
            <input
              className="my-1 border p-1 border-[#e6ebea] rounded-md"
              type="text"
              value={user.email}
              onChange={(e) => {
                setUser((prevData) => ({
                  ...prevData,
                  email: e.target.value,
                }));
              }}
              placeholder="Email"
            />
            <button
              className="text-[#96aab4] border border-[#e6ebea] rounded-md w-12 self-center"
              onClick={handleFirstMsg}
            >
              Save
            </button>
          </div>
        )}
        {messages.map((message, index) => (
          <Message key={index} text={message.text} sender={message.sender} />
        ))}
        {loading && (
          <div className="message text-left p-2 my-1 rounded-md bg-red-200 text-gray-800">
            Loading...
          </div>
        )}
        {paymentBtn === true && (
          <div className="flex flex-col">
            <button
              className="bg-blue-200 rounded-md mt-1"
              onClick={() => setSelectedBtn("Examination Form")}
            >
              Examination Form
            </button>
            {selectedBtn === "Examination Form" && (
              <Issuebtn
                setSelectedBtn={setSelectedBtn}
                setIssueBtn={setIssueBtn}
                issueBtn={issueBtn}
                setMessages={setMessages}
                typewriterEffect={typewriterEffect}
                setPaymentBtnBtn={setPaymentBtnBtn}
              />
            )}
            <button
              className="bg-blue-200 rounded-md mt-1"
              onClick={() => setSelectedBtn("Admission Form")}
            >
              Admission Form
            </button>
            {selectedBtn === "Admission Form" && (
              <Issuebtn
                setSelectedBtn={setSelectedBtn}
                setIssueBtn={setIssueBtn}
                issueBtn={issueBtn}
                setMessages={setMessages}
                typewriterEffect={typewriterEffect}
                setPaymentBtnBtn={setPaymentBtnBtn}
              />
            )}
            <button
              className="bg-blue-200 rounded-md mt-1"
              onClick={() => setSelectedBtn("Admit Card")}
            >
              Admit Card
            </button>
            {selectedBtn === "Admit Card" && (
              <Issuebtn
                setSelectedBtn={setSelectedBtn}
                setIssueBtn={setIssueBtn}
                issueBtn={issueBtn}
                setMessages={setMessages}
                typewriterEffect={typewriterEffect}
                setPaymentBtnBtn={setPaymentBtnBtn}
              />
            )}
          </div>
        )}
        {/* {helpBtn === true && (
          <div className="flex flex-col">
            <Button btnTitle={"Support"} setBtn={setHelpSubBtn} />
            <Button btnTitle={"Complaint"} setBtn={setHelpSubBtn} />
            <Button btnTitle={"Report"} setBtn={setHelpSubBtn} />
            <Button btnTitle={"Enquiry"} setBtn={setHelpSubBtn} />
            <Button btnTitle={"Information"} setBtn={setHelpSubBtn} />
            {helpSubBtn === "Information" && (
              <div className="mt-2 flex flex-col items-end">
                <button
                  className="bg-blue-200 px-2 rounded-lg mb-2 w-1/2"
                  onClick={() => {
                    setHelpbtn(false);
                    setClgList(true);
                  }}
                >
                  College list in RU
                </button>
                <button
                  className="bg-blue-200 px-2 rounded-lg mb-2 w-1/2"
                  // onClick={}
                >
                  Courses Offered by RU
                </button> */}
                {/* <button className="bg-blue-500 px-2 rounded-lg mb-2 w-1/3">
                  Admission Requirement
                </button>
                <button className="bg-blue-500 px-2 rounded-lg mb-2 w-1/3">
                  Academic Calender
                </button>
                <button className="bg-blue-500 px-2 rounded-lg mb-2 w-1/3">
                  Campus Facilities
                </button>
                <button
                  className="bg-blue-500 px-2 rounded-lg mb-2 w-1/3"
                  onClick={() => setHelpSubBtn("")}
                >
                  Cancel
                </button> */}
              </div>
            {/* )} */}
          {/* </div>
        )}
        {clgList && (
          <div className="flex flex-col">
            {collgeList.map((ele, i) => {
              return (
                <button
                  key={i}
                  className="bg-blue-200 px-2 rounded-lg mb-2 "
                  onClick={() => {
                    setClgList(false);
                    handleSendMessage(ele);
                  }}
                >
                  {ele}
                </button>
              );
            })}
          </div>
        )}
      </div> */}
     <div className="flex flex-row items-center justify-center p-2 mt-auto rounded-md">
      <button className="bg-blue-200 text-xs p-1 rounded-md" onClick={() => handleButtonClick('Admission Process')}>
        Admission Process
      </button>
      <button className="bg-blue-200 text-xs p-1 m-1 rounded-md" onClick={() => handleButtonClick('Documents')}>
        Documents
      </button>
      <button className="bg-blue-200 text-xs p-1 m-1 rounded-md" onClick={() => handleButtonClick('School Policy')}>
        School Policy
      </button>
      <button className="bg-blue-200 text-xs p-1 m-1 rounded-md" onClick={() => handleButtonClick('School Location')}>
        School Location
      </button>
      <button className="bg-blue-200 text-xs p-1 m-1 rounded-md" onClick={() => handleButtonClick('Dates')}>
        Dates
      </button>
    </div>
      <div className="bg-white p-0">
        {isDropdownOpen && (
          <>
            {feedbackState && (
              <div className="px-6">
                <p className="text-[#041871] font-semibold text-center">
                  Write Your Feedback
                </p>
                <textarea
                  className="w-full mt-2 border"
                  onChange={(e) => setFeedBack(e.target.value)}
                ></textarea>
                <div className="w-full flex justify-end mt-2">
                  <button
                    className="bg-blue-400 p-1 rounded-md"
                    onClick={handleFeedback}
                  >
                    Submit
                  </button>
                  <button
                    className="bg-blue-400 p-1 rounded-md ml-2"
                    onClick={() => setFeedBackState(false)}
                  >
                    Close
                  </button>
                </div>
              </div>
            )}
            <div className="ml-2">
              <div
                className="text-[#027BFF] p-1 rounded-md flex items-center cursor-pointer"
                onClick={() => setFeedBackState(true)}
              >
                <MdOutlineFeedback className="mr-2 items-center" /> Feedback
              </div>
              <div
                className="text-[#027BFF] p-1 rounded-md flex items-center cursor-pointer"
                onClick={() => setMessages([])}
              >
                <RiDeleteBin5Fill className="mr-2 items-center" /> Clear Chat
              </div>
            </div>
          </>
        )}
        <div className={`mb-2`}>
          <div
            onClick={() => setDropdownOpen(!isDropdownOpen)}
            className={`flex justify-between items-center px-4 mb-1 cursor-pointer p-2 rounded-md`}
          >
            <p className="text-[#027BFF] text-xs font-normal">
              {isDropdownOpen ? "Hide Option" : "Choose Option"}
            </p>
            <button className="ml-2 mr-2">
              <span className="mr-1"></span>
              <i
                className="arrow ml-2"
                style={{
                  transform: isDropdownOpen
                    ? "rotate(225deg)"
                    : "rotate(45deg)",
                  // transform: isDropdownOpen
                  //   ? "rotate(-135deg)"
                  //   : "rotate(45deg)",
                }}
              ></i>
            </button>
          </div>
          <div className="flex">
            <button
              className="p-1 mr-1 bg-blue-400 text-white rounded-md hover:bg-purple-600 w-[10%]"
              onClick={() => {
                // setHelpSubBtn("");
                // setClgList(false);
                handleSendMessage("help");
              }}
              title="HELP"
            >
              <IoIosHelpCircle fontSize={"30px"} />
            </button>
            <div className="py-1 flex border border-gray-400 w-[90%] rounded-md bg-white">
              <div className=" w-4/5">
                <input
                  className="flex-grow p-2 rounded-l-md focus:outline-none focus:ring focus:border-purple-500 w-full"
                  type="text"
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      handleSendMessage();
                    }
                  }}
                  placeholder="Type your message..."
                />
              </div>
              <div className="flex">
                <button
                  className="px-[10px] rounded-full mr-1 bg-blue-300"
                  onClick={() => handleSendMessage()}
                >
                  <RiSendPlaneFill fontSize={"20px"} color="white" />
                </button>
                <SpeechToTextButton handleSendMessage={handleSendMessage} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const Issuebtn = ({
  setIssueBtn,
  issueBtn,
  setMessages,
  setSelectedBtn,
  setPaymentBtnBtn,
}) => {
  const handleIssueBtn = async () => {
    const userMessage = { text: issueBtn, sender: "user" };
    setMessages((prevMessages) => [...prevMessages, userMessage]);
    try {
      const url = "http://192.168.88.201:5000/webhook";
      const data = {
        message: {
          text: issueBtn,
        },
      };

      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error(`Network response was not ok: ${response.statusText}`);
      }

      const responseData = await response.json();

      const assistantMessage = {
        text: responseData.message.trim(),
        sender: "assistant",
      };

      setMessages((prevMessages) => [
        ...prevMessages,
        { text: assistantMessage.text, sender: "assistant" },
      ]);

      // Apply typewriter effect to assistant message
      typewriterEffect(assistantMessage.text, setMessages);
    } catch (error) {
      console.error("Error:", error.message);
    }
    setIssueBtn("");
  };
  return (
    <div className="mt-2 flex flex-col items-end">
      <button
        className="bg-blue-200 px-2 rounded-lg mb-2 w-1/3"
        onClick={() => {
          setIssueBtn("Payment_Procedure");
          setSelectedBtn("");
          setPaymentBtnBtn(false);
          handleIssueBtn();
        }}
      >
        Procedure
      </button>
      <button
        className="bg-blue-200 px-2 rounded-lg mb-2 w-1/3"
        onClick={() => {
          setIssueBtn("Payment_Failure");
          setSelectedBtn("");
          setPaymentBtnBtn(false);
          handleIssueBtn();
        }}
      >
        Failure
      </button>
      <button
        className="bg-blue-200 px-2 rounded-lg mb-2 w-1/3"
        onClick={() => {
          setIssueBtn("Double_Payment");
          setSelectedBtn("");
          setPaymentBtnBtn(false);
          handleIssueBtn();
        }}
      >
        Double Payment
      </button>
      <button
        className="bg-blue-200 px-2 rounded-lg w-1/3"
        onClick={() => {
          setIssueBtn("Payment_Auto-reverse");
          setSelectedBtn("");
          setPaymentBtnBtn(false);
          handleIssueBtn();
        }}
      >
        Auto-reverse
      </button>
    </div>
  );
};
