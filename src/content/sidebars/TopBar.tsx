import React from "react";
import { useState, useEffect, } from "react";

import "./../../themes.scss"
import "./topbar.scss";

const TopBar = ({ applicationSettings, phoneState, wifiState }) => {
  
  const [time, setDate] = useState(new Date());


  function updateTime() {
    setDate(new Date());
  }


  useEffect(() => {
    const timer1 = setInterval(updateTime, 10000);

    return function cleanup() {
      clearInterval(timer1);
    };
  }, []);


  return (
    <div className={`topbar ${applicationSettings.app.colorTheme.value}`}>
      <div className="topbar__info">
        <svg className={`topbar__icon topbar__icon--${(wifiState ? "connected" : "disconnected")}`}>
          <use xlinkHref="./../assets/wifi.svg#wifi"></use>
        </svg>
        <svg className={`topbar__icon topbar__icon--${'disconnected'}`}>
          <use xlinkHref="./../assets/bluetooth.svg#bluetooth"></use>
        </svg>
        <svg className={`topbar__icon topbar__icon--${(phoneState ? "connected" : "disconnected")}`}>
          <use xlinkHref="./../assets/phone.svg#phone"></use>
        </svg>
      </div>
      <div>
        <div className="topbar__banner">
          <svg className="topbar__banner__graphic">
            <use xlinkHref="./../assets/banner.svg#banner"></use>
          </svg>
        </div>
      </div>
      <div className="topbar__time">
        <div className="topbar__time__container">
          <h2>{time.toLocaleTimeString('sv-SV', { hour: '2-digit', minute: '2-digit' })} </h2>
        </div>
      </div>
    </div>

  );
};


export default TopBar;
