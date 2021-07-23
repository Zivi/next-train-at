import Head from 'next/head'
import React, { useEffect, useState } from 'react';
import { set } from 'date-fns'

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

  let northboundTimetable = null;
  let southboundTimetable = null;
  async function displayRoute() {
    if (origin.index === destination.index) {
      setRoute({...route, trainNumber: null});
      return;
    }
    if (origin.index > destination.index) {
      // Northbound
      if (!northboundTimetable) {
        northboundTimetable = await fetch('./northTimetable.json')
          .then(response => response.json());
      }
      parseRoute(northboundTimetable);
      return;
    }
    // Soutbound
    if (!southboundTimetable) {
      southboundTimetable = await fetch('./southTimetable.json')
        .then(response => response.json());
    }
    parseRoute(southboundTimetable);

  }

  function parseRoute(data) {
    const currentTime = new Date();
    let newRoute = {};
    for (let i = 0; i < data.length; i += 1) {
      let departureTime = set(currentTime, {
        hours: parseInt(data[i].arrival_time[0] + data[i].arrival_time[1]),
        minutes: parseInt(data[i].arrival_time[3] + data[i].arrival_time[4]),
        seconds: parseInt(data[i].arrival_time[6] + data[i].arrival_time[7])
      });
      if (data[i].stop_name === origin.name && departureTime > currentTime) {
        newRoute = {
          trainNumber: data[i].trip_id,
          orignTime: data[i].arrival_time
        }
        // check if this train number has the destination as well
      } else if (data[i].stop_name === destination.name && departureTime > currentTime && data[i].trip_id === newRoute.trainNumber) {
        newRoute = { ...newRoute, destinationTime: data[i].arrival_time };
        break;
      }
    }
   // debugger;
    setRoute(newRoute);
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
            <option value="Tramien Caltrain">Tamien</option>
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
            <option value="Tramien Caltrain">Tamien</option>
            <option value="Capitol Caltrain">Capitol</option>
            <option value="Blossom Hill Caltrain">Blossom Hill</option>
            <option value="Morgan Hill Caltrain">Morgan Hill</option>
            <option value="San Martin Calrain">San Martin</option>
            <option value="Gilroy Caltrain">Gilroy</option>
          </select>
        </label>

        {route && route.trainNumber && route.orignTime && route.destinationTime &&
          <>
            <div>trainNumber: {route.trainNumber}</div>
            <div>departing {origin.name} at {route.orignTime}</div>
            <div>arriving at {destination.name} at {route.destinationTime}</div>
          </>
        }
        {route && (!route.trainNumber || !route.destinationTime || !route.orignTime) &&
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
