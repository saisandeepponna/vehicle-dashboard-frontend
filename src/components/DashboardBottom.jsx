import gearRatioIcon from "../assets/icons/gearratio.png";
import batteryPercentageIcon from "../assets/icons/batterypercentage.png";
import batteryTempIcon from "../assets/icons/batterytemp.png";
import motorRpmIcon from "../assets/icons/motorrpm.png";


const DashboardBottom = ({motorData}) => {
    return(
       <div className="dashboard-bottom">
        <div className="data-card">
          <img
            src={gearRatioIcon} 
            alt={`Gear Ratio Icon`}
            className="icon"
          />
          <p>{motorData.gear_ratio || ''}</p>
        </div>
        <div className="data-card">
          <img
            src={batteryPercentageIcon}
            alt="Battery Percentage Icon"
            className="icon"
            />
          <p>{motorData.battery_percentage || ''}%</p>
        </div>
        <div className="data-card">
          <img 
            src={batteryTempIcon} 
            alt="Battery temp icon"
            className="icon"
          />
          <p>{motorData.battery_temperature || ''}°C</p>
        </div>
        <div className="data-card">
          <img 
            src={motorRpmIcon} 
            alt="Motor RPM Icon"
            className="icon"
          />
          <p>{motorData.rpm || ''} RPM</p>
        </div>
    </div>
    
    )
}
export default DashboardBottom;