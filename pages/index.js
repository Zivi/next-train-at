import Head from 'next/head'
import React, { useEffect, useState } from 'react';
import { isBefore, set } from 'date-fns'

export default function Home() {
  const [origin, setOrigin] = useState({
    name: null,
    index: null
  });

  const [destination, setDestination] = useState({
    name: null,
    index: null
  });

  const [route, setRoute] = useState({
    trainNumber: null,
    orignTime: null,
    destinationTime: null
  })

  useEffect(() => {
    if (origin.name && destination.name) {
      displayRoute();
    }
  }, [origin, destination]);

  function updateOrigin(event) {
    setOrigin({
      name: event.currentTarget.value,
      index: event.currentTarget.selectedIndex
    });
  }

  function updateDestination(event) {
    setDestination({
      name: event.currentTarget.value,
      index: event.currentTarget.selectedIndex
    });
  }

  function displayRoute() {
    // if origin station > destination, search the north timetable
    // if origin station < detination station search the south timetable
    // On the timetable 
    if (origin.index === destination.index) return;
    if (origin.index > destination.index) {
      // add conditional for the weekend after
      fetch('./northTimetable.json')
        .then(response => response.json())
        .then(data => parseRoute(data));
    } else {
      fetch('./southTimetable.json')
        .then(response => response.json())
        .then(data => parseRoute(data));
    }
  }

  function parseRoute(data) {
    // let startIndex;
    // let endIndex;
    const currentTime = new Date();
    let newRouteDetails = {};
    for (let i = 0; i < data.length; i += 1) {
      // if the station names match
      // if the arrival time is after now
      // call setRoute with the trip_id, arrival_time for departing station
      // continue the loop to find the destination station
      // will need to create a new date object where date is today and time is the arrival time
      // 06:10:00 data[i].arrival_time
      let departureTime = set(currentTime, {
        hours: parseInt(data[i].arrival_time[0] + data[i].arrival_time[1]),
        minutes: parseInt(data[i].arrival_time[3] + data[i].arrival_time[4]),
        seconds: parseInt(data[i].arrival_time[6] + data[i].arrival_time[7])
      });
      if (data[i].stop_name === origin.name && departureTime > currentTime) {
        newRouteDetails = {
          trainNumber: data[i].trip_id,
          orignTime: data[i].arrival_time
        }
      } else if (data[i].stop_name === destination.name && departureTime > currentTime) {
        newRouteDetails = { ...newRouteDetails, destinationTime: data[i].arrival_time };
        break;
      }
    }
    setRoute({...route, ...newRouteDetails});
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
        <select name="start" onChange={updateOrigin}>
            <option value="San Francisco Caltrain">SF 4th and King</option>
            <option value="Millbrae Caltrain">Millbrae</option>
            <option value="Redwood City Caltrain">Redwood City</option>
          </select>
        </label>

        <label>Choose destination:
        <select name="destination" onChange={updateDestination}>
            <option value="San Francisco Caltrain">SF 4th and King</option>
            <option value="Millbrae Caltrain">Millbrae</option>
            <option value="Redwood City Caltrain">Redwood City</option>
          </select>
        </label>

        <div>trainNumber: {route.trainNumber}</div>
        <div>departing {origin.name} at {route.orignTime}</div>
        <div>arriving at {destination.name} at {route.destinationTime}</div>
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
