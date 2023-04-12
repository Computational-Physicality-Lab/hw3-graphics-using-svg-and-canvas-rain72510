const svg = document.querySelector(".svg");

const svgNS = "http://www.w3.org/2000/svg";

// const svg = document.getElementById("object-svg");
const pw = document.querySelector(".pixelwise");
// const ctx_svg = svg.getContext('2d');
const ctx_pw = pw.getContext('2d');

var layer = 0; // 0: both, 1: svg, 2: pixelwise

var a = `<ellipse cx="200" cy="80" rx="100" ry="50"
style="fill:yellow;stroke:purple;stroke-width:2" />`

var b = `<ellipse cx="300" cy="200" rx="100" ry="50"
style="fill:yellow;stroke:purple;stroke-width:2" />`

svg.innerHTML += b;
svg.innerHTML += a;



const layerSelect = () => {
  console.log("layerSelect!");
  let layersInput = document.getElementById("layersInput")
  if (layersInput.layer[0].checked) {
    layer = 0;
  }
  if (layersInput.layer[1].checked) {
    layer = 1;

  }
  if (layersInput.layer[2].checked) {
    layer = 2;
  }
}

ctx_pw.fillStyle = "#f00";
ctx_pw.fillRect(200, 200, 300, 250);



