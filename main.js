const svg = document.querySelector("#svg");
const pw = document.querySelector(".pixelwise");
pw.setAttribute("height", "800px");
pw.setAttribute("width", "800px");
const ctx_pw = pw.getContext("2d");
const init_mode = 2;
const init_border_color = 3;
const init_border_width = 3;
const init_fill_color = 7;
var layer = 0; // 0: both, 1: svg, 2: pixelwise
var mode = init_mode; // 0: cursor, 1: line, 2: rectangle, 3: ellipse
var border_color = init_border_color; // 1:"#fff", 2: "#999", 3:"#000", 4:"#ff0", 5:"#f00", 6:"#0ff", 7:"#0f0"
var border_width = init_border_width;
var fill_color = init_fill_color; // 1:"#fff", 2: "#999", 3:"#000", 4:"#ff0", 5:"#f00", 6:"#0ff", 7:"#0f0"
var mousedowned = false;
var mousedown_cursorX = 0;
var mousedown_cursorY = 0;
var mousemove_cursorX = 0;
var mousemove_cursorY = 0;
var mouseup_cursorX = 0;
var mouseup_cursorY = 0;
var obj_id = 0;


const colors = {1:"#fff", 2: "#999", 3:"#000", 4:"#ff0", 5:"#f00", 6:"#0ff", 7:"#0f0"}
const obj_dict = {}

const draw_rectangle = (fill_color, stroke_width, stroke_color, width, height, x, y, opts) => {
  return `
  <rect`
  + (opts["id"]?` id="${opts["id"]}"`:"") +
  `
  x=${x} y=${y}
  width=${width}px height=${height}px
  style="fill:${fill_color};
  stroke-width:${stroke_width}px;
  stroke:${stroke_color}"
  shape-rendering="crispEdges"
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
  var modeInputs = document.getElementById("modeInput");
  var borderColorInputs = document.getElementById("borderColorInput");
  var fillColorInputs = document.getElementById("fillColorInput");
  modeInputs.innerHTML += `
    <label class="inputIcon flexbox" >
      <input id="modeInput2" type="button" onclick="selectPanel(event)">
      <svg id="modeInput2Icon" viewbox="0, 0, 42, 28">
        ${draw_rectangle(colors[init_fill_color], 1, colors[init_border_color], 42, 28, 0, 0, {})}
      </svg>
    </label>
    `;
  modeInputs.innerHTML += `
    <label class="inputIcon flexbox" >
      <input id="modeInput3" type="button" onclick="selectPanel(event)">
      <svg id="modeInput3Icon" viewbox="0, 0, 42, 28">
        ${draw_ellipse(colors[init_fill_color], 1, colors[init_border_color], 21, 14, 21, 14, {})}
      </svg>
    </label>
    `;
  for (let v = 1; v < Object.keys(colors).length + 1; v++) {
    // console.log(v);
    borderColorInputs.innerHTML += `\
    <label class="inputIcon flexbox">\
      <input id="borderColorInput${v}" type="button" onclick="selectPanel(event)">\
      <svg viewbox="0, 0, 42, 28">\
        ${draw_rectangle(colors[v], 1, colors[3], 42, 28, 0, 0, {})}\
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
        ${draw_rectangle(colors[v], 1, colors[3], 42, 28, 0, 0, {})}\
      </svg>\
    </label>\
    `;
  }
  document.getElementById(`borderColorInput${init_border_color}`).parentElement.style.border="solid 1px #00f";
  document.getElementById(`fillColorInput${init_fill_color}`).parentElement.style.border="solid 1px #00f";
  document.getElementById(`modeInput${init_mode}`).parentElement.style.border="solid 1px #00f";
}

const change

const loadingWorkspace = () => {
  var workpace = document.querySelector(".workspace");
  workpace.addEventListener("mousedown", mousedown);
  workpace.addEventListener("mousemove", mousemove);
  workpace.addEventListener("mouseup", mouseup);
}

const printCurrentState = () => {
  console.log(`layer: ${layer}\nmode: ${mode},\nborder_color: ${border_color}\nborderWidth: ${border_width}fill_color: ${fill_color}`);
}

function draw_example() {
  // ctx_pw.fillStyle = "rgb(200,0,0)";
  // ctx_pw.strokeRect(50,50,50,50);
  var a = `<ellipse cx="200" cy="80" rx="100" ry="50"
  style="fill:yellow;stroke:purple;stroke-width:2" />`
  var b = `<ellipse cx="300" cy="200" rx="100" ry="50"
  style="fill:yellow;stroke:purple;stroke-width:2" />`
  var c = `<rect x="0" y="0" width="50" height="20" style="fill:#0ff;  stroke-width:1px;  stroke:#000" shape-rendering="crispEdges"></rect>`
  var d = draw_rectangle(colors[3], 1, colors[5], 100, 50, 200, 300, {});
  // svg.innerHTML += b;
  // svg.innerHTML += a;
  svg.innerHTML += d;
}

// draw_example();


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

const mousedown = (e) => {
  mousedown_cursorX = e.clientX;
  mousedown_cursorY = e.clientY;
  console.log("mousedown, ", e.clientX, e.clientY);
  mousedowned = true;
}

const mousemove = (e) => {
  mouseup_cursorX = e.clientX;
  mouseup_cursorY = e.clientY;
  if (mousedowned) {
    draw_in_workspace(true);
  }
}

const mouseup = (e) => {
  mouseup_cursorX = e.clientX;
  mouseup_cursorY = e.clientY;
  console.log("mouseup, ", e.clientX, e.clientY);
  draw_in_workspace(false);
  mousedowned = false;
}

const draw_in_workspace = (tmp) => {
  if (mode === 2) {
    var id = `obj_id${obj_id}`;
    var left = Math.min(mousedown_cursorX, mouseup_cursorX);
    var top = Math.min(mousedown_cursorY, mouseup_cursorY);
    var rect = draw_rectangle(
      colors[fill_color], border_width, colors[border_color],
      Math.abs(mouseup_cursorX - mousedown_cursorX),
      Math.abs(mouseup_cursorY - mousedown_cursorY),
      left - 260 - 8, top - 8,
      {"id": id}
      );
    
    if (tmp) {
      try {
        document.getElementById(id).remove();
      } catch {};
      svg.innerHTML += rect;
    } else {
      svg.innerHTML += rect;
      obj_id += 1;
    }
    
  }
}