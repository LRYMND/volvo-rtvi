import {
  useEffect,
  useState,
} from 'react'

//import { GooSpinner } from 'react-spinners-kit';

import { io } from "socket.io-client";

import Carplay from '../../carplay/Carplay'

import NavBar from '../../sidebars/NavBar';
import TopBar from '../../sidebars/TopBar';
import DashBar from '../../sidebars/DashBar';
import Swiper from '../swiper/Swiper';
import Settings from '../settings/Settings';
//import Volvo from '../volvo/Volvo';

import "./../../../themes.scss"
import './home.scss';

const settingsChannel = io("ws://localhost:4001/settings")
const versionNumber = "2.0"


const Home = () => {

  // Application state variables
  const [view, setView] = useState('Dashboard')
  const [applicationSettings, setApplicationSettings] = useState(null)
  const [canbusSettings, setCanbusSettings] = useState(null)
  const [startedUp, setStartedUp] = useState(false);

  // Interface state variables
  const [showNavBar, setShowNavBar] = useState(true);
  const [showTopBar, setShowTopBar] = useState(true);
  const [showOsd, setShowOsd] = useState(true);

  // Connection state variables
  const [wifiState, setWifiState] = useState(false);
  const [phoneState, setPhoneState] = useState(false);

  // Carplay state variables


  //Network state variables
  const [carData, setCarData] = useState({})




  useEffect(() => {
    // Initial request for settings when component mounts
    settingsChannel.emit("requestSettings", "application");
    settingsChannel.emit("requestSettings", "canbus");
  }, []);

  useEffect(() => {
    // Event listener for receiving settings data
    const handleApplicationSettings = (data) => {
      console.log("Data received from socket:", data);
      setApplicationSettings(data);
    };

    const handleCanbusSettings = (data) => {
      console.log("Data received from socket:", data);
      setCanbusSettings(data);
    };

    settingsChannel.on("application", handleApplicationSettings);
    settingsChannel.on("canbus", handleCanbusSettings);

    // Cleanup function for removing the event listener when the component is unmounted
    return () => {
      settingsChannel.off("application", handleApplicationSettings);
      settingsChannel.off("canbus", handleCanbusSettings);
    };
  });


  useEffect(() => {
    console.log("Updating application-settings");
    if (applicationSettings != null) {
      setStartedUp(true);
      console.log("Settings loaded.")
    }
  }, [applicationSettings])

  useEffect(() => {
    console.log("Updating canbus-settings");
    if (canbusSettings != null) {
      console.log("Settings loaded.")
    }
  }, [canbusSettings])


  const updateCardata = (args) => {
    if (args != null) {
      Object.keys(canbusSettings.messages).forEach((key) => {
        const message = canbusSettings.messages[key];
        const rtviId = message.rtvi_id;

        if (args.includes(rtviId)) {
          const value = args.replace(rtviId, "");
          setCarData((prevState) => ({ ...prevState, [key]: Number(value).toFixed(2) }));
        }
      });
    }
  };



  /*
  useEffect(() => {
    console.log("streaming: ", receivingVideo)
    console.log("phoneState: ", isPlugged)
    console.log("view: ", view)

    if (receivingVideo && isPlugged && (view === 'Carplay')) {
      setShowTopBar(false);
      setShowNavBar(false);
      if (applicationSettings.interface.activateOSD)
        setShowOsd(true);
    } else {
      setShowTopBar(true);
      setShowNavBar(true);
      setShowOsd(false);
    }
  }, [receivingVideo, isPlugged, view, applicationSettings]);
*/

  function leaveCarplay() {
    setView('Dashboard')
  }


  const template = () => {
    return null;
  }



  const renderView = () => {
    switch (view) {
      case 'Carplay':
        return (
          <div className='container'>
            {showOsd &&
              <DashBar
                className='dashbar'
                canbusSettings={canbusSettings}
                applicationSettings={applicationSettings}
                carData={carData}
                phoneState={phoneState}
                wifiState={wifiState}
                setView={setView}
              />
            }
            <Carplay/>
          </div >
        )

      case 'Dashboard':
        return (
          <Swiper
            canbusSettings={canbusSettings}
            applicationSettings={applicationSettings}
            carData={carData}
          />
        )

      case 'Settings':
        return (
          <Settings
            canbusSettings={canbusSettings}
            applicationSettings={applicationSettings}
            setApplicationSettings={setApplicationSettings}
            versionNumber={versionNumber}
          />
        )

      case 'Volvo':
        return (
          {/* 
          <Volvo
            userSettings={userSettings}
          />
          */}
        )

      case 'Template':
        return (
          <></>
        )

      default:
        return (
          <Swiper
            canbusSettings={canbusSettings}
            applicationSettings={applicationSettings}
            carData={carData}
          />
        )

    }
  }


  return (
    <>


      {startedUp ?
        <div className='container'>
          {showTopBar &&
            <TopBar
              className='topbar'
              applicationSettings={applicationSettings}
              wifiState={wifiState}
              phoneState={phoneState}
            />
          }

          {renderView()}

          {showNavBar &&
            <NavBar
              className='navbar'
              applicationSettings={applicationSettings}
              view={view}
              setView={setView}
            />
          }
        </div>
        : <></>}

      {/*
      {startedUp ?
        <div className='container'>
          {showTop &&
            <TopBar
              className='topbar'
              userSettings={userSettings}
              wifiState={wifiState}
              phoneState={phoneState}
            />
          }

          {renderView()}

          {showNav &&
            <NavBar
              className='navbar'
              userSettings={userSettings}
              view={view}
              setView={setView}
            />
          }
        </div>
        :
        <div className='refresh'>
          <button className='refresh__button' type='button' onClick={reloadApp}>
            <h1>RTVI</h1>
          </button>
          <span className='refresh__version'>v{versionNumber}</span>
        </div>}
        */}
    </>
  );
};


export default Home;
