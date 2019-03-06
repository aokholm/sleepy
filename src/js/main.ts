// three.js
import * as THREE from 'three'
import { Vector3, Quaternion, Euler } from 'three'


import * as OrbitControlsLibrary from 'three-orbit-controls'
let OrbitControls = OrbitControlsLibrary(THREE)

let scene = new THREE.Scene();
let camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000);

let renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Orbiting controls in using mouse/trackpad
let controls:THREE.OrbitControls = new OrbitControls(camera)
controls.enableKeys = false
controls.center.add(new Vector3(0, 0, 0))
camera.position.x = 0;
camera.position.y = 0;
camera.position.z = 3;
controls.update()

// Scene light
setupLights()



class Pause {
  on: boolean = false
  constructor() { this.setUpListener() }

  toggle() {
      this.on = !this.on
  }

  setUpListener() {
      var self = this
      document.addEventListener('keydown', function (e) {
          var key = e.keyCode || e.which;
          if (key === 80) {
              self.toggle()
          }
      }, false);
  }
}


// Pause
let pause = new Pause()


// instantiate a loader
var loader = new THREE.TextureLoader();

var light
var lightRadius = 10
var lightPhase = 0
var moon


var loader = new THREE.TextureLoader();
loader.crossOrigin = '';


let promiseArray = [loadTexture("images/moon-4k.png"), loadTexture("images/moon_normal.jpg")]

function loadTexture(fileName: string): Promise<THREE.Texture> {

    return new Promise( (resolve, reject) => {
    
        // load a resource
        loader.load(
            // resource URL
            fileName,
            // Function when resource is loaded
            function ( texture ) {
                // do something with the texture
                resolve(texture)
            },
            // Function called when download progresses
            function ( xhr ) {
                console.log( (xhr.loaded / xhr.total * 100) + '% loaded' )
            },
            // Function called when download errors
            function ( xhr ) {
                console.log( 'An error happened' )
                reject(xhr)
            }
        )

    })  
}


Promise.all(promiseArray)
.then( textures => {
    
    var material = new THREE.MeshPhongMaterial( {
            map: textures[0],
            normalMap: textures[1],
            shininess: 5
        })

        var geometry = new THREE.SphereGeometry(1,64,64)
        moon = new THREE.Mesh( geometry, material )
        //moon.castShadow = true;
        scene.add( moon )
} )
.catch( error => {
    alert(error)
})



var geometry = new THREE.BoxGeometry( 1, 1, 1 );
var material = new THREE.MeshBasicMaterial( { color: 0x00ff00 } );
var cube = new THREE.Mesh( geometry, material );
scene.add( cube );


// start rendering scene and setup callback for each frame
let lastTime
render(null) // start 

function render(ms) {
    // we get passed a timestamp in milliseconds
    if (lastTime) {
        update((ms-lastTime)/1000) // call update and pass delta time in seconds
    }

    lastTime = ms
    requestAnimationFrame(render)
    renderer.render( scene, camera )
}
var rotationRateMoon = 2*Math.PI / ( 20 * 60 )  // rad / sek
var rotationRateSun = 2*Math.PI / (2 * 60 )  // rad / sek

// Main update loop which is run on every frame 
function update(dt) {
    if (pause.on) return

    dt = dt // can be used for adjusting the animation speed
    dt = Math.min(dt, 0.03) // max timestep of 0.03 seconds

    if(moon) {
        moon.rotateY(rotationRateMoon * dt)
    }

    if (light) {
        lightPhase += rotationRateSun * dt
        var x = Math.cos(lightPhase)
        var z = Math.sin(lightPhase)
        
        light.position.set(x,0,z)
    }

    detectUserInput(dt) // detect any keypresses and update accordinly
}

function setupLights() {
    // var hemiLight = new THREE.HemisphereLight(0xffffff, 0xffffff, 0.6)
    // hemiLight.color.setHSL(0.6, 1, 0.6)
    // hemiLight.groundColor.setHSL(0.095, 1, 0.75)
    // hemiLight.position.set(0, 500, 0)
    // scene.add(hemiLight)
    
    // var dirLight = new THREE.DirectionalLight(0xffffff, 1)
    // dirLight.color.setHSL(0.1, 1, 0.95)
    // dirLight.position.set(20, 100, 0)
    // dirLight.position.multiplyScalar(50)
    // scene.add(dirLight)

    scene.add(new THREE.AmbientLight(0x333333,0.1));

    light = new THREE.DirectionalLight(0xffffff, 1);
    light.position.set(10,0,10);
    scene.add(light);
}

function detectUserInput(dt) {
    var rotationRate = Math.PI // rad / s
    var thrustRate = 20 // N / s

    // if (Key.isDown(Key.UP)) camera.fov -= 10 * dt //kite.elevator.mesh.rotateZ(-rotationRate * dt)
    // if (Key.isDown(Key.LEFT)) camera.fov += 10 * dt //kite.rudder.mesh.rotateZ(-rotationRate * dt)
    // if (Key.isDown(Key.DOWN)) kite.elevator.mesh.rotateZ(rotationRate * dt)
    // if (Key.isDown(Key.RIGHT)) kite.rudder.mesh.rotateZ(rotationRate * dt)
    // if (Key.isDown(Key.S)) kite.obj.rotateZ(-rotationRate / 4 * dt)
    // if (Key.isDown(Key.X)) kite.obj.rotateZ(rotationRate / 4 * dt)
    // if (Key.isDown(Key.A)) kite.adjustThrustBy(-thrustRate * dt)
    // if (Key.isDown(Key.Z)) kite.adjustThrustBy( thrustRate * dt)
}

export var Key = {
  _pressed: {},

  LEFT: 37,
  UP: 38,
  RIGHT: 39,
  DOWN: 40,
  A: 65,
  S: 83,
  X: 88,
  Z: 90,
  
  isDown: function(keyCode) {
    return this._pressed[keyCode];
  },

  onKeydown: function(event) {
    this._pressed[event.keyCode] = true;
  },

  onKeyup: function(event) {
    delete this._pressed[event.keyCode];
  }
};

window.addEventListener('keydown', function(e) { Key.onKeydown(e) })
window.addEventListener('keyup', function(e) { Key.onKeyup(e) })


function setUpListener(keyCode: number, action: () => void, caller: Object) {
    document.addEventListener('keydown', function (e) {
        var key = e.keyCode || e.which;
        if (key === keyCode) { // 81 q
            action.call(caller)
        }
    }, false);
}

