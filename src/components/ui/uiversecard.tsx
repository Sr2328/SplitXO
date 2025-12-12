import React from 'react';
import styled from 'styled-components';

const ExpenseCards = () => {
  return (
    <StyledWrapper>
      <div className="cards-container">
        {/* Card 1: Expense Split */}
        <div className="card">
          <div className="title">
            <span className="icon-split">
              <svg width={20} fill="currentColor" height={20} viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm.31-8.86c-1.77-.45-2.34-.94-2.34-1.67 0-.84.79-1.43 2.1-1.43 1.38 0 1.9.66 1.94 1.64h1.71c-.05-1.34-.87-2.57-2.49-2.97V5H10.9v1.69c-1.51.32-2.72 1.3-2.72 2.81 0 1.79 1.49 2.69 3.66 3.21 1.95.46 2.34 1.15 2.34 1.87 0 .53-.39 1.39-2.1 1.39-1.6 0-2.23-.72-2.32-1.64H8.04c.1 1.7 1.36 2.66 2.86 2.97V19h2.34v-1.67c1.52-.29 2.72-1.16 2.73-2.77-.01-2.2-1.9-2.96-3.66-3.42z"/>
              </svg>
              <svg className="small-icon" width={12} height={12} fill="white" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z"/>
              </svg>
            </span>
            <p className="title-text">Expense Split</p>
            <p className="percent">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1792 1792" fill="currentColor" height={20} width={20}>
                <path d="M1408 1216q0 26-19 45t-45 19h-896q-26 0-45-19t-19-45 19-45l448-448q19-19 45-19t45 19l448 448q19 19 19 45z" />
              </svg>
              20%
            </p>
          </div>
          <div className="data">
            <p>₹39,500</p>
            <div className="range">
              <div className="fill" />
            </div>
          </div>
        </div>

        {/* Card 2: Expense Tracking */}
        <div className="card">
          <div className="title">
            <span className="icon-tracking">
              <svg width={20} fill="currentColor" height={20} viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path d="M19 3h-4.18C14.4 1.84 13.3 1 12 1c-1.3 0-2.4.84-2.82 2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-7 0c.55 0 1 .45 1 1s-.45 1-1 1-1-.45-1-1 .45-1 1-1zm2 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z"/>
              </svg>
              <svg className="small-icon" width={12} height={12} fill="white" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
              </svg>
            </span>
            <p className="title-text">Expense Tracking</p>
            <p className="percent percent-blue">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1792 1792" fill="currentColor" height={20} width={20}>
                <path d="M1408 1216q0 26-19 45t-45 19h-896q-26 0-45-19t-19-45 19-45l448-448q19-19 45-19t45 19l448 448q19 19 19 45z" />
              </svg>
              15%
            </p>
          </div>
          <div className="data">
            <p>128 Items</p>
            <div className="range">
              <div className="fill fill-blue" />
            </div>
          </div>
        </div>

        {/* Card 3: Expense Settle */}
        <div className="card">
          <div className="title">
            <span className="icon-settle">
              <svg width={20} fill="currentColor" height={20} viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
              </svg>
              <svg className="small-icon" width={12} height={12} fill="white" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path d="M11.8 10.9c-2.27-.59-3-1.2-3-2.15 0-1.09 1.01-1.85 2.7-1.85 1.78 0 2.44.85 2.5 2.1h2.21c-.07-1.72-1.12-3.3-3.21-3.81V3h-3v2.16c-1.94.42-3.5 1.68-3.5 3.61 0 2.31 1.91 3.46 4.7 4.13 2.5.6 3 1.48 3 2.41 0 .69-.49 1.79-2.7 1.79-2.06 0-2.87-.92-2.98-2.1h-2.2c.12 2.19 1.76 3.42 3.68 3.83V21h3v-2.15c1.95-.37 3.5-1.5 3.5-3.55 0-2.84-2.43-3.81-4.7-4.4z"/>
              </svg>
            </span>
            <p className="title-text">Expense Settle</p>
            <p className="percent percent-purple">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1792 1792" fill="currentColor" height={20} width={20}>
                <path d="M1408 1216q0 26-19 45t-45 19h-896q-26 0-45-19t-19-45 19-45l448-448q19-19 45-19t45 19l448 448q19 19 19 45z" />
              </svg>
              85%
            </p>
          </div>
          <div className="data">
            <p>₹28,750</p>
            <div className="range">
              <div className="fill fill-purple" />
            </div>
          </div>
        </div>
      </div>
    </StyledWrapper>
  );
}

const StyledWrapper = styled.div`
  .cards-container {
    display: flex;
    gap: 2rem;
    padding: 2rem;
    max-width: 1400px;
    margin: 0 auto;
    flex-wrap: wrap;
  }

  @media (min-width: 1024px) {
    .cards-container {
      flex-wrap: nowrap;
    }
  }

  .card {
    padding: 1.5rem;
    background: linear-gradient(180deg, #ffffff, #f9f9f9);
    box-shadow: 0 8px 20px rgba(0, 0, 0, 0.08);
    border-radius: 28px;
    font-family: -apple-system, BlinkMacSystemFont, "SF Pro Text",
      "Helvetica Neue", Arial, sans-serif;
    transform: translateY(20px);
    opacity: 0;
    animation: cardFadeUp 0.8s cubic-bezier(0.25, 1, 0.5, 1) forwards;
  }

  .card:nth-child(2) {
    animation-delay: 0.15s;
  }

  .card:nth-child(3) {
    animation-delay: 0.3s;
  }

  .card:hover {
    transform: translateY(-6px);
    box-shadow: 0 16px 32px rgba(0, 0, 0, 0.12);
    transition:
      transform 0.45s ease,
      box-shadow 0.45s ease;
  }

  .title {
    display: flex;
    align-items: center;
  }

  .title span {
    position: relative;
    padding: 0.6rem;
    width: 1.6rem;
    height: 1.6rem;
    border-radius: 50%;
    animation: pulse 2.4s ease-in-out infinite;
  }

  .icon-split {
    background: linear-gradient(135deg, #34d399, #10b981);
    box-shadow: 0 3px 8px rgba(16, 185, 129, 0.35);
  }

  .icon-tracking {
    background: linear-gradient(135deg, #34d399, #10b981);
    box-shadow: 0 3px 8px rgba(16, 185, 129, 0.35);
  }

  .icon-settle {
    background: linear-gradient(135deg, #34d399, #10b981);
    box-shadow: 0 3px 8px rgba(16, 185, 129, 0.35);
  }

  .title span svg {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    color: #ffffff;
    height: 1rem;
  }

  .small-icon {
    position: absolute !important;
    bottom: -2px !important;
    right: -2px !important;
    background: rgba(0, 0, 0, 0.3);
    border-radius: 50%;
    padding: 2px;
    width: 16px !important;
    height: 16px !important;
    transform: none !important;
    top: auto !important;
    left: auto !important;
  }

  .title-text {
    margin-left: 0.75rem;
    color: #1c1c1e;
    font-size: 19px;
    font-weight: 600;
    letter-spacing: -0.02em;
  }

  .percent {
    margin-left: auto;
    color: #0a7c36;
    font-weight: 600;
    display: flex;
    align-items: center;
    font-size: 15px;
  }

  .percent-blue {
    color: #0a7c36;
  }

  .percent-purple {
    color: #0a7c36;
  }

  .data {
    display: flex;
    flex-direction: column;
    justify-content: flex-start;
  }

  .data p {
    margin-top: 1.25rem;
    margin-bottom: 1.25rem;
    color: #111827;
    font-size: 2.4rem;
    line-height: 2.7rem;
    font-weight: 700;
    text-align: left;
    letter-spacing: -0.03em;
    opacity: 0;
    animation: fadeIn 0.8s ease forwards 0.3s;
  }

  .data .range {
    position: relative;
    background-color: #e5e5ea;
    width: 100%;
    height: 0.55rem;
    border-radius: 9999px;
    overflow: hidden;
  }

  .data .range .fill {
    position: absolute;
    top: 0;
    left: 0;
    background: linear-gradient(90deg, #34d399, #10b981);
    width: 0%;
    height: 100%;
    border-radius: inherit;
    box-shadow: inset 0 1px 2px rgba(0, 0, 0, 0.15);
    animation:
      fillBar 1.6s ease forwards 0.5s,
      pulseFill 4s ease-in-out infinite 2.2s;
  }

  .fill-blue {
    background: linear-gradient(90deg, #34d399, #10b981) !important;
    animation:
      fillBar2 1.6s ease forwards 0.65s,
      pulseFill 4s ease-in-out infinite 2.35s !important;
  }

  .fill-purple {
    background: linear-gradient(90deg, #34d399, #10b981) !important;
    animation:
      fillBar3 1.6s ease forwards 0.8s,
      pulseFill 4s ease-in-out infinite 2.5s !important;
  }

  /* ✨ Animations */
  @keyframes cardFadeUp {
    from {
      transform: translateY(20px);
      opacity: 0;
    }
    to {
      transform: translateY(0);
      opacity: 1;
    }
  }

  @keyframes fadeIn {
    from {
      opacity: 0;
      transform: translateY(6px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  @keyframes fillBar {
    from {
      width: 0%;
    }
    to {
      width: 76%;
    }
  }

  @keyframes fillBar2 {
    from {
      width: 0%;
    }
    to {
      width: 62%;
    }
  }

  @keyframes fillBar3 {
    from {
      width: 0%;
    }
    to {
      width: 85%;
    }
  }

  @keyframes pulseFill {
    0%,
    100% {
      filter: brightness(1);
    }
    50% {
      filter: brightness(1.2);
    }
  }

  @keyframes pulse {
    0%,
    100% {
      transform: scale(1);
    }
    50% {
      transform: scale(1.08);
    }
  }

  @media (max-width: 768px) {
    .cards-container {
      grid-template-columns: 1fr;
    }
  }
`;

export default ExpenseCards;