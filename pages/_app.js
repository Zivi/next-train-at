import Head from 'next/head';
import React, { useEffect, useState } from 'react';
import { isWeekend, differenceInMinutes, set } from 'date-fns';
import './styles.css';

/*
  Next items
  2. CSS enhancements
  3. Unit tests

*/
let stopsList = [];
let originStationId = null;
let destinationStationId = null;

export default function Home() {
  const [origin, setOrigin] = useState(null);
  const [destination, setDestination] = useState(null);
  const [route, setRoute] = useState(null);
  const [moreRoutesList, setMoreRoutesList] = useState([]);

  useEffect(() => {
    if (origin && destination) {
      displayRoute();
    }
  }, [origin, destination]);

  function updateOrigin({ currentTarget: { value: name, selectedIndex: index } }) {
    setOrigin({ name, index });
  }

  function updateDestination({ currentTarget: { value: name, selectedIndex: index } }) {
    setDestination({ name, index });
  }

  function stopTimeToNum(stopTime) {
    const hour = +stopTime.slice(0, 2);
    const minute = +stopTime.slice(3, 5);
    return hour * 60 + minute;
  }

  let stopTimes = null;
  async function displayRoute() {
    if (!stopTimes) {
      stopTimes = await fetch('./stopTimes.json')
        .then(response => response.json());
    }

    if (origin.index === destination.index) {
      setRoute({ ...route, trainNumber: null });
      return;
    }

    const isThisAWeekend = isWeekend(new Date());

    if (origin.index > destination.index) {
      // Northbound
      stopsList = stopTimes.filter((stopTime) => {
        if (isThisAWeekend) {
          return stopTime.trip_id % 2 === 1 && String(stopTime.trip_id)[0] === '2';
        } else {
          return stopTime.trip_id % 2 === 1 && String(stopTime.trip_id)[0] !== '2';
        }
      }).sort((a, b) => {
        return stopTimeToNum(a.arrival_time) - stopTimeToNum(b.arrival_time);
      })

      let northBoundStations = await fetch('./northStations.json')
        .then(response => response.json());

      northBoundStations.forEach(station => {
        if (origin.name === station.stop_name && station.stop_id % 2 === 1) {
          originStationId = station.stop_id;
        } else if (destination.name === station.stop_name && station.stop_id % 2 === 1) {
          destinationStationId = station.stop_id;
        }
      })
      parseRoute(stopsList, originStationId, destinationStationId);
      return;
    }
    if (origin.index < destination.index) {
      // Southbound
      stopsList = stopTimes.filter((stopTime) => {
        if (isThisAWeekend) {
          return stopTime.trip_id % 2 === 0 && String(stopTime.trip_id)[0] === '2';
        } else {
          return stopTime.trip_id % 2 === 0 && String(stopTime.trip_id)[0] !== '2';
        }
      }).sort((a, b) => {
        return stopTimeToNum(a.arrival_time) - stopTimeToNum(b.arrival_time);
      })

      let southBoundStations = await fetch('./southStations.json')
        .then(response => response.json());

      southBoundStations.forEach(station => {
        if (origin.name === station.stop_name && station.stop_id % 2 === 0) {
          originStationId = station.stop_id;
        } else if (destination.name === station.stop_name && station.stop_id % 2 === 0) {
          destinationStationId = station.stop_id;
        }
      })
      parseRoute(stopsList, originStationId, destinationStationId);
      return;
    }
  }

  function parseRoute(stops, originStation, destinationStation) {
    const currentTime = new Date();
    let newRoute = {};

    for (let i = 0; i < stops.length; i += 1) {
      let departureTime = set(currentTime, {
        hours: parseInt(stops[i].arrival_time[0] + stops[i].arrival_time[1]),
        minutes: parseInt(stops[i].arrival_time[3] + stops[i].arrival_time[4]),
        seconds: parseInt(stops[i].arrival_time[6] + stops[i].arrival_time[7])
      });
      if (stops[i].stop_id === originStation && departureTime > currentTime) {
        let remainingTime = differenceInMinutes(departureTime, currentTime);
        newRoute = {
          trainNumber: stops[i].trip_id,
          originTime: stops[i].arrival_time,
          remainingTime: remainingTime
        }

        // loop to find matching destination
        for (let j = i + 1; j < stops.length; j += 1) {
          if (stops[j].stop_id === destinationStation && departureTime > currentTime && stops[j].trip_id === newRoute.trainNumber) {
            let arrivalTime = set(currentTime, {
              hours: parseInt(stopsList[j].arrival_time[0] + stopsList[j].arrival_time[1]),
              minutes: parseInt(stopsList[j].arrival_time[3] + stopsList[j].arrival_time[4]),
              seconds: parseInt(stopsList[j].arrival_time[6] + stopsList[j].arrival_time[7])
            });
            let routeDuration = differenceInMinutes(arrivalTime, departureTime);
            newRoute = { ...newRoute, destinationTime: stops[j].arrival_time, duration: routeDuration };
            setRoute(newRoute);
            break;
          }
        }
        if (newRoute.destinationTime) break;
      }
    }
  }

  function changeDirection() {
    setOrigin(destination);
    setDestination(origin);
    setMoreRoutesList([]);
  }

  function handleShowMore() {
    const currentTime = new Date();
    const routeDepartureTime = set(currentTime, {
      hours: parseInt(route.originTime[0] + route.originTime[1]),
      minutes: parseInt(route.originTime[3] + route.originTime[4]),
      seconds: parseInt(route.originTime[6] + route.originTime[7])
    })

    for (let i = 0; i < stopsList.length; i += 1) {
      let departureTime = set(currentTime, {
        hours: parseInt(stopsList[i].arrival_time[0] + stopsList[i].arrival_time[1]),
        minutes: parseInt(stopsList[i].arrival_time[3] + stopsList[i].arrival_time[4]),
        seconds: parseInt(stopsList[i].arrival_time[6] + stopsList[i].arrival_time[7])
      });

      if (stopsList[i].stop_id === originStationId && departureTime > routeDepartureTime) {
        const newRoute = {
          trainNumber: stopsList[i].trip_id,
          originTime: stopsList[i].arrival_time,
        };

        for (let j = i + 1; j < stopsList.length; j += 1) {
          if (stopsList[j].stop_id === destinationStationId && stopsList[j].trip_id === newRoute.trainNumber) {

            let arrivalTime = set(currentTime, {
              hours: parseInt(stopsList[j].arrival_time[0] + stopsList[j].arrival_time[1]),
              minutes: parseInt(stopsList[j].arrival_time[3] + stopsList[j].arrival_time[4]),
              seconds: parseInt(stopsList[j].arrival_time[6] + stopsList[j].arrival_time[7])
            });
            let routeDuration = differenceInMinutes(arrivalTime, departureTime);

            const newRoute2 = { ...newRoute, destinationTime: stopsList[j].arrival_time, duration: routeDuration };
            setMoreRoutesList(moreRoutesList => [...moreRoutesList, newRoute2]);
            break;
          }
        }
      }
    }
  }

  return (
    <div className="container">
      <Head>
        <title>Timetables</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main>
        <h1 className="title">
          Next Caltrain
        </h1>
        <div className="navigation-section">
          <div className="stations-section">
            <label className="origin-label">Origin:<span> </span>
              <select className="station-select" name="start" onChange={updateOrigin} value={origin ? origin.name : ''}>
                <option value="" disabled>--Departing Station--</option>
                <option value="San Francisco Caltrain">SF 4th and King</option>
                <option value="22nd Street Caltrain">SF 22nd</option>
                <option value="Bayshore Caltrain">Bayshore</option>
                <option value="South San Francisco Caltrain">South SF</option>
                <option value="San Bruno Caltrain">San Bruno</option>
                <option value="Millbrae Caltrain">Millbrae</option>
                <option value="Broadway Caltrain">Broadway</option>
                <option value="Burlingame Caltrain">Burlingame</option>
                <option value="San Mateo Caltrain">San Mateo</option>
                <option value="Hayward Park Caltrain">Hayward Park</option>
                <option value="Hillsdale Caltrain">Hillsdale</option>
                <option value="Belmont Caltrain">Belmont</option>
                <option value="San Carlos Caltrain">San Carlos</option>
                <option value="Redwood City Caltrain">Redwood City</option>
                <option value="Menlo Park Caltrain">Menlo Park</option>
                <option value="Palo Alto Caltrain">Palo Alto</option>
                <option value="California Ave Calrain">California Ave</option>
                <option value="San Antonio Caltrain">San Antonio</option>
                <option value="Mountain View Caltrain">Mountain View</option>
                <option value="Sunnyvale Caltrain">Sunnyvale</option>
                <option value="Lawrence Caltrain">Lawrence</option>
                <option value="Santa Clara Caltrain">Santa Clara</option>
                <option value="College Park Caltrain">College Park</option>
                <option value="San Jose Diridon Caltrain">San Jose Diridon</option>
                <option value="Tamien Caltrain">Tamien</option>
                <option value="Capitol Caltrain">Capitol</option>
                <option value="Blossom Hill Caltrain">Blossom Hill</option>
                <option value="Morgan Hill Caltrain">Morgan Hill</option>
                <option value="San Martin Calrain">San Martin</option>
                <option value="Gilroy Caltrain">Gilroy</option>
              </select>
            </label>

            <label>Destination:<span> </span>


            <select className="station-select" name="destination" onChange={updateDestination} value={destination ? destination.name : ''}>
              <option value="" disabled>--Arriving Station--</option>
              <option value="San Francisco Caltrain">SF 4th and King</option>
              <option value="22nd Street Caltrain">SF 22nd</option>
              <option value="Bayshore Caltrain">Bayshore</option>
              <option value="South San Francisco Caltrain">South SF</option>
              <option value="San Bruno Caltrain">San Bruno</option>
              <option value="Millbrae Caltrain">Millbrae</option>
              <option value="Broadway Caltrain">Broadway</option>
              <option value="Burlingame Caltrain">Burlingame</option>
              <option value="San Mateo Caltrain">San Mateo</option>
              <option value="Hayward Park Caltrain">Hayward Park</option>
              <option value="Hillsdale Caltrain">Hillsdale</option>
              <option value="Belmont Caltrain">Belmont</option>
              <option value="San Carlos Caltrain">San Carlos</option>
              <option value="Redwood City Caltrain">Redwood City</option>
              <option value="Menlo Park Caltrain">Menlo Park</option>
              <option value="Palo Alto Caltrain">Palo Alto</option>
              <option value="California Ave Calrain">California Ave</option>
              <option value="San Antonio Caltrain">San Antonio</option>
              <option value="Mountain View Caltrain">Mountain View</option>
              <option value="Sunnyvale Caltrain">Sunnyvale</option>
              <option value="Lawrence Caltrain">Lawrence</option>
              <option value="Santa Clara Caltrain">Santa Clara</option>
              <option value="College Park Caltrain">College Park</option>
              <option value="San Jose Diridon Caltrain">San Jose Diridon</option>
              <option value="Tamien Caltrain">Tamien</option>
              <option value="Capitol Caltrain">Capitol</option>
              <option value="Blossom Hill Caltrain">Blossom Hill</option>
              <option value="Morgan Hill Caltrain">Morgan Hill</option>
              <option value="San Martin Calrain">San Martin</option>
              <option value="Gilroy Caltrain">Gilroy</option>
            </select>
            </label>
          </div>
          <button className="direction-switcher" aria-label="switch direction" onClick={changeDirection}>
            <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 0 24 24" width="24px" fill="#000000"><path d="M0 0h24v24H0z" fill="none"/><path d="M16 17.01V10h-2v7.01h-3L15 21l4-3.99h-3zM9 3L5 6.99h3V14h2V6.99h3L9 3z"/></svg>
          </button>
        </div>

        {route && route.trainNumber && route.originTime && route.destinationTime &&
          <>
            <div className="next-train-section">
              <div>Next Train #{route.trainNumber}</div>
              <div>Departing <b>{origin.name.replace(' Caltrain', '')}</b> at <b>{route.originTime.replace(/:00$/, '')}</b> in <b>{route.remainingTime} minutes</b></div>
              <div>Arriving <b>{destination.name.replace(' Caltrain', '')}</b> at <b>{route.destinationTime.replace(/:00$/, '')}</b></div>
              <div>Trip duration: {route.duration} min</div>
              {moreRoutesList.length === 0 && <button className="show-more-trains-btn" onClick={handleShowMore}>Show More Trains</button>}
            </div>
          </>
        }
        {moreRoutesList.length > 0 &&
          <>
            <h2>Later Trains</h2>
            <table className="timetable">
              <thead>
                <tr>
                  <td>Train</td>
                  <td>{origin.name.replace(' Caltrain', '')}</td>
                  <td>{destination.name.replace(' Caltrain', '')}</td>
                  <td>Duration</td>
                </tr>
              </thead>
              <tbody>
                {moreRoutesList.map((route) =>
                  <tr key={route.trainNumber}>
                    <td className="train-number"># {route.trainNumber}</td>
                    <td>{route.originTime.replace(/:00$/, '')}</td>
                    <td>{route.destinationTime.replace(/:00$/, '')}</td>
                    <td>{route.duration} min</td>
                  </tr>
                )}
              </tbody>
            </table>
          </>
        }
        {route && (!route.trainNumber || !route.destinationTime || !route.originTime) &&
          <>
            <div>No trains match your request</div>
          </>
        }
      </main>
      <footer>
        <div>Made with 🚂 by Zivi Weinstock</div>
      </footer>
    </div>
  )
}

// credits: <a href="http://www.onlinewebfonts.com">online Web Fonts</a>
