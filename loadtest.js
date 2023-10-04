// loadtest.js
import http from 'k6/http';
import { check, sleep } from 'k6';

export let options = {
  vus: 10, // Virtual Users
  duration: '60s', // Duration of the test
};

export default function () {
  let res = http.get(`http://localhost:8080/`); // Update with your API endpoint
  check(res, {
    'status is 200': (r) => r.status === 200,
  });
  sleep(1);
}
