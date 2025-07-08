import '@testing-library/jest-dom';
import { Request, Response } from 'node-fetch';

// Polyfill for Request and Response in JSDOM environment
if (typeof global !== 'undefined' && !global.Request) {
  global.Request = Request;
}
if (typeof global !== 'undefined' && !global.Response) {
  global.Response = Response;
}