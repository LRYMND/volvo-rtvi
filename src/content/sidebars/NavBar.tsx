import React from 'react';

import DashboardIcon from "../../assets/gauge.svg"
import CarplayIcon from "../../assets/carplay.svg"
import SettingsIcon from "../../assets/settings.svg"

import NavBarBackground from "./images/navbar.png"
import "../../themes.scss";
import "./navbar.scss";

const NavBar = ({ userSettings, view, setView }) => {

  function changeView(page) {
    setView(page)
  }


  return (
    <div className={`navbar ${userSettings.app.colorTheme.value}`} style={{ backgroundImage: `url(${NavBarBackground})` }}>


      <button type="button" onClick={() => changeView('Dashboard')}>
        Home
      </button>

      <button type="button" onClick={() => changeView('Carplay')}>
        Carplay
      </button>

      <button type="button" onClick={() => changeView('Settings')}>
        Settings
      </button>

      {/* 
          <IconButton onClick={() => changeView('Dashboard')} style={{ fill: (view === 'Dashboard') ? 'var(--fillActive)' : 'var(--fillInactive)' }}>
            <svg className="navbar__icon">
              <use xlinkHref="./svg/gauge.svg#gauge"></use>
            </svg>
          </IconButton>

          {userSettings.interface.activateMMI.value ?
            <IconButton onClick={() => changeView('Carplay')} style={{ fill: (view === 'Carplay') ? 'var(--fillActive)' : 'var(--fillInactive)' }}>
              <svg className="navbar__icon">
                <use xlinkHref="./svg/carplay.svg#carplay"></use>
              </svg>
            </IconButton>
          : <></>}

          <IconButton onClick={() => changeView('Settings')} style={{ fill: (view === 'Settings') ? 'var(--fillActive)' : 'var(--fillInactive)' }}>
            <svg className="navbar__icon">
              <use xlinkHref="./svg/settings.svg#settings"></use>
            </svg>
          </IconButton>

          */}

      {/*
          <IconButton onClick={() => changeView('Volvo')} style={{ fill: (view === 'Volvo') ? 'var(--fillActive)' : 'var(--fillInactive)' }}>
            <svg className="navbar__icon">
              <use xlinkHref="./svg/car.svg#car"></use>
            </svg>
          </IconButton>
          */}
    </div >
  );
};


export default NavBar;