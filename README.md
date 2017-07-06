# fin-hypergrid-css

This page is for developers of grid-based apps using the (Hypergrid)[https://www.npmjs.com/package/fin-hypergrid] grid engine.

Each Hypergrid grid has a complex internal state, consisting of both cosmetic properties, such as `color` (font color) and `halign` (horizontal alignment), as well as semantic properties, such as `columnIndexes` (which columns to display and in which order) and `render` (the name of the cell renderer to use).

This state can be represented by a single plain Javascript object, which we call a Hypergrid _state object._ State objects are used to persist grid state in a data store in a serialized form. The grid methods `grid.saveState` and `grid.loadState` respectively produce and accept a JSON string representation of such a state object.

For the proper configuration of a Hypergrid state object, including examples for the following properties, see the [Persisting Grid State](https://github.com/openfin/fin-hypergrid/wiki/Persisting-Grid-State) wiki, but to summarize:
A Hypergrid state object is basically analogous to a `grid.properties` object, but with certain additions for column, cell, and row state:

* **`columns`:** Optional column state objects for specific columns can be nested within the root state object. Properties on these state objects are copied to `grid.getColumn(i).properties` (where `i` is a specified column object) and override properties of the same name in `grid.properties` for the specified column `i` only.
* **`cells`:** Likewise, optional cell state objects for specific cells can also be nested within the root state object. The properties on these state objects are copied to `grid.getColumns(i).getCellOwnProperties(j)` (where `j` is a specified row) override the properties of the same name in `grid.getColumn(i).properties` for the cell in the specified row `j` only.
* **`rows`:** Finally, optional state objects for specific rows can also be nested within the root state object. The properties on these state objects override the properties of the same name in `grid.properties` for the specified row only. Note that the only row property currently supported is `height`.
* **`calculators`:** Computed column calculator registry. Functions may be referred to by name, or complete function definitions (in Javascript) may be specified. In either case, identical functions are shared among columns. Alternatively, when a column state object's `calculator` property specify a function definition (preferably including a function name) rather than a named reference, such definition is added to the registry and will be output by `grid.saveState` as part of the registry, while the output of this `calculator` property will contain only the loosely coupled reference (_i.e.,_ the function name) (when a name was included in the function definition; otherwise it will include the function script).
* **`subgrids`:** \[copy needed\]
* ** `columnIndexes` and `columnNames`:** \[copy needed\]
* **Grid properties:** Miscellaneous grid state roperties in the root of the state object are copied to `grid.properties` and refer to the grid as a whole.

Keep in mind that each Hypergrid instance renders a grid in its entirety to a single canvas element and does not use any additional DOM elements in the grid itself. The render properties that Hypergrid offers are specifically defined by the cell renderers' capabilities. These are generally a very limited subset of the CSS styles normally available in the DOM.

This page contains an HTML table styled using CSS, and an algorithm that inspects the table's CSS styles and produces a hypergrid state object containing the basic cosmetic properties utilized by the `Simplecell` cell renderer. These include:

lineWidth
lineColor
gridBorderTop
gridBorderRight
gridBorderBottom
gridBorderLeft

halign
backgroundColor
color
font

defaultRowHeight
