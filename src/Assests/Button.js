import React from "react";

export const Button = ({ btnTitle, setBtn }) => {
  return (
    <button
      className="bg-blue-200 rounded-md mt-1"
      onClick={() => {
        setBtn(btnTitle);
        // setSelectedBtn("");
        // setPaymentBtnBtn(false);
        // handleIssueBtn();
      }}
    >
      {btnTitle}
    </button>
  );
};
