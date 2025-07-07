const moment = jest.fn(() => ({ format: jest.fn(() => 'mocked date') }));
moment.utc = jest.fn(() => moment());
moment.locale = jest.fn();
module.exports = moment;
