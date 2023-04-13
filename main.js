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
var obj_id_cnt = 0;
var current_obj = null;


const colors = {1:"#fff", 2: "#999", 3:"#000", 4:"#ff0", 5:"#f00", 6:"#0ff", 7:"#0f0"};
const obj_dict = {};

const createStyle = (stroke_color, stroke_width, fill_color) => {
  return `
  fill:${colors[fill_color]};
  stroke-width:${stroke_width}px;
  stroke:${colors[stroke_color]}`
}

const drawRectangle = (stroke_color, stroke_width, fill_color, width, height, x, y, opts) => {
  return `
  <rect`
  + (opts["id"]?` id="${opts["id"]}"`:"") +
  `
  x=${x} y=${y}
  width=${width}px height=${height}px
  style="${createStyle(stroke_color, stroke_width, fill_color)}"
  shape-rendering="crispEdges"
  />`;
}

const drawEllipse = (stroke_color, stroke_width, fill_color, rx, ry, cx, cy) => {
  return `
  <ellipse
  cx=${cx} cy=${cy}
  rx=${rx}px ry=${ry}px
  style="${createStyle(stroke_color, stroke_width, fill_color)}"
  shape-rendering="crispEdges"
  />`;
}

const loadingPanel = () => {
  var borderColorInputs = document.getElementById("borderColorInput");
  var fillColorInputs = document.getElementById("fillColorInput");
  renderModeInputIcon();
  for (let v = 1; v < Object.keys(colors).length + 1; v++) {
    // console.log(v);
    borderColorInputs.innerHTML += `\
    <label class="inputIcon flexbox">\
      <input id="borderColorInput${v}" type="button" onclick="selectPanel(event)">\
      <svg viewbox="0, 0, 42, 28">\
        ${drawRectangle(3, 1, v, 42, 28, 0, 0, {})}\
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
        ${drawRectangle(3, 1, v, 42, 28, 0, 0, {})}\
      </svg>\
    </label>\
    `;
  }
  document.getElementById(`borderColorInput${border_color}`).parentElement.style.border="solid 1px #00f";
  document.getElementById(`fillColorInput${fill_color}`).parentElement.style.border="solid 1px #00f";
  document.getElementById(`modeInput${mode}`).parentElement.style.border="solid 1px #00f";
}

const renderModeInputIcon = () => { // also change border width
  var modeInputs = document.getElementById("modeInput").parentElement.getElementsByTagName("label");
  // console.log(modeInputs);
  try {
    var icon = document.getElementById("modeInput2Icon");
    icon.remove();
    var icon = document.getElementById("modeInput3Icon");
    icon.remove();
  } catch {};
  modeInputs[2].innerHTML += `
    <svg id="modeInput2Icon" viewbox="0, 0, 42, 28">
      ${drawRectangle(border_color, 1, fill_color, 42, 28, 0, 0, {})}
    </svg>
    `;
  modeInputs[3].innerHTML += `
    <svg id="modeInput3Icon" viewbox="0, 0, 42, 28">
      ${drawEllipse(border_color, 1, fill_color, 21, 14, 21, 14, {})}
    </svg>
    `;
}

const changePanelIconBorder = () => {
  var modeInput = document.getElementById("modeInput");
  for (let sib of modeInput.children) {
    sib.style.border="solid 1px #fff";
  }
  document.getElementById(`modeInput${mode}`).parentElement.style.border="solid 1px #00f";
  var borderColorInput = document.getElementById("borderColorInput");
  for (let sib of borderColorInput.children) {
    sib.style.border="solid 1px #fff";
  }
  document.getElementById(`borderColorInput${border_color}`).parentElement.style.border="solid 1px #00f";
  var fillColorInput = document.getElementById("fillColorInput");
  for (let sib of fillColorInput.children) {
    sib.style.border="solid 1px #fff";
  }
  document.getElementById(`fillColorInput${fill_color}`).parentElement.style.border="solid 1px #00f";
  var widthInput = document.getElementById("borderWidthInput0");
  widthInput.parentElement.getElementsByTagName("p")[0].innerHTML = border_width;
  widthInput.value = border_width;
}

const loadingWorkspace = () => {
  var workspace = document.querySelector(".workspace");
  workspace.addEventListener("mousedown", mousedown);
  workspace.addEventListener("mousemove", mousemove);
  workspace.addEventListener("mouseup", mouseup);
  svg.innerHTML += `
  <filter id="selectFilter">
    <feOffset result="offOut" in="SourceAlpha" dx="0" dy="0" />
    <feGaussianBlur result="blurOut" in="offOut" stdDeviation="5" />
    <feBlend in="SourceGraphic" in2="blurOut" mode="normal" />
  </filter>
  `
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
  var d = drawRectangle(colors[3], 1, colors[5], 100, 50, 200, 300, {});
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
  var id = e.target.getAttribute("id");
  var chosenNum = parseInt(id.slice(-1))
  switch (id.slice(0, -1)) {
    case "modeInput":
      mode = chosenNum;
      break;
    case "borderColorInput":
      border_color = chosenNum;
      break;
    case "fillColorInput":
      fill_color = chosenNum;
      break;
  }
  modifyObj();
  renderModeInputIcon();
  changePanelIconBorder();
  printCurrentState();
}

const selectWidth = (e) => {
  var widthInput = document.getElementById("borderWidthInput0");
  border_width = widthInput.value;
  changePanelIconBorder();
}

const modifyObj = () => {
  try {
    current_obj.setAttribute("style", createStyle(border_color, border_width, fill_color));
    var obj_info = obj_dict[`${current_obj.getAttribute("id")}`];
    obj_info["border_color"] = border_color;
    obj_info["border_width"] = border_width;
    obj_info["fill_color"] = fill_color;
    console.log(current_obj);
  } catch {};
}

const mousedown = (e) => {
  mousedown_cursorX = e.clientX;
  mousedown_cursorY = e.clientY;
  console.log("mousedown, ", e.clientX, e.clientY);
  mousedowned = true;
  if (mode == 0) {
    chooseObj(e);
  }
}

const mousemove = (e) => {
  mouseup_cursorX = e.clientX;
  mouseup_cursorY = e.clientY;
  if (mousedowned) {
    drawInWorkspace(true);
  }
}

const mouseup = (e) => {
  mouseup_cursorX = e.clientX;
  mouseup_cursorY = e.clientY;
  console.log("mouseup, ", e.clientX, e.clientY);
  drawInWorkspace(false);
  mousedowned = false;
}

const drawInWorkspace = (tmp) => {
  if (mode === 2) {
    var id = `obj_id${obj_id_cnt}`;
    var left = Math.min(mousedown_cursorX, mouseup_cursorX);
    var top = Math.min(mousedown_cursorY, mouseup_cursorY);
    var rect = drawRectangle(
      border_color, border_width, fill_color,
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
      obj_dict[`${id}`] = {
        "mode": mode,
        "border_color": border_color,
        "border_width": border_width,
        "fill_color": fill_color,
        "width": Math.abs(mouseup_cursorX - mousedown_cursorX),
        "height": Math.abs(mouseup_cursorY - mousedown_cursorY),
        "x": left - 260 - 8,
        "y": top - 8,
      }
      obj_id_cnt += 1;
    }
    
  }
}

const chooseObj = (e) => {
  console.log("chooseObj !", e.target);
  var tar = e.target;
  try {
    current_obj.setAttribute("filter", "");
  } catch {};
  if (tar.getAttribute("id").slice(0, 6) == "obj_id") {
    tar.setAttribute("filter", `url(#selectFilter)`);
    current_obj = tar;
    var obj_info = obj_dict[`${current_obj.getAttribute("id")}`];
    console.log(obj_info);
    border_color = obj_info["border_color"];
    border_width = obj_info["border_width"];
    fill_color = obj_info["fill_color"];
    renderModeInputIcon();
    changePanelIconBorder();
  }

  if (tar.getAttribute("id") == "svg") {
    current_obj = null;
  }
}