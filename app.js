
// Global selection
const colorDivs = document.querySelectorAll('.color');
const generateBtn = document.querySelector('.generate');
const sliders = document.querySelectorAll('input [type="range"]');
const currentHex = document.querySelectorAll('.color h2');
let initialColors;
//Functions
// Color generator
function generateHex() {
    const hexColor = chroma.random();
    return hexColor;
}




function randomColors() {
    colorDivs.forEach((div, index) => {
        const hexText = div.children[0];
        const randomColor = generateHex();
        // Add the color to the bg
        div.style.backgroundColor = randomColor;
        hexText.innerText = randomColor;
    });

}

randomColors();