//This is a minimal example on how to draw a lasso selection and display it as polygon overlay in OSD

//init seadragon
viewer = OpenSeadragon({
    id: "openseadragon",
        prefixUrl: "/FreeSelection/css/images/",
        tileSources: "/FreeSelection/data/tiles/channel_00.dzi", //set your own pyramid location here
});


var isSelectionToolActive = false;
viewer.setControlsEnabled(true);


viewer.addHandler('open', () => {
    let printButton = new OpenSeadragon.Button({
        tooltip: 'Print',
        srcRest: `/FreeSelection/css/images/button_rest.png`,
        srcGroup: `/FreeSelection//css/images/button_grouphover.png`,
        srcHover: `/FreeSelection//css/images/button_hover.png`,
        srcDown: `/FreeSelection//css/images/button_pressed.png`,
        onClick: switchSelectionMode
    });

    viewer.addControl(printButton.element, { anchor: OpenSeadragon.ControlAnchor.TOP_LEFT });
})

switchSelectionMode = function(){
    isSelectionToolActive = !isSelectionToolActive;
    viewer.setMouseNavEnabled(!isSelectionToolActive);
    if (isSelectionToolActive){
        d3.select('body').style("cursor", "crosshair");
    }else{
        d3.select('body').style("cursor", "default");
    }
}

//we also add an svg overlay (plugin) for the fancy stuff
svg_overlay = viewer.svgOverlay()
overlay = d3.select(svg_overlay.node())


//SELECTION POLYGON (LASSO)
polygonSelection = [];
var renew = false;
var numCalls = 0; //defines how fine-grained the polygon resolution is (0 = no subsampling, 10=high subsampling)

lasso_draw = function(event){
    //add points to polygon and (re)draw

    var webPoint = event.position;
    var viewportPoint = viewer.viewport.pointFromPixel(webPoint);
    //console.log(webPoint.toString(), viewportPoint.toString());

    if (numCalls % 5 == 0){
        console.log(numCalls)
        polygonSelection.push({"x":viewportPoint.x,"y":viewportPoint.y});
    }

    d3.select('#selectionPolygon').remove();
    var selPoly = overlay.selectAll("selectionPolygon").data([polygonSelection]);
    selPoly.enter().append("polygon")
        .attr('id', 'selectionPolygon')
        .attr("points",function(d) {
            return d.map(function(d) { return [d.x,d.y].join(","); }).join(" ");})
    numCalls++;
}

lasso_end = function(event){
    renew = true;

    //the drawn polygon data
    console.log('original polygon data: ')
    console.log(polygonSelection);

    //the compressed url string for this polygon
    var encodedPolygonString = toURL(polygonSelection);
    console.log('compressed polygon string: ');
    console.log(encodedPolygonString)

    //the decoded polygon (holding the original x,y values for each point)
    var decodedPolygon = fromURL(encodedPolygonString);
    console.log('decoded polygon data: ')
    console.log(decodedPolygon);

    polygonSelection = [];
    numCalls = 0;
}


var mouse_drag = new OpenSeadragon.MouseTracker({
    element: viewer.canvas,
    dragHandler: function(event) {
        if (isSelectionToolActive) {
            console.log('dragged');
            lasso_draw(event);
        }
    }
})

var mouse_up = new OpenSeadragon.MouseTracker({
    element: viewer.canvas,
    dragEndHandler: function(event) {
        if (isSelectionToolActive) {
            console.log('release');
            lasso_end(event);
        }
    }
})

var toURL = function(polygon){
    pointString='';
    polygon.forEach(function(d){
        pointString += d.x.toFixed(5) + "," + d.y.toFixed(5) + ",";
    })
    pointString = pointString.slice(0, -1); //removes "," at the end
    var result =  LZString.compressToEncodedURIComponent(pointString);
    return result;
}

var fromURL = function(polygonString){
    var decompressed = LZString.decompressFromEncodedURIComponent(polygonString);
    var xArray = [], yArray = [];

    //get all values out of the string
    decompressed.split(',').forEach(function(d,i){
        if (i % 2 == 0){ xArray.push(d); }
        else{ yArray.push(d) }
    })

    //recreate polygon data structure
    var newPolygon = [];
    xArray.forEach(function(d, i){
        newPolygon.push({x: d, y: yArray[i]});
    })
    return newPolygon;
}


//some resizing corrections
d3.select(window).on('resize', function() {});
svg_overlay.resize();
