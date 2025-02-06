const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
const gravity=1;
const maxVelocity=3;
const brush_size_slider = document.getElementById("brush_size_slider")
const cell_size_slider = document.getElementById("cell_size_slider")
const brush_sliderValue = document.getElementById("brush_value")
const cell_sliderValue =  document.getElementById("cell_value")

const clearButton= document.getElementById("clear_button")
const stoneButton=document.getElementById("stone")
const sandButton=document.getElementById("sand")
const waterButton=document.getElementById("water")
const smokeButton=document.getElementById("smoke")
let mode="stone"

let cellSize = 10;
resizeCanvas();
console.table(sandGrid)
ctx.fillStyle = "black"
let mouseX = 0, mouseY = 0;
let isDrawing = false;




canvas.addEventListener("mousemove", (event) => {
    const rect = canvas.getBoundingClientRect();
    mouseX = event.clientX - rect.left
    mouseY = event.clientY - rect.top

    col = Math.floor(mouseX / cellSize)
    row = Math.floor(mouseY / cellSize)
    if (isDrawing === true) {
        for(i=0;i<brush_size_slider.value;i++){
            for(j=0;j<brush_size_slider.value;j++){
                if (mode==="stone"){
                    sandGrid[col+i][row+j]={type:1,velocity:0}
                }
                else if (mode==="sand"){
                    sandGrid[col+i][row+j]={type:2,velocity:0}
                }
                else if (mode==="water"){
                    sandGrid[col+i][row+j]={type:3,velocity:0}
                }
                else if (mode==="smoke"){
                    sandGrid[col+i][row+j]={type:4,velocity:0}
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
    for (i = 0; i < sandGrid.length; i++) {
        for (j = 0; j < sandGrid[i].length; j++) {
            let cell = sandGrid[i][j]
            if (cell.type === 1) {
                ctx.fillStyle = "gray"
                ctx.fillRect(i * cellSize, j * cellSize, cellSize, cellSize)
            }
            else if (cell.type === 2){
                ctx.fillStyle = "gold"
                ctx.fillRect(i * cellSize, j * cellSize, cellSize, cellSize)
            }
            else if (cell.type === 3){
                ctx.fillStyle = "blue"
                ctx.fillRect(i * cellSize, j * cellSize, cellSize, cellSize)
            }
            else if (cell.type === 4){
                ctx.fillStyle = "lightgray"
                ctx.fillRect(i * cellSize, j * cellSize, cellSize, cellSize)
            }


        }
    }
}

function stoneMove(i,j) {
    if (sandGrid[i][j] === 1 && j + 1 < sandGrid.length && [0, 3, 4].includes(sandGrid[i][j + 1])) {
        sandGrid[i][j + 1] = 1;
        sandGrid[i][j] = 0;
            
    }
    
}

function sandMove(i,j) {
    let cell=sandGrid[i][j]
    number = Math.random()
    if (cell.type===2){
        cell.velocity = Math.min(cell.velocity + gravity, maxVelocity);
        for (let step = 1; step <= Math.floor(cell.velocity); step++) {
            let newJ = j + step;
       

        
            // Check if it's within bounds and can fall straight down
            if (newJ < sandGrid[i].length && sandGrid[i][newJ].type === 0) {
                sandGrid[i][newJ] = { ...cell };
                sandGrid[i][j] = { type: 0, velocity: 0 };
                return;
            }
        }
        
        if (number < 0.5 && i + 1 < sandGrid.length && sandGrid[i + 1][j + 1].type === 0) {
            sandGrid[i + 1][j + 1] = { ...cell, velocity: cell.velocity }; // Reduce velocity slightly
            sandGrid[i][j] = { type: 0, velocity: 0 };
            return;
        }
        else if (number >= 0.5 && i > 0 && sandGrid[i - 1][j + 1].type === 0) {
            sandGrid[i - 1][j + 1] = { ...cell, velocity: cell.velocity }; // Reduce velocity slightly
            sandGrid[i][j] = { type: 0, velocity: 0 };
            return;
        }
        cell.velocity=0
    
   
    
    
}
}
function waterMove(i,j){
    number = Math.random()
    if (j+1 <sandGrid.length){
        if (sandGrid[i][j] === 3 && [0, 4].includes(sandGrid[i][j + 1])) {
            sandGrid[i][j + 1] = 3;
            sandGrid[i][j] = 0;
            return
                
        }
        else if(number<0.5 && i+1<sandGrid.length){
            if(sandGrid[i+1][j]===0 && sandGrid[i][j]===3){
                sandGrid[i][j] = 0;
                sandGrid[i+1][j]=3
                return
            }
        }
        else if(number>0.5 && i>=1){
            if(sandGrid[i-1][j]===0 && sandGrid[i][j]===3){
                sandGrid[i][j] = 0;
                sandGrid[i-1][j]=3
                return
            }
        }
    }
   
}
function smokeMove(i,j){
    number = Math.random()
    if (j+1 <sandGrid.length){
        if (sandGrid[i][j] === 4 && sandGrid[i][j-1] === 0) {
            sandGrid[i][j-1] = 4;
            sandGrid[i][j] = 0;
            return
                
        }
        else if(number<0.5 && i+1<sandGrid.length){
            if(sandGrid[i+1][j]===0 && sandGrid[i][j]===4){
                sandGrid[i][j] = 0;
                sandGrid[i+1][j]=4
                return
            }
        }
        else if(number>0.5 && i>=1){
            if(sandGrid[i-1][j]===0 && sandGrid[i][j]===4){
                sandGrid[i][j] = 0;
                sandGrid[i-1][j]=4
                return
            }
        }
    }
}

setInterval(() => {
    for (let i = 0; i <= sandGrid.length - 1; i++) {
        for (let j = sandGrid[i].length - 1; j >= 0; j--) {
            stoneMove(i,j);
            sandMove(i,j);
            waterMove(i,j);
            smokeMove(i,j);
    }
}
    

    updateGrid();
}, 100)



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
})


function resizeCanvas(){
    canvas.width= window.innerWidth
    canvas.height=window.innerHeight
    cellSize= cell_size_slider.value
  cols = Math.floor(canvas.width / cellSize);
  rows = Math.floor(canvas.height / cellSize);
  
  // Recreate the grid to match new size
  sandGrid = Array.from({ length: cols }, () => 
    Array.from({ length: rows }, () => ({ type: 0, velocity: 0 }))
);

  updateGrid()
}

window.addEventListener("resize", resizeCanvas);

resizeCanvas();
stoneButton.addEventListener("click",()=>{
    mode="stone"
})
sandButton.addEventListener("click",()=>{
    mode="sand"
})
waterButton.addEventListener("click",()=>{
    mode="water"
})
smokeButton.addEventListener("click",()=>{
    mode="smoke"
})
