class tile_obj {
    constructor(height, width, id) {
        this.height = height;
        this.width = width;
        this.id = id;
        this.start_corner = 0;
        this.end_corner = 0;
    }
}


class room {
    constructor(room_size, tile_size, symetric, laminate) {
        this.height = room_size[0] * 100;
        this.width = room_size[1] * 100;

        this.tile = {};
        this.tile.height = tile_size[0];
        this.tile.width = tile_size[1];

        this.min_width = tile_size[2];

        this.symetric = symetric;
        this.laminate = {}
        this.laminate.is = laminate[0];

        this.row_array = [];
        this.rows = Math.ceil(this.height / this.tile.height);
        this.ids = 0;
        this.left_over = [];
        this.current_height = 0;
        this.small_height = false;

        // Debugg
        this.flush = false;

        if (!this.laminate.is) {
            this.laminate.size = laminate[1] / 10;

            this.height -= this.laminate.size;
            this.width -= this.laminate.size;

            this.tile.height += this.laminate.size;
            this.tile.width += this.laminate.size;
        }

        for (var i = 0; i < this.rows; i++) {
            this.row_array.push([]);
        }

        // Place all rows
        for (var i = 0; i < this.rows; i++) {
            this.place_row(i);
        }

        console.log("Stats: ");

        // Debugg: show width final
        for (var i = 0; i < this.rows; i++) {
            this.calc_width(i);
        }

        console.log("Left over:", this.left_over.length)
    }

    clean_data() {
        if (!this.laminate.is) {
            this.width += this.laminate.size;
            this.height += this.laminate.size;
            this.tile.height -= this.laminate.size;
            this.tile.width -= this.laminate.size;
        }
        for (var row of this.row_array) {
            for (var tile_ of row) {
                // if (!this.laminate.is) {
                //     tile_.width -= this.laminate.size;
                //     tile_.height -= this.laminate.size;
                // }
                var width_string = tile_.width.toFixed(2);
                var height_string = tile_.height.toFixed(2);

                tile_.width = Number(width_string);
                tile_.height = Number(height_string);
            }
        }

        for (var tile_ of this.left_over) {
            var width_string = tile_.width.toFixed(2);
            var height_string = tile_.height.toFixed(2);

            tile_.width = Number(width_string);
            tile_.height = Number(height_string);
        }
    }

    add_cords() {
        var i = 0;

        var prev_y_cord = 0
        var y_counter = 0;
        var prev_x_cord = 0
        var x_counter = 0;
        console.log("this.width: ", this.width)
        for (var row of this.row_array) {
            y_counter += this.row_array[i][0].height
            var y_cord = y_counter / this.height * canvas_height
            for (var tile_ of row) {
                x_counter += tile_.width
                var x_cord = x_counter / this.width * canvas_width
                tile_.start_corner = [prev_x_cord, prev_y_cord]
                tile_.end_corner = [x_cord, y_cord]
                prev_x_cord = x_cord
            }
            prev_x_cord = 0;
            x_cord = 0;
            x_counter = 0;
            prev_y_cord = y_cord;
            i += 1;
        }
    }

    remove_fuge() {
        for (var row of this.row_array) {
            for (var tile_ of row) {
                    tile_.width -= this.laminate.size;
                    tile_.height -= this.laminate.size;
            }
        }
    }

    place_row(row) {
        var pos_above = 0;
        var pos_max = 0;
        var pos_min = this.tile.width;
        this.current_height = this.tile.height;

        // If first row
        if (row == 0) {
            var last_height = this.height % this.tile.height
            console.log(last_height < this.tile.height * 0.3)
            console.log(last_height > 0.0)
            if (last_height < this.tile.height * 0.3 && last_height > 0) {
                console.log("Last_height", last_height);
                this.small_height = true;
                this.current_height = this.height - ((this.tile.height * 0.3) + (this.rows - 2) * this.tile.height);
            }
        }

        // If last row
        if (row == this.rows - 1) {
            if (this.small_height) {
                this.current_height = this.tile.height * 0.3
            }
            else {
                var total_height = 0
                for (var arr of this.row_array) {
                    if (arr.length >= 1) {
                        total_height += arr[0].height;
                    }
                }
                console.log("total_height", total_height)
                this.current_height = this.height - total_height
            }
        }

        // Place rows 0,1 for all other Rows Symetric layout
        if (row > 1 && this.symetric) {
            if (row % 2) {
                for (var tile_ of this.row_array[1]) {
                    if (tile_.width == this.tile.width) {
                        this.row_array[row].push(this.full_tile());
                    }
                    else {
                        this.row_array[row].push(this.cut_tile(tile_.height, tile_.width));
                    }

                }
                return;
            }
            for (var tile_ of this.row_array[0]) {
                if (tile_.width == this.tile.width) {
                    this.row_array[row].push(this.full_tile());
                }
                else {
                    this.row_array[row].push(this.cut_tile(tile_.height, tile_.width));
                }
            }
            return;
        }

        // If not first row: Tile offset
        if (row != 0) {
            pos_above = this.row_array[row - 1][0].width
            pos_min = pos_above - this.tile.width * 0.2
            pos_max = pos_above + this.tile.width * 0.2
        }

        // Check for Tile in left_over to place.
        for (var tile_ of this.left_over) {
            if (tile_.width >= this.min_width && tile_.height == this.current_height) {
                if (tile_.width <= pos_min || tile_.width >= pos_max) {
                    var num_full_tiles = Math.floor((this.width - tile_.width) / this.tile.width)
                    console.log("Debugg log", (this.width - (num_full_tiles * this.tile.width + tile_.width)) % this.tile.width)
                    if ((this.width - (num_full_tiles * this.tile.width + tile_.width)) % this.tile.width > this.min_width) {
                        this.row_array[row].push(tile_);
                        this.left_over.splice(this.left_over.indexOf(tile_), 1);
                        break;
                    }
                }
            }
        }

        if (row != 0) {
            if (this.calc_width(row) == 0.0 && this.row_array[row - 1][0].width == this.tile.width) {
                this.row_array[row].push(this.cut_tile(this.current_height, this.tile.width * 0.7))
            }
        }

        // Calculate number of Full tile in this row
        var full_tiles_in_row = Math.floor((this.width - this.calc_width(row)) / this.tile.width)
        // Calculate last Tile size
        // var last_tile_in_row = (this.width - full_tiles_in_row * this.tile.width + this.calc_width(row)) % this.tile.width
        var last_tile_in_row = (this.width - (full_tiles_in_row * this.tile.width + this.calc_width(row))) % this.tile.width

        // If last Tile is not flush (0.0cm) else place Fulltile as last
        // Add Or above = same lenght
        if (last_tile_in_row != 0.0 || this.flush) {

            this.flush = false;

            // Remove one from full_tiles_in_row if last is smaller then 30% to cut 2nd last Tile.
            if (last_tile_in_row < this.min_width) {
                full_tiles_in_row -= 1
            }

            // Add all tiles to row
            this.add_full_tiles(full_tiles_in_row, row);

            if (row != 0) {
                for (var offset of this.calc_offsets(row - 1)) {
                    var end_width = this.width - this.min_width
                    if (end_width <= offset[0] || end_width >= offset[1]) {
                        console.log("True")
                    }
                    else {
                        console.log("False")
                    }
                }
            }
            // If last row is smaller 30%, cut 2nd last tile to fit 30% for the last tile.
            if (last_tile_in_row < this.min_width) {
                var dif_width_tile = this.min_width - last_tile_in_row
                if (row != 0) {
                    if (this.row_array[row - 1][0].width - pos_min >= this.tile.width - dif_width_tile || this.row_array[row - 1][0].width + pos_max <= this.tile.width - dif_width_tile) {
                        this.row_array[row].unshift(this.cut_tile(this.current_height, this.tile.width - dif_width_tile))
                        this.row_array[row].push(this.cut_tile(this.current_height, this.min_width))
                    }
                    else {
                        this.row_array[row].unshift(this.cut_tile(this.current_height, this.row_array[row - 1][0].width - pos_min))
                        var last_tile_width = this.width - this.calc_width(row)
                        this.row_array[row].push(this.cut_tile(this.current_height, last_tile_width))
                    }
                }
                else {
                    this.row_array[row].unshift(this.cut_tile(this.current_height, this.tile.width - dif_width_tile))
                    this.row_array[row].push(this.cut_tile(this.current_height, this.min_width))
                }


            }
            // Else get remaining size and cut tile.
            else {
                var last_tile_width = this.width - this.calc_width(row)
                this.row_array[row].push(this.cut_tile(this.current_height, last_tile_width))
            }
        }
        // else Flush place all tiles
        else {
            //full_tiles_in_row += 1
            this.add_full_tiles(full_tiles_in_row, row);
            this.flush = true;
        }

    }

    cut_tile(height, width) {
        this.ids += 1
        this.left_over.push(new tile_obj(this.current_height, (this.tile.width - width), this.ids))
        return new tile_obj(height, width, this.ids)

    }

    calc_offsets(row) {
        var offsets_array = []
        var pos_in_row = 0
        var pos = 0
        for (var tile_ of this.row_array[row]) {
            if (pos + tile_.width < this.width) {
                pos = tile_.width + pos_in_row
                var pos_min = pos - this.tile.width * 0.2
                var pos_max = pos + this.tile.width * 0.2
                pos_in_row += tile_.width
                offsets_array.push([pos_min, pos_max])
            }
        }
        return offsets_array
    }

    full_tile() {
        this.ids += 1
        return new tile_obj(this.current_height, this.tile.width, this.ids)
    }

    add_full_tiles(num, row) {
        for (var i = 0; i < num; i++) {
            this.row_array[row].push(this.full_tile())
        }
    }

    calc_width(row) {
        var full_width = 0;
        for (var tile_ of this.row_array[row]) {
            full_width += tile_.width
        }
        console.log(full_width);
        return full_width
    }

}