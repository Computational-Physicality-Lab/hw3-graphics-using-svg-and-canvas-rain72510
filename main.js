// import {floodFill} from "./floodfill.js"
const svg = document.querySelector("#svg");
const pw = document.querySelector("#canvas");
var pw_tmp = null;
const pw_width = 800;
const pw_height = 850;
const ctx_pw = pw.getContext("2d");
const init_layer = 1;
const init_mode = 2;
const init_border_color = 3;
const init_border_width = 3;
const init_fill_color = 7;
const panelWidth = 260;
const bodyMargin = 8;
var layer = init_layer; // 0: canvas, 1: svg, 2: both
var mode = init_mode; // 0: cursor, 1: line, 2: rectangle, 3: ellipse
var border_color = init_border_color; // 1:"#fff", 2: "#999", 3:"#000", 4:"#ff0", 5:"#f00", 6:"#0ff", 7:"#0f0"
var border_width = init_border_width;
var fill_color = init_fill_color; // 1:"#fff", 2: "#999", 3:"#000", 4:"#ff0", 5:"#f00", 6:"#0ff", 7:"#0f0"

var mousedowned = false;
var mousedown_cursorX = 0;
var mousedown_cursorY = 0;
var mouseup_cursorX = 0;
var mouseup_cursorY = 0;
var obj_id_cnt = 0;
var current_obj = null;
var escaping = false;
var shifting = false;
var polylineDetecParam = {"polylining": false, "toPop": false};
var polylinePoints = [];


const colors = {1:"#fff", 2: "#999", 3:"#000", 4:"#ff0", 5:"#f00", 6:"#0ff", 7:"#0f0"};
const obj_dict = {};

const createStyle = (stroke_color, stroke_width, fill_color) => {
  return (fill_color == 0? "fill:none;":`fill:${colors[fill_color]};`) +
    (stroke_color == 0? "stroke:none;":`stroke-width:${stroke_width}px;stroke:${colors[stroke_color]}`)
}

const distance2D = (x1, y1, x2, y2) => {
  return Math.sqrt(Math.pow(Math.abs(x1 - x2), 2) + Math.pow(Math.abs(y1 - y2), 2));
}

const deleteFromObjDict = (id) => {
  delete obj_dict[id];
}

const cloneCanvas = (oldCanvas) => {
  var newCanvas = document.createElement('canvas');
  var context = newCanvas.getContext('2d');
  newCanvas.width = oldCanvas.width;
  newCanvas.height = oldCanvas.height;
  context.drawImage(oldCanvas, 0, 0);
  return newCanvas;
}

const canvasTmp = () => {
  pw_tmp = document.createElement('canvas');
  pw_tmp.setAttribute("id", "canvas_tmp");
  pw_tmp.width = pw.width;
  pw_tmp.height = pw.height;
  pw_tmp_ctx = pw_tmp.getContext("2d");
  pw_tmp_ctx.drawImage(pw, 0, 0);
  pw.insertAdjacentElement("afterend", pw_tmp);
  switchCanvas(true);
  return pw_tmp.getContext("2d");
}

const switchCanvas = (tmp) => {
  if (tmp) {
    pw.style.display = "none";
  } else {
    pw.style.display = "";
  }
}

const drawLine = (stroke_color, stroke_width, fill_color, x1, y1, x2, y2, opts) => {
  switch (layer) {
    case 0:
      var ctx = opts["ctx"];
      ctx.strokeStyle = colors[stroke_color];
      ctx.lineWidth = stroke_width;
      ctx.beginPath();
      ctx.moveTo(x1, y1);
      ctx.lineTo(x2, y2);
      ctx.stroke();
    case 1:
      return `
      <line`
      + (opts["id"]?` id="${opts["id"]}"`:"") +
      `
      x1=${x1} y1=${y1}
      x2=${x2} y2=${y2}
      style="${createStyle(stroke_color, stroke_width, fill_color)}"
      shape-rendering="crispEdges"`
      + (opts["filter"]?"filter=url(#selectFilter)":"") +
      `/>`;
  }
}

const drawRectangle = (stroke_color, stroke_width, fill_color, width, height, x, y, opts) => {
  switch (layer) {
    case 0:
      var ctx = opts["ctx"];
      ctx.beginPath();
      ctx.rect(x, y, width, height);
      if (stroke_color != 0) {
        ctx.strokeStyle = colors[stroke_color];
        ctx.lineWidth = stroke_width;
        ctx.stroke();
      }
      if (fill_color != 0) {
        ctx.fillStyle = colors[fill_color];
        ctx.fill();
      }
      return;
    case 1:
      return `
      <rect`
      + (opts["id"]?` id="${opts["id"]}"`:"") +
      `
      x=${x} y=${y}
      width=${width}px height=${height}px
      style="${createStyle(stroke_color, stroke_width, fill_color)}"
      shape-rendering="crispEdges"`
      + (opts["filter"]?"filter=url(#selectFilter)":"") +
      `/>`;
  }
}

const drawEllipse = (stroke_color, stroke_width, fill_color, rx, ry, cx, cy, opts) => {
  switch (layer) {
    case 0:
      var ctx = opts["ctx"];
      ctx.beginPath();
      ctx.ellipse(cx, cy, rx, ry , 0, 0, Math.PI*2);
      if (stroke_color != 0) {
        ctx.strokeStyle = colors[stroke_color];
        ctx.lineWidth = stroke_width;
        ctx.stroke();
      }
      if (fill_color != 0) {
        ctx.fillStyle = colors[fill_color];
        ctx.fill();
      }
      return;
    case 1:
      return `
      <ellipse`
      + (opts["id"]?` id="${opts["id"]}"`:"") +
      `
      cx=${cx} cy=${cy}
      rx=${rx}px ry=${ry}px
      style="${createStyle(stroke_color, stroke_width, fill_color)}"
      shape-rendering="crispEdges"`
      + (opts["filter"]?"filter=url(#selectFilter)":"") +
      `/>`;
  }
}

const drawPolyLine = (stroke_color, stroke_width, fill_color, points, opts) => {
  switch (layer) {
    case 0:
      var ctx = opts["ctx"];
      ctx.strokeStyle = colors[stroke_color];
      ctx.lineWidth = stroke_width;
      ctx.beginPath();
      ctx.moveTo(points[0][0], points[0][1]);
      for (var t = 1; t < points.length; t++) {
        ctx.lineTo(points[t][0], points[t][1]);
      }
      ctx.stroke();
    case 1:
      pointsString = "";
      for (var p of points) {
        pointsString += `${p[0]},${p[1]} `;
      }
      return `
      <polyline`
      + (opts["id"]?` id="${opts["id"]}"`:"") +
      `
      points="${pointsString}"
      style="${createStyle(stroke_color, stroke_width, 0)}"
      shape-rendering="crispEdges"`
      + (opts["filter"]?"filter=url(#selectFilter)":"") +
      `/>`;
  }
}

const drawFromInfo = (info) => {
  switch (info["mode"]) {
    case 1:
      return drawLine(info["border_color"], info["border_width"], info["fill_color"], info["param"]["x1"], info["param"]["y1"], info["param"]["x2"], info["param"]["y2"], info["opts"]);
    case 2:
      return drawRectangle(info["border_color"], info["border_width"], info["fill_color"], info["param"]["width"], info["param"]["height"], info["param"]["x"], info["param"]["y"], info["opts"]);
    case 3:
      return drawEllipse(info["border_color"], info["border_width"], info["fill_color"], info["param"]["rx"], info["param"]["ry"], info["param"]["cx"], info["param"]["cy"], info["opts"]);
    case 4:
      return drawPolyLine(info["border_color"], info["border_width"], info["fill_color"], info["param"]["points"], info["opts"]);
  }
}

const loadingPanel = () => {
  var borderColorInputs = document.getElementById("borderColorInput");
  var fillColorInputs = document.getElementById("fillColorInput");
  renderModeInputIcon();
  layer = 1;
  for (let v = 1; v < Object.keys(colors).length + 1; v++) {
    borderColorInputs.innerHTML += `
    <label class="inputIcon flexbox">
      <div class="grayFilter">
      </div>
      <input id="borderColorInput${v}" type="button" onclick="selectPanel(event)">
      <svg viewbox="0, 0, 42, 28">
        ${drawRectangle(3, 1, v, 42, 28, 0, 0, {})}
      </svg>
    </label>
    `;
  }
  for (let v = 1; v < Object.keys(colors).length + 1; v++) {
    fillColorInputs.innerHTML += `
    <label class="inputIcon flexbox">
      <div class="grayFilter">
      </div>
      <input id="fillColorInput${v}" type="button" onclick="selectPanel(event)">
      <svg viewbox="0, 0, 42, 28">
        ${drawRectangle(3, 1, v, 42, 28, 0, 0, {})}
      </svg>
    </label>
    `;
  }
  document.getElementById(`borderColorInput${border_color}`).parentElement.style.border="solid 1px #00f";
  document.getElementById(`fillColorInput${fill_color}`).parentElement.style.border="solid 1px #00f";
  document.getElementById(`modeInput${mode}`).parentElement.style.border="solid 1px #00f";
  var layersInput = document.getElementById("layersInput");
  layersInput.layer[init_layer].checked = true;
  selectLayer();
  // deleteDisable();
}

const renderModeInputIcon = () => { // also change border width
  var modeInputs = document.getElementById("modeInput").parentElement.getElementsByTagName("label");
  try {
    var icon = document.getElementById("modeInput2Icon");
    icon.remove();
    var icon = document.getElementById("modeInput3Icon");
    icon.remove();
  } catch {};
  var layerOld = layer;
  layer = 1;
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
  layer = layerOld;
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
  pw.setAttribute("width", `${pw_width}px`);
  pw.setAttribute("height", `${pw_height}px`);
  var workspace = document.querySelector(".workspace");
  workspace.addEventListener("mousedown", mousedown);
  workspace.addEventListener("mousemove", mousemove);
  workspace.addEventListener("mouseup", mouseup);
  window.addEventListener("keydown", keyDown);
  window.addEventListener("keyup", keyUp);
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

const selectLayer = () => { // 0: both, 1: svg, 2: pixelwise
  // console.log("layerSelect!");
  var layersInput = document.getElementById("layersInput")
  if (layersInput.layer[0].checked) {
    layer = 0;
    svg.style.display = "none";
    pw.style.display = "";
  }
  else if (layersInput.layer[1].checked) {
    layer = 1;
    svg.style.display = "";
    pw.style.display = "none";
  }
  else if (layersInput.layer[2].checked) {
    layer = 2;
    svg.style.display = "";
    pw.style.display = "";
  }
  chooseObj(null);
  buttonDisable();
  deleteDisable();
  
}

const buttonDisable = () => {
  if (layer === 2) {
    for (var filter of document.querySelectorAll(".grayFilter")) {
      filter.style.display = "";
    }
    for (var input of document.querySelectorAll("input")) {
      if (input.getAttribute("name") === "layer") {
        continue;
      }
      if (input.parentElement.getAttribute("id") === "deleteInput") {
        continue;
      }
      input.setAttribute("disabled", true);
    }
  }
  else {
    for (var filter of document.querySelectorAll(".grayFilter")) {
      filter.style.display = "none";
    }
    for (var input of document.querySelectorAll("input")) {
      input.removeAttribute("disabled");
    }
  }
}

const deleteDisable = () => {
  var deleteButton = document.getElementById("deleteOne");
  if ((layer !== 1) || (current_obj === null)) {
    deleteButton.setAttribute("disabled", true);
  } else {
    deleteButton.removeAttribute("disabled");
  }
}

const selectPanel = (e) => {
  // console.log("selectPanel !!")
  var id = e.target.getAttribute("id");
  var chosenNum = parseInt(id.slice(-1))
  switch (id.slice(0, -1)) {
    case "modeInput":
      mode = chosenNum;
      chooseObj(null);
      break;
    case "borderColorInput":
      if ((fill_color == 0) && (chosenNum == 0)) {
        break;
      }
      border_color = chosenNum;
      break;
    case "fillColorInput":
      if ((border_color == 0) && (chosenNum == 0)) {
        break;
      }
      fill_color = chosenNum;
      break;
  }
  modifyObj();
  renderModeInputIcon();
  changePanelIconBorder();
  // printCurrentState();
}

const selectWidth = (e) => {
  var widthInput = document.getElementById("borderWidthInput0");
  border_width = widthInput.value;
  changePanelIconBorder();
  modifyObj();
}

const modifyObj = () => {
  try {
    var obj_info = obj_dict[`${current_obj.getAttribute("id")}`];
    if (obj_info["mode"] === 4) {
      current_obj.setAttribute("style", createStyle(border_color, border_width, 0));
    } else {
      current_obj.setAttribute("style", createStyle(border_color, border_width, fill_color));
    }
    obj_info["border_color"] = border_color;
    obj_info["border_width"] = border_width;
    obj_info["fill_color"] = fill_color;
  } catch {};
}

const moveObj = (tmp) => {
  try {
    var id = current_obj.getAttribute("id");
    var obj_info = obj_dict[id];
  } catch {};
  if (escaping) {
    switch (obj_info["mode"]) {
      case 1:
        try {
          current_obj.setAttribute("x1", obj_info["param"]["x1"]);
          current_obj.setAttribute("y1", obj_info["param"]["y1"]);
          current_obj.setAttribute("x2", obj_info["param"]["x2"]);
          current_obj.setAttribute("y2", obj_info["param"]["y2"]);
        } catch {};
        break;
      case 2:
        try {
          current_obj.setAttribute("x", obj_info["param"]["x"]);
          current_obj.setAttribute("y", obj_info["param"]["y"]);
        } catch {};
        break;
      case 3:
        try {
          current_obj.setAttribute("cx", obj_info["param"]["cx"]);
          current_obj.setAttribute("cy", obj_info["param"]["cy"]);
        } catch {};
        break;
      case 4:
        try {
          pointsString = "";
          for (var p of obj_info["param"]["points"]) {
            pointsString += `${p[0]},${p[1]} `;
          }
          current_obj.setAttribute("points", pointsString);
      

        } catch {};
        break;
    }
    mousedowned = false;
    chooseObj(null);
    return;
  }
  // console.log("Moving obj !!");
  var dx = mouseup_cursorX - mousedown_cursorX;
  var dy = mouseup_cursorY - mousedown_cursorY;
  switch (obj_info["mode"]) {
    case 1:
      if (tmp) {
        current_obj.setAttribute("x1", obj_info["param"]["x1"] + dx);
        current_obj.setAttribute("y1", obj_info["param"]["y1"] + dy);
        current_obj.setAttribute("x2", obj_info["param"]["x2"] + dx);
        current_obj.setAttribute("y2", obj_info["param"]["y2"] + dy);
      }
      else {
        obj_info["param"]["x1"] = obj_info["param"]["x1"] + dx;
        obj_info["param"]["y1"] = obj_info["param"]["y1"] + dy;
        obj_info["param"]["x2"] = obj_info["param"]["x2"] + dx;
        obj_info["param"]["y2"] = obj_info["param"]["y2"] + dy;
      }
      break;
    case 2:
      if (tmp) {
        current_obj.setAttribute("x", obj_info["param"]["x"] + dx);
        current_obj.setAttribute("y", obj_info["param"]["y"] + dy);
      }
      else {
        obj_info["param"]["x"] = obj_info["param"]["x"] + dx;
        obj_info["param"]["y"] = obj_info["param"]["y"] + dy;
      }
      break;
    case 3:
      if (tmp) {
        current_obj.setAttribute("cx", obj_info["param"]["cx"] + dx);
        current_obj.setAttribute("cy", obj_info["param"]["cy"] + dy);
      }
      else {
        obj_info["param"]["cx"] = obj_info["param"]["cx"] + dx;
        obj_info["param"]["cy"] = obj_info["param"]["cy"] + dy;
      }
      break;
    case 4:
      if (tmp) {
        pointsString = "";
        for (var p of obj_info["param"]["points"]) {
          pointsString += `${p[0] + dx},${p[1] + dy} `;
        }
        current_obj.setAttribute("points", pointsString);
      }
      else {
        for (var t=0; t < obj_info["param"]["points"].length; t++) {
          obj_info["param"]["points"][t][0] += dx; 
          obj_info["param"]["points"][t][1] += dy;
        }
      }
      break;
  }
}

const mousedown = (e) => {
  mousedown_cursorX = e.clientX;
  mousedown_cursorY = e.clientY;
  // console.log("mousedown, ", e.clientX - panelWidth - bodyMargin, e.clientY - bodyMargin);
  mousedowned = true;
  if (mode == 0) {
    switch (layer) {
      case 0:
        floodFill(e, pw, colors[fill_color]);
        break;
      case 1:
        chooseObj(e);
        break;
    }
  }
}

const mousemove = (e) => {
  mouseup_cursorX = e.clientX;
  mouseup_cursorY = e.clientY;
  if (mousedowned) {
    switch (mode) {
      case 0:
        if (current_obj) {
          moveObj(true);
        }
        break;
      case 1:
      case 2:
      case 3:
        drawInWorkspace(true);
        break;
    }
  }
  if ((mode == 4) && polylineDetecParam["polylining"]) {
    drawInWorkspace(true);
  }
}

const mouseup = (e) => {
  mouseup_cursorX = e.clientX;
  mouseup_cursorY = e.clientY;
  // console.log("mouseup, ", e.clientX - panelWidth - bodyMargin, e.clientY - bodyMargin);
  if (mousedowned) {
    switch (mode) {
      case 0:
        if (current_obj) {
          moveObj(false);
        }
        break;
      case 1:
      case 2:
      case 3:
        drawInWorkspace(false);
        break;
      case 4:
        polylineDetecParam["polylining"] = true;
        polylineDetecParam["toPop"] = false;
        drawInWorkspace(true);
        break;
    }
    mousedowned = false;
  }
}

const shiftParam = (param) => {
  if (!shifting) {
    return;
  }
  switch (mode) {
    case 1:
    case 4:
      var dx = param["x2"] - param["x1"];
      var dy = param["y2"] - param["y1"];
      var theta = dy / dx;
      var x2 = param["x2"];
      var y2 = param["y2"];
      if (dx > 0) {
        if (theta > Math.tan(Math.PI * (3/8))) {
          x2 = param["x1"];
        } else if ((Math.tan(Math.PI * (3/8)) > theta) &&
                    (theta > Math.tan(Math.PI * (1/8)))) {
          x2 = param["x1"] + Math.max(Math.abs(dx), Math.abs(dy));
          y2 = param["y1"] + Math.max(Math.abs(dx), Math.abs(dy));
        } else if ((Math.tan(Math.PI * (1/8)) > theta) &&
                    (theta > Math.tan(Math.PI * (-1/8)))) {
          y2 = param["y1"];
        } else if ((Math.tan(Math.PI * (-1/8)) > theta) &&
                    (theta > Math.tan(Math.PI * (-3/8)))) {
          x2 = param["x1"] + Math.max(Math.abs(dx), Math.abs(dy));
          y2 = param["y1"] - Math.max(Math.abs(dx), Math.abs(dy));
        } else if (Math.tan(Math.PI * (-3/8)) > theta) {
          x2 = param["x1"];
        }
      } else {
        if (theta > Math.tan(Math.PI * (3/8))) {
          x2 = param["x1"];
        } else if ((Math.tan(Math.PI * (3/8)) > theta) &&
                    (theta > Math.tan(Math.PI * (1/8)))) {
          x2 = param["x1"] - Math.max(Math.abs(dx), Math.abs(dy));
          y2 = param["y1"] - Math.max(Math.abs(dx), Math.abs(dy));
        } else if ((Math.tan(Math.PI * (1/8)) > theta) &&
                    (theta > Math.tan(Math.PI * (-1/8)))) {
          y2 = param["y1"];
        } else if ((Math.tan(Math.PI * (-1/8)) > theta) &&
                    (theta > Math.tan(Math.PI * (-3/8)))) {
          x2 = param["x1"] - Math.max(Math.abs(dx), Math.abs(dy));
          y2 = param["y1"] + Math.max(Math.abs(dx), Math.abs(dy));
        } else if (Math.tan(Math.PI * (-3/8)) > theta) {
          x2 = param["x1"];
        }
      }
      return {
        "x2": x2,
        "y2": y2,
      }
    case 2:
      var width = Math.max(param["width"], param["height"]);
      var height = Math.max(param["width"], param["height"]);
      var left = param["left"];
      var top = param["top"];
      if (mouseup_cursorX < mousedown_cursorX) {
        left = mousedown_cursorX - width;
      }
      if (mouseup_cursorY < mousedown_cursorY) {
        top = mousedown_cursorY - height;
      }
      return {
        "width": width,
        "height": height,
        "left": left,
        "top": top,
      }
    case 3:
      rx = Math.max(param["rx"], param["ry"]);
      ry = Math.max(param["rx"], param["ry"]);
      cx = mousedown_cursorX + rx;
      cy = mousedown_cursorY + ry;
      if (mouseup_cursorX < mousedown_cursorX) {
        cx = mousedown_cursorX - rx;
      }
      if (mouseup_cursorY < mousedown_cursorY) {
        cy = mousedown_cursorY - ry;
      }
      return {
        "rx": rx,
        "ry": ry,
        "cx": cx,
        "cy": cy,
      }
  }
}

const drawInWorkspace = (tmp) => {
  const draw = () => {
    switch (layer) {
      case 0:
        if (tmp) {
          obj_dict[id]["opts"]["ctx"] = canvasTmp();
          drawFromInfo(obj_dict[id]);
        } else {
          obj_dict[id]["opts"]["ctx"] = ctx_pw;
          drawFromInfo(obj_dict[id]);
          switchCanvas(false);
          obj_id_cnt += 1;
        }
        break;
      case 1:
        svg.innerHTML += drawFromInfo(obj_dict[id]);
        if (!tmp) {
          obj_id_cnt += 1;
        }
        break;
    }
  }

  if (!mousedowned && !polylineDetecParam["polylining"]) {
    return;
  }
  var id = `obj_id${obj_id_cnt}`;
  try {
    switch (layer) {
      case 0:
        document.getElementById("canvas_tmp").remove();
        switchCanvas(false);
        break;
      case 1:
        document.getElementById(id).remove();
        deleteFromObjDict(id);
        break;
      }
  } catch {};
  if (escaping) {
    mousedowned = false;
    return;
  }

  switch (mode) {
    case 1:
      if (border_color === 0) {
        break;
      }
      var x1 = mousedown_cursorX;
      var y1 = mousedown_cursorY;
      var x2 = mouseup_cursorX;
      var y2 = mouseup_cursorY;
      
      if (shifting && x2 - x1 != 0) {
        var shifted = shiftParam({
          "x1": x1,
          "y1": y1,
          "x2": x2,
          "y2": y2,
        })
        x2 = shifted["x2"];
        y2 = shifted["y2"];
      }
      if (distance2D(x1, y1, x2, y2) >= 10) {
        obj_dict[id] = {
          "layer": layer,
          "mode": mode,
          "border_color": border_color,
          "border_width": border_width,
          "fill_color": fill_color,
          "param": {
            "x1": x1 - panelWidth - bodyMargin,
            "y1": y1 - bodyMargin,
            "x2": x2 - panelWidth - bodyMargin,
            "y2": y2 - bodyMargin,
          },
          "opts": {"id": id, "filter":false},
        }
        draw();
      }
      break;
    case 2:
      var height = Math.abs(mouseup_cursorY - mousedown_cursorY);
      var width = Math.abs(mouseup_cursorX - mousedown_cursorX);
      var left = Math.min(mousedown_cursorX, mouseup_cursorX);
      var top = Math.min(mousedown_cursorY, mouseup_cursorY);
      if (shifting){
        var shifted = shiftParam({
          "height": height,
          "width": width,
          "left": left,
          "top": top,});
        height = shifted["height"];
        width = shifted["width"];
        left = shifted["left"];
        top = shifted["top"];
      }
      if ((width >= 10) && (height >= 10)) {
        obj_dict[id] = {
          "layer": layer,
          "mode": mode,
          "border_color": border_color,
          "border_width": border_width,
          "fill_color": fill_color,
          "param": {
            "width": width,
            "height": height,
            "x": left - panelWidth - bodyMargin,
            "y": top - bodyMargin,
          },
          "opts": {"id": id, "filter":false,},
        }
        draw();
      }
      break;
    case 3:
      var rx = Math.abs(mouseup_cursorX - mousedown_cursorX) / 2;
      var ry = Math.abs(mouseup_cursorY - mousedown_cursorY) / 2;
      var cx = (mouseup_cursorX + mousedown_cursorX) / 2;
      var cy = (mouseup_cursorY + mousedown_cursorY) / 2;
      var height = Math.abs(mouseup_cursorY - mousedown_cursorY);
      var width = Math.abs(mouseup_cursorX - mousedown_cursorX);
      
      if (shifting) {
        var shifted = shiftParam({
          "rx": rx,
          "ry": ry,
          "cx": cx,
          "cy": cy,
        })
        rx = shifted["rx"];
        ry = shifted["ry"];
        cx = shifted["cx"];
        cy = shifted["cy"];
      }
      if ((width >= 10) && (height >= 10)) {
        obj_dict[id] = {
          "layer": layer,
          "mode": mode,
          "border_color": border_color,
          "border_width": border_width,
          "fill_color": fill_color,
          "param": {
            "rx": rx,
            "ry": ry,
            "cx": cx - panelWidth - bodyMargin,
            "cy": cy - bodyMargin,
          },
          "opts": {"id": id, "filter":false,},
        }
        draw();
      }
      break;
    case 4:
      var x = mouseup_cursorX - panelWidth - bodyMargin;
      var y = mouseup_cursorY - bodyMargin;
      if (tmp) {
        if (polylinePoints.length >= 1){
          if (shifting && x - x1 != 0) {
            var x1 = polylineDetecParam["toPop"]?
              polylinePoints[polylinePoints.length - 2][0]:
              polylinePoints[polylinePoints.length - 1][0];
            var y1 = polylineDetecParam["toPop"]?
              polylinePoints[polylinePoints.length - 2][1]:
              polylinePoints[polylinePoints.length - 1][1];
            var shifted = shiftParam({
              "x1": x1,
              "y1": y1,
              "x2": x,
              "y2": y,
            })
            x = shifted["x2"];
            y = shifted["y2"];
          }
          var dist = polylineDetecParam["toPop"]? 
            distance2D(x, y, polylinePoints[polylinePoints.length - 2][0], polylinePoints[polylinePoints.length - 2][1]):
            distance2D(x, y, polylinePoints[polylinePoints.length - 1][0], polylinePoints[polylinePoints.length - 1][1])
          // console.log("dist!!", dist);
          if (dist >= 10) {
            if (polylineDetecParam["toPop"]){
              polylinePoints.pop();
            }
            polylinePoints.push([x, y]);
            polylineDetecParam["toPop"] = true;
          }
        } else {
          polylinePoints.push([x, y]);
        }
      }
      
      if (!tmp) {
        // console.log(polylinePoints);
      }
      
      obj_dict[id] = {
        "layer": layer,
        "mode": mode,
        "border_color": border_color,
        "border_width": border_width,
        "fill_color": fill_color,
        "param": {
          "points": polylinePoints,
        },
        "opts": {"id": id, "filter":false,},
      }
      if (polylinePoints.length > 1){
        draw();
      }
      
      break;
  }
}

const chooseObj = (e) => {
  try {
    current_obj.setAttribute("filter", "");
    try{
      var obj_info = obj_dict[`${current_obj.getAttribute("id")}`];
      obj_info["opts"]["filter"] = false;
    } catch {};
  } catch {};
  current_obj = null;
  deleteDisable();
  if ((escaping) || (e === null)) {
    return;
  }
  var tar = e.target;
  // console.log("chooseObj !", tar);
  if (tar.getAttribute("id").slice(0, 6) == "obj_id") {
    current_obj = tar;
    var obj_info = obj_dict[`${current_obj.getAttribute("id")}`];
    current_obj.setAttribute("filter", `url(#selectFilter)`);
    obj_info["opts"]["filter"] = true;
    border_color = obj_info["border_color"];
    border_width = obj_info["border_width"];
    fill_color = obj_info["fill_color"];
    renderModeInputIcon();
    changePanelIconBorder();
    deleteDisable();
  }
}

const deleteObj = (e) => {
  // console.log("Delete !!");
  if (current_obj !== null) {
    deleteFromObjDict(current_obj.getAttribute("id"));
    current_obj.remove();
    current_obj = null;
    deleteDisable();
    mousedowned = false; // We have hot key here.
  }
}

const deleteAllObj = (e) => {
  // console.log("Delete All!!");
  ctx_pw.clearRect(0, 0, pw_width, pw_height);
  for (var id of Object.keys(obj_dict)) {
    if (obj_dict[id]["layer"] == 1) {
      deleteFromObjDict(id);
      document.getElementById(id).remove();
    }
  }
  current_obj = null;
  deleteDisable();
  mousedowned = false;
}

const keyDown = (e) => {
  // console.log(e);
  switch (e.keyCode) {
    case 16: // shift
      shifting = true;
      switch(mode) {
        case 0:
          // moveObj(true);
          break;
        case 1:
        case 2:
        case 3:
          drawInWorkspace(true);
          break;
      }
      break;
    case 27: // esc
      escaping = true;
      switch(mode) {
        case 0:
          if (current_obj !== null) {
            moveObj(false);
          }
          break;
        case 1:
        case 2:
        case 3:
          drawInWorkspace(true);
          break;
        case 4:
          drawInWorkspace(true);
          polylinePoints = [];
          polylineDetecParam["polylining"] = false;
          polylineDetecParam["toPop"] = false;
          break;
      }
      escaping = false;
      shifting = false;
      break;
    case 32: // space
      if (polylineDetecParam["toPop"]) {
        polylinePoints.pop();
        polylineDetecParam["toPop"] = false;
      }
      polylinePoints.pop();
      if (polylinePoints.length <= 0) {
        polylineDetecParam["polylining"] = false;
        try {
          var id = `obj_id${obj_id_cnt}`;
          switch (layer) {
            case 0:
              document.getElementById("canvas_tmp").remove();
              switchCanvas(false);
              break;
            case 1:
              document.getElementById(id).remove();
              deleteFromObjDict(id);
              break;
          }
        } catch {};
      } else {
        drawInWorkspace(true);
      }
      break;
    case 46: // delete
      deleteObj(null);
      break;
    case 81:
      // console.log("q!!", obj_dict);
      if (mode == 4) {
        if (polylineDetecParam["toPop"]){
          polylinePoints.pop();
        }
        drawInWorkspace(false);
        polylinePoints = [];
        polylineDetecParam["polylining"] = false;
        polylineDetecParam["toPop"] = false;
      }
      break;
  }
}

const keyUp = (e) => {
  // console.log(e);
  switch (e.keyCode) {
    case 16:
      shifting = false;
      switch(mode) {
        case 0:
          // moveObj(true);
          break;
        case 1:
        case 2:
        case 3:
          drawInWorkspace(true);
          break;
      }
      break;
  }
}

function draw_example () {
  var border_width = 1;
  polylinePoints = [[0, 0], [20, 30], [70, 90], [510, 320],];
  polylinePoints.push([15, 89]);
  console.log(polylinePoints[polylinePoints.length - 1])
  console.log(polylinePoints);
  var d = drawPolyLine(border_color, border_width, fill_color, polylinePoints, {});
  console.log(d);
  svg.innerHTML += d;
}

// draw_example ();


