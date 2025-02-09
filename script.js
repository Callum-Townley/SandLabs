const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
const gravity=1;
const maxVelocity=3;
const brush_size_slider = document.getElementById("brush_size_slider")
const cell_size_slider = document.getElementById("cell_size_slider")
const brush_sliderValue = document.getElementById("brush_value")
const cell_sliderValue =  document.getElementById("cell_value")
const particlePool={}
const pixel_number_paragraph = document.getElementById("pixel_number_paragraph")
const clearButton= document.getElementById("clear_button")
const pauseButton=document.getElementById("pause_button")



pixelNumber=0;
let isPaused=false
let mode="stone"
let cellSize = 10;
let currentPixels=[]
let currentID=0
let buttonGrid= document.getElementById("buttonGrid")
let buttonList = buttonGrid.querySelectorAll("*")


let mouseX = 0, mouseY = 0;
let isDrawing = false;
class Pixel{
    constructor(x,y,type){
        this.x=x;
        this.y=y;
        this.type=type;
        this.typeData=types[type];
        this.id=currentID
        this.color=RandomColor(this)
        currentID++;
        sandGrid[x][y] = this;
    }
}

function buttonColor(Buttons){
    Buttons.forEach(button=>{
        button.style.backgroundColor=types[button.id].color
    })
}

function createPixel(x,y,type){
    currentPixels.push(new Pixel(x,y,type))
}


resizeCanvas();


let types={"sand":{
    "name":"sand",
    "color":"#F4A460",
    "behavior":[
        "00||00||00",
        "00||00||00",
        "22%70||11||22%70"
    ],
    "weight":2,
    "category":"land"

},
"rocks":{
    "name":"rocks",
    "color":"#808080",
    "behavior":[
        "00||00||00",
        "00||00||00",
        "00||11||00"
    ],
    "weight":3,
    "category":"land"

},
"water":{
    "name":"water",
    "color":"#1E90FF",
    "behavior":[
        "00||00||00",
        "22||00||22",
        "22||11%70||22"
    ],
    "weight":1,
    "category":"liquid"
},
"smoke":{
    "name":"smoke",
    "color":"#D3D3D3",
    "behavior":[
        "22||11%50||22",
        "22||00||22",
        "00||00||00"
    ],
    "weight":1,
    "category":"gas"
},
"wall":{
    "name":"wall",
    "color":"#2F4F4F",
    "behavior":[
        "00||00||00",
        "00||00||00",
        "00||00||00"
    ],
    "weight":1,
    "category":"solid"
},
"virus":{
    "name":"virus",
    "color":"#4B0082",
    "behavior":[
        "R:virus||R:virus||R:virus",
        "R:virus||00||R:virus",
        "22%70||R:virusAND11||22%70"
    ],
    "weight":2,
    "category":"solid"
}

}

buttonColor(buttonList);
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
function RandomColor(pixel){
    var type=pixel.type
    var typeData=typeData
    var rgb = hexToRgb(types[type].color);
    var colorOffSet=Math.floor(Math.random() * (Math.random() > 0.5 ? -1 : 1) * Math.random() * 15);
    var r = rgb.r + colorOffSet;
    var g = rgb.g + colorOffSet;
    var b = rgb.b + colorOffSet;
    r = Math.max(0, Math.min(255, r));
    g = Math.max(0, Math.min(255, g));
    b = Math.max(0, Math.min(255, b));
    var color = "rgb("+r+","+g+","+b+")";
    return color

}


canvas.addEventListener("mousemove", (event) => {
    const rect = canvas.getBoundingClientRect();
    mouseX = event.clientX - rect.left
    mouseY = event.clientY - rect.top

    col = Math.floor(mouseX / cellSize)
    row = Math.floor(mouseY / cellSize)
    if (isDrawing === true) {
        for(i=0;i<brush_size_slider.value;i++){
            for(j=0;j<brush_size_slider.value;j++){
                if (isEmpty(col+i,row+j)){
                pixelNumber+=1
                createPixel(col+i,row+j,currentType)
                }

                
                
            }
            
        }
        
    }
})

canvas.addEventListener("mousedown", () => {
    isDrawing = true;
})

canvas.addEventListener("mouseup", () => {
    isDrawing = false;
})



function updateGrid() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    for (i=0;i<currentPixels.length;i++){
        pixel = currentPixels[i]
        x=pixel.x
        y=pixel.y
        //documents pixel count
        
        ctx.fillStyle = pixel.color
        ctx.fillRect(x * cellSize, y * cellSize, cellSize, cellSize)
    }
    pixel_number_paragraph.textContent=pixelNumber
    }
    
    function movePixel(pixel,x,y) {
        if (!currentPixels.includes(pixel)) {
            return;
        }
           
        sandGrid[pixel.x][pixel.y] = 0
     
        pixel.x = x;
        pixel.y = y;
        sandGrid[x][y] = pixel;
    }

    function pixelSwap(pixel1,pixel2){
        var tempX = pixel1.x;
        var tempY = pixel1.y;
        pixel1.x = pixel2.x;
        pixel1.y = pixel2.y;
        pixel2.x = tempX;
        pixel2.y = tempY;
        sandGrid[pixel1.x][pixel1.y] = pixel1;
        sandGrid[pixel2.x][pixel2.y] = pixel2;

    }
function Replace_pixel(Replace_Cells,replace_Type){
    if(Replace_Cells.length>0){
        var coords= Replace_Cells[Math.floor(Math.random()*Replace_Cells.length)]
        if (isInBounds(coords.x,coords.y)){
        if (sandGrid[coords.x][coords.y].type!=replace_Type&& sandGrid[coords.x][coords.y]!=0){
            createPixel(coords.x,coords.y,replace_Type)
        }
        else{Replace_Cells.splice(Replace_Cells.indexOf(coords),1);}
    }
}

}
function Priority_move(Priority_Cells_1,Priority_Cells_2,pixel){
    let moved=false
        if (Priority_Cells_1.length>0){
            while (Priority_Cells_1.length>0){
                var coords= Priority_Cells_1[Math.floor(Math.random()*Priority_Cells_1.length)]
                var newx=coords.x
                var newy=coords.y
                if (isEmpty(newx,newy)){
                    moved=true
                    movePixel(pixel,newx,newy)
                    break
                }
                else{Priority_Cells_1.splice(Priority_Cells_1.indexOf(coords),1);}
                if (isInBounds(newx,newy)&&sandGrid[newx][newy]!=0){
                    if(sandGrid[newx][newy].typeData.weight<pixel.typeData.weight&&(sandGrid[newx][newy].typeData.category=="liquid"||sandGrid[newx][newy].typeData.category=="gas")){
                        moved=true
                        pixelSwap(pixel,sandGrid[newx][newy])
                    }
                }
                
            }
           
        }
        if (moved==false){
            if (Priority_Cells_2.length>0){
                while (Priority_Cells_2.length>0){
                    var coords= Priority_Cells_2[Math.floor(Math.random()*Priority_Cells_2.length)]
                    newx=coords.x
                    newy=coords.y
                    if (isEmpty(newx,newy)){
                        moved=true
                        movePixel(pixel,newx,newy)
                        break
                    }
                    else{
                        Priority_Cells_2.splice(Priority_Cells_2.indexOf(coords),1);
                    }
                }
               
            }

        }

    }
function isInBounds(x,y){
    return (x>=0 &&y>=0&&x<sandGrid.length && y<sandGrid[x].length)
}
function isEmpty(x,y){
    if (x>=0 &&y>=0&&x<sandGrid.length && y<sandGrid[x].length){
        return sandGrid[x][y]==0
    }
    return false
}
//HI CALLUM SORT THIS FUNCTION, THERE IS AN INFINITE LOOP BEING CAUSED SOMEHOW

function behaviorCoords(x,y,bi,bj){
    x+=(bj-1)
    y+=(bi-1)
    return {x:x,y:y}
}
function pixelLogic(pixel){
    var Data = pixel.typeData
    var behavior=Data.behavior
    var x = pixel.x
    var y = pixel.y
    var Priority_Cells_1=[]
    var Priority_Cells_2=[]
    var Replace_Cells=[]
    var replace_Type=""
    for (let bi = 0; bi < behavior.length; bi++) {
        behavior_row= behavior[bi].split("||")
        for (let bj =0; bj<behavior_row.length; bj++) {
           var behavior_cell=behavior_row[bj];
           var behavior_list = [behavior_cell];
           if (behavior_cell.includes("AND")){
            behavior_list=behavior_cell.split("AND")
           }
           behavior_list.forEach(single_behavior => {
            if (single_behavior.includes("%")) {
                var chance = parseFloat(single_behavior.split("%")[1]);
                single_behavior = single_behavior.split(/[\:\%]/)[0];
            }
            else { var chance = 100; }
            if (Math.random()*100 < chance) {
            var NextCoords= behaviorCoords(x,y,bi,bj)
            if(single_behavior =="11"){
                Priority_Cells_1.push(NextCoords)
            }
            if(single_behavior =="22"){
                Priority_Cells_2.push(NextCoords)
            }
            if(single_behavior.includes("R")){
                replace_Type= single_behavior.split(":")[1];
                Replace_Cells.push(NextCoords)
            }
           }});
            
    }
} 
    Priority_move(Priority_Cells_1,Priority_Cells_2,pixel)
    Replace_pixel(Replace_Cells,replace_Type)
}

setInterval(() => {
    if (!isPaused){

    
    for (i=0;i<currentPixels.length;i++){
        pixel = currentPixels[i]
        pixelLogic(pixel)
    }}
    updateGrid();
}, 10)



brush_size_slider.addEventListener("input", () => {
    brush_sliderValue.textContent = brush_size_slider.value
})

cell_size_slider.addEventListener("input", () => {
    cell_sliderValue.textContent = cell_size_slider.value
    resizeCanvas()
})

clearButton.addEventListener("click",()=>{
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    for(let i  =0;i<sandGrid.length;i++){
        sandGrid[i].fill(0)
    }
    pixelNumber=0;
    currentPixels=[]
})


function resizeCanvas(){
    canvas.width= window.innerWidth-200
    canvas.height=window.innerHeight-150
    cellSize= cell_size_slider.value
  cols = Math.floor(canvas.width / cellSize);
  rows = Math.floor(canvas.height / cellSize);
  
  
  // Recreate the grid to match new size
  sandGrid = Array.from({ length: cols }, () =>
    Array.from({ length: rows }, () => (0))
);

  updateGrid()
}

window.addEventListener("resize", resizeCanvas);
let currentType="sand"
resizeCanvas();
buttonList.forEach(button => {
    button.addEventListener("click", () => {currentType=button.id});
});

pauseButton.addEventListener("click",()=>{isPaused=!isPaused
    if (isPaused){
        pauseButton.textContent="Unpause"
    }
    else{
        pauseButton.textContent="Pause"
    }
})
