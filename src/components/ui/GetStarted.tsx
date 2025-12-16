import React from 'react';
import styled from 'styled-components';

const Button = () => {
  return (
    <StyledWrapper>
      <button className="btn">
        <div>GET STARTED</div>
        <svg fill="none" viewBox="0 0 24 24" height="25px" width="25px" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinejoin="round" strokeLinecap="round" strokeMiterlimit={10} strokeWidth={2} stroke="white" d="M11.6801 14.62L14.2401 12.06L11.6801 9.5" />
          <path strokeLinejoin="round" strokeLinecap="round" strokeMiterlimit={10} strokeWidth={2} stroke="white" d="M4 12.0601H14.17" />
          <path strokeLinejoin="round" strokeLinecap="round" strokeMiterlimit={10} strokeWidth={2} stroke="white" d="M12 4C16.42 4 20 7 20 12C20 17 16.42 20 12 20" />
        </svg>
      </button>
    </StyledWrapper>
  );
}

const StyledWrapper = styled.div`
  .btn {
    --color: #479f76;
    position: relative;
    display: flex;
    justify-content: center;
    align-items: center;
    transition: all .5s;
    border: none;
    background-color: transparent;
  }

  .btn div {
    letter-spacing: 2px;
    font-weight: bold;
    background: var(--color);
    border-radius: 2rem;
    color: white;
    padding: 1rem;
  }

  .btn::before {
    content: '';
    z-index: -1;
    background-color: var(--color);
    border: 2px solid white;
    border-radius: 2rem;
    width: 110%;
    height: 100%;
    position: absolute;
    transform: rotate(10deg);
    transition: .5s;
    opacity: 0.2;
  }

  .btn:hover {
    cursor: pointer;
    filter: brightness(1.2);
    transform: scale(1.1);
  }

  .btn:hover::before {
    transform: rotate(0deg);
    opacity: 1;
  }

  .btn svg {
    transform: translateX(-200%);
    transition: .5s;
    width: 0;
    opacity: 0;
  }

  .btn:hover svg {
    width: 25px;
    transform: translateX(0%);
    opacity: 1;
  }

  .btn:active {
    filter: brightness(1.4);
  }`;

export default Button;
