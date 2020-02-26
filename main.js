var room_
var colored_tiles = []
var canvas_width
var canvas_height

/**
 * Does all calcuations for a Room set by all Parameter in the HTML.
 */
function calc_room() {
    var room_height = get_element_value("room_height");
    var room_width = get_element_value("room_width");
    var panel_height = get_element_value("panel_height");
    var panel_width = get_element_value("panel_width");
    var min_width = get_element_value("min_width");
    var installation = document.getElementById("installation");
    var tile_type = document.getElementById("tile_type");

    var laminate = [true];
    var symetric = false;

    if (tile_type.value == "Fliesen") {
        laminate = [false, get_element_value("input_gap")];
    }

    if (installation.value == "Symetrisch") {
        symetric = true;
    }

    var room_size = [room_height, room_width];
    var tile_size = [panel_height, panel_width, min_width];

    var width_sizes = panel_width < min_width || room_width * 100 < panel_width
    var height_sizes = room_height * 100 < panel_height

    console.log()

    if (width_sizes || height_sizes) {
        alert("Something went wrong. Check sizes again!")
        return;
    }

    room_ = new room(room_size, tile_size, symetric, laminate);

    colored_tiles = [];

    room_.clean_data();
    room_.add_cords();
    if (tile_type.value == "Fliesen") {
        room_.remove_fuge();
    }
    draw_tiles();
}
/**
 * Toggles the Input for Fuge
 */
function add_parameter() {
    var row = document.getElementById("2nd_row");
    // Add items to set Gapsize
    if (document.getElementById("tile_type").value == "Fliesen") {
        var blank = document.createElement("font");
        blank.innerHTML = "";

        var gap_size_text = document.createElement("font");
        gap_size_text.innerHTML = "Fuge";

        var input_gap = document.createElement("input");
        var input_gap_unit = document.createElement("input");

        input_gap.id = "input_gap";
        input_gap.className = "inputs_field";
        input_gap.type = "number";
        input_gap.min = 1;
        input_gap.value = 10;

        input_gap_unit.id = "input_unit";
        input_gap_unit.type = "text";
        input_gap_unit.value = "mm";
        input_gap_unit.disabled = true;

        append_to_child(row, [blank, gap_size_text, input_gap, input_gap_unit]);
        return;
    }
    // Delete Items if not Fliesen.
    for (var i = 0; i <= 3; i++) {
        row.removeChild(row.lastChild);
    }
}
/**
 * Add Childs[] (list) to the Parent.
 * @param {Element} parent Parent DOMElement
 * @param {Element[]} items child DOMElements in a List
 */
function append_to_child(parent, items) {
    for (item of items) {
        parent.appendChild(item);
    }
}

/**
 * Used by the Flip button to switch sides of the canvas drawing.
 */
function reverse_room() {

    for (var i = 0; i < room_.rows; i++) {
        room_.row_array[i] = room_.row_array[i].reverse()
    }

    background(255)
    colored_tiles = []
    room_.add_cords();
    draw_tiles();

}

/**
 * Setup used by P5js to setup the Canvas and such.
 */
function setup() {
    canvas_width = windowWidth * 0.55;
    canvas_height = windowHeight * 0.45;
    cnv = createCanvas(canvas_width, canvas_height);
    cnv.parent('grid_container');
    cnv.mouseClicked(click_cnv);
    background(255);

    // Draw Länge / Breite
    textSize(20);
    fill(0)
    draw_arrow(20, 10, canvas_width - 20, 10)
    draw_arrow(10, 20, 10, canvas_height - 20)
    text("Länge", canvas_width / 2 - 22, 30)
    text("Breite", 15, canvas_height / 2 - 22)
}

/**
 * Draws a double sided Arrow with 2 Cordination points.
 * @param {*} x1 Start Point X
 * @param {*} y1 Start Point Y
 * @param {*} x2 End Point X
 * @param {*} y2 End Point Y
 */
function draw_arrow(x1, y1, x2, y2) {

    // Base line
    line(x1, y1, x2, y2);

    var arrowLength = 10;

    var dx = x1 - x2;
    var dy = y1 - y2;

    // Arrow head degree
    var rad = 35 * (Math.PI / 180);
    var rad2 = -35 * (Math.PI / 180);

    for (var i = 1; i > -2; i -= 2) {
        var theta = Math.atan2(i * dy, i * dx);

        var x3 = x1 - arrowLength * Math.cos(theta + rad);
        var y3 = y1 - arrowLength * Math.sin(theta + rad);

        var x4 = x1 - arrowLength * Math.cos(theta + rad2);
        var y4 = y1 - arrowLength * Math.sin(theta + rad2);

        line(x1, y1, x3, y3)
        line(x1, y1, x4, y4)

        x1 = x2
        y1 = y2

        //[x1, x2] = [x2, x1];
        //[y1, y2] = [y2, y1];
    }
}

/**
 * On click check wich Tile is in that Spot.
 * Used by Click event in P5js
 * */
function click_cnv() {

    console.log(mouseX, mouseY);

    // Get Tile with the Cords saved to them.
    for (var row of room_.row_array) {
        for (var tile_ of row) {
            var x_cord = tile_.start_corner[0] < mouseX && tile_.end_corner[0] > mouseX; 
            var y_cord = tile_.start_corner[1] < mouseY && tile_.end_corner[1] > mouseY; 
            if (x_cord && y_cord) {
                get_tile_by_id(room_, tile_.id)
            }
        }
    }
}

/**
 * Draw all tiles that are in global room_.row_array
 */
function draw_tiles() {
    fill(255, 255, 255)
    rect(0, 0, canvas_width, canvas_height)
    // Outlines
    line(0, 0, 0, canvas_height)
    line(0, 0, canvas_width, 0)

    // Draw all Tiles with the Cords saved to them.
    for (var row of room_.row_array) {
        for (var tile_ of row) {
            var width = Math.abs(tile_.start_corner[0] - tile_.end_corner[0]);
            var height = Math.abs(tile_.start_corner[1] - tile_.end_corner[1]);
            rect(tile_.start_corner[0], tile_.start_corner[1], width, height);
            }
        }
}


/**
 * Get the Tile that has the ID.
 * Also Draws the Tile in the Cavas and 
 * Prints the Tile with the Same ID to the List left of the Canvas
 * @param {room} room_obj Room Object.
 * @param {number} id Tile ID to find.
 */
function get_tile_by_id(room_obj, id) {
    var tile_list = document.getElementById("left_list")

    while (tile_list.firstChild) {
        tile_list.removeChild(tile_list.firstChild);
    }

    if (colored_tiles.length > 0) {
        fill('rgba(255,255,255, 1)')
        for (var arr_ of colored_tiles) {
            rect(arr_[0], arr_[1], arr_[2], arr_[3])
        }
        colored_tiles = []
    }

    for (var row of room_obj.row_array) {
        for (var tile_ of row) {
            if (tile_.id == id) {
                console.log(tile_.start_corner, tile_.end_corner);
                fill('rgba(125,125,255, 0.25)');
                var width = Math.abs(tile_.start_corner[0] - tile_.end_corner[0]);
                var height = Math.abs(tile_.start_corner[1] - tile_.end_corner[1]);
                rect(tile_.start_corner[0], tile_.start_corner[1], width, height);
                colored_tiles.push([tile_.start_corner[0], tile_.start_corner[1], width, height]);
                var node = document.createElement("li");
                var text_node = document.createTextNode("ID: " + tile_.id + " Width: " + tile_.width + " Height: " + tile_.height);
                node.appendChild(text_node);
                tile_list.appendChild(node)
            }
        }
    }

    for (var tile_ of room_obj.left_over) {
        if (tile_.id == id) {
            var node = document.createElement("li");
            var text_node = document.createTextNode("ID: " + tile_.id + " Width: " + tile_.width + " Height: " + tile_.height + " Leftover");
            node.appendChild(text_node);
            tile_list.appendChild(node)
        }
    }
}

/**
 * Gets the Float value of a DOMElement with its ID.
 * @param {*} id ID of DOM
 */
function get_element_value(id) {
    return parseFloat(document.getElementById(id).value)
}