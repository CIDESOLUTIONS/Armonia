import '@testing-library/jest-dom';
import { Request, Response } from 'node-fetch';

// Polyfill for TextEncoder and TextDecoder
import { TextEncoder, TextDecoder } from 'util';

if (typeof global !== 'undefined') {
  if (typeof global.TextEncoder === 'undefined') {
    global.TextEncoder = TextEncoder;
  }
  if (typeof global.TextDecoder === 'undefined') {
    global.TextDecoder = TextDecoder;
  }
}

// Polyfill for Request and Response in JSDOM environment
if (typeof global !== 'undefined' && !global.Request) {
  global.Request = Request;
}
if (typeof global !== 'undefined' && !global.Response) {
  global.Response = Response;
}