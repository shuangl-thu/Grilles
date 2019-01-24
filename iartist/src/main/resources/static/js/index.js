let $canvas = document.querySelector("#board");
let ctx = $canvas.getContext("2d");
ctx.globalCompositeOperation = "destination-over";

// Initial Ready Map
let ready = {
    pencil: false,
    eraser: false,
    rect: false,
    ruler: false,
    palette_facades: false,
    palette_voc: false,
    seal: false
};


// Model
let models = {};

// Locations
let drawArea = undefined;
let pencilArea = undefined;
let eraserArea = undefined;
let rulerArea = undefined;
let rectArea = undefined;
let paletteArea = undefined;
let sealArea = undefined;

// UI Layers
let toolsLayer = undefined;
let bgLayer = undefined;
let previewLayer = undefined;
let previewCtx = undefined;
let edgeLayer = undefined;

// Load Tools Images
let pencilImg = new Image();
let rulerImg = new Image();
let eraserImg = new Image();
let rectImg = new Image();
let paletteFacadesImg = new Image();
let paletteVocImg = new Image();
let sealImg = new Image();
pencilImg.src = "/static/image/pencil.png";
pencilImg.onload = function () {
    ready["pencil"] = true;
    prepareCanvas();
};
rulerImg.src = "/static/image/ruler.png";
rulerImg.onload = function () {
    ready["ruler"] = true;
    prepareCanvas();
};
eraserImg.src = "/static/image/eraser.png";
eraserImg.onload = function () {
    ready["eraser"] = true;
    prepareCanvas();
};
rectImg.src = "/static/image/rect.png";
rectImg.onload = function () {
    ready["rect"] = true;
    prepareCanvas();
};
paletteFacadesImg.src = "/static/image/palette_facades.png";
paletteFacadesImg.onload = function () {
    ready["palette_facades"] = true;
    prepareCanvas();
};
paletteVocImg.src = "/static/image/palette_voc.png";
paletteVocImg.onload = function () {
    ready["palette_voc"] = true;
    prepareCanvas();
};
sealImg.src = "/static/image/seal.png";
sealImg.onload = function () {
    ready["seal"] = true;
    prepareCanvas();
};

// Paint Layers
let layers = [];
let ctxs = [];
let types = [];
let currentid = -1;

// Painter
let painterSize = 3; // from 1 to 5
let painterStyles = {
    'facades': {
        line: "#000000",
        wall: "#0d3dfb",
        door: "#a50000",
        window: "#0075ff",
        windowSill: "#68f898",
        shutter: "#eeed28",
        trim: "#ff9204",
        white: "#ffffff"
    },
    'voc': {
        line: "#000000",
        bird: "#808000",
        cat: "#a50000",
        dog: "#400080",
        horse: "#c00080",
        cow: "#408000",
        sheep: "#804000",
        white: "#ffffff"
    }
};

let id2stylename = {
    'facades': ["line", "wall", "door", "window", "windowSill", "shutter", "trim", "white"],
    'voc': ["line", "bird", "cat", "dog", "horse", "cow", "sheep", "white"]
};

let sealStyle = ["bird", "cat", "dog", "horse", "cow", "sheep"];

let id2heart = [
    {x: 190, y: 475},
    {x: 127, y: 455},
    {x: 79, y: 406},
    {x: 53, y: 345},
    {x: 55, y: 275},
    {x: 88, y: 210},
    {x: 143, y: 168},
    {x: 206, y: 152}
];

let painterStyle = painterStyles['facades']['line'];
let painterStatus = false;
let painterType = 'pencil';
let painterStyleName = 'line';
let lastPoint = {x: undefined, y: undefined};

let rulerDrag = false;


function addLayer(type) {
    let id = layers.length;
    layers.push(document.createElement("canvas"));
    ctxs.push(layers[id].getContext("2d"));
    types.push(type);
    layers[id].width = $canvas.width;
    layers[id].height = $canvas.height;

    currentid = id;

    /*
    ctxs[currentid].save();
    ctxs[currentid].rect(0, 0, drawArea.w, drawArea.h);
    ctxs[currentid].fillStyle = "#000";
    ctxs[currentid].fill();
    ctxs[currentid].restore();
    */

    redrawTools();
    combineLayers();
    console.log(types);
}

function prepareCanvas() {
    for (let key in ready)
        if (!ready[key])
            return;

    // fetchModel('facades', '/static/model/facades_BtoA.bin');
    // fetchModel('edges2cats', '/static/model/edges2cats_AtoB.bin');
    // fetchModel('voc', '/static/model/VOC.bin');

    $canvas.height = $canvas.width / 2 + 100;

    drawArea = {x: $canvas.width / 4, y: 50, w: $canvas.width / 2, h: $canvas.width / 2};

    rulerArea = {
        x: drawArea.x + drawArea.w - 180,
        y: drawArea.y + 400,
        w: rulerImg.width,
        h: rulerImg.height
    };

    // Initial Tools Layer
    toolsLayer = document.createElement("canvas");
    toolsLayer.width = $canvas.width;
    toolsLayer.height = $canvas.height;

    // Initial Bg Layer
    bgLayer = document.createElement("canvas");
    bgLayer.width = drawArea.w;
    bgLayer.height = drawArea.h;
    let bgc = bgLayer.getContext("2d");
    bgc.save();
    bgc.rect(0, 0, drawArea.w, drawArea.h);
    bgc.fillStyle = "#fff";
    bgc.fill();
    bgc.restore();

    // Initial Preview Layer
    previewLayer = document.createElement("canvas");
    previewLayer.width = $canvas.width;
    previewLayer.height = $canvas.height;
    previewCtx = previewLayer.getContext("2d");


    // Initial Edge Layer
    edgeLayer = document.createElement("canvas");
    edgeLayer.width = $canvas.width;
    edgeLayer.height = $canvas.height;
    let edgeImg = new Image();
    edgeImg.src = "/static/image/edge.png";
    edgeImg.onload = function () {
        let c = edgeLayer.getContext("2d");
        let w = (500 / drawArea.w) * 600;
        let x = drawArea.x - (w - drawArea.w) / 2;
        let y = drawArea.y - (w - drawArea.h) / 2;
        c.drawImage(edgeImg, x, y, w, w);
        combineLayers();
    };

    addLayer("facades");

    // Initial Combine


    $canvas.onmousedown = function (e) {
        lastPoint = getLocation(e.clientX, e.clientY);
        console.log(lastPoint);
        if (inArea(drawArea, lastPoint)) {
            if (painterType == "pencil") {
                painterStatus = true;
                drawCircle(lastPoint.x, lastPoint.y);
            } else if (painterType == "eraser") {
                painterStatus = true;
                clearCircle(lastPoint.x, lastPoint.y);
            } else if (painterType == 'rect') {
                painterStatus = true;
            } else if (painterType == "seal") {
                drawSeal(painterStyleName, lastPoint.x, lastPoint.y);
            }
        } else if (inArea(pencilArea, lastPoint)) {
            painterType = "pencil";
            combineLayers();
        } else if (inArea(eraserArea, lastPoint)) {
            painterType = "eraser";
            combineLayers();
        } else if (inArea(sealArea, lastPoint)) {
            painterType = "seal";
            combineLayers();
        }
        else if (inArea(rectArea, lastPoint)) {
            painterType = "rect";
            combineLayers();
        } else if (inArea(rulerArea, lastPoint)) {
            rulerDrag = true;
        } else {
            for (let i in id2heart) {
                if (inColorArea(id2heart[i], lastPoint)) {
                    painterStyle = painterStyles[types[currentid]][id2stylename[types[currentid]][i]];
                    painterStyleName = id2stylename[types[currentid]][i];
                    combineLayers();
                    break;
                }
            }
        }
    };

    $canvas.onmousemove = function (e) {
        let newPoint = getLocation(e.clientX, e.clientY);
        if (painterStatus) {
            if (painterType == "pencil") {
                drawLine(lastPoint.x, lastPoint.y, newPoint.x, newPoint.y);
                lastPoint = newPoint;
            } else if (painterType == "eraser") {
                clearLine(lastPoint.x, lastPoint.y, newPoint.x, newPoint.y);
                lastPoint = newPoint;
            } else if (painterType == "rect") {
                previewRect(lastPoint.x, lastPoint.y, newPoint.x, newPoint.y);
            }
        }
        if (rulerDrag) {
            let deltaX = newPoint.x - lastPoint.x;
            rulerArea.x += deltaX;
            let len = rulerArea.x - (drawArea.x + drawArea.w);
            if (len > -90) len = -90;
            else if (len < -180) len = -180;
            rulerArea.x = len + (drawArea.x + drawArea.w);
            combineLayers();
            lastPoint = newPoint;
        }
    };

    $canvas.onmouseup = function (e) {
        let newPoint = getLocation(e.clientX, e.clientY);

        if (painterStatus) {
            if (painterType == "pencil") {
                ctxs[currentid].restore();
            } else if (painterType == "eraser") {
                ctxs[currentid].restore();
            } else if (painterType == "rect") {
                drawRect(lastPoint.x, lastPoint.y, newPoint.x, newPoint.y);
            }
            painterStatus = false;
        }
        if (rulerDrag) {
            let len = rulerArea.x - (drawArea.x + drawArea.w);
            if (len > -90) len = -90;
            else if (len < -180) len = -180;
            if (len > -110) {
                len = -90;
                painterSize = 12;
            }
            else if (len > -143) {
                len = -130;
                painterSize = 9
            }
            else if (len > -168) {
                len = -155;
                painterSize = 6;
            }
            else {
                len = -180;
                painterSize = 3;
            }
            rulerArea.x = len + (drawArea.x + drawArea.w);
            combineLayers();
            rulerDrag = false;
        }
    };

}


function drawCircle(x, y) {
    ctxs[currentid].save();
    ctxs[currentid].strokeStyle = painterStyle;
    ctxs[currentid].beginPath();
    ctxs[currentid].fill();
    combineLayers();
}

function drawLine(x1, y1, x2, y2) {
    ctxs[currentid].lineWidth = painterSize;
    ctxs[currentid].lineCap = "round";
    ctxs[currentid].lineJoin = "round";
    ctxs[currentid].moveTo(x1, y1);
    ctxs[currentid].lineTo(x2, y2);
    ctxs[currentid].stroke();
    ctxs[currentid].closePath();
    combineLayers();
}

function clearCircle(x, y) {
    ctxs[currentid].save();
    ctxs[currentid].beginPath();
    ctxs[currentid].arc(x, y, painterSize, 0, 2 * Math.PI);
    ctxs[currentid].clip();
    ctxs[currentid].clearRect(0, 0, layers[currentid].width, layers[currentid].height);
    ctxs[currentid].restore();
    combineLayers();
}

function clearLine(x1, y1, x2, y2) {
    let asin = painterSize * Math.sin(Math.atan((y2 - y1) / (x2 - x1)));
    let acos = painterSize * Math.cos(Math.atan((y2 - y1) / (x2 - x1)));
    let x3 = x1 + asin;
    let y3 = y1 - acos;
    let x4 = x1 - asin;
    let y4 = y1 + acos;
    let x5 = x2 + asin;
    let y5 = y2 - acos;
    let x6 = x2 - asin;
    let y6 = y2 + acos;

    //保证线条的连贯，所以在矩形一端画圆
    ctxs[currentid].save();
    ctxs[currentid].beginPath();
    ctxs[currentid].arc(x2, y2, painterSize, 0, 2 * Math.PI);
    ctxs[currentid].clip();
    ctxs[currentid].clearRect(0, 0, layers[currentid].width, layers[currentid].height);
    ctxs[currentid].restore();

    //清除矩形剪辑区域里的像素
    ctxs[currentid].save();
    ctxs[currentid].beginPath();
    ctxs[currentid].moveTo(x3, y3);
    ctxs[currentid].lineTo(x5, y5);
    ctxs[currentid].lineTo(x6, y6);
    ctxs[currentid].lineTo(x4, y4);
    ctxs[currentid].closePath();
    ctxs[currentid].clip();
    ctxs[currentid].clearRect(0, 0, layers[currentid].width, layers[currentid].height);
    ctxs[currentid].restore();
    combineLayers();
}

function previewRect(x1, y1, x2, y2) {
    let ww = previewLayer.width;
    previewLayer.width = 0;
    previewLayer.width = ww;
    previewCtx.save();
    previewCtx.fillStyle = painterStyle;
    let x = (x1 < x2) ? (x1) : (x2);
    let y = (y1 < y2) ? (y1) : (y2);
    let w = (x1 < x2) ? (x2 - x1) : (x1 - x2);
    let h = (y1 < y2) ? (y2 - y1) : (y1 - y2);
    //previewCtx.rect(x, y, w, h);
    //previewCtx.fill();
    previewCtx.fillRect(x, y, w, h);
    previewCtx.restore();
    combineLayers();
}

function drawRect(x1, y1, x2, y2) {
    let ww = previewLayer.width;
    previewLayer.width = 0;
    previewLayer.width = ww;
    ctxs[currentid].save();
    ctxs[currentid].fillStyle = painterStyle;
    let x = (x1 < x2) ? (x1) : (x2);
    let y = (y1 < y2) ? (y1) : (y2);
    let w = (x1 < x2) ? (x2 - x1) : (x1 - x2);
    let h = (y1 < y2) ? (y2 - y1) : (y1 - y2);
    //ctxs[currentid].rect(x, y, w, h);
    //ctxs[currentid].fill();
    ctxs[currentid].fillRect(x, y, w, h);
    ctxs[currentid].restore();
    combineLayers();
}

function drawSeal(type, x1, y1) {
    let dirPath = "/static/seal/";
    let path = dirPath + type + ".png";
    let m = new Image();
    m.src = path;
    m.onload = function () {
        let scale = ((painterSize / 3) - 2) * 0.5 + 1;
        let w = m.width * scale;
        let h = m.height * scale;
        let x = x1 - w / 2;
        let y = y1 - h / 2;
        ctxs[currentid].drawImage(m, x, y, w, h);
        combineLayers();
    }

}

function getLocation(x, y) {
    var bbox = $canvas.getBoundingClientRect();
    return {
        x: (x - bbox.left) * ($canvas.width / bbox.width),
        y: (y - bbox.top) * ($canvas.height / bbox.height)
    };
}

function inArea(area, point) {
    if (point.x < area.x) return false;
    if (point.x > area.x + area.w) return false;
    if (point.y < area.y) return false;
    if (point.y > area.y + area.h) return false;
    return true;
}

function inColorArea(heart, point) {
    let r2 = 30 * 30;
    let d2 = (heart.x - point.x) * (heart.x - point.x) + (heart.y - point.y) * (heart.y - point.y);
    if (d2 < r2) return true;
    return false;
}

function redrawTools() {
    let c = toolsLayer.getContext("2d");
    c.save();
    c.clearRect(0, 0, toolsLayer.width, toolsLayer.height);

    if (painterType == "seal" && sealStyle.indexOf(painterStyleName) < 0) {
        painterType = "pencil";
    }

    pencilArea = {
        x: drawArea.x + drawArea.w - 230 + ((painterType == "pencil") ? (40) : (0)),
        y: drawArea.y + 30,
        w: pencilImg.width,
        h: pencilImg.height
    };
    eraserArea = {
        x: drawArea.x + drawArea.w - 100 + ((painterType == "eraser") ? (40) : (0)),
        y: drawArea.y + 110,
        w: eraserImg.width,
        h: eraserImg.height
    };
    sealArea = {
        x: drawArea.x + drawArea.w - 20 + ((painterType == "seal") ? (20) : (0)),
        y: drawArea.y + 210,
        w: eraserImg.width,
        h: eraserImg.height
    };
    rectArea = {
        x: drawArea.x + drawArea.w - 50 + ((painterType == "rect") ? (40) : (0)),
        y: drawArea.y + 300,
        w: eraserImg.width,
        h: eraserImg.height
    };
    paletteArea = {
        x: drawArea.x - 250,
        y: drawArea.y + 50,
        w: paletteFacadesImg.width,
        h: paletteFacadesImg.height
    };

    c.drawImage(pencilImg, pencilArea.x, pencilArea.y);
    c.drawImage(eraserImg, eraserArea.x, eraserArea.y);
    c.drawImage(rectImg, rectArea.x, rectArea.y);
    c.drawImage(rulerImg, rulerArea.x, rulerArea.y);
    c.drawImage(sealImg, sealArea.x, sealArea.y);
    if (types[currentid] == "facades")
        c.drawImage(paletteFacadesImg, paletteArea.x, paletteArea.y);
    else if (types[currentid] == 'voc')
        c.drawImage(paletteVocImg, paletteArea.x, paletteArea.y);
    c.restore();
}

function combineLayers() {
    ctx.save();
    ctx.clearRect(0, 0, $canvas.width, $canvas.height);
    // Redraw Tools
    redrawTools();
    // Draw Tools Layer
    ctx.drawImage(toolsLayer, 0, 0);
    // Draw Bg Layer
    ctx.drawImage(bgLayer, drawArea.x, drawArea.y, drawArea.w, drawArea.h);
    // Draw Painting Layers
    for (i in layers) {
        ctx.drawImage(layers[i], drawArea.x, drawArea.y, drawArea.w, drawArea.h, drawArea.x, drawArea.y, drawArea.w, drawArea.h);
    }
    // Draw Preview Layer
    ctx.drawImage(previewLayer, drawArea.x, drawArea.y, drawArea.w, drawArea.h, drawArea.x, drawArea.y, drawArea.w, drawArea.h);
    // Draw Edge Layer
    ctx.drawImage(edgeLayer, 0, 0);
    ctx.restore();
}

function removeLayer(id) {
    if (id > -1 && id < layers.length) {
        layers.splice(id, 1);
        ctxs.splice(id, 1);
        currentid = layers.length - 1;
        if (currentid == -1) {
            addLayer("facades");
        }
    }
    combineLayers();
}

function removeTopLayer() {
    removeLayer(currentid);
}

function getTopLayerDataArray() {
    imageData = ctxs[currentid].getImageData(drawArea.x, drawArea.y, drawArea.w, drawArea.h);
    let $preview = document.querySelector("#preview");
    $preview.width = 256;
    $preview.height = 256;
    let c = $preview.getContext("2d");
    c.drawImage(layers[currentid], drawArea.x, drawArea.y, drawArea.w, drawArea.h, 0, 0, 256, 256);
    return c.getImageData(0, 0, 256, 256).data;
}

function fetchModel(name, url) {
    let xhr = new XMLHttpRequest();
    xhr.open("GET", url, true);
    xhr.responseType = "arraybuffer";
    xhr.onprogress = function (e) {
        let v = Math.round(e.loaded / e.total * 100);
        let $progress = $("#" + name + "_progress");
        let $progress_bar = $("#" + name + "_progress_bar");
        $progress_bar.css("width", v.toString() + "%");
        $progress_bar.html("Loading model \'" + name + "\' : " + v.toString() + "%");
        if (e.loaded == e.total) {
            $progress.fadeOut(2000);
        }
        // console.log(v);
    };
    xhr.onload = function (e) {
        if (xhr.status != 200) {
            console.log("http error");
            return;
        }
        let buf = xhr.response;
        if (!buf) {
            console.log("invalid arraybuffer");
            return;
        }
        let parts = [];
        let offset = 0;
        while (offset < buf.byteLength) {
            let b = new Uint8Array(buf.slice(offset, offset + 4));
            offset += 4;
            let len = (b[0] << 24) + (b[1] << 16) + (b[2] << 8) + b[3];
            parts.push(buf.slice(offset, offset + len));
            offset += len;
        }
        let shapes = JSON.parse((new TextDecoder("utf8")).decode(parts[0]));
        let index = new Float32Array(parts[1]);
        let encoded = new Uint8Array(parts[2]);
        // decode using index
        let arr = new Float32Array(encoded.length);
        for (let i = 0; i < arr.length; i++) {
            arr[i] = index[encoded[i]];
        }
        let weights = {};
        offset = 0;
        for (let i = 0; i < shapes.length; i++) {
            let shape = shapes[i].shape;
            let size = shape.reduce((total, num) => total * num);
            let values = arr.slice(offset, offset + size);
            let dlarr = dl.Array1D.new(values, "float32");
            weights[shapes[i].name] = dlarr.reshape(shape);
            offset += size;
        }
        models[name] = weights;
    };
    xhr.send(null);
}

function model(input, weights) {
    const math = dl.ENV.math;

    function preprocess(input) {
        return math.subtract(math.multiply(input, dl.Scalar.new(2)), dl.Scalar.new(1));
    }

    function deprocess(input) {
        return math.divide(math.add(input, dl.Scalar.new(1)), dl.Scalar.new(2));
    }

    function batchnorm(input, scale, offset) {
        var moments = math.moments(input, [0, 1]);
        const varianceEpsilon = 1e-5;
        return math.batchNormalization3D(input, moments.mean, moments.variance, varianceEpsilon, scale, offset);
    }

    function conv2d(input, filter, bias) {
        return math.conv2d(input, filter, bias, [2, 2], "same");
    }

    function deconv2d(input, filter, bias) {
        var convolved = math.conv2dTranspose(input, filter, [input.shape[0] * 2, input.shape[1] * 2, filter.shape[2]], [2, 2], "same");
        var biased = math.add(convolved, bias);
        return biased;
    }

    var preprocessed_input = preprocess(input);

    var layers = [];

    var filter = weights["generator/encoder_1/conv2d/kernel"];
    var bias = weights["generator/encoder_1/conv2d/bias"];
    var convolved = conv2d(preprocessed_input, filter, bias);
    layers.push(convolved);

    for (var i = 2; i <= 8; i++) {
        var scope = "generator/encoder_" + i.toString();
        var filter = weights[scope + "/conv2d/kernel"];
        var bias = weights[scope + "/conv2d/bias"];
        var layer_input = layers[layers.length - 1];
        var rectified = math.leakyRelu(layer_input, 0.2);
        var convolved = conv2d(rectified, filter, bias);
        var scale = weights[scope + "/batch_normalization/gamma"];
        var offset = weights[scope + "/batch_normalization/beta"];
        var normalized = batchnorm(convolved, scale, offset);
        layers.push(normalized);
    }

    for (var i = 8; i >= 2; i--) {
        if (i == 8) {
            var layer_input = layers[layers.length - 1];
        } else {
            var skip_layer = i - 1;
            var layer_input = math.concat3D(layers[layers.length - 1], layers[skip_layer], 2);
        }
        var rectified = math.relu(layer_input);
        var scope = "generator/decoder_" + i.toString();
        var filter = weights[scope + "/conv2d_transpose/kernel"];
        var bias = weights[scope + "/conv2d_transpose/bias"];
        var convolved = deconv2d(rectified, filter, bias);
        var scale = weights[scope + "/batch_normalization/gamma"];
        var offset = weights[scope + "/batch_normalization/beta"];
        var normalized = batchnorm(convolved, scale, offset);
        // missing dropout
        layers.push(normalized);
    }

    var layer_input = math.concat3D(layers[layers.length - 1], layers[0], 2);
    var rectified = math.relu(layer_input);
    var filter = weights["generator/decoder_1/conv2d_transpose/kernel"];
    var bias = weights["generator/decoder_1/conv2d_transpose/bias"];
    var convolved = deconv2d(rectified, filter, bias);
    var rectified = math.tanh(convolved);
    layers.push(rectified);

    var output = layers[layers.length - 1];
    var deprocessed_output = deprocess(output);

    return deprocessed_output;
}

function predict() {
    let SIZE = 256;
    let input_uint8_data = getTopLayerDataArray();
    let dataarray = Array.prototype.slice.call(input_uint8_data);
    var img = { };
    img["array"] = dataarray;
    // let input_float32_data = Float32Array.from(input_uint8_data, (x) => x / 255);
    //
    // // console.time('render')
    // const math = dl.ENV.math;
    // math.startScope();
    // let input_rgba = dl.Array3D.new([SIZE, SIZE, 4], input_float32_data, "float32");
    // let input_rgb = math.slice3D(input_rgba, [0, 0, 0], [SIZE, SIZE, 3]);
    //
    // let output_rgb = model(input_rgb, models[types[currentid]]);
    //
    // let alpha = dl.Array3D.ones([SIZE, SIZE, 1]);
    // let output_rgba = math.concat3D(output_rgb, alpha, 2);
    //
    // output_rgba.getValuesAsync().then((output_float32_data) => {
    //     let res = Uint8ClampedArray.from(output_float32_data, (x) => x * 255);
    //     math.endScope();
    //     let $preview = document.querySelector("#preview");
    //     $preview.width = 0;
    //     $preview.width = 256;
    //     $preview.height = 256;
    //     let c = $preview.getContext("2d");
    //     let resImgData = new ImageData(res, SIZE, SIZE);
    //     c.putImageData(resImgData, 0, 0);
    //     let gcobk = ctxs[currentid].globalCompositeOperation;
    //     ctxs[currentid].globalCompositeOperation = "source-in";
    //     ctxs[currentid].drawImage($preview, 0, 0, $preview.width, $preview.height, drawArea.x, drawArea.y, drawArea.w, drawArea.h);
    //     ctxs[currentid].globalCompositeOperation = gcobk;
    //     combineLayers();
    // });
    console.log("post")
    $.ajax({
        type:"POST",
        url:"http://"+document.location.hostname+":5000/predict",
        data:JSON.stringify(img),
        contentType:"application/json",
        dataType:'json',
        success:function (data) {
            let res = Uint8ClampedArray.from(data['data'], (x) => x );
            let $preview = document.querySelector("#preview");
            $preview.width = 0;
            $preview.width = 256;
            $preview.height = 256;
            let c = $preview.getContext("2d");
            let resImgData = new ImageData(res, SIZE, SIZE);
            c.putImageData(resImgData, 0, 0);
            let gcobk = ctxs[currentid].globalCompositeOperation;
            ctxs[currentid].globalCompositeOperation = "source-in";
            ctxs[currentid].drawImage($preview, 0, 0, $preview.width, $preview.height, drawArea.x, drawArea.y, drawArea.w, drawArea.h);
            ctxs[currentid].globalCompositeOperation = gcobk;
            combineLayers();
        },
        error:function (e) {
            console.log("post failed!");
            console.log(e)
        }
    });
}

