import React, { useState, useEffect, useRef } from "react";
import "../dashboard.css";
import parkingInactiveIcon from "../assets/icons/parkinginactive.png";
import parkingActiveIcon from "../assets/icons/parkingactive.png";
import checkEngineInactiveIcon from "../assets/icons/checkengineinactive.png";
import checkEngineActiveIcon from "../assets/icons/checkengineactive.png";
import motorActiveIcon from "../assets/icons/motoractive.png";
import motorInactiveIcon from "../assets/icons/motorinactive.png";
import batteryActiveIcon from "../assets/icons/batteryactive.png";
import batteryInactiveIcon from "../assets/icons/batteryinactive.png";
import DashboardBottom from "./DashboardBottom";
import menuIcon from "../assets/icons/menu.png";
import chargerIcon from "../assets/icons/charger.png";
import { GaugeComponent } from "react-gauge-component";
import axios from "axios";

const Dashboard = () => {
  const [indicators, setIndicators] = useState([]);
  const [motorData, setMotorData] = useState({});
  const [sliderValue, setSliderValue] = useState(0);
  const [isCharging, setIsCharging] = useState(false);
  const [isSliderDisabled, setIsSliderDisabled] = useState(false);
  const intervalRef = useRef(null);
  const apiBaseUrl = process.env.REACT_APP_API_BASE_URL;
 
  useEffect(() => {
    fetchIndicatorsData();
    fetchMotorData();
  }, []);

  useEffect(() => {
    setIndicators((prevIndicators) =>
      prevIndicators.map((indicator) => {
        if (indicator.name === "Motor") {
          const updatedStatus = motorData.rpm >= 700 ? 1 : 0; 
          return { ...indicator, status: updatedStatus };
        }
        if (indicator.name === "Battery Low") {
          const updatedStatus = motorData.battery_percentage <= 10 ? 1 : 0; 
          return { ...indicator, status: updatedStatus };
        }
        if (indicator.name === "Parking Brake") {
          const updatedStatus = motorData.rpm === 0 ? 1 : 0;
          return { ...indicator, status: updatedStatus };
        }
        if (indicator.name === "Check Engine") {
          const updatedStatus = motorData.rpm === 1000 ? 1 : 0;
          return { ...indicator, status: updatedStatus };
        }
        return indicator;
      })
    );
  }, [motorData.rpm, motorData.battery_percentage]); 

  useEffect(() => {
    const updateIndicatorsInDatabase = async () => {
      try {
        for (let indicator of indicators) {
          
          await axios.put(
            `${apiBaseUrl}/indicators/id/${indicator.id}`,
            {
              status: indicator.status,
            }
          );
        }
      } catch (error) {
        console.error("Error updating indicators in the database", error);
      }
    };

    if (indicators.length > 0) {
      updateIndicatorsInDatabase();
    }
  }, [indicators]);

  useEffect(() => {
    if (motorData.battery_percentage === 0) {
      setSliderValue(0); 
      setIsSliderDisabled(true);
    }
  }, [motorData.battery_percentage]);

  const getIcon = (name, status) => {
    switch (name) {
      case "Parking Brake":
        return status ? parkingActiveIcon : parkingInactiveIcon;
      case "Check Engine":
        return status ? checkEngineActiveIcon : checkEngineInactiveIcon;
      case "Motor":
        return status ? motorActiveIcon : motorInactiveIcon;
      case "Battery Low":
        return status ? batteryInactiveIcon : batteryActiveIcon;
      default:
        return null;
    }
  };

  // Fetch indicators data from the database
  const fetchIndicatorsData = async () => {
    try {
      const response = await axios.get(`${apiBaseUrl}/indicators`);
      setIndicators(JSON.parse(response.data.body));
      console.log('response is '+response.data.body);
    } catch (error) {
      console.error("Error fetching indicators data", error);
    }
  };

  const fetchMotorData = async () => {
    try {
      const response = await axios.get(`${apiBaseUrl}/motor-data`);
      const motorData = JSON.parse(response.data.body);

      setMotorData(motorData);
      setIsCharging(motorData.charging_state);

      setIndicators((prevIndicators) =>
        prevIndicators.map((indicator) =>
          indicator.name === "Battery Low"
            ? {
                ...indicator,
                status: motorData.battery_percentage <= 10 ? 1 : 0,
              }
            : indicator
        )
      );
    } catch (error) {
      console.error("Error fetching motor data:", error);
    }
  };

  const toggleChargingState = async () => {
    const newChargingState = !isCharging;
    setIsCharging(newChargingState);

    try {
      await axios.put(`${apiBaseUrl}/charging-state`, {
        charging_state: newChargingState ? 1 : 0,
      });

      if (newChargingState) {
        setSliderValue(0);
        setIsSliderDisabled(true);

        updateMotorSpeed(0);
        incrementBatteryPercentage(newChargingState);
      } else {
        clearInterval(intervalRef.current);
        updatePowerForCharge();
        setIsSliderDisabled(false);
      }
    } catch (error) {
      console.error("Error toggling charging state:", error);
    }
  };

  const incrementBatteryPercentage = (newChargingState) => {

    clearInterval(intervalRef.current);

    
    if (newChargingState) {
      axios
        .put(`${apiBaseUrl}/motor-data`, {
          battery_percentage: motorData.battery_percentage,
          battery_temperature: motorData.battery_temperature,
          power_consumption: 0,
        })
        .then(() => {
    
          setMotorData((prevData) => ({
            ...prevData,
            power_consumption: 0,
          }));
        })
        .catch((error) => {
          console.error("Error initializing power consumption:", error);
        });

   
      intervalRef.current = setInterval(() => {
        setMotorData((prevData) => {
          if (prevData.battery_percentage < 100 && newChargingState) {
            const newBatteryPercentage = prevData.battery_percentage + 1;
            const newPowerConsumption = prevData.power_consumption - 20;

          
            axios
              .put(`${apiBaseUrl}/motor-data`, {
                battery_percentage: newBatteryPercentage,
                battery_temperature: prevData.battery_temperature, 
                power_consumption: newPowerConsumption,
              })
              .catch((error) => {
                console.error("Error updating motor data:", error);
              });

            return {
              ...prevData,
              battery_percentage: newBatteryPercentage,
              battery_temperature: 0, 
              power_consumption: newPowerConsumption,
            };
          } else {
            clearInterval(intervalRef.current);

            axios
              .put(`${apiBaseUrl}/motor-data`, {
                battery_percentage: prevData.battery_percentage,
                battery_temperature: 0,
                power_consumption: 0,
              })
              .catch((error) => {
                console.error("Error resetting motor data:", error);
              });

            return {
              ...prevData,
              battery_temperature: 0,
              power_consumption: 0,
            };
          }
        });
      }, 1000);
    }
  };

  const updatePowerForCharge = () => {
    
    intervalRef.current = setInterval(() => {
      setMotorData((prevData) => {
       
        axios
          .put(`${apiBaseUrl}/motor-data`, {
            battery_percentage: prevData.battery_percentage,
            battery_temperature: 0,
            power_consumption: 0,
          })
          .catch((error) => {
            console.error("Error updating motor data:", error);
          });

        return {
          ...prevData,
          battery_percentage: prevData.battery_percentage,
          battery_temperature: 0, 
          power_consumption: 0,
        };
      });
    });
  };

  const decrementBatteryPercentage = (value) => {
    clearInterval(intervalRef.current);

    intervalRef.current = setInterval(() => {
      setMotorData((prevData) => {
        if (prevData.battery_percentage > 0 && value > 0) {
          const newBatteryPercentage = prevData.battery_percentage - 1;

          const newBatteryTemperature =
            newBatteryPercentage > 0
              ? Math.min(prevData.battery_temperature + 1, 100)
              : 0;

          axios
            .put(`${apiBaseUrl}/motor-data`, {
              battery_percentage: newBatteryPercentage,
              battery_temperature: newBatteryTemperature,
              power_consumption: prevData.power_consumption,
            })
            .catch((error) => {
              console.error(
                "Error updating battery percentage and temperature:",
                error
              );
            });

          if (newBatteryPercentage === 0) {
            setSliderValue(0);
            updateMotorPower(0);
            updateMotorSpeed(0);
            setIsSliderDisabled(true); 
          }

          return {
            ...prevData,
            battery_percentage: newBatteryPercentage,
            battery_temperature: newBatteryTemperature,
            power_consumption: prevData.power_consumption,
          };
        } else {
         

          axios
            .put(`${apiBaseUrl}/motor-data`, {
              battery_percentage: prevData.battery_percentage,
              battery_temperature: 0,
              power_consumption: 0,
            })
            .catch((error) => {
              console.error("Error resetting battery temperature to 0:", error);
            });
          if (motorData.battery_percentage === 0) {
            setIsSliderDisabled(true);
          }

          return {
            ...prevData,
            battery_temperature: 0,
            power_consumption: 0,
          };
        }
      });
    }, 1000);
  };

  const handleSliderChange = (value) => {
    const rpm = value * 250; 
    const powerConsumption = value * 100; 

    updateMotorSpeed(rpm); 
    updateMotorPower(powerConsumption);
    decrementBatteryPercentage(value); 

    setSliderValue(value); 
  };

  const updateMotorSpeed = async (rpm) => {
    try {
      await axios.put(`${apiBaseUrl}/motor-speed`, { rpm });
      setMotorData((prevData) => ({ ...prevData, rpm })); 
    } catch (error) {
      console.error("Error updating motor speed:", error);
    }
  };

  const updateMotorPower = async (powerConsumption) => {
    try {
      await axios.put(`${apiBaseUrl}/motor-power`, {
        powerConsumption,
      });
      setMotorData((prevData) => ({ ...prevData, powerConsumption }));
      await fetchMotorData();
    } catch (error) {
      console.error("Error updating motor power consumption:", error);
    }
  };

  useEffect(() => {
    return () => clearInterval(intervalRef.current);
  }, []);

  return (
    <div className="dashboard">
      <h3>
        This app is created by Sai Sandeep Ponna. Contact me at
        ponnasaisandeep@gmail.com, Mobile: (506) 898-3190
      </h3>
      {/* Top Row: Indicators */}
      <div className="top-row">
        {indicators.map((indicator) => (
          <div key={indicator.name}>
            <img
              src={getIcon(indicator.name, indicator.status)}
              alt={`${indicator.name} Icon`}
              className="icon"
            />
            <p>{indicator.status ? "Active" : "Inactive"}</p>
          </div>
        ))}
      </div>

      {/* Gauges Section */}

      {/* Power Gauge */}
      <div className="gauges-section">
        <GaugeComponent
          minValue={-1000}
          maxValue={1000}
          value={motorData.power_consumption || 0}
          arc={{
            subArcs: [
              { limit: -750, color: "#EA4228", showTick: true },
              { limit: -500, color: "#EA4298", showTick: true },
              { limit: -250, color: "#F58B19", showTick: true },
              { limit: 250, color: "#F5CD19", showTick: true },
              { limit: 500, color: "#F58B19", showTick: true },
              { limit: 750, color: "#5BE12C", showTick: true },
              { limit: 1000, color: "#5BE1AC", showTick: true },
            ],
          }}
          labels={{
            valueLabel: { formatTextValue: (value) => value + " kW" },
            step: 250,
          }}
        />

        {/* Motor RPM Gauge */}
        <GaugeComponent
          minValue={0}
          maxValue={1000}
          value={motorData.rpm || 0}
          arc={{
            subArcs: [
              { limit: 250, color: "#F5CD19", showTick: true },
              { limit: 500, color: "#F58B19", showTick: true },
              { limit: 750, color: "#5BE12C", showTick: true },
              { limit: 1000, color: "#5BE1AC", showTick: true },
            ],
          }}
          labels={{
            valueLabel: { formatTextValue: (value) => value + " RPM" },
            step: 250,
          }}
        />
      </div>

      <div className="dashboard-container">
        <DashboardBottom motorData={motorData} />
        <div className="slider-section">
          <h3>Motor Speed Setting</h3>
          <input
            type="range"
            min="0"
            max="4"
            step="1"
            className="slider"
            value={sliderValue}
            onChange={(e) => setSliderValue(Number(e.target.value))}
            onMouseUp={() => handleSliderChange(sliderValue)}
            disabled={isSliderDisabled}
          />
          <div className="slider-labels">
            <span>OFF</span>
            <span>1</span>
            <span>2</span>
            <span>3</span>
            <span>4</span>
          </div>
        </div>
      </div>

      <div className="dashboard-container">
        <DashboardBottom motorData={[]} />
        <span>
          <img src={menuIcon} alt={`Menu Icon`} className="icon" />
        </span>
        <span className="menu">
          <img src={chargerIcon} alt={`Charger Icon`} className="icon" />
          <button onClick={toggleChargingState}>
            <p>{isCharging ? "Charging" : "Not Charging"}</p>
          </button>
        </span>
      </div>
    </div>
  );
};

export default Dashboard;