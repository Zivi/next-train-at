import Head from 'next/head';
import React, { useEffect, useState } from 'react';
import { set } from 'date-fns';
import { isWeekend } from 'date-fns';

export default function Home() {
  const [origin, setOrigin] = useState(null);
  const [destination, setDestination] = useState(null);
  const [route, setRoute] = useState(null);

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
      let originStationId = null;
      let destinationStationId = null;
      let northBoundStopTimes = null;
      northBoundStopTimes = stopTimes.filter((stopTime) => {
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
      parseRoute(northBoundStopTimes, originStationId, destinationStationId);
      return;
    }
    if (origin.index < destination.index) {
      // Southbound
      let originStationId = null;
      let destinationStationId = null;
      let southBoundStopTimes = null;
      southBoundStopTimes = stopTimes.filter((stopTime) => {
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
      parseRoute(southBoundStopTimes, originStationId, destinationStationId);
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
        newRoute = {
          trainNumber: stops[i].trip_id,
          originTime: stops[i].arrival_time
        }

        // loop to find matching destination
        for (let j = i + 1; j < stops.length; j += 1) {
          if (stops[j].stop_id === destinationStation && departureTime > currentTime && stops[j].trip_id === newRoute.trainNumber) {
            newRoute = { ...newRoute, destinationTime: stops[j].arrival_time };
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
  }

  return (
    <div className="container">
      <Head>
        <title>Timetables</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main>
        <h1 className="title">
          Find your route
        </h1>
        <label>Choose origin:
          <select name="start" onChange={updateOrigin} value={origin ? origin.name : ''}>
            <option value="" disabled>--Select Departing Station--</option>
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

        <label>Choose destination:
          <select name="destination" onChange={updateDestination} value={destination ? destination.name : ''}>
            <option value="" disabled>--Select Arriving Station--</option>
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
        {origin && destination && <button onClick={changeDirection}>Switch Direction</button>}

        {route && route.trainNumber && route.originTime && route.destinationTime &&
          <>
            <div>trainNumber: {route.trainNumber}</div>
            <div>departing {origin.name} at {route.originTime}</div>
            <div>arriving at {destination.name} at {route.destinationTime}</div>
          </>
        }
        {route && (!route.trainNumber || !route.destinationTime || !route.originTime) &&
          <>
            <div>No trains match your request</div>
          </>
        }
      </main>
      <footer>
        <div>Made with by 🚂 Zivi Weinstock</div>
      </footer>

      <style jsx>{`
        .container {
          min-height: 100vh;
          padding: 0 0.5rem;
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
        }

        main {
          padding: 5rem 0;
          flex: 1;
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
        }

        footer {
          width: 100%;
          height: 100px;
          border-top: 1px solid #eaeaea;
          display: flex;
          justify-content: center;
          align-items: center;
        }

        footer img {
          margin-left: 0.5rem;
        }

        footer a {
          display: flex;
          justify-content: center;
          align-items: center;
        }

        a {
          color: inherit;
          text-decoration: none;
        }

        .title a {
          color: #0070f3;
          text-decoration: none;
        }

        .title a:hover,
        .title a:focus,
        .title a:active {
          text-decoration: underline;
        }

        .title {
          margin: 0;
          line-height: 1.15;
          font-size: 4rem;
        }

        .title,
        .description {
          text-align: center;
        }

        .description {
          line-height: 1.5;
          font-size: 1.5rem;
        }

        code {
          background: #fafafa;
          border-radius: 5px;
          padding: 0.75rem;
          font-size: 1.1rem;
          font-family: Menlo, Monaco, Lucida Console, Liberation Mono,
            DejaVu Sans Mono, Bitstream Vera Sans Mono, Courier New, monospace;
        }

        .grid {
          display: flex;
          align-items: center;
          justify-content: center;
          flex-wrap: wrap;

          max-width: 800px;
          margin-top: 3rem;
        }

        .card {
          margin: 1rem;
          flex-basis: 45%;
          padding: 1.5rem;
          text-align: left;
          color: inherit;
          text-decoration: none;
          border: 1px solid #eaeaea;
          border-radius: 10px;
          transition: color 0.15s ease, border-color 0.15s ease;
        }

        .card:hover,
        .card:focus,
        .card:active {
          color: #0070f3;
          border-color: #0070f3;
        }

        .card h3 {
          margin: 0 0 1rem 0;
          font-size: 1.5rem;
        }

        .card p {
          margin: 0;
          font-size: 1.25rem;
          line-height: 1.5;
        }

        .logo {
          height: 1em;
        }

        @media (max-width: 600px) {
          .grid {
            width: 100%;
            flex-direction: column;
          }
        }
      `}</style>

      <style jsx global>{`
        html,
        body {
          padding: 0;
          margin: 0;
          font-family: -apple-system, BlinkMacSystemFont, Segoe UI, Roboto,
            Oxygen, Ubuntu, Cantarell, Fira Sans, Droid Sans, Helvetica Neue,
            sans-serif;
        }

        * {
          box-sizing: border-box;
        }
      `}</style>
    </div>
  )
}
