/* eslint no-undef: "off", no-unused-vars: "off" */
import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.126.0/build/three.module.js'
import { OrbitControls } from 'https://cdn.jsdelivr.net/npm/three@0.126.0/examples/jsm/controls/OrbitControls.js'
import { TransformControls } from 'https://cdn.jsdelivr.net/npm/three@0.126.0/examples/jsm/controls/TransformControls.js'
import { Rhino3dmLoader } from 'https://cdn.jsdelivr.net/npm/three@0.126.0/examples/jsm/loaders/3DMLoader.js'
import rhino3dm from 'https://cdn.jsdelivr.net/npm/rhino3dm@0.15.0-beta/rhino3dm.module.js'

// set up loader for converting the results to threejs
const loader = new Rhino3dmLoader()
loader.setLibraryPath( 'https://cdn.jsdelivr.net/npm/rhino3dm@0.15.0-beta/' )

const definition = 'metaballTable.gh'

// setup input change events
const dimension_slider = document.getElementById( 'dimension' )
dimension_slider.addEventListener( 'mouseup', onSliderChange, false )
dimension_slider.addEventListener( 'touchend', onSliderChange, false )

const height_slider = document.getElementById( 'height' )
height_slider.addEventListener( 'mouseup', onSliderChange, false )
height_slider.addEventListener( 'touchend', onSliderChange, false )

const cadeira = document.getElementById( 'cadeira' )
cadeira.addEventListener( 'change', onSelectChange, false )

const coordenadas = [{x:-74.75,y:52.01},{x:154.49,y:132.97},{x:163.86,y:104.00},{x:122.10,y:-20.42},{x:164.71,y:-118.42},{x:127.22,y:-148.25},{x:-25.32,y:-98.82}]
const coordenadas2 = [{x:-276,y:163},{x:-285,y:106},{x:-76,y:50},{x:-47,y:44},{x:-118,y:-204},{x:-20,y:-197},{x:-15,y:-64}]
const coordenadas3 = [{x:-176,y:193},{x:-185,y:156},{x:-96,y:80},{x:-87,y:44},{x:-118,y:-904},{x:-27,y:-197},{x:-15,y:-94}]
const coordenadas4 = [{x:-136,y:193},{x:-356,y:156},{x:-96,y:157},{x:-87,y:467},{x:-300,y:-904},{x:-27,y:-999},{x:-15,y:-15}]

var points = []
var points2 = []
var option1 = [coordenadas, coordenadas2]
var option2 = [coordenadas3, coordenadas4]
var option_selector = option1

var ico = null
var ico2 = null
var tcontrols = null

let rhino, doc

rhino3dm().then(async m => {
  console.log('Loaded rhino3dm.')
  rhino = m // global

  init()
  rndPts()
  compute()
})

function rndPts() {
  console.log(scene)
  let obj
  for( var i = scene.children.length - 1; i >= 0; i--) { 
    obj = scene.children[i];
    scene.remove(obj); 
}
  
  scene.traverse(child => {
    console.log("aqui")
    if ( child.userData.hasOwnProperty( 'objectType' ) && child.userData.objectType === 'File3dm' ) {
      scene.remove( child )
    }})
  // generate random points
  points = []
  points2 = []

  console.log ("fgdfg")
  console.log (option_selector)
  const curva1 = option_selector[0]
  const curva2 = option_selector[1]

  for (let i = 0; i < curva1.length; i++) {
    const x = curva1[i].x
    const y = curva1[i].y
    const z = 0


    const pt = "{\"X\":" + x + ",\"Y\":" + y + ",\"Z\":" + z + "}"

    console.log( `x ${x} y ${y}` )

    points.push(pt)
    
    //viz in three
    const icoGeo = new THREE.IcosahedronGeometry(5)
    const icoMat = new THREE.MeshNormalMaterial(( { color: 0xff5733, vertexColors: true } ))
    const ico = new THREE.Mesh( icoGeo, icoMat )
    ico.name = 'ico'
    ico.position.set( x, y, z)
    scene.add( ico )
    
    let tcontrols = new TransformControls( camera, renderer.domElement )
    tcontrols.enabled = true
    tcontrols.attach( ico )
    tcontrols.showX = true
    tcontrols.showY = true
    tcontrols.showZ = false
    tcontrols.size = 0.1
    tcontrols.addEventListener( 'dragging-changed', onChange )
    scene.add(tcontrols)
    
  }
  for (let i = 0; i < curva2.length; i++) {
    const x = curva2[i].x
    const y = curva2[i].y
    const z = 0


    const pt2 = "{\"X\":" + x + ",\"Y\":" + y + ",\"Z\":" + z + "}"

    console.log( `x ${x} y ${y}` )

    points2.push(pt2)
    
    //viz in three
  
    const icoGeo = new THREE.IcosahedronGeometry(5)
    const icoMat = new THREE.MeshNormalMaterial()
    ico2 = new THREE.Mesh( icoGeo, icoMat )
    ico2.name = 'ico2'
    ico2.position.set( x, y, z)
    scene.add( ico2 )
    
    let tcontrols = new TransformControls( camera, renderer.domElement )
    tcontrols.enabled = true
    tcontrols.attach( ico2 )
    tcontrols.showX = true
    tcontrols.showY = true
    tcontrols.showZ = false
    tcontrols.size = 0.1
    tcontrols.addEventListener( 'dragging-changed', onChange )
    scene.add(tcontrols)
    
  }
}

let dragging = false
function onChange() {
  
  dragging = ! dragging
  if ( !dragging ) {
    // update points position
    points = []
    points2 = []
    scene.traverse(child => {
      if ( child.name === 'ico' ) {
        const pt = "{\"X\":" + child.position.x + ",\"Y\":" + child.position.y + ",\"Z\":" + child.position.z + "}"
        points.push( pt )
        console.log(pt)
      }
      if ( child.name === 'ico2' ) {
        const pt = "{\"X\":" + child.position.x + ",\"Y\":" + child.position.y + ",\"Z\":" + child.position.z + "}"
        points2.push( pt )
        console.log(pt)
      }
    }, false)

    compute()
  
    controls.enabled = true
    return 
}

  controls.enabled = false

}

/**
 * Call appserver
 */
async function compute () {

  showSpinner(true)

  // initialise 'data' object that will be used by compute()
  const data = {
    definition: definition,
    inputs: {
      'dimension': dimension_slider.valueAsNumber,
      'height': height_slider.valueAsNumber,
      'points': points, points2
    
    }
    
  }

  console.log(data.inputs)

  const request = {
    'method':'POST',
    'body': JSON.stringify(data),
    'headers': {'Content-Type': 'application/json'}
  }

  try {
    const response = await fetch('/solve', request)

    if(!response.ok)
      throw new Error(response.statusText)

    const responseJson = await response.json()
    collectResults(responseJson)

  } catch(error){
    console.error(error)
  }
  
}

/**
 * Parse response
 */
 function collectResults(responseJson) {

  const values = responseJson.values

  console.log(values)

  // clear doc
  try {
    if( doc !== undefined)
        doc.delete()
  } catch {}

  //console.log(values)
  doc = new rhino.File3dm()

  // for each output (RH_OUT:*)...
  for ( let i = 0; i < values.length; i ++ ) {
    // ...iterate through data tree structure...
    for (const path in values[i].InnerTree) {
      const branch = values[i].InnerTree[path]
      // ...and for each branch...
      for( let j = 0; j < branch.length; j ++) {
        // ...load rhino geometry into doc
        const rhinoObject = decodeItem(branch[j])
        if (rhinoObject !== null) {
          // console.log(rhinoObject)
          doc.objects().add(rhinoObject, null)
        }
      }
    }
  }

  if (doc.objects().count < 1) {
    console.error('No rhino objects to load!')
    showSpinner(false)
    return
  }

  // load rhino doc into three.js scene
  const buffer = new Uint8Array(doc.toByteArray()).buffer
  loader.parse( buffer, function ( object ) 
  {

      // clear objects from scene
      scene.traverse(child => {
        if ( child.userData.hasOwnProperty( 'objectType' ) && child.userData.objectType === 'File3dm') {
          scene.remove( child )
        }
      })

      ///////////////////////////////////////////////////////////////////////
      
      // color crvs
      object.traverse(child => {
        if (child.isLine) {
          if (child.userData.attributes.geometry.userStringCount > 0) {
            //console.log(child.userData.attributes.geometry.userStrings[0][1])
            const col = child.userData.attributes.geometry.userStrings[0][1]
            const threeColor = new THREE.Color( "rgb(" + col + ")")
            const mat = new THREE.LineBasicMaterial({color:threeColor})
            child.material = mat
          }
        }
      })

      ///////////////////////////////////////////////////////////////////////
      // add object graph from rhino model to three.js scene
      scene.add( object )

      // hide spinner and enable download button
      showSpinner(false)
      //downloadButton.disabled = false

  })
}

/**
* Attempt to decode data tree item to rhino geometry
*/
function decodeItem(item) {
const data = JSON.parse(item.data)
if (item.type === 'System.String') {
  // hack for draco meshes
  try {
      return rhino.DracoCompression.decompressBase64String(data)
  } catch {} // ignore errors (maybe the string was just a string...)
} else if (typeof data === 'object') {
  return rhino.CommonObject.decode(data)
}
return null
}

/**
 * Called when a slider value changes in the UI. Collect all of the
 * slider values and call compute to solve for a new scene
 */
function onSliderChange () {
  // show spinner
  let x = dimension_slider.valueAsNumber
  let y= height_slider.valueAsNumber
  document.getElementById( 'dimension_label' ).innerHTML = 'Section Dimension:' + x
  document.getElementById( 'height_label' ).innerHTML = 'Length of the seat: ' + y


  showSpinner(true)
  compute()

 
}

function onSelectChange (){
  
  const batata = document.getElementById ("cadeira")
  const opcao = batata.value
  switch (opcao) {
    case "option1":
      option_selector = option1
      break;
    case "option2" :
      option_selector = option2
      break
  }
  console.log(opcao)
  showSpinner(true)
  rndPts()
  compute()
}
  // show spinner

/**
 * Shows or hides the loading spinner
 */
 function showSpinner(enable) {
  if (enable)
    document.getElementById('loader').style.display = 'block'
  else
    document.getElementById('loader').style.display = 'none'
}

// BOILERPLATE //

var scene, camera, renderer, controls

function init () {

  // Rhino models are z-up, so set this as the default
  THREE.Object3D.DefaultUp = new THREE.Vector3( 0, 0, 1 );

  scene = new THREE.Scene()
  scene.background = new THREE.Color(0,0,0)
  camera = new THREE.PerspectiveCamera( 45, window.innerWidth/window.innerHeight, 1, 10000 )
  camera.position.x = 1000
  camera.position.y = 0
  camera.position.z = 1000

  renderer = new THREE.WebGLRenderer({antialias: true})
  renderer.setPixelRatio( window.devicePixelRatio )
  renderer.setSize( window.innerWidth, window.innerHeight )
  document.body.appendChild(renderer.domElement)

  controls = new OrbitControls( camera, renderer.domElement  )

  window.addEventListener( 'resize', onWindowResize, false )
  let x = dimension_slider.valueAsNumber
  let y= height_slider.valueAsNumber
  document.getElementById( 'dimension_label' ).innerHTML = 'Section Dimension:' + x
  document.getElementById( 'height_label' ).innerHTML = 'Length of the seat: ' + y
  animate()
}

var animate = function () {
  requestAnimationFrame( animate )
  renderer.render( scene, camera )
}
  
function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight
  camera.updateProjectionMatrix()
  renderer.setSize( window.innerWidth, window.innerHeight )
  animate()
}

/**
 * Helper function that behaves like rhino's "zoom to selection", but for three.js!
 */
 function zoomCameraToSelection( camera, controls, selection, fitOffset = 1.2 ) {
  
  const box = new THREE.Box3();
  
  for( const object of selection ) {
    if (object.isLight) continue
    box.expandByObject( object );
  }
  
  const size = box.getSize( new THREE.Vector3() );
  const center = box.getCenter( new THREE.Vector3() );
  
  const maxSize = Math.max( size.x, size.y, size.z );
  const fitHeightDistance = maxSize / ( 2 * Math.atan( Math.PI * camera.fov / 360 ) );
  const fitWidthDistance = fitHeightDistance / camera.aspect;
  const distance = fitOffset * Math.max( fitHeightDistance, fitWidthDistance );
  
  const direction = controls.target.clone()
    .sub( camera.position )
    .normalize()
    .multiplyScalar( distance );
  controls.maxDistance = distance * 10;
  controls.target.copy( center );
  
  camera.near = distance / 100;
  camera.far = distance * 100;
  camera.updateProjectionMatrix();
  camera.position.copy( controls.target ).sub(direction);
  
  controls.update();
  
}
