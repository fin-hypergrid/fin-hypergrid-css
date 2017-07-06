'use strict';

// Note that _regardless of input,_ values from getComputedStyle always have the following characteristics:
// Measurements: In pixels (have "px" appended), including 0 ("0px").
// Colors: Either in rgb or rgba format.

var RE_PIXELS = /^(\d*(\.\d*)?)px/;
var RE_COLOR = /^(rgb\(\d*(\.\d*)?(, \d*(\.\d*)?){2}|rgba\(\d*(\.\d*)?(, \d*(\.\d*)?){3})\)/;
var RE_FONT = /^(normal|italic|oblique)?\s*(normal|small-caps)?\s*(normal|bold|100|100|300|400|500|600|700|800|900)?\s*(\d+px)?\s*(.*)$/;

window.addEventListener('load', function() {
    document.getElementById('colNames').value.replace(/,\s+/, ',').split(',').forEach(addColumn);

    var source = document.getElementById('textarea-css');
    var tableSelector = 'table.hypergrid-model';
    var tableEl = document.querySelector(tableSelector);

    document.querySelector('style#hypergrid-defaults').innerHTML = makeDefaultsStylesheet(grid.constructor.defaults, tableSelector);

    querySelectorAll('table.hypergrid-model > tbody.header > tr.unselected > td').forEach(function(headerTD, x) {
        headerTD.onmouseup = function (event) {
            console.log(x);
            var isSelected = this.className === 'selected';
            this.className = isSelected ? 'unselected' : 'selected';
            querySelectorAll('table.hypergrid-model > tbody.data > tr > td:nth-of-type(' + (x+1) + ')').forEach(function(dataTD) {
                dataTD.classList[isSelected ? 'remove' : 'add']('selected');
            });
        };
    });

    querySelectorAll('table.hypergrid-model > tbody.data > tr > th > input').forEach(function(input) {
        input.onclick = function(event) {
            this.parentElement.parentElement.className = this.checked ? 'selected' : 'unselected';
        };
    });

    source.onkeyup = function() { stylesheetChanged.call(this, tableEl); };
    source.onkeyup();
});

var colorsAndFont = {
    backgroundColor: 'background-color',
    color: 'color',
    font: 'font',
};
var colorsAndFontAndAlignment = Object.assign({}, colorsAndFont, {
    halign: 'text-align'
});
var miscellaney = Object.assign({}, colorsAndFontAndAlignment, {
    cellPadding: 'padding-left',
    cellPadding: 'padding-right',
});

function makeDefaultsStylesheet(defaults, tableSelector) {
    return Object.keys(stylers).reduce(function(rule, prop) {
        var style = stylers[prop];
        return defaults[prop] ? '\t' + rule + style + ':' + defaults[prop] + ';\n' : rule;
    }, tableSelector + ' td {\n') + '}';
}

var stylers = [
    makeStyler('tbody.data   > tr            > td', '', miscellaney),

    makeStyler('tbody.data   > tr.unselected > td', '', colorsAndFontAndAlignment),
    makeStyler('tbody.data   > tr.selected   > td', 'foregroundSelection', colorsAndFont),

    makeStyler('tbody.header > tr.unselected > td', 'columnHeader', colorsAndFontAndAlignment),
    makeStyler('tbody.header > tr.selected   > td', 'columnHeaderForegroundSelection', colorsAndFont),

    makeStyler('tbody.data   > tr.unselected > th', 'rowHeader', colorsAndFont),
    makeStyler('tbody.data   > tr.selected   > th', 'rowHeaderForegroundSelection', colorsAndFont)
];

// returns a plain object with a `selector` prop and a prop for each non-blacklisted key in `styleMap` set to prefix applied to that key
function makeStyler(selector, prefix, styleMap) {
    return Object.keys(styleMap).reduce(function(styler, prop) {
        styler[prop] = makePrefixedProp(prefix, prop);
        return styler;
    }, {
        selector: selector
    });
}

function makePrefixedProp(prefix, prop) {
    if (prefix) {
        prop = prefix + prop[0].toUpperCase() + prop.substr(1);
        prop = prop
            .replace('ForegroundSelectionBackground', 'BackgroundSelection')
            .replace('foregroundSelectionBackground', 'backgroundSelection');
    }
    return prop;
}

function stylesheetChanged(tableEl) {
    var css = this.value;
    document.getElementById('for-app-table-el').innerHTML = css;

    var state = parseCSS(tableEl);
    console.log(state);
    grid.applyTheme(state);
    grid.behavior.shapeChanged();
}

function parseCSS(tableEl) {
    var state = {};

    // STEP 1: Properties observed on <table> element
    var a = assign.bind(state, tableEl, null);

    a('color');
    a('backgroundColor');

    a('gridBorderTop', 'borderTopWidth', bool);
    a('gridBorderRight', 'borderRightWidth', bool);
    a('gridBorderBottom', 'borderBottomWidth', bool);
    a('gridBorderLeft', 'borderLeftWidth', bool);

    // STEP 2: Properties observed on first <td> element for cells in both "selected" and "unselected" states
    a = assign.bind(state, tableEl, 'td');
    a('cellPadding', 'padding');
    a('lineWidth', 'borderRightWidth');
    a('lineColor', 'borderColor');

    a('defaultRowHeight', 'height');

    a = assign.bind({}, tableEl, 'td');
    state.defaultRowHeight += a('paddingTop') + a('paddingBottom');

    // STEP 3: Properties observed on elements selected per stylers' selectors
    stylers.forEach(function(styler) {
        a = assign.bind(state, tableEl, styler.selector);
        a(styler.backgroundColor, 'backgroundColor');
        a(styler.color, 'color');
        a(styler.halign, 'text-align');

        a('cellPadding', 'padding-left');
        a('cellPadding', 'padding-right');
        a('defaultRowHeight', 'height');

        var font = getFontDefault(styler.font);
        a = assign.bind(font, tableEl, styler.selector);
        a('style', 'font-style');
        a('variant', 'font-variant');
        a('weight', 'font-weight');
        a('size', 'font-size');
        a('family', 'font-family');
        state[styler.font] = [font.style, font.variant, font.weight, font.size, font.family].join(' ').replace(/\s+/, ' ').trim();
    });

    return state;
}

function bool(n) { return !!n; }

// getch and parse the default font string
function getFontDefault(propName) {
    var font = grid.constructor.defaults[propName];
    var matches = font.match(RE_FONT);
    font = {};
    if (matches) {
        if (matches[1]) { font.style = matches[1]; }
        if (matches[2]) { font.variant = matches[2]; }
        if (matches[3]) { font.weight = matches[3]; }
        if (matches[4]) { font.size = matches[4]; }
        if (matches[5]) { font.family = matches[5]; }
    }
    return font;
}

function assign(tableEl, selector, propName, styleName, fixer) {
    var gridProp = !selector,
        el = gridProp ? tableEl : tableEl.querySelector(selector),
        styles = window.getComputedStyle(el),
        styleValue = styles[styleName = styleName || propName],
        matches;

    switch (styleValue) {
        case 'normal':
        case 'none':
        case 'auto':
        case 'start':
        case '':
        case undefined:
            styleValue = undefined;
            break;

        default:
            if ((matches = styleValue.match(RE_PIXELS))) {
                styleValue = styleName === 'font-size' ? matches[0] : Number(matches[1]);
            } else if ((matches = styleValue.match(RE_COLOR))) {
                styleValue = matches[0];
                if (!gridProp && /^rgba\(([^,]+, ){3}0\)$/.test(styleValue)) {
                    styleValue = undefined;
                }
            }
    }

    if (styleValue !== undefined) {
        if (fixer) {
            styleValue = fixer(styleValue);
        }
        this[propName] = styleValue;
    } else {
//                this[propName] = grid.constructor.defaults[propName];
    }

    return styleValue;
}

function addColumn(colName, x) {
    querySelectorAll('tbody').forEach(function(tbody) {
        querySelectorAll('tr', tbody).forEach(function(tr, y) {
            var td = document.createElement('td');
            switch (tbody.className) {
                case 'header':
                    td.className = 'unselected column-' + colName;
                    td.innerHTML = capitalize(colName);
                    break;
                case 'data':
                    td.className = 'column-' + colName;
                    td.innerHTML = 'data(' + x + ',' + y + ')';
                    break;
            }
            tr.appendChild(td);
        });
    });
}

function capitalize(string) {
    return (/[a-z]/.test(string) ? string : string.toLowerCase())
        .replace(/[\s\-_]*([^\s\-_])([^\s\-_]+)/g, replacer)
        .replace(/[A-Z]/g, ' $&')
        .trim();
}

function replacer(a, b, c) {
    return b.toUpperCase() + c;
}

function querySelectorAll(selector, el) {
    return Array.prototype.slice.call((el || document).querySelectorAll(selector))
}
