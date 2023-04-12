const svg = document.querySelector(".svg");
const pw = document.querySelector(".pixelwise");
pw.setAttribute("height", "800px");
pw.setAttribute("width", "800px");
const ctx_pw = pw.getContext("2d");
var layer = 0; // 0: both, 1: svg, 2: pixelwise
var mode = 0; // 0: cursor, 1: line, 2: rectangle, 3: ellipse
var border_color = 0; // 1:"#fff", 2: "#999", 3:"#000", 4:"#ff0", 5:"#f00", 6:"#0ff", 7:"#f0f"
var border_width = 3;
var fill_color = 0; // 1:"#fff", 2: "#999", 3:"#000", 4:"#ff0", 5:"#f00", 6:"#0ff", 7:"#f0f"

const colors = {1:"#fff", 2: "#999", 3:"#000", 4:"#ff0", 5:"#f00", 6:"#0ff", 7:"#f0f"}

const draw_rectangle = (fill_color, stroke_width, stroke_color, width, height, x, y) => {
  return `\
  <rect\
  x=${x} y=${y}\
  width=${width}px height=${height}px\
  style="fill:${fill_color};\
  stroke-width:${stroke_width}px;\
  stroke:${stroke_color}"\
  shape-rendering="crispEdges"\
  />`;
}

const draw_ellipse = (fill_color, stroke_width, stroke_color, rx, ry, cx, cy) => {
  return `\
  <ellipse\
  cx=${cx} cy=${cy}\
  rx=${rx}px ry=${ry}px\
  style="fill:${fill_color};\
  stroke-width:${stroke_width}px;\
  stroke:${stroke_color}"\
  shape-rendering="crispEdges"\
  />`;
}

const loadingPanel = () => {
  var modeInputs = document.getElementById("modeInput").getElementsByTagName("label");
  var borderColorInputs = document.getElementById("borderColorInput");
  var fillColorInputs = document.getElementById("fillColorInput");
  modeInputs[2].innerHTML += `\
  <svg viewbox="0, 0, 42, 28">\
    ${draw_rectangle(colors[6], 1, colors[5], 42, 28, 0, 0)}
  </svg>`;
  modeInputs[3].innerHTML += `\
  <svg viewbox="0, 0, 42, 28">\
    ${draw_ellipse(colors[6], 1, colors[5], 21, 14, 21, 14)}
  </svg>`;
  for (let v = 1; v < Object.keys(colors).length + 1; v++) {
    // console.log(v);
    borderColorInputs.innerHTML += `\
    <label class="inputIcon flexbox">\
      <input id="borderColorInput${v}" type="button" onclick="selectPanel(event)">\
      <svg viewbox="0, 0, 42, 28">\
        ${draw_rectangle(colors[v], 1, colors[3], 42, 28, 0, 0)}\
      </svg>\
    </label>\
    `;
  }
  for (let v = 1; v < Object.keys(colors).length + 1; v++) {
    // console.log(v);
    fillColorInputs.innerHTML += `\
    <label class="inputIcon flexbox">\
      <input id="fillColorInput${v}" type="button" onclick="selectPanel(event)">\
      <svg viewbox="0, 0, 42, 28">\
        ${draw_rectangle(colors[v], 1, colors[3], 42, 28, 0, 0)}\
      </svg>\
    </label>\
    `;
  }
}

const printCurrentState = () => {
  console.log(`layer: ${layer}\nmode: ${mode},\nborder_color: ${border_color}\nborderWidth: ${border_width}fill_color: ${fill_color}`);
}

function draw_example() {
  ctx_pw.fillStyle = "rgb(200,0,0)";
  ctx_pw.strokeRect(50,50,50,50);
  var a = `<ellipse cx="200" cy="80" rx="100" ry="50"
  style="fill:yellow;stroke:purple;stroke-width:2" />`
  
  var b = `<ellipse cx="300" cy="200" rx="100" ry="50"
  style="fill:yellow;stroke:purple;stroke-width:2" />`
  
  svg.innerHTML += b;
  svg.innerHTML += a;
}

// draw_example()


const selectLayer = () => { // 0: both, 1: svg, 2: pixelwise
  console.log("layerSelect!");
  let layersInput = document.getElementById("layersInput")
  if (layersInput.layer[0].checked) {
    layer = 0;
    svg.style.visibility = "";
    pw.style.visibility = "";
  }
  if (layersInput.layer[1].checked) {
    layer = 1;
    svg.style.visibility = "";
    pw.style.visibility = "hidden";
  }
  if (layersInput.layer[2].checked) {
    layer = 2;
    svg.style.visibility = "hidden";
    pw.style.visibility = "";
  }
  printCurrentState();
}

const selectPanel = (e) => {
  console.log("selectPanel !!")
  for (let sib of e.target.parentElement.parentElement.children) {
    sib.style.border="solid 1px #fff";
  }
  e.target.parentElement.style.border="solid 1px #00f";
  var id = e.target.getAttribute("id");
  switch (id.slice(0, -1)) {
    case "modeInput":
      mode = parseInt(id.slice(-1));
      break;
    case "borderColorInput":
      border_color = parseInt(id.slice(-1));
      break;
    case "fillColorInput":
      fill_color = parseInt(id.slice(-1));
      break;
  }
  printCurrentState();
}

const selectWidth = (e) => {
  var widthInput = document.getElementById("borderWidthInput0");
  widthInput.parentElement.getElementsByTagName("p")[0].innerHTML = widthInput.value;
  border_width = widthInput.value;
  // printCurrentState();
}

