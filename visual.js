// @ts-nocheck
// Porter Glines
// ISU Data Visualization 5599
// Final Project

// Parameters
hiddenTilt = 15
hiddenNodeRadius = 20
hiddenVerticalSeparation = 100
hiddenHorizontalSpacing = 90
hiddenDepthSpacing = 50

observedVerticalSeparation = 0
observedVerticalSpacing = 20
observedDepthSpacing = 20


curveControlDistance = 15

animationTiming = 0.7

// Some global variables
var scene
var camera
var data
var renderer
var mouse
var raycaster
var hiddenMeshes = []
var wordClouds = []

var sequence = ["Fred", "sometimes", "likes", "red"]
var startsWith = false
var selectedNodes = [0, 1, 0, 3]
var cameraStartingPos = [-302, 282, 268]

var isObservedDimmed = false

let hiddenGeometry = new THREE.SphereGeometry(hiddenNodeRadius, 32, 32);
// White
let hiddenMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.8, side: THREE.BackSide});
// White
let hiddenOutlineMaterial = new THREE.MeshBasicMaterial({ color: 0x000000, transparent: true, opacity: 0.7, side: THREE.BackSide });
// Mint green
let hiddenSelectedMaterial = new THREE.MeshBasicMaterial({ color: 0xA9FDAC, transparent: true, opacity: 0.8, side: THREE.BackSide});
// Light grey
let hiddenInactiveMaterial = new THREE.MeshBasicMaterial({ color: 0xdddddd, transparent: true, opacity: 0.8, side: THREE.BackSide});
// Grey
let hiddenCutMaterial = new THREE.MeshBasicMaterial({ color: 0xbbbbbb, transparent: true, opacity: 0.8, side: THREE.BackSide});


// White
let observedMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.5, side: THREE.BackSide});
// Black
let observedOutlineMaterial = new THREE.MeshBasicMaterial({ color: 0x000000, transparent: true, opacity: 0.7, side: THREE.BackSide });
// Black
let observedWordColor = '#000000'
// Cerulean blue
let observedWordHighlightColor = '#1B51D9'

var observedDimmedAmount = 0.5


let lineColor = 0x000000
let lineDeselectColor = 0xcccccc

fetch("data/red_rhyme.json")
  .then(res => res.json())
  .then(json => update(json))


function makeHiddenNode(scene, text, status, x, y, z) {

  let material = getStatusMaterial(status)

  var mesh = new THREE.Mesh(hiddenGeometry, material);
  mesh.position.set(x, y, z)
  scene.add(mesh)

  var outline = new THREE.Mesh(hiddenGeometry, hiddenOutlineMaterial)
  outline.position.set(x, y, z)
  outline.scale.multiplyScalar(1.05);
  scene.add(outline)

  let textMesh = new THREE.TextSprite({
    alignment: 'center',
    color: '#000000',
    fontFamily: '"Times New Roman", Times, serif',
    fontSize: 7,
    text: text,
  });
  textMesh.scale.multiplyScalar(0.2);
  textMesh.position.set(x, y, z)
  scene.add(textMesh)
  return mesh
}

function getStatusMaterial(status) {
  var material
  switch (status) {
    case "active":
      material = hiddenMaterial
      break;
    case "inactive":
      material = hiddenInactiveMaterial
      break;
    case "cut":
      material = hiddenCutMaterial
      break;
    default:
      material = hiddenMaterial
  }
  return material
}


function makeConnection(scene, color, x1, y1, z1, x2, y2, z2) {
  var material = new THREE.LineBasicMaterial( { color: color } );
  var points = [];
  points.push( new THREE.Vector3( x1, y1, z1 ) );
  points.push( new THREE.Vector3( x2, y2, z2 ) );
  var geometry = new THREE.BufferGeometry().setFromPoints(points);
  var line = new THREE.Line(geometry, material);
  scene.add(line)
}

function makeConnectionBezier(scene, color, points) {
  const material = new THREE.LineBasicMaterial( { color: color } );
  const curve = new THREE.CubicBezierCurve3(
    points[0],
    points[1],
    points[2],
    points[3]
  );

  const curvePoints = curve.getPoints( 50 );

  const geometry = new THREE.BufferGeometry().setFromPoints(curvePoints);
  var line = new THREE.Line(geometry, material);
  scene.add(line)
  return line
}

function makeOrientation(scene) {
  var material = new THREE.LineBasicMaterial( { color: 0x0000ff } ); // X blue
  var points = [];
  points.push( new THREE.Vector3( 0, 0, 0 ) );
  points.push( new THREE.Vector3( 20, 0, 0 ) );
  var geometry = new THREE.BufferGeometry().setFromPoints(points);
  var line = new THREE.Line(geometry, material);
  scene.add(line)
  material = new THREE.LineBasicMaterial( { color: 0x00ff00 } ); // Y green
  points = [];
  points.push( new THREE.Vector3( 0, 0, 0 ) );
  points.push( new THREE.Vector3( 0, 20, 0 ) );
  geometry = new THREE.BufferGeometry().setFromPoints(points);
  line = new THREE.Line(geometry, material);
  scene.add(line)
  material = new THREE.LineBasicMaterial( { color: 0xff0000 } ); // Z red
  points = [];
  points.push( new THREE.Vector3( 0, 0, 0 ) );
  points.push( new THREE.Vector3( 0, 0, 20 ) );
  geometry = new THREE.BufferGeometry().setFromPoints(points);
  line = new THREE.Line(geometry, material);
  scene.add(line)
}

function selectHiddenNode(hiddenNode, isSelected) {
  hiddenNode[2] = isSelected
  if (isSelected) {
    hiddenNode[1].material = hiddenSelectedMaterial
  } else {
    hiddenNode[1].material = hiddenMaterial
  }
}

function dimObservedNodes() {
  if (!isObservedDimmed) {
    for (var i = 0; i < wordClouds.length; i++) {
      for (var j = 0; j < wordClouds[i].length; j++) {
        this.tl = new TimelineMax();
        this.tl.to(wordClouds[i][j].material, animationTiming, {opacity: observedDimmedAmount, ease: Expo.easeOut})
      }
    }
    isObservedDimmed = true
  }
}

function brightenObservedNodes() {
  if (isObservedDimmed) {
     for (var i = 0; i < wordClouds.length; i++) {
      for (var j = 0; j < wordClouds[i].length; j++) {
        this.tl = new TimelineMax();
        this.tl.to(wordClouds[i][j].material, animationTiming, {opacity: 1.0, ease: Expo.easeOut})
      }
    }   
    isObservedDimmed = false
  }
}

function makeObservedNode(scene, words, row, x, y, z, hiddenMesh) {
  let width = 160
  let height = 160
  let margin = 10

  let cloudMeshes = []

  y -= (height - hiddenVerticalSeparation)/2
  let geometry = new THREE.BoxGeometry(30, height, width)
  let mesh = new THREE.Mesh(geometry, observedMaterial)
  mesh.position.set(x, y, z)
  // scene.add(mesh)
  // cloudMeshes.push(mesh)

  var outline = new THREE.Mesh(geometry, observedOutlineMaterial)
  outline.position.set(x, y, z)
  outline.scale.multiplyScalar(1.03);
  // scene.add(outline)
  // cloudMeshes.push(outline)

  // Make connection to hidden node
  let line = makeConnectionBezier(
    scene,
    0x666666,
    [
      new THREE.Vector3(
        hiddenMesh.position.x,
        hiddenMesh.position.y - hiddenNodeRadius*1.05,
        hiddenMesh.position.z
      ),
      new THREE.Vector3(
        hiddenMesh.position.x,
        hiddenMesh.position.y - hiddenNodeRadius*1.05 - curveControlDistance,
        hiddenMesh.position.z
      ),
      new THREE.Vector3(
        mesh.position.x,
        mesh.position.y + height/2 + curveControlDistance,
        mesh.position.z,
      ),
      new THREE.Vector3(
        mesh.position.x,
        mesh.position.y + height/2,
        mesh.position.z,
      )
    ]
  )
  cloudMeshes.push(line)
  line.material.transparent = true
  line.material.opacity = 0.0
  this.tl = new TimelineMax();
  this.tl.to(line.material, animationTiming, {opacity: 1, ease: Expo.easeOut})

  let wordVerticalSpacing = 20
  let wordHorizontalSpacingPerLetter = 5.0

  var wordAtSequenceLength = false
  if (row < sequence.length) {
    wordAtSequenceLength = true
  }

  var shift = 0
  if (words.length < 10) {
    shift = 20
  }

  let p = 0
  let pWidth = 0
  for (w = 0; w < words.length; w++) {

    var color = observedWordColor
    if (wordAtSequenceLength) {
      if (startsWith) {
        if (words[w].name[0].toLowerCase() == sequence[row][0].toLowerCase()) {
          color = observedWordHighlightColor
        }
      } else {
        if (words[w].name.toLowerCase() == sequence[row].toLowerCase()) {
          color = observedWordHighlightColor
        }
      }
    }

    let textMesh = new THREE.TextSprite({
      alignment: 'center',
      color: color,
      fontFamily: '"Times New Roman", Times, serif',
      // fontFamily: 'Arial, Helvetica, sans-serif',
      fontSize: 8,
      text: words[w].name,
    });
    textMesh.scale.multiplyScalar(0.2);


    let wx = x
    let wz = z - width / 2 + margin + pWidth + (words[w].name.length * wordHorizontalSpacingPerLetter)/2 + shift
    pWidth += words[w].name.length * wordHorizontalSpacingPerLetter + shift

    // If the word needs to be pushed to the next row
    let l = words[w].name.length
    if (pWidth > z + width/2) {
      p += 1
      pWidth = 0
      wz = z - width / 2 + margin + pWidth + (words[w].name.length * wordHorizontalSpacingPerLetter)/2 + shift
      pWidth += words[w].name.length * wordHorizontalSpacingPerLetter + shift
    } 

    let wy = y - wordVerticalSpacing*p + height/2 - margin
    textMesh.position.set(wx, wy, wz)

    textMesh.material.transparent = true
    textMesh.material.opacity = 0.0
    scene.add(textMesh)
    cloudMeshes.push(textMesh)

    this.tl = new TimelineMax();
    this.tl.to(textMesh.material, animationTiming, {opacity: 1, ease: Expo.easeOut})
  }

  wordClouds[row] = cloudMeshes
}

function makeObservedNodes(hiddenMeshes, i, data, scene) {
  // find selected hidden node for row
  var selectedPos = 0
  for (var k = 0; k < hiddenMeshes[i].length; k++) {
    if (hiddenMeshes[i][k][2] == true) {
      selectedPos = k
      break;
    }
  }

  for (var j = 0; j < data.tokens[i].observed.length; j++) { // Observed node
    let observedNode = data.tokens[i].observed[j]
    if (observedNode.name == hiddenMeshes[i][selectedPos][0]) {
      let x = i*hiddenHorizontalSpacing - (data.tokens.length/2 * hiddenHorizontalSpacing)
      let y = 0
      let z = (data.tokens.length/2*hiddenDepthSpacing)/2
      makeObservedNode(scene, observedNode.to, i, x, y, z, hiddenMeshes[i][selectedPos][1])
    }
  }

  if (!isObservedDimmed) {
    dimObservedNodes()
  } else {
    brightenObservedNodes()
  }
}

function removeWordCloud(scene, renderer, wordCloud) {
  for (var i = 0; i < wordCloud.length; i++) {
    scene.remove(wordCloud[i]);
  }
  renderer.renderLists.dispose();
}

// DONE
// 1. Line from selected node to word cloud
// 2. Change word cloud for selected hidden node
// 3. Highlight selected words
// 4. Highlight for active/inactive hidden nodes and words
//    4.1 Complete red_rhyme toy example data
// 5. Fade words when above and looking at hidden nodes
// 6. Button to switch from toy to real data
    // text for the sequence
// 7. CHANGE export code to include inactive hidden/observed nodes

function update(data) {
  this.data = data
  scene = new THREE.Scene();

  camera = new THREE.PerspectiveCamera(45,window.innerWidth/window.innerHeight,0.1,10000)
  // camera.position.set(-56.0, 261.0, 386.0);
  camera.position.set(cameraStartingPos[0], cameraStartingPos[1], cameraStartingPos[2]);
  camera.lookAt(scene.position)

  renderer = new THREE.WebGLRenderer({antialias: true});
  renderer.setClearColor("#ffffff");
  renderer.setSize(window.innerWidth,window.innerHeight);

  document.body.appendChild(renderer.domElement);

  var controls = new THREE.OrbitControls(camera, renderer.domElement);

  window.addEventListener('resize', () => {
      renderer.setSize(window.innerWidth,window.innerHeight);
      camera.aspect = window.innerWidth / window.innerHeight;

      camera.updateProjectionMatrix();
  })

  raycaster = new THREE.Raycaster();
  mouse = new THREE.Vector2();

  // Make all the 3D objects here

  // Orientation
  // makeOrientation(scene)


  // Display Hidden Nodes up top here

  for (var i = 0; i < data.tokens.length; i++) { // Step in sequence
    var hiddenRow = []
    // if (i === 0) {
    if (i === -1) {

    } else {
      for (var j = 0; j < data.tokens[i].hidden.length; j++) { // Hidden node
        let hiddenNode = data.tokens[i].hidden[j]
        for (connectingNode of hiddenNode.to) { // Connecting to hidden node
          var found = false
          for (var k = 0; k < hiddenRow.length; k++) {
            if (hiddenRow[k][0] == connectingNode.name) {
              found = true
              break
            }
          }
          if (!found) {
            let x = i*hiddenHorizontalSpacing - (data.tokens.length/2 * hiddenHorizontalSpacing)
            let y = hiddenVerticalSeparation
            let z = -hiddenRow.length*hiddenDepthSpacing + (data.tokens.length/2*hiddenDepthSpacing)

            // find status of connectingNode
            var nodeStatus
            if (i < data.tokens.length-1) {
              for (var q = 0; q < data.tokens[i+1].hidden.length; q++) {
                if (data.tokens[i+1].hidden[q].name == connectingNode.name) {
                  nodeStatus = data.tokens[i+1].hidden[q].status
                }
              }
            } else {
              for (var p = 0; p < data.lastHiddenStatuses.length; p++) {
                if (data.lastHiddenStatuses[p].name == connectingNode.name) {
                  nodeStatus = data.lastHiddenStatuses[p].status
                }
              }
            }
  
            nodeMesh = makeHiddenNode(scene, connectingNode.name, nodeStatus, x, y, z)
            // Name, mesh, isSelected, status
            hiddenRow.push([connectingNode.name, nodeMesh, false, nodeStatus])
          }
        }
      }
    }
    hiddenMeshes.push(hiddenRow)
  }
  // Select starting nodes here
  for (var i = 0; i < selectedNodes.length && i < sequence.length; i++) {
    selectHiddenNode(hiddenMeshes[i][selectedNodes[i]], true)
  }

  // Connecting Hidden Nodes
  for (var i = 0; i < data.tokens.length; i++) { // Step in sequence
    var hiddenRow = []
    if (i === 0) {
    // if (i === -1) {

    } else {
      for (var j = 0; j < data.tokens[i].hidden.length; j++) { // Hidden node
        let hiddenNode = data.tokens[i].hidden[j]

        var foundPos = -1
        for (var p = 0; p < hiddenMeshes[i-1].length; p++) {
          if (hiddenMeshes[i-1][p][0] == hiddenNode.name) {
            foundPos = p
            break
          }
        }

        if (foundPos != -1) {
          // console.log(hiddenNode)
          for (connectingNode of hiddenNode.to) {
            for (var k = 0; k < hiddenMeshes[i].length; k++) {
              if (hiddenMeshes[i][k][0] == connectingNode.name) {

                var color = lineColor
                if (connectingNode.value == 0) {
                  color = lineDeselectColor
                }

                makeConnectionBezier(
                  scene, color,
                  [
                    new THREE.Vector3(
                      hiddenMeshes[i-1][foundPos][1].position.x + hiddenNodeRadius*1.05,
                      hiddenMeshes[i-1][foundPos][1].position.y,
                      hiddenMeshes[i-1][foundPos][1].position.z,
                    ),
                    new THREE.Vector3(
                      hiddenMeshes[i-1][foundPos][1].position.x + hiddenNodeRadius*1.05 + curveControlDistance,
                      hiddenMeshes[i-1][foundPos][1].position.y,
                      hiddenMeshes[i-1][foundPos][1].position.z,
                    ),
                    new THREE.Vector3(
                      hiddenMeshes[i][k][1].position.x - hiddenNodeRadius*1.05 - curveControlDistance,
                      hiddenMeshes[i][k][1].position.y,
                      hiddenMeshes[i][k][1].position.z
                    ),
                    new THREE.Vector3(
                      hiddenMeshes[i][k][1].position.x - hiddenNodeRadius*1.05,
                      hiddenMeshes[i][k][1].position.y,
                      hiddenMeshes[i][k][1].position.z
                    ),
                  ]

                )
                break  
              }
            }
          }
        }
      }
    }
  }

  // Make observed node visible for selected hidden node

  for (var i = 0; i < hiddenMeshes.length; i++) { // Step in sequence
    makeObservedNodes(hiddenMeshes, i, data, scene)
  }


  // Lighting
  var light = new THREE.PointLight(0xFFFFFF, 1, 1000)
  light.position.set(0,0,0);
  scene.add(light);

  var light = new THREE.PointLight(0xFFFFFF, 2, 1000)
  light.position.set(0,0,25);
  scene.add(light);

  var render = function() {
      requestAnimationFrame(render);

      controls.update()
      // console.log(camera.position)

      // When looking at hidden nodes, dim node beneath
      if (camera.position.y > hiddenVerticalSeparation + 170) {
        dimObservedNodes()
      } else {
        brightenObservedNodes()
      }

      renderer.render(scene, camera);
  }

  window.addEventListener('click', onMouseClick);
  render();
}

function onMouseClick(event) {
  event.preventDefault();

  mouse.x = ( event.clientX / window.innerWidth ) * 2 - 1;
  mouse.y = - ( event.clientY / window.innerHeight ) * 2 + 1;

  raycaster.setFromCamera(mouse, camera);

  var intersects = raycaster.intersectObjects(scene.children, true);


  // Find if selecting hidden node
  for (var k = 0; k < intersects.length; k++) {
    // console.log(intersects[k].object)
    var found = false
    for (var i = 0; i < hiddenMeshes.length; i++) {
      for (var j = 0; j < hiddenMeshes[i].length; j++) {
        if (intersects[k].object == hiddenMeshes[i][j][1]) {
          // console.log(`Match! node named ${hiddenMeshes[i][j][0]}`)
          let isSelected = hiddenMeshes[i][j][2]

          if (isSelected) { // deselect mesh              
            hiddenMeshes[i][j][2] = false
            hiddenMeshes[i][j][1].material = getStatusMaterial(hiddenMeshes[i][j][3])
            removeWordCloud(scene, renderer, wordClouds[i])

          } else {
            for (var p = 0; p < hiddenMeshes[i].length; p++) { // deselect meshes on this row
              if (hiddenMeshes[i][p][2] == true) {
                hiddenMeshes[i][p][2] = false
                hiddenMeshes[i][p][1].material = getStatusMaterial(hiddenMeshes[i][p][3])
                removeWordCloud(scene, renderer, wordClouds[i])
              }
            }
            hiddenMeshes[i][j][2] = true
            hiddenMeshes[i][j][1].material = hiddenSelectedMaterial
            makeObservedNodes(hiddenMeshes, i, data, scene)
          }
          found = true
          break;
        }
      }
    }
    if (found) {
      break
    }
  }
}

function changeData() {
  var button = document.getElementById("change");
  if (button.innerHTML == "Larger data") {
    button.innerHTML = "Toy data"

    startsWith = true
    sequence = ["d", "a", "b", "d", "a"]
    selectedNodes = [4, 5, 1, 5, 14]
    cameraStartingPos = [-302, 282, 268]
    isObservedDimmed = false
    hiddenMeshes = []
    wordClouds = []

    while(scene.children.length > 0){ 
      scene.remove(scene.children[0]); 
    }
    window.removeEventListener('click', onMouseClick)
    document.body.removeChild(renderer.domElement);

    fetch("data/substantial.json")
      .then(res => res.json())
      .then(json => update(json))

  } else {
    button.innerHTML = "Larger data"

    startsWith = false
    sequence = ["Fred", "sometimes", "likes", "red"]
    selectedNodes = [0, 1, 0, 3]
    isObservedDimmed = false
    hiddenMeshes = []
    wordClouds = []

    while(scene.children.length > 0){ 
      scene.remove(scene.children[0]); 
    }
    window.removeEventListener('click', onMouseClick)
    document.body.removeChild(renderer.domElement);

    fetch("data/red_rhyme.json")
      .then(res => res.json())
      .then(json => update(json))
  }
}