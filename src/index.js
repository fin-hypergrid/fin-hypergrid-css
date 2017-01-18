var Hypergrid = require('fin-hypergrid');

var data = [
    { symbol: 'APPL', name: 'Apple Inc.', prevclose: 93.13 },
    { symbol: 'MSFT', name: 'Microsoft Corporation', prevclose: 51.91 },
    { symbol: 'TSLA', name: 'Tesla Motors Inc.', prevclose: 196.40 },
    { symbol: 'IBM', name: 'International Business Machines Corp', prevclose: 155.35 }
];

var grid = window.grid = new Hypergrid();

grid.setData(data);