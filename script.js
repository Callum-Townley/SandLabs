const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
const gravity = 1;
const maxVelocity = 3;
const brush_size_slider = document.getElementById("brush_size_slider")
const cell_size_slider = document.getElementById("cell_size_slider")
const brush_sliderValue = document.getElementById("brush_value")
const cell_sliderValue = document.getElementById("cell_value")
const tick_speed_slider = document.getElementById("tick_speed_slider")
const particlePool = {}
const pixel_number_paragraph = document.getElementById("pixel_number_paragraph")
const clearButton = document.getElementById("clear_button")
const pauseButton = document.getElementById("pause_button")




let pixelNumber = 0;
let intervalId;
let isPaused = false
let mode = "stone"
let cellSize = 10;
let tickSpeed = tick_speed_slider.value
let currentPixels = []
let currentID = 0
let buttonGrid = document.getElementById("buttonGrid")



let mouseX = 0, mouseY = 0;
let cursorSize = 100
let isDrawing = false;




document.addEventListener("DOMContentLoaded", () => {
    const buttonGrid = document.getElementById("buttonGrid");

    Object.keys(types).forEach(type => {
        if (!types[type].no_button) {
            const button = document.createElement("button");
            button.className = "grid-button";
            button.id = type;
            button.textContent = type.charAt(0).toUpperCase() + type.slice(1);
            button.setAttribute("data-category", types[type].category)
            buttonGrid.appendChild(button);
        }
    });




    buttonColor(buttonGrid.querySelectorAll(".grid-button"));

    buttonGrid.querySelectorAll(".grid-button").forEach(button => {
        button.addEventListener("click", () => {
            currentType = button.id;
        });
    });
});

document.addEventListener("DOMContentLoaded", function () {
    const elementButtons = document.querySelectorAll(".grid-button")
    console.log(elementButtons)
    const categoryButtons = document.querySelectorAll(".category")
    categoryButtons.forEach(button => {

        button.addEventListener("click", function () {
            const selectedCategory = this.getAttribute("data-category");
            categoryButtons.forEach(btn => {
                btn.style.backgroundColor = "black";
            });
            this.style.backgroundColor = "green";
            elementButtons.forEach(btn => {
                if (btn.getAttribute("data-category") == selectedCategory) {
                    btn.style.display = "block";
                } else {
                    btn.style.display = "none";
                }
            });
        });
    });
    categoryButtons[0].click();
});



class Pixel {
    constructor(x, y, type) {
        this.x = x;
        this.y = y;
        this.type = type;
        this.typeData = types[type];
        this.id = currentID
        this.color = RandomColor(this.type, this.typeData)
        currentID++;
        this.melt_point = this.typeData.melt_point;
        this.boil_point = this.typeData.boil_point;
        this.temperature = this.typeData.baseTemp ?? 20;
        sandGrid[x][y] = this;
        this.decay = this.typeData.decay
        this.decay_timer = 0
    }
    meltPixel() {

        if (this.temperature > this.melt_point && this.typeData.form == "solid") {
            var fieryColor
            if (this.typeData.melt_to) {

                const meltedPixel = new Pixel(this.x, this.y, this.typeData.melt_to);
                meltedPixel.temperature = this.temperature
                const index = currentPixels.indexOf(this);

                if (index !== -1) {
                    currentPixels[index] = meltedPixel;
                }
                sandGrid[this.x][this.y] = meltedPixel;
            }
            else {
                // PROBLEMS HERE
                var newType = "molten_" + this.type

                var original_color = this.typeData.color
                if (Array.isArray(original_color)) {
                    fieryColor = original_color.map(color => {
                        let { r, g, b } = hexToRgb(this.color);
                        r = Math.min(255, r + 50);
                        g = Math.max(0, g - 30);
                        b = Math.max(0, b - 30);
                        return { r, g, b };
                    }
                    );
                }
                else {
                    let { r, g, b } = hexToRgb(this.color);
                    r = Math.min(255, r + 150);
                    g = Math.max(0, g + 50);
                    b = Math.max(0, b);
                    fieryColor = { r, g, b };
                }
                types[newType] = {
                    "name": newType,
                    "color": fieryColor,
                    "behavior": [
                        "00||00||00",
                        "22||00||22",
                        "22%30||11||22%30"
                    ],
                    "weight": 1000,
                    "form": "liquid",
                    "category": "liquid",
                    "immune": "true",
                    "baseTemp": 2000,
                    "melt_point": this.melt_point,
                    "freeze_to": this.type

                }

                const meltedPixel = new Pixel(this.x, this.y, newType);
                meltedPixel.temperature = this.temperature
                const index = currentPixels.indexOf(this);

                if (index !== -1) {
                    currentPixels[index] = meltedPixel;
                }
                sandGrid[this.x][this.y] = meltedPixel;
            }


        }


    }
    freezePixel() {

        if (this.temperature <= this.melt_point && (this.typeData.form == "liquid" || this.typeData.form == "gas")) {

            if (this.typeData.freeze_to) {

                const frozenPixel = new Pixel(this.x, this.y, this.typeData.freeze_to);
                frozenPixel.temperature = this.temperature
                const index = currentPixels.indexOf(this);

                if (index !== -1) {
                    currentPixels[index] = frozenPixel;
                }
                sandGrid[this.x][this.y] = frozenPixel;
            }


        }
    }
    boilPixel() {
        if (this.temperature > this.boil_point && this.typeData.form == "liquid") {
            if (this.typeData.boil_to) {

                const boiledPixel = new Pixel(this.x, this.y, this.typeData.boil_to);
                boiledPixel.temperature = this.temperature
                const index = currentPixels.indexOf(this);

                if (index !== -1) {
                    currentPixels[index] = boiledPixel;
                }
                sandGrid[this.x][this.y] = boiledPixel;
            }
        }
    }
    decayLogic() {
        this.decay_timer += 1
        if (this.decay_timer >= this.decay) {
            if (this.typeData.decay_to) {
                const decayedPixel = new Pixel(this.x, this.y, this.typeData.decay_to);
                decayedPixel.temperature = this.temperature
                const index = currentPixels.indexOf(this);

                if (index !== -1) {
                    currentPixels[index] = decayedPixel;
                }
                sandGrid[this.x][this.y] = decayedPixel;
            }
            else {

                const index = currentPixels.indexOf(this);
                currentPixels = currentPixels.filter(p => !((p.x === this.x && p.y === this.y)));
                sandGrid[this.x][this.y] = 0
            }

        }
    }
}

function buttonColor(Buttons) {
    Buttons.forEach(button => {
        if (Array.isArray(types[button.id].color)) {
            var colors = types[button.id].color
            const gradient = ctx.createLinearGradient(0, 0, button.clientWidth, 0);
            const step = 1 / (colors.length - 1);

            colors.forEach((color, index) => {
                gradient.addColorStop(index * step, color);
            });
            button.style.backgroundImage = `linear-gradient(to right, ${colors.join(', ')})`;
        }
        else {
            button.style.backgroundColor = types[button.id].color
        }
    })
}

function createPixel(x, y, type) {
    currentPixels.push(new Pixel(x, y, type))
}

updateInterval()
resizeCanvas();


let types = {
    "sand": {
        "name": "sand",
        "color": "#F4A460",
        "behavior": [
            "00||00||00",
            "00||00||00",
            "22%70||11||22%70"
        ],
        "weight": 5,
        "form": "solid",
        "category": "solid",
        "melt_point": 1700,
        "melt_to": "molten_glass"

    },
    "rocks": {
        "name": "rocks",
        "color": "#808080",
        "behavior": [
            "00||00||00",
            "00||00||00",
            "00||11||00"
        ],
        "weight": 3,
        "form": "solid",
        "category": "solid",
        "melt_point": 1700,
        "melt_to": "magma"

    },
    "water": {
        "name": "water",
        "color": "#1E90FF",
        "behavior": [
            "00||00||00",
            "22||00||22",
            "22||11%70||22"
        ],
        "weight": 2,
        "form": "liquid",
        "category": "liquid",
        "freeze_to": "ice",
        "melt_point": 0,
        "boil_point": 100,
        "boil_to": "steam"
    },
    "smoke": {
        "name": "smoke",
        "color": "#696969",
        "behavior": [
            "22||11%50||22",
            "22||00||22",
            "22%50||22%50||22%50"
        ],
        "weight": 1,
        "form": "gas",
        "category": "gas",
        "decay": 15
    },
    "wall": {
        "name": "wall",
        "color": "#2F4F4F",
        "behavior": [
            "00||00||00",
            "00||00||00",
            "00||00||00"
        ],
        "weight": 1000,
        "form": "solid",
        "melt_point": 1300,
        "category": "solid"
    },
    "virus": {
        "name": "virus",
        "color": "#4B0082",
        "behavior": [
            "R:virus||R:virus||R:virus",
            "R:virus||R:virus||R:virus",
            "22%70||R:virusAND11||22%70"
        ],
        "weight": 2,
        "form": "solid",
        "category": "special"
    },
    "acid": {
        "name": "acid",
        "color": ["#00FF00", "#32CD32", "#9ACD32"],
        "behavior": [
            "00||CL||00",
            "CLAND22||00||CLAND22",
            "22%70||CLAND11||22%70"
        ],
        "weight": 0.5,
        "form": "liquid",
        "category": "liquid",
        "melt_point": 0,
        "freeze_to": "acid_ice",
        "boil_point": 150,
        "boil_to": "acid_gas"

    },
    "carbon_dioxide": {
        "name": "carbon_dioxide",
        "color": ["#696969", "#2F4F4F", "#708090"],
        "behavior": [
            "22%70||11%70||22%70",
            "11||00||11",
            "22||11||22"
        ],
        "weight": 0.5,
        "form": "gas",
        "category": "gas",
        "melt_point": -80,
        "freeze_to": "dry_ice"


    },
    "confetti": {
        "name": "confetti",
        "color": ["#FF0000", "#FFA500", "#FFFF00", "#008000", "#0000FF", "#4B0082", "#EE82EE"],
        "behavior": [
            "00||00||00",
            "00||00||00",
            "11||11%70||11"
        ],
        "weight": 0.5,
        "form": "solid",
        "melt_point": 200,
        "melt_to": "ash",
        "category": "solid"
    },
    "invincible wall": {
        "name": "invincible wall",
        "color": "#FFFFF0",
        "behavior": [
            "00||00||00",
            "00||11||00",
            "00||00||00"
        ],
        "weight": 1000,
        "form": "solid",
        "category": "solid",
        "immune": "true"
    },
    "fire": {
        "name": "fire",
        "color": "#FF4500",
        "behavior": [
            "22||11%50||22",
            "22||00||22",
            "00||00||00"
        ],
        "weight": 1000,
        "form": "gas",
        "category": "energy",
        "immune": "true",
        "baseTemp": 2000,
        "decay": 20,
        "decay_to": "smoke"
    },
    "frost_fire": {
        "name": "frost_fire",
        "color": "#1E90FF",
        "behavior": [
            "22||11%50||22",
            "22||00||22",
            "00||00||00"
        ],
        "weight": 1000,
        "form": "gas",
        "category": "energy",
        "immune": "true",
        "baseTemp": -100,
        "decay": 20,
        "decay_to": "smoke"
    },
    "magma": {
        "name": "magma",
        "color": ["#FF4500", "#FF6347", "#FF8C00", "#FFA500", "#FFD700"],
        "behavior": [
            "00||00||00",
            "22||00||22",
            "22||11||22"
        ],
        "weight": 1000,
        "form": "liquid",
        "category": "liquid",
        "baseTemp": 2000,
        "melt_point": 1700,
        "freeze_to": "rocks"

    },
    "ice": {
        "name": "ice",
        "color": ["#B0E0E6", "#ADD8E6", "#87CEEB", "#4682B4", "#5F9EA0"],
        "behavior": [
            "00||00||00",
            "00||00||00",
            "22||11||22"
        ],
        "weight": 5,
        "form": "solid",
        "category": "solid",
        "baseTemp": -20,
        "melt_point": 0,
        "melt_to": "water"

    },
    "steam": {
        "name": "steam",
        "color": ["#E0E0E0", "#F5F5F5", "#FFFFFF", "#D3D3D3", "#C0C0C0"],
        "behavior": [
            "11||11||11",
            "11||00||11",
            "11%50||11%50||11%50"
        ],
        "weight": 1,
        "form": "gas",
        "category": "gas",
        "baseTemp": 120,
        "melt_point": 100,
        "freeze_to": "water"

    },
    "ash": {
        "name": "sand",
        "color": "#505050",
        "behavior": [
            "00||00||00",
            "00||00||00",
            "22%70||11||22%70"
        ],
        "weight": 5,
        "form": "solid",
        "category": "solid",
        "melt_point": 1700,

    },
    "acid_ice": {
        "name": "sand",
        "color": ["#00FF7F", "#32CD32", "#00FA9A", "#66CDAA", "#20B2AA"],
        "behavior": [
            "00||00||00",
            "00||00||00",
            "22%70||11||22%70"
        ],
        "weight": 5,
        "form": "solid",
        "category": "solid",
        "melt_point": 100,
        "melt_to": "acid",
        "no_button": true

    },
    "acid_gas": {
        "name": "acid_gas",
        "color": ["#ADFF2F", "#7FFF00", "#32CD32", "#9ACD32", "#00FF00"],
        "behavior": [
            "11||11||11",
            "11||00||11",
            "11%50||11%50||11%50"
        ],
        "weight": 1,
        "form": "gas",
        "category": "gas",
        "melt_point": 150,
        "freeze_to": "acid",
        "no_button": true

    },
    "molten_glass": {
        "name": "molten_glass",
        "color": ["#FFD700", "#FFA500", "#FF8C00", "#FF4500"],
        "behavior": [
            "00||00||00",
            "22||00||22",
            "22||11||22"
        ],
        "weight": 1,
        "form": "liquid",
        "category": "liquid",
        "melt_point": 1700,
        "freeze_to": "glass",
        "no_button": true

    },
    "glass": {
        "name": "glass",
        "color": ["#B0E0E6", "#ADD8E6", "#87CEEB", "#4682B4", "#5F9EA0"],
        "behavior": [
            "00||00||00",
            "00||00||00",
            "22||11||22"
        ],
        "weight": 1,
        "form": "solid",
        "category": "solid",
        "melt_point": 1600,
        "freeze_to": "glass",

    },
    "plasma": {
        "name": "glass",
        "color": ["#FF4500", "#FF6347", "#FFD700", "#FFFF00", "#FFA500"],
        "behavior": [
            "22||11%50||22",
            "22||00||22",
            "00||00||00"
        ],
        "weight": 1,
        "form": "gas",
        "baseTemp": 100000,
        "category": "energy",
        "decay": 15


    },
    "absolute_zero": {
        "name": "absolute_zero",
        "color": "#4B0082",
        "behavior": [
            "22||11%50||22",
            "22||00||22",
            "00||00||00"
        ],
        "weight": 1,
        "form": "gas",
        "baseTemp": -273,
        "category": "energy",
        "decay": 15


    },
    "liquid_nitrogen": {
        "name": "liquid_nitrogen",
        "color": ["#4B0082", "#483D8B", "#191970", "#000080", "#00008B"],
        "behavior": [
            "00||00||00",
            "22||00||22",
            "22||11||22"
        ],
        "weight": 1,
        "form": "liquid",
        "baseTemp": -200,
        "category": "liquid",
        "melt_point": -210,
        "boil_point": -195,
        "boil_to": "nitrogen",
        "freeze_to": "solid_nitrogen"


    },
    "nitrogen": {
        "name": "nitrogen",
        "color": ["#4B0082", "#483D8B", "#191970", "#000080", "#00008B"],
        "behavior": [
            "11||11||11",
            "11||00||11",
            "11||11||11"
        ],
        "weight": 1,
        "form": "gas",
        "melt_point": -210,
        "freeze_to": "liquid_nitrogen",
        "category": "gas",


    },
    "solid_nitrogen": {
        "name": "solid_nitrogen",
        "color": ["#4B0082", "#483D8B", "#191970", "#000080", "#00008B"],
        "behavior": [
            "00||00||00",
            "00||00||00",
            "22||11||22"
        ],
        "weight": 1,
        "form": "solid",
        "baseTemp": -200,
        "melt_point": -195,
        "melt_to": "liquid_nitrogen",
        "category": "solid",
        "no_button": true


    },
    "oxygen": {
        "name": "oxygen",
        "color": "#ADD8E6",
        "behavior": [
            "11||11||11",
            "11||00||11",
            "11%95||11%95||11%95"
        ],
        "weight": 1,
        "form": "gas",
        "category": "gas",
        "melt_point": -180,
        "freeze_to": "liquid_oxygen"



    },
    "liquid_oxygen": {
        "name": "liquid_oxygen",
        "color": "#ADD8E6",
        "behavior": [
            "00||00||00",
            "22||00||22",
            "11||11%50||11"
        ],
        "weight": 1,
        "form": "liquid",
        "category": "liquid",
        "boil_point": -180,
        "melt_point": -220,
        "boil_to": "oxygen",
        "freeze_to": "solid_oxygen",
        "no_button": true


    },
    "solid_oxygen": {
        "name": "solid_oxygen",
        "color": "#ADD8E6",
        "behavior": [
            "00||00||00",
            "00||00||00",
            "11||11%50||11"
        ],
        "weight": 1,
        "form": "solid",
        "category": "solid",
        "boil_point": -180,
        "melt_point": -220,
        "melt_to": "liquid_oxygen",
        "no_button": true


    },
    "salt": {
        "name": "salt",
        "color": "#F3FAFD",
        "behavior": [
            "00||00||00",
            "00||00||00",
            "11%30AND22||11||11%30AND22"
        ],
        "weight": 1,
        "form": "solid",
        "category": "solid",
        "melt_point": 800,



    },
    "dry_ice": {
        "name": "dry_ice",
        "color": "#F3FAFD",
        "behavior": [
            "00||00||00",
            "00||00||00",
            "11%30AND22||11||11%30AND22"
        ],
        "weight": 1,
        "form": "solid",
        "category": "solid",
        "baseTemp": -100,
        "melt_point": -80,
        "melt_to": "carbon_dioxide"



    },
    "chlorine": {
        "name": "chlorine",
        "color": "#00FF00",
        "behavior": [
            "00||00||00",
            "22||00||22",
            "22||11%70||22"
        ],
        "weight": 1,
        "form": "liquid",
        "category": "liquid",
        "baseTemp": -100,
        "melt_point": -101,
        "boil_point": -34,
        "freeze_to": "solid_chlorine",
        "boil_to": "chlorine_gas"



    },
    "solid_chlorine": {
        "name": "chlorine",
        "color": "#006400",
        "behavior": [
            "00||00||00",
            "00||00||00",
            "11%30AND22||11||11%30AND22"
        ],
        "weight": 1,
        "form": "solid",
        "category": "solid",
        "baseTemp": -110,
        "melt_point": -101,
        "melt_to": "chlorine",
        "no_button": true



    },
    "chlorine_gas": {
        "name": "chlorine_gas",
        "color": "#00FF7F",
        "behavior": [
            "11||11||11",
            "11||00||11",
            "11||11||11"
        ],
        "weight": 1,
        "form": "gas",
        "category": "gas",
        "baseTemp": 20,
        "melt_point": -34,
        "freeze_to": "chlorine",




    },







}
function setCursorSize(cellSize, brush_sliderValue) {
    cursorSize = cellSize * brush_sliderValue
}
function drawCursor(x, y, cursorSize) {
    cursorSize = Math.floor(cursorSize)
    ctx.fillStyle = 'rgba(255, 0, 0, 0.2)';
    ctx.strokeStyle = 'rgba(255,0,0,1)'
    ctx.strokeRect(x - cursorSize / 2, y - cursorSize / 2, cursorSize, cursorSize)
    ctx.fillRect(x - cursorSize / 2, y - cursorSize / 2, cursorSize, cursorSize);

}
function hexToRgb(hex) {
    // Remove the leading '#' if present
    hex = hex.replace(/^#/, '');

    // Parse the hex string into RGB components
    let bigint = parseInt(hex, 16);
    let r = (bigint >> 16) & 255;
    let g = (bigint >> 8) & 255;
    let b = bigint & 255;

    return { r, g, b };
}
function rgbToHex(rgb) {

}
function RandomColor(type, typeData) {
    var color
    if (Array.isArray(typeData.color)) {
        color = typeData.color[Math.floor(Math.random() * typeData.color.length)];
    }
    else {
        color = typeData.color
    }

    if (typeof color !== 'object') {
        var rgb = hexToRgb(color);
    }
    else {
        var rgb = color
    }
    var colorOffSet = Math.floor(Math.random() * (Math.random() > 0.5 ? -1 : 1) * Math.random() * 15);
    var r = rgb.r + colorOffSet;
    var g = rgb.g + colorOffSet;
    var b = rgb.b + colorOffSet;
    r = Math.max(0, Math.min(255, r));
    g = Math.max(0, Math.min(255, g));
    b = Math.max(0, Math.min(255, b));
    var color = "rgb(" + r + "," + g + "," + b + ")";
    return color

}

function GetPixelAttributes(x, y) {
    if (sandGrid[x][y] != 0) {
        return sandGrid[x][y]
    }
    else {
        return ""
    }
}
const pixel_type_paragraph = document.getElementById("pixel_type_paragraph")
const pixel_temperature_paragraph = document.getElementById("pixel_temperature_paragraph")

canvas.addEventListener("mousemove", (event) => {
    const rect = canvas.getBoundingClientRect();
    mouseX = event.clientX - rect.left
    mouseY = event.clientY - rect.top

    col = Math.floor(mouseX / cellSize)
    row = Math.floor(mouseY / cellSize)
    if (isDrawing === true) {
        for (i = 0 - Math.floor(brush_size_slider.value / 2); i < Math.ceil(brush_size_slider.value) / 2; i++) {
            for (j = 0 - Math.floor(brush_size_slider.value / 2); j < Math.ceil(brush_size_slider.value / 2); j++) {
                if (isEmpty(col + i, row + j)) {
                    createPixel(col + i, row + j, currentType)
                }



            }

        }

    }
    pixel_type_paragraph.textContent = GetPixelAttributes(col, row).type
    pixel_temperature_paragraph.textContent = Math.floor(GetPixelAttributes(col, row).temperature) + "℃"
})

canvas.addEventListener("mousedown", () => {
    isDrawing = true;
})

canvas.addEventListener("mouseup", () => {
    isDrawing = false;
})



function updateGrid() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    for (i = 0; i < currentPixels.length; i++) {
        pixel = currentPixels[i]
        x = pixel.x
        y = pixel.y
        //documents pixel count

        ctx.fillStyle = pixel.color
        ctx.fillRect(x * cellSize, y * cellSize, cellSize, cellSize)
    }
    pixelNumber = currentPixels.length
    pixel_number_paragraph.textContent = pixelNumber
    drawCursor(mouseX, mouseY, cursorSize)
}

function movePixel(pixel, x, y) {
    if (!currentPixels.includes(pixel)) {
        return;
    }

    sandGrid[pixel.x][pixel.y] = 0

    pixel.x = x;
    pixel.y = y;
    sandGrid[x][y] = pixel;
}

function pixelSwap(pixel1, pixel2) {
    var tempX = pixel1.x;
    var tempY = pixel1.y;
    pixel1.x = pixel2.x;
    pixel1.y = pixel2.y;
    pixel2.x = tempX;
    pixel2.y = tempY;
    sandGrid[pixel1.x][pixel1.y] = pixel1;
    sandGrid[pixel2.x][pixel2.y] = pixel2;

}
function Clear_pixel(Clear_Cells, pixel) {
    if (Clear_Cells.length > 0) {
        var coords = Clear_Cells[Math.floor(Math.random() * Clear_Cells.length)]

        if (isInBounds(coords.x, coords.y) && sandGrid[coords.x][coords.y] != 0 && sandGrid[coords.x][coords.y].type != "acid") {
            currentPixels = currentPixels.filter(p => !((p.x === coords.x && p.y === coords.y) || (p.x === pixel.x && p.y === pixel.y)));
            sandGrid[pixel.x][pixel.y] = 0
            sandGrid[coords.x][coords.y] = 0
        }
        else { Clear_Cells.splice(Clear_Cells.indexOf(coords), 1) }



    }
}
function Replace_pixel(Replace_Cells, replace_Type) {
    if (Replace_Cells.length > 0) {
        var coords = Replace_Cells[Math.floor(Math.random() * Replace_Cells.length)]
        if (isInBounds(coords.x, coords.y)) {
            if (sandGrid[coords.x][coords.y].type != replace_Type && sandGrid[coords.x][coords.y] != 0) {
                sandGrid[coords.x][coords.y] = 0
                createPixel(coords.x, coords.y, replace_Type)
            }
            else { Replace_Cells.splice(Replace_Cells.indexOf(coords), 1); }
        }
    }

}
function Priority_move(Priority_Cells_1, Priority_Cells_2, pixel) {
    let moved = false
    if (Priority_Cells_1.length > 0) {
        while (Priority_Cells_1.length > 0) {
            var coords = Priority_Cells_1[Math.floor(Math.random() * Priority_Cells_1.length)]
            var newx = coords.x
            var newy = coords.y
            if (isEmpty(newx, newy)) {
                moved = true
                movePixel(pixel, newx, newy)
                break
            }
            else {
                Priority_Cells_1.splice(Priority_Cells_1.indexOf(coords), 1);
            }


            if (isInBounds(newx, newy) && sandGrid[newx][newy] != 0) {
                if (sandGrid[newx][newy].typeData.weight < pixel.typeData.weight && (sandGrid[newx][newy].typeData.category == "liquid" || sandGrid[newx][newy].typeData.category == "gas")) {
                    moved = true
                    pixelSwap(pixel, sandGrid[newx][newy])
                }
            }

        }

    }
    if (moved == false) {
        if (Priority_Cells_2.length > 0) {
            while (Priority_Cells_2.length > 0) {
                var coords = Priority_Cells_2[Math.floor(Math.random() * Priority_Cells_2.length)]
                newx = coords.x
                newy = coords.y
                if (isEmpty(newx, newy)) {
                    moved = true
                    movePixel(pixel, newx, newy)
                    break
                }
                else {
                    Priority_Cells_2.splice(Priority_Cells_2.indexOf(coords), 1);
                }

                if (isInBounds(newx, newy) && sandGrid[newx][newy] != 0) {
                    if (sandGrid[newx][newy].typeData.weight < pixel.typeData.weight && (sandGrid[newx][newy].typeData.category == "liquid" || sandGrid[newx][newy].typeData.category == "gas")) {
                        moved = true
                        pixelSwap(pixel, sandGrid[newx][newy])
                    }
                }
            }

        }

    }

}
function isInBounds(x, y) {
    return (x >= 0 && y >= 0 && x < sandGrid.length && y < sandGrid[x].length)
}
function isEmpty(x, y) {
    if (x >= 0 && y >= 0 && x < sandGrid.length && y < sandGrid[x].length) {
        return sandGrid[x][y] == 0
    }
    return false
}

function behaviorCoords(x, y, bi, bj) {
    x += (bj - 1)
    y += (bi - 1)
    return { x: x, y: y }
}
function pixelLogic(pixel) {
    var Data = pixel.typeData
    var behavior = Data.behavior
    var x = pixel.x
    var y = pixel.y
    var temperature = pixel.temperature
    var Priority_Cells_1 = []
    var Priority_Cells_2 = []
    var Replace_Cells = []
    var Clear_Cells = []
    var replace_Type = ""
    for (let bi = 0; bi < behavior.length; bi++) {
        behavior_row = behavior[bi].split("||")
        for (let bj = 0; bj < behavior_row.length; bj++) {
            var behavior_cell = behavior_row[bj];
            var behavior_list = [behavior_cell];
            if (behavior_cell.includes("AND")) {
                behavior_list = behavior_cell.split("AND")
            }
            behavior_list.forEach(single_behavior => {
                if (single_behavior.includes("%")) {
                    var chance = parseFloat(single_behavior.split("%")[1]);
                    single_behavior = single_behavior.split(/[\:\%]/)[0];
                }
                else { var chance = 100; }
                if (Math.random() * 100 < chance) {
                    var NextCoords = behaviorCoords(x, y, bi, bj)
                    spreadHeat(pixel, NextCoords.x, NextCoords.y)
                    if (single_behavior == "11") {
                        Priority_Cells_1.push(NextCoords)
                    }
                    if (single_behavior == "22") {
                        Priority_Cells_2.push(NextCoords)
                    }
                    if (single_behavior.includes("R")) {
                        replace_Type = single_behavior.split(":")[1];
                        Replace_Cells.push(NextCoords)
                    }
                    if (single_behavior.includes("CL")) {
                        Clear_Cells.push(NextCoords)
                    }
                }
            });

        }
    }

    Clear_pixel(Clear_Cells, pixel)
    Replace_pixel(Replace_Cells, replace_Type)
    Priority_move(Priority_Cells_1, Priority_Cells_2, pixel)
    pixel.meltPixel()
    pixel.freezePixel()
    pixel.boilPixel()
    pixel.decayLogic()

}
function spreadHeat(pixel, x, y) {
    if (isInBounds(x, y)) {
        neighbor = sandGrid[x][y]
        if (neighbor !== 0) {
            const temperatureDifference = neighbor.temperature - pixel.temperature;
            const heatTransfer = temperatureDifference * 0.03; // Adjust the factor for more or less heat transfer
            pixel.temperature += heatTransfer;
            neighbor.temperature -= heatTransfer;
        }
    }
}





function updateInterval() {
    if (intervalId) {
        clearInterval(intervalId);
    }
    intervalId = setInterval(() => {
        if (!isPaused) {
            for (let i = 0; i < currentPixels.length; i++) {
                let pixel = currentPixels[i];
                pixelLogic(pixel);
            }
            updateGrid();
        }
    }, tickSpeed);
}



brush_size_slider.addEventListener("input", () => {
    brush_sliderValue.textContent = brush_size_slider.value
    setCursorSize(cellSize, brush_size_slider.value)
})

cell_size_slider.addEventListener("input", () => {
    cell_sliderValue.textContent = cell_size_slider.value
    setCursorSize(cellSize, brush_size_slider.value)
    resizeCanvas()
})

tick_speed_slider.addEventListener("input", () => {
    tickSpeed = tick_speed_slider.value
    updateInterval();
})

clearButton.addEventListener("click", () => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    for (let i = 0; i < sandGrid.length; i++) {
        sandGrid[i].fill(0)
    }
    pixelNumber = 0;
    currentPixels = []
})


function resizeCanvas() {
    canvas.width = window.innerWidth - 200
    canvas.height = window.innerHeight - 150
    cellSize = cell_size_slider.value
    cols = Math.floor(canvas.width / cellSize);
    rows = Math.floor(canvas.height / cellSize);


    // Recreate the grid to match new size
    sandGrid = Array.from({ length: cols }, () =>
        Array.from({ length: rows }, () => (0))
    );
    setCursorSize(cellSize, brush_size_slider.value)
    updateGrid()
}

window.addEventListener("resize", resizeCanvas);
let currentType = "sand"
resizeCanvas();



pauseButton.addEventListener("click", () => {
    isPaused = !isPaused
    if (isPaused) {
        pauseButton.textContent = "Unpause"
    }
    else {
        pauseButton.textContent = "Pause"
    }
})
