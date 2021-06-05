
// Global selection
const colorDivs = document.querySelectorAll('.color');
const generateBtn = document.querySelector('.generate');
const sliders = document.querySelectorAll('input[type="range"]');
const currentHex = document.querySelectorAll('.color h2');
const popup = document.querySelector('.copy-container');
const adjustButton = document.querySelectorAll('.adjust');
const lockButton = document.querySelectorAll('.lock');
const closeAdjustments = document.querySelectorAll('.close-adjustment');
const slidersContainer = document.querySelectorAll('.sliders');
let initialColors;
// local storage
let savedPalettes = [];




// Add our event listeners 
generateBtn.addEventListener('click', randomColors);

sliders.forEach(slider => {
    slider.addEventListener('input', hslControls);
});
colorDivs.forEach((div, index) => {
    div.addEventListener('change', () => {
        updateTextUI(index);
    });
});
currentHex.forEach(hex => {
    hex.addEventListener('click', () => {
        copyToClickBoard(hex);
    })
});

popup.addEventListener('transitionend', () => {
    const popupBox = popup.children[0];
    popup.classList.remove('active');
    popupBox.classList.remove('active');
});

adjustButton.forEach((button, index) => {
    button.addEventListener('click', () => {
        openAdjustmentPanel(index);
    })

});

closeAdjustments.forEach((button, index) => {
    button.addEventListener('click', () => {
        closeAdjustmentPanel(index);
    })
});

lockButton.forEach((button, index) => {
    button.addEventListener('click', () => {
        lockFeature(index);
    })
})
//Functions

function lockFeature(index) {
    colorDivs[index].classList.toggle('locked');
    lockButton[index].children[0].classList.toggle('fa-lock-open');
    lockButton[index].children[0].classList.toggle('fa-lock');
}
// Color generator
function generateHex() {
    const hexColor = chroma.random();
    return hexColor;
}




function randomColors() {
    initialColors = [];
    colorDivs.forEach((div, index) => {
        const hexText = div.children[0];
        const randomColor = generateHex();
        //Add it to the array 
        if (div.classList.contains('locked')) {
            initialColors.push(hexText.innerText);
            return;
        } else {
            initialColors.push(chroma(randomColor).hex());
        }

        // Add the color to the bg
        div.style.backgroundColor = randomColor;
        hexText.innerText = randomColor;
        //Check for contrast 
        checkTextContrast(randomColor, hexText);
        //Initial color sliders
        const color = chroma(randomColor);
        const sliders = div.querySelectorAll(".sliders input");
        const hue = sliders[0];
        const brightness = sliders[1];
        const saturation = sliders[2];


        colorizeSliders(color, hue, brightness, saturation);
    });
    //Reset Inputs
    resetInputs();
    //Check for button contrast
    adjustButton.forEach((button, index) => {
        checkTextContrast(initialColors[index], button);
        checkTextContrast(initialColors[index], lockButton[index]);
    })

}

function checkTextContrast(color, text) {
    const luminance = chroma(color).luminance();
    if (luminance > 0.5) {
        text.style.color = "black";
    } else {
        text.style.color = "white";
    }
}

function colorizeSliders(color, hue, brightness, saturation) {
    //Scale Sat
    const noSat = color.set("hsl.s", 0);
    const fullSat = color.set("hsl.s", 1);
    const scaleSat = chroma.scale([noSat, color, fullSat]);
    //Scale Brightness
    const midBright = color.set("hsl.l", 0.5);
    const scaleBrightness = chroma.scale(['black', midBright, 'white']);
    // Input update colorizeSliders
    saturation.style.backgroundImage = `linear-gradient(to right,${scaleSat(0)},${scaleSat(1)})`;
    brightness.style.backgroundImage = `linear-gradient(to right,${scaleBrightness(0)}, ${scaleBrightness(0.5)},${scaleBrightness(1)})`;
    hue.style.backgroundImage = `linear-gradient(to right, rgb(204,75,75), rgb(204,204,75), rgb(75,204,75), rgb(75,204,204), rgb(75,75,204), rgb(204,75,204), rgb(204,75,75))`;

}
function hslControls(e) {
    const index =
        e.target.getAttribute('data-bright') ||
        e.target.getAttribute('data-sat') ||
        e.target.getAttribute('data-hue');
    let sliders = e.target.parentElement.querySelectorAll('input[type="range"]');
    const hue = sliders[0];
    const brightness = sliders[1];
    const saturation = sliders[2];

    const bgColor = initialColors[index];
    let color = chroma(bgColor)
        .set('hsl.s', saturation.value)
        .set('hsl.l', brightness.value)
        .set('hsl.h', hue.value);

    colorDivs[index].style.backgroundColor = color;
    //Colorize inputs/sl
    colorizeSliders(color, hue, brightness, saturation);
}

function updateTextUI(index) {
    const activeDiv = colorDivs[index];
    const color = chroma(activeDiv.style.backgroundColor);
    const textHex = activeDiv.querySelector('h2');
    const icons = activeDiv.querySelectorAll('.controls button')
    textHex.innerText = color.hex();
    //Check contrast 
    checkTextContrast(color, textHex);
    for (icon of icons) {
        checkTextContrast(color, icon);
    }
}
function resetInputs() {
    const sliders = document.querySelectorAll('.sliders input');
    sliders.forEach(slider => {
        if (slider.name === "hue") {
            const hueColor = initialColors[slider.getAttribute('data-hue')];
            const hueValue = chroma(hueColor).hsl()[0]
            slider.value = Math.floor(hueValue);
        }
        if (slider.name === "brightness") {
            const brightColor = initialColors[slider.getAttribute('data-bright')];
            const brightValue = chroma(brightColor).hsl()[2]
            slider.value = Math.floor(brightValue * 100) / 100;
        }
        if (slider.name === "saturation") {
            const satColor = initialColors[slider.getAttribute('data-sat')];
            const satValue = chroma(satColor).hsl()[1]
            slider.value = Math.floor(satValue * 100) / 100;
        }
    });
}

function copyToClickBoard(hex) {
    const el = document.createElement('textarea');
    el.value = hex.innerText;
    document.body.appendChild(el);
    el.select();
    document.execCommand('Copy');
    document.body.removeChild(el);
    //Popup Animation
    const popupBox = popup.children[0];
    popup.classList.add('active');
    popupBox.classList.add('active');
}


function openAdjustmentPanel(index) {
    slidersContainer[index].classList.toggle('active');
}

function closeAdjustmentPanel(index) {
    slidersContainer[index].classList.remove('active');
}

// Implement save to palette and LOCAL STORAGE STUFF
const saveBtn = document.querySelector('.save');
const submitSave = document.querySelector('.submit-save');
const closeSave = document.querySelector('.close-save');
const saveContainer = document.querySelector('.save-container');
const saveInput = document.querySelector('.save-container input');
const libraryContainer = document.querySelector('.library-container');
const libraryBtn = document.querySelector('.library');
const closeLibraryBtn = document.querySelector('.close-library');

// Event listener 
saveBtn.addEventListener('click', openPalette);
closeSave.addEventListener('click', closePalette);
submitSave.addEventListener('click', savePalette);
libraryBtn.addEventListener('click', openLibrary);
closeLibraryBtn.addEventListener('click', closeLibrary);

function openPalette(e) {
    const popup = saveContainer.children[0];
    saveContainer.classList.add('active');
    popup.classList.add('active');

}

function closePalette(e) {
    const popup = saveContainer.children[0];
    saveContainer.classList.remove('active');
    popup.classList.remove('active');
}

function savePalette(e) {
    saveContainer.classList.remove('active');
    popup.classList.remove('active');
    const name = saveInput.value;
    const colors = [];
    currentHex.forEach(hex => {
        colors.push(hex.innerText);
    });
    // Generate Object 
    let paletteNr;
    const paletteObjects = JSON.parse(localStorage.getItem('palettes'));
    if (paletteObjects) {
        paletteNr = paletteObjects.length;
    } else {
        paletteNr = savedPalettes.length;
    }
    const paletteObj = { name, colors, nr: paletteNr };
    savedPalettes.push(paletteObj);
    //save to local storage
    savetoLocal(paletteObj);
    saveInput.value = "";
    // Generate the pallete for library palette
    const palette = document.createElement("div");
    palette.classList.add('custom-palette');
    const title = document.createElement('h4');
    title.innerText = paletteObj.name;
    const preview = document.createElement('div');
    preview.classList.add('small-preview');
    paletteObj.colors.forEach(smallColor => {
        const smallDiv = document.createElement('div');
        smallDiv.style.backgroundColor = smallColor;
        preview.appendChild(smallDiv);
    });
    const paletteBtn = document.createElement('button');
    paletteBtn.classList.add('pick-palette-btn');
    paletteBtn.classList.add(paletteObj.nr);
    paletteBtn.innerText = 'Select';
    //Event to the button 
    paletteBtn.addEventListener('click', e => {
        closeLibrary();
        const paletteIndex = e.target.classList[1];
        initialColors = [];
        savedPalettes[paletteIndex].colors.forEach((color, index) => {
            initialColors.push(color);
            colorDivs[index].style.backgroundColor = color;
            const text = colorDivs[index].children[0];
            checkTextContrast(color, text);
            updateTextUI(index);
        });
        resetInputs();
    });

    //Append to Library
    palette.appendChild(title);
    palette.appendChild(preview);
    palette.appendChild(paletteBtn);
    libraryContainer.children[0].appendChild(palette);
}

function savetoLocal(paletteObj) {
    let localPalette;
    if (localStorage.getItem('palettes') === null) {
        localPalette = [];
    } else {
        localPalette = JSON.parse(localStorage.getItem('palettes'));
    }
    localPalette.push(paletteObj);
    localStorage.setItem('palettes', JSON.stringify(localPalette));
}

function openLibrary() {
    const popup = libraryContainer.children[0];
    libraryContainer.classList.add('active');
    popup.classList.add('active');
}

function closeLibrary() {
    const popup = libraryContainer.children[0];
    libraryContainer.classList.remove('active');
    popup.classList.remove('active');
}

function getLocal() {
    if (localStorage.getItem("palettes") === null) {
        //Local Palettes
        localPalette = [];
    } else {
        const paletteObjects = JSON.parse(localStorage.getItem("palettes"));
        // *2

        savedPalettes = [...paletteObjects];
        paletteObjects.forEach(paletteObj => {
            //Generate the palette for Library
            const palette = document.createElement("div");
            palette.classList.add("custom-palette");
            const title = document.createElement("h4");
            title.innerText = paletteObj.name;
            const preview = document.createElement("div");
            preview.classList.add("small-preview");
            paletteObj.colors.forEach(smallColor => {
                const smallDiv = document.createElement("div");
                smallDiv.style.backgroundColor = smallColor;
                preview.appendChild(smallDiv);
            });
            const paletteBtn = document.createElement("button");
            paletteBtn.classList.add("pick-palette-btn");
            paletteBtn.classList.add(paletteObj.nr);
            paletteBtn.innerText = "Select";

            //Attach event to the btn
            paletteBtn.addEventListener("click", e => {
                closeLibrary();
                const paletteIndex = e.target.classList[1];
                initialColors = [];
                paletteObjects[paletteIndex].colors.forEach((color, index) => {
                    initialColors.push(color);
                    colorDivs[index].style.backgroundColor = color;
                    const text = colorDivs[index].children[0];
                    checkTextContrast(color, text);
                    updateTextUI(index);
                });
                resetInputs();
            });

            //Append to Library
            palette.appendChild(title);
            palette.appendChild(preview);
            palette.appendChild(paletteBtn);
            libraryContainer.children[0].appendChild(palette);
        });
    }
}

getLocal();
randomColors();