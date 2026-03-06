import React from "react";
import { useNavigate } from "react-router-dom";

const Focus = () => {
  const navigate = useNavigate();
  return (
    <div>
      <div>
        <button
          className="w-10 absolute px-4 pt-10"
          onClick={() => navigate(-1)}
        >
          back
        </button>
      </div>
      <main className="start-app-shell">
        <section className="start-phone-frame">
          <header className="start-focus-header">
            <div className="focus-icon">
              <ion-icon name="lock-closed-outline"></ion-icon>
            </div>
            <h2>Focus Mode</h2>
            <p>Focus on your reading with zero distractions</p>
          </header>

          <section className="start-timer-wrap" aria-live="polite">
            <div className="start-timer-ring" id="startTimerRing">
              <div className="start-timer-inner">
                <span id="startTimer">07:30</span>
                <span className="status">Focus Mode Active</span>
              </div>
            </div>
          </section>

          <section className="session-actions">
            <button type="button" className="mini-action dark" id="pauseBtn">
              <ion-icon name="pause-circle-outline"></ion-icon>
            </button>
            <button type="button" className="mini-action light" id="resetBtn">
              <ion-icon name="reload-outline"></ion-icon>
            </button>
            <button type="button" className="end-btn" id="endBtn">
              End Session
            </button>
          </section>

          <div className="session-toast" id="sessionToast">
            <ion-icon name="checkmark-outline"></ion-icon>Focus Session Started.
            Stay Focused!
          </div>
        </section>
      </main>
    </div>
  );
};

export default Focus;
