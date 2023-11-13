import "./../../styles.scss"
import "./../../themes.scss"
import "./dashbar.scss";


const DashBar = ({ canbusSettings, applicationSettings, carData, wifiState, phoneState, setView }) => {

    return (
        <div className={`dashbar ${applicationSettings.app.colorTheme.value}`} style={{ height: `${applicationSettings.interface.heightOSD.value}px`}}>
            <div className="dashbar__dash">
                <div className="dashbar__dash__bar">
                    <h5>{canbusSettings.messages[applicationSettings.dash_bar.value_1.value].label}: {carData[applicationSettings.dash_bar.value_1.value]}{canbusSettings.messages[applicationSettings.dash_bar.value_1.value].unit}</h5>
                </div>

                <div className="dashbar__dash__bar">
                    <h5>{canbusSettings.messages[applicationSettings.dash_bar.value_2.value].label}: {carData[applicationSettings.dash_bar.value_2.value]}{canbusSettings.messages[applicationSettings.dash_bar.value_2.value].unit}</h5>
                </div>

                <div className="dashbar__dash__bar">
                    <h5>{canbusSettings.messages[applicationSettings.dash_bar.value_3.value].label}: {carData[applicationSettings.dash_bar.value_3.value]}{canbusSettings.messages[applicationSettings.dash_bar.value_3.value].unit}</h5>
                </div>
            </div>

            <div className="dashbar__banner">
                <svg className="dashbar__banner__graphic">
                    <use xlinkHref="/svg/volvo-typo.svg#volvo"></use>
                </svg>
            </div>

            <div className="dashbar__info">
                <svg className={`dashbar__icon dashbar__icon--${(wifiState ? "connected" : "disconnected")}`}>
                    <use xlinkHref="/svg/wifi.svg#wifi"></use>
                </svg>

                <svg className={`dashbar__icon dashbar__icon--${'disconnected'}`}>
                    <use xlinkHref="/svg/bluetooth.svg#bluetooth"></use>
                </svg>

                <svg className={`dashbar__icon dashbar__icon--${(phoneState ? "connected" : "disconnected")}`}>
                    <use xlinkHref="/svg/phone.svg#phone"></use>
                </svg>


                <button className='exit-button' type='button' onClick={() => setView('Dashboard')}>
                    <div>EXIT</div>
                </button>
            </div>

            {/*<ProgressBar
                        currentValue={carData[applicationSettings.dash_bar.value_1.value]}
                        maxValue={canbusSettings.messages[applicationSettings.dash_bar.value_1.value].max_value}
                        unit={canbusSettings.messages[applicationSettings.dash_bar.value_1.value].unit}
                        warning={canbusSettings.messages[applicationSettings.dash_bar.value_1.value].limit_start}
                        progressColor={fillActive}
                        fillColor={sectionColor}
                        backgroundColor={fillInactive}
                        textColor={textColor}
                        theme={applicationSettings.app.colorTheme.value} />*/}


        </div>
    );
};


export default DashBar;