import React from 'react';
import styled from 'styled-components';

const Transaction = () => {
  return (
    <StyledWrapper>
      <div className="container">
        <div className="left-side">
          <div className="card">
            <div className="card-line" />
            <div className="buttons" />
          </div>
          <div className="post">
            <div className="post-line" />
            <div className="screen">
              <div className="dollar">₹</div>
            </div>
            <div className="numbers" />
            <div className="numbers-line2" />
          </div>
        </div>
        <div className="right-side">
          <div className="new">New Transaction</div>
          <svg viewBox="0 0 451.846 451.847" height={512} width={512} xmlns="http://www.w3.org/2000/svg" className="arrow">
            <path fill="#cfcfcf" data-old_color="#000000" className="active-path" data-original="#000000" d="M345.441 248.292L151.154 442.573c-12.359 12.365-32.397 12.365-44.75 0-12.354-12.354-12.354-32.391 0-44.744L278.318 225.92 106.409 54.017c-12.354-12.359-12.354-32.394 0-44.748 12.354-12.359 32.391-12.359 44.75 0l194.287 194.284c6.177 6.18 9.262 14.271 9.262 22.366 0 8.099-3.091 16.196-9.267 22.373z" />
          </svg>
        </div>
      </div>
    </StyledWrapper>
  );
}

const StyledWrapper = styled.div`
  .container {
    background-color: #ffffff;
    display: flex;
    width: 100%;
    height: 100px;
    position: relative;
    border-radius: 12px;
    transition: 0.3s ease-in-out;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
    overflow: hidden;
  }

  .container:hover {
    transform: scale(1.02);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  }

  .container:hover .left-side {
    width: 100%;
  }

  .container:hover .right-side {
    opacity: 0;
    pointer-events: none;
  }

  .left-side {
    background-color: #5de2a3;
    width: 110px;
    height: 100px;
    border-radius: 12px 0 0 12px;
    position: relative;
    display: flex;
    justify-content: center;
    align-items: center;
    cursor: pointer;
    transition: width 0.3s ease;
    flex-shrink: 0;
    overflow: hidden;
  }

  .right-side {
    width: calc(100% - 110px);
    display: flex;
    align-items: center;
    overflow: hidden;
    cursor: pointer;
    justify-content: space-between;
    white-space: nowrap;
    transition: opacity 0.3s ease;
    padding: 0 20px;
  }

  .right-side:hover {
    background-color: #f9f7f9;
  }

  .arrow {
    width: 18px;
    height: 18px;
    flex-shrink: 0;
  }

  .new {
    font-size: 16px;
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
    font-weight: 600;
    color: #333;
  }

  .card {
    width: 60px;
    height: 38px;
    background-color: #c7ffbc;
    border-radius: 5px;
    position: absolute;
    display: flex;
    z-index: 12;
    flex-direction: column;
    align-items: center;
    box-shadow: 7px 7px 7px -2px rgba(77, 200, 143, 0.72);
  }

  .card-line {
    width: 55px;
    height: 11px;
    background-color: #80ea69;
    border-radius: 2px;
    margin-top: 6px;
  }

  .buttons {
    width: 7px;
    height: 7px;
    background-color: #379e1f;
    box-shadow: 0 -8px 0 0 #26850e, 0 8px 0 0 #56be3e;
    border-radius: 50%;
    margin-top: 5px;
    transform: rotate(90deg);
    margin: 8px 0 0 -26px;
  }

  .container:hover .card {
    animation: slide-top 1.2s cubic-bezier(0.645, 0.045, 0.355, 1) both;
  }

  .container:hover .post {
    animation: slide-post 1s cubic-bezier(0.165, 0.84, 0.44, 1) both;
  }

  @keyframes slide-top {
    0% {
      transform: translateY(0);
    }
    50% {
      transform: translateY(-60px) rotate(90deg);
    }
    60% {
      transform: translateY(-60px) rotate(90deg);
    }
    100% {
      transform: translateY(-7px) rotate(90deg);
    }
  }

  .post {
    width: 54px;
    height: 65px;
    background-color: #dddde0;
    position: absolute;
    z-index: 8;
    bottom: 10px;
    top: 100px;
    border-radius: 5px;
    overflow: hidden;
  }

  .post-line {
    width: 42px;
    height: 8px;
    background-color: #545354;
    position: absolute;
    border-radius: 0px 0px 3px 3px;
    right: 6px;
    top: 7px;
  }

  .post-line:before {
    content: "";
    position: absolute;
    width: 42px;
    height: 8px;
    background-color: #757375;
    top: -7px;
  }

  .screen {
    width: 42px;
    height: 20px;
    background-color: #ffffff;
    position: absolute;
    top: 19px;
    right: 6px;
    border-radius: 3px;
  }

  .numbers {
    width: 10px;
    height: 10px;
    background-color: #838183;
    box-shadow: 0 -15px 0 0 #838183, 0 15px 0 0 #838183;
    border-radius: 2px;
    position: absolute;
    transform: rotate(90deg);
    left: 22px;
    top: 45px;
  }

  .numbers-line2 {
    width: 10px;
    height: 10px;
    background-color: #aaa9ab;
    box-shadow: 0 -15px 0 0 #aaa9ab, 0 15px 0 0 #aaa9ab;
    border-radius: 2px;
    position: absolute;
    transform: rotate(90deg);
    left: 22px;
    top: 58px;
  }

  @keyframes slide-post {
    50% {
      transform: translateY(0);
    }
    100% {
      transform: translateY(-60px);
    }
  }

  .dollar {
    position: absolute;
    font-size: 14px;
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
    width: 100%;
    left: 0;
    top: 1px;
    color: #4b953b;
    text-align: center;
    font-weight: 600;
  }

  .container:hover .dollar {
    animation: fade-in-fwd 0.3s 1s backwards;
  }

  @keyframes fade-in-fwd {
    0% {
      opacity: 0;
      transform: translateY(-5px);
    }
    100% {
      opacity: 1;
      transform: translateY(0);
    }
  }

  @media only screen and (max-width: 768px) {
    .container {
      height: 90px;
    }

    .left-side {
      width: 100px;
      height: 90px;
    }

    .right-side {
      width: calc(100% - 100px);
      padding: 0 15px;
    }

    .new {
      font-size: 15px;
    }

    .card {
      width: 54px;
      height: 34px;
    }

    .card-line {
      width: 50px;
      height: 10px;
    }
  }

  @media only screen and (max-width: 480px) {
    .container {
      height: 80px;
    }

    .left-side {
      width: 90px;
      height: 80px;
    }

    .right-side {
      width: calc(100% - 90px);
      padding: 0 12px;
    }

    .new {
      font-size: 14px;
    }

    .arrow {
      width: 16px;
      height: 16px;
    }

    .card {
      width: 50px;
      height: 32px;
    }

    .card-line {
      width: 46px;
      height: 9px;
    }
  }
`;

export default Transaction;