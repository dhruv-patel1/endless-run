let sceneWidth;
let sceneHeight;

let camera;
let scene;
let renderer;

//world
let rotatingPlane;
//snow Effect
let starGeo;
let stars;

let moon, sun, planet;
const worldRadius = 26;

let mixer;
let character;

let collisionDetected;

let particleGeo;
const numParticles = 25;
let explosionPower = 4;
let particles;

let score;
let scoreNum;
let incrementer = 2.5;

let raf;
let stopped;
const leftMostLane = -2;
const leftLane = -1;
const midLane = 0;
const rightLane = 1;
const rightMostLane = 2;
let currentLane;
let jumping;
let bounceVal=0.1;

let clock;
let spherical;
let pathAngles;
let obstacleReleaseInterval = 1;
let obstaclesInPath;
let obstaclesPool;

let coinCollision;
let coinsInPath;
let coinsPool;
let coinPathAngles;
let coinIncrementOne = 10;

let light, light2, light3;
let sunshine, sunshine2, sunshine3;

let ds1, ds2, ds3, ds4;

let flag = true;
let flag2 = true;



const init = () =>{
    //setup the scene once init is called 
    createScene();
    update();

};



const createScene = () =>{

    //snowman obstacle stuff
    collisionDetected = false;
    obstaclesInPath = [];
    obstaclesPool = [];

    //coin stuff
    coinCollision = false;
    coinsInPath = [];
    coinsPool = [];
    coinPathAngles = [1.47, 1.53, 1.59];

    clock = new THREE.Clock();
    score = 0;
    stopped = false;
    clock.start();
    pathAngles = [1.50, 1.57, 1.64];
    //Get dimensions 
    sceneWidth = window.innerWidth;
    sceneHeight = window.innerHeight;

    //This is the 3D scene 
    scene = new THREE.Scene();
    
    scene.background = new THREE.Color(0xFFDADF);
    scene.fog = new THREE.FogExp2(0xF9DEFD, 0.15);

    spherical = new THREE.Spherical();
    //Set up the perspective camera
    camera = new THREE.PerspectiveCamera(60, sceneWidth / sceneHeight, 0.1, 2000);

    //Set up the renderer and initialize with transparent background
    renderer = new THREE.WebGLRenderer({alpha: true});
    renderer.setClearColor(0xECF0F1, 1);
    //enable the shadow
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.setSize(sceneWidth, sceneHeight);

    let dom = document.getElementById('game');
    dom.appendChild(renderer.domElement);

    //call scene functions here
    createPlane();
    addCharacter();
    createStars();
    createMoon();

    addHakai();

    createCoinPool();

    createObstaclesPool();
    setupLight();
    gSoundOne();

    scoreNum = document.createElement('div');

    scoreNum.style.zIndex = 3;

    scoreNum.style.width = 100;
    scoreNum.style.height = 60;

    scoreNum.style.fontSize = 20 + 'px';
    scoreNum.style.position = 'absolute';
    scoreNum.style.top = 50 + 'px';
    scoreNum.style.left = 85+ '%';

    scoreNum.innerHTML = "Score: "+0;

    document.body.appendChild(scoreNum);

    camera.position.z = 10;
    camera.position.y = 2.75;


    window.addEventListener('resize', onWindowResize, false);

    //add Function to handle key down events
    document.onkeydown = handleInteraction;

}




const gSoundOne = () =>{
    const listener = new THREE.AudioListener();
        camera.add(listener);
        const sound = new THREE.Audio(listener);
        const audioLoader = new THREE.AudioLoader();
        audioLoader.load('./sounds/bg1.mp3', (buffer) =>{
            sound.setBuffer(buffer);
            sound.setLoop(true);
            sound.setVolume(0.5);
            sound.play();
        })
}





const handleInteraction = (e) =>{
    if(jumping){
        return;
    }
    let validMove = true;
    if(e.key === 'ArrowLeft'){
        const lane = currentLane;
        if(lane === leftLane){
            currentLane = leftMostLane;
        }
        if(lane === midLane){
            currentLane = leftLane;
        }
        if(lane === rightLane){
            currentLane = midLane;
        }
        if(lane === rightMostLane){
            currentLane = rightLane;
        }
        else{
            validMove = false;
        }
    }
    if(e.key === 'ArrowRight'){
        const lane = currentLane;
        if(lane === leftMostLane){
            currentLane = leftLane;
        }
        if(lane === leftLane){
            currentLane = midLane;
        }
        if(lane === midLane){
            currentLane = rightLane;
        }
        if(lane === rightLane){
            currentLane = rightMostLane;
        }
        else{
            validMove = false;
        }
    }
    else{
        if(e.key === 'ArrowUp'){
            bounceVal = 0.13;
            jumping = true;
        }
        validMove = false;
    }
    if(validMove){
        jumping = true;
        bounceVal = 0.06;
    }
}





const handleGameOver = () =>{
    setTimeout(() =>{
        window.location.href="gameOver.html";
    }, 800);
  
}




//load character here
const addCharacter = () =>{
    
    const loader = new THREE.GLTFLoader();
    loader.load('./character/scene.gltf', (gltf) =>{

        character = gltf.scene.children[0];
        character.scale.set(0.6, 0.6, 0.6);


        mixer = new THREE.AnimationMixer(gltf.scene);
        const action = mixer.clipAction(gltf.animations[0]);
        character = gltf.scene;
        action.play();
        character.position.y = 1.8;
        character.position.z = 7;
        character.rotation.y = 9.4;
        

        character.receiveShadow = true;
        character.castShadow = true;
        currentLane = midLane;

        character.position.x = currentLane;

        scene.add(gltf.scene);

    })
}



//obstacles 
const createObstaclesPool = () =>{
    const obstacles = 30;
    let newObstacle;
    for(let i=0; i < obstacles; i++){
        newObstacle = createSnowman();
        obstaclesPool.push(newObstacle);
    }
}




const createObstaclesPool2 = () =>{
    obstaclesPool = [];
    obstaclesInPath = [];
    const obstacles = 30;
    let newObstacle;
    for(let i=0; i < obstacles; i++){
        newObstacle = createCactus();
        obstaclesPool.push(newObstacle);
    }
}




const createObstaclesPool3 = () =>{
    obstaclesPool = [];
    obstaclesInPath = [];
    const obstacles = 30;
    let newObstacle;
    for(let i=0; i < obstacles; i++){
        newObstacle = createTree();
        obstaclesPool.push(newObstacle);
    }
}
 




const addPathObstacle = () =>{
    const ops = [0,1,2];
    let lane = Math.floor(Math.random()*3);
    addObstacle(true, lane);
    ops.splice(lane, 1);
    if(Math.random() > 0.5){
        lane = Math.floor(Math.random()*2);
        addObstacle(true, ops[lane]);
    }
}




const addObstacle = (inPath, row) =>{
    let newObstacle;
    if(inPath){
        if(obstaclesPool.length === 0){return;}
        newObstacle = obstaclesPool.pop();
        newObstacle.visible = true;
        obstaclesInPath.push(newObstacle);
        spherical.set(worldRadius - 0.3, pathAngles[row], -rotatingPlane.rotation.x + 4);
    }
    newObstacle.position.setFromSpherical(spherical);
    const groundVector = rotatingPlane.position.clone().normalize();
    const obstacleVector = newObstacle.position.clone().normalize();
    newObstacle.quaternion.setFromUnitVectors(obstacleVector, groundVector);
    newObstacle.rotation.x += (Math.random() * (2 * Math.PI/10)) + -Math.PI/10;

    rotatingPlane.add(newObstacle);
}





//obstacle geometries
const createSnowman = () =>{

    const sides = 8;
    const tiers = 6;

    let b1Geo = new THREE.SphereGeometry(0.5, sides, tiers);
    const mats = new THREE.MeshStandardMaterial({
        color: 0xffffff,
        shading: THREE.FlatShading
    });

    const b1 = new THREE.Mesh(b1Geo, mats);
    b1.castShadow = true;
    b1.receiveShadow = false;
    b1.position.y = 0.4;

    const b2Geo = new THREE.SphereGeometry(0.35, sides, tiers);
    const b2 = new THREE.Mesh(b2Geo, mats);
    b2.position.y = 1.1;

    const b3Geo = new THREE.SphereGeometry(0.2, sides, tiers);
    const b3 = new THREE.Mesh(b3Geo, mats);
    b3.position.y = 1.55;

    const snowman = new THREE.Object3D();
    snowman.add( b1, b2, b3);

    return snowman;
}




const createCactus = () =>{

    let loader = new THREE.TextureLoader();
    const texture = loader.load('./cactus_texture.jpg');

    const midGeo = new THREE.CylinderGeometry(0.2, 0.2, 2.4, 5);
    const mat = new THREE.MeshBasicMaterial({
        map: texture,
        fog: false
    });

    const p1 = new THREE.Mesh(midGeo, mat);
    p1.castShadow = true;
    p1.receiveShadow = false;
    p1.position.y = 0.4;

    const topGeo = new THREE.ConeGeometry(0.2, 0.3, 5);
    const p2 = new THREE.Mesh(topGeo, mat);
    p2.position.y = 1.75;
    p2.castShadow = true;
    p2.receiveShadow = false;

    const armGeo = new THREE.CylinderGeometry(0.2, 0.2, 1, 5);
    const p3 = new THREE.Mesh(armGeo, mat);
    p3.position.y = 1;
    p3.position.z = -0.05;
    p3.rotation.x = Math.PI/2;

    const cactus = new THREE.Object3D();
    cactus.add(p1, p2, p3);

    return cactus;
 
}




const createTree = () =>{

	const treeGeometry = new THREE.ConeGeometry( 0.5, 1.5, 12, 6);
	const treeMaterial = new THREE.MeshStandardMaterial({
         color: 0x00FF55,
         fog: false  
        });


	const treeTop = new THREE.Mesh( treeGeometry, treeMaterial );
	treeTop.castShadow=true;
	treeTop.receiveShadow=false;
	treeTop.position.y=1.2;
	treeTop.rotation.y=(Math.random()*(Math.PI));
	const treeTrunkGeometry = new THREE.CylinderGeometry( 0.1, 0.2,0.5);
	const trunkMaterial = new THREE.MeshStandardMaterial({
        color: 0x886633,
        fog: false  
    });
	const treeTrunk = new THREE.Mesh( treeTrunkGeometry, trunkMaterial );
	treeTrunk.position.y=0.4;
	const tree = new THREE.Object3D();
	tree.add(treeTrunk);
	tree.add(treeTop);
	return tree;
}






const snowmanLogic = () =>{
    let snowman;
    let snowmanPos = new THREE.Vector3();
    let snowmanRemove = [];

    obstaclesInPath.forEach( (element, index) =>{
        snowman = obstaclesInPath[index];
        snowmanPos.setFromMatrixPosition(snowman.matrixWorld);
        if(snowmanPos.z > 7 && snowman.visible){
            snowmanRemove.push(snowman);
        }
        else{
            //do collision logic here
            if(character){
                if(snowmanPos.distanceTo(character.position) <= 0.75){
                    console.log("collision detected!");
                    collisionDetected = true;
                    deathSound();
                    hakai(); 
                }
            }
        }
    });

    let fromWhere;
    snowmanRemove.forEach((element, index) =>{
        snowman = snowmanRemove[index];
        fromWhere = obstaclesInPath.indexOf(snowman);
        obstaclesInPath.splice(fromWhere, 1);
        obstaclesPool.push(snowman);
        snowman.visible = false;
    })
}




//coin stuff goes here
const createCoin = () =>{
    const sides = 0.3;

    const geometry = new THREE.CylinderGeometry(sides, sides, 0.05, 32);
    const mat = new THREE.MeshPhongMaterial({
        color: 0xF3C70D,
        opacity: 0.8,
        fog: false
    });

    const coin = new THREE.Mesh(geometry, mat);
    coin.castShadow = true;
    coin.receiveShadow = false;
    
    return coin;

}




const createCoinPool = () =>{
    const numCoins = 15;
    let newCoin;
    for(let i=0; i < numCoins; i++){
        newCoin = createCoin();
        coinsPool.push(newCoin);
    }
}





const addPathCoin = () =>{
    const ops = [0,1,2];
    let lane = Math.floor(Math.random()*3);
    addCoin(true, lane);
    ops.splice(lane, 1);
    if(Math.random() > 0.5){
        lane = Math.floor(Math.random()*2);
        addCoin(true, ops[lane]);
    }
}




const addCoin = (inPath, row) =>{
    let newCoin;
    if(inPath){
        if(coinsPool.length === 0){return;}
        newCoin = coinsPool.pop();
        newCoin.visible = true;
        coinsInPath.push(newCoin);
        spherical.set(worldRadius, coinPathAngles[row], -rotatingPlane.rotation.x + 4);
        newCoin.position.setFromSpherical(spherical);

        rotatingPlane.add(newCoin);
    }
    
    
}




const coinSound = () =>{
    const listener = new THREE.AudioListener();
    camera.add(listener);
    const sound = new THREE.Audio(listener);
    const audioLoader = new THREE.AudioLoader();
    audioLoader.load('./sounds/coin.wav', (buffer) =>{
        sound.setBuffer(buffer);
        sound.setLoop(false);
        sound.setVolume(0.2);
        sound.play();
    })
}




const coinLogic = () =>{
    let coin;
    let coinPos = new THREE.Vector3();
    let coinRemove = [];
    coinsInPath.forEach( (element, index) =>{
        coin = coinsInPath[index];
        coinPos.setFromMatrixPosition(coin.matrixWorld);
        if(coin.z > 7 && coin.visible){
            coinRemove.push(coin);
        }
        else{
            //do coin collision logic here
            if(character){
                if(coinPos.distanceTo(character.position) <= 0.7){
                    console.log("You got a coin");
                    coinCollision = true;
                    coinSound();
                    coin.visible = false;
                }
            }
        }
    });

    let fromWhere;
    coinRemove.forEach((element, index) =>{
        coin = coinRemove[index];
        fromWhere = coinsInPath.indexOf(coin);
        coinsInPath.splice(fromWhere, 1);
        coinsPool.push(coin);
        coin.visible = false;
    })
}




const deathSound = () =>{
    const listener = new THREE.AudioListener();
    camera.add(listener);
    const sound = new THREE.Audio(listener);
    const audioLoader = new THREE.AudioLoader();
    audioLoader.load('./sounds/death.wav', (buffer) =>{
        sound.setBuffer(buffer);
        sound.setLoop(false);
        sound.setVolume(0.2);
        sound.play();
    })
}




const addHakai = () =>{
    particleGeo = new THREE.Geometry();
    for(let i=0; i < numParticles; i++){
        let vtx = new THREE.Vector3();
        particleGeo.vertices.push(vtx);
    }

    const particleMat = new THREE.ParticleBasicMaterial({
        color: 0xFF0000,
        size: 0.1,
        fog: true
    });
    particles = new THREE.Points(particleGeo, particleMat);
    scene.add(particles);
    particles.visible = false;
}





const explosionLogic = () =>{
    if(!particles.visible){return;}
    for(let i=0; i < numParticles; i++){
        particleGeo.vertices[i].multiplyScalar(explosionPower);
    }
    if(explosionPower > 1.005){
        explosionPower -= 0.001;
    }
    else{
        particles.visible = false;
    }
    particleGeo.verticesNeedUpdate = true;
}





const hakai = () =>{
    particles.position.x = character.position.x;
    particles.position.y = 2;
    particles.position.z = 4.8;
    for(let i=0; i<numParticles; i++){
        let vtx = new THREE.Vector3();
        vtx.x = -0.2+Math.random() * 0.4;
		vtx.y = -0.2+Math.random() * 0.4 ;
		vtx.z = -0.2+Math.random() * 0.4;
        particleGeo.vertices[i] = vtx;
    }
    explosionPower = 1.07;
    particles.visible = true;
}





//function to create 3D Spherical Geometry which is the plane of the game
const createPlane = () =>{
    const sides = 50;
    const tiers = 50;
    

    const sphereGeometry = new THREE.SphereGeometry(worldRadius, sides, tiers);
    const sphereMaterial = new THREE.MeshStandardMaterial({color: 0xF1F1F1, shading: THREE.FlatShading});

    let vIdx;
    let vVector = new THREE.Vector3();
    let nextVector = new THREE.Vector3();
    let fvVector = new THREE.Vector3();
    let offset = new THREE.Vector3();

    let currentTier = 1;
    let lerpVal = 0.5;
    let heightVal;
    const maxHeight = 0.07;

    for(let j=1; j<tiers-2; j++){
        currentTier = j;
        for(let i=0; i<sides; i++){
            vIdx = (currentTier * sides) + 1;
            vVector = sphereGeometry.vertices[i+vIdx].clone();
            if(j%2 !== 0){
                if(i === 0){
                    fvVector = vVector.clone();
                }
                nextVector = sphereGeometry.vertices[i+vIdx+1].clone();
                if(i === sides-1){
                    nextVector = fvVector;
                }
                lerpVal = (Math.random() * 0.5) + 0.25;
                vVector.lerp(nextVector, lerpVal);
            }
            heightVal = (Math.random()*maxHeight) - (maxHeight/2);
            offset = vVector.clone().normalize().multiplyScalar(heightVal);
            sphereGeometry.vertices[i+vIdx] = vVector.add(offset);
        }
    }

    rotatingPlane = new THREE.Mesh(sphereGeometry, sphereMaterial);
    rotatingPlane.receiveShadow = true;
    rotatingPlane.castShadow = false;
    rotatingPlane.rotation.z = -Math.PI/2;
    scene.add(rotatingPlane);
    rotatingPlane.position.y = -24;
    rotatingPlane.position.z = 2;

    
}




const setupLight = () =>{
    light = new THREE.HemisphereLight(0xFBFBFB, 0x000000, 0.9);
    scene.add(light);
    sunshine = new THREE.DirectionalLight(0xFB0032, 0.7);
    sunshine.position.set(0, 10, -7);
    sunshine.castShadow = true;
    scene.add(sunshine);

    sunshine.shadow.mapSize.width = 256;
    sunshine.shadow.mapSize.height = 256;
    sunshine.shadow.camera.near = 0.5;
    sunshine.shadow.camera.far = 50;
}



const setupLight2 = () =>{
    light2 = new THREE.HemisphereLight(0xFFD22D, 0xD4EFF3, 0.9);
    scene.add(light);
    sunshine2 = new THREE.DirectionalLight(0xFFC900, 0.7);
    sunshine2.position.set(0, 10, -7);
    sunshine2.castShadow = true;
    scene.add(sunshine2);

    sunshine2.shadow.mapSize.width = 256;
    sunshine2.shadow.mapSize.height = 256;
    sunshine2.shadow.camera.near = 0.5;
    sunshine2.shadow.camera.far = 50;
}




const setupLight3 = () =>{
    light3 = new THREE.HemisphereLight(0x2DFFA0, 0xB9C3C4, 0.9);
    scene.add(light3);
    sunshine3 = new THREE.DirectionalLight(0x00FF55, 0.7);
    sunshine3.position.set(0, 10, -7);
    sunshine3.castShadow = true;
    scene.add(sunshine3);


    sunshine3.shadow.mapSize.width = 256;
    sunshine3.shadow.mapSize.height = 256;
    sunshine3.shadow.camera.near = 0.5;
    sunshine3.shadow.camera.far = 50;
}





const createStars = () =>{
    starGeo = new THREE.Geometry();
    for(let i=0; i<3000; i++){
        let star = new THREE.Vector3(
            Math.random() * 600 - 300,
            Math.random() * 600 - 300,
            Math.random() * 600 - 300
        );
        star.velocity = 0;
        star.acceleration = 0.01;
        starGeo.vertices.push(star);
    }

    let loader = new THREE.TextureLoader();
    const texture = loader.load('./circle.png');
    let material = new THREE.PointsMaterial({
        color: 0xaaaaaa,
        size: 0.6,
        map: texture,
        fog: false
    });
    stars = new THREE.Points(starGeo, material);
    stars.castShadow = false;
    scene.add(stars);
}





const createMoon = () =>{
    const moonGeometry = new THREE.SphereGeometry(50, 50, 50);
    const loader = new THREE.TextureLoader();
    const texture = loader.load("./moon_texture.jpg");
    const moonMaterial = new THREE.MeshPhongMaterial({
        map: texture,
        fog: false,
        shininess: 10
    });
    moon = new THREE.Mesh(moonGeometry, moonMaterial);
    moon.position.y = 375
    moon.position.x = -600
    moon.position.z = -800
    scene.add(moon);
}





const createSun = () =>{
    const sunGeo = new THREE.SphereGeometry(50, 50, 50);
    const mat = new THREE.MeshLambertMaterial({
        color: 0xFFD500,
        fog: false
    });
    sun = new THREE.Mesh(sunGeo, mat);

    const loader = new THREE.TextureLoader();
    const texture = loader.load("./glow.png");

    sun.position.y = 375
    sun.position.x = -500
    sun.position.z = -800

    const spriteMat = new THREE.SpriteMaterial({
        map: texture,
        useScreenCoordinates: false,
        color: 0xff6700,
        transparent: false,
        blending: THREE.AdditiveBlending
    });
    const sprite = new THREE.Sprite(spriteMat);
    sprite.scale.set(200, 200, 1.0);
    sun.add(sprite);
    scene.add(sun);

}




const createPlanet = () =>{
    const planetGeo = new THREE.SphereGeometry(50, 50, 50);
    const mat = new THREE.MeshLambertMaterial({
        color: 0xE6AEAE,
        fog: false
    });
    planet = new THREE.Mesh(planetGeo, mat);

    const loader = new THREE.TextureLoader();
    const texture = loader.load("./glow.png");

    planet.position.y = 375
    planet.position.x = -500
    planet.position.z = -800

    const spriteMat = new THREE.SpriteMaterial({
        map: texture,
        useScreenCoordinates: false,
        color: 0xffffff,
        transparent: false,
        blending: THREE.AdditiveBlending,
        fog: false
    });
    const sprite = new THREE.Sprite(spriteMat);
    sprite.scale.set(200, 200, 1.0);
    planet.add(sprite);
    scene.add(planet);
}




const createDesertStars = () =>{
    const geo = new THREE.IcosahedronGeometry(6);
    const mat = new THREE.MeshLambertMaterial({
        color: 0xffffff,
        fog: false
    });

        ds1 = new THREE.Mesh(geo, mat);
        ds1.position.y = 275
        ds1.position.x = -200
        ds1.position.z = -800
        scene.add(ds1);

        ds2 = new THREE.Mesh(geo, mat);
        ds2.position.y = 275
        ds2.position.x = 0
        ds2.position.z = -600
        scene.add(ds2);

        ds3 = new THREE.Mesh(geo, mat);
        ds3.position.y = 375
        ds3.position.x = 200
        ds3.position.z = -800
        scene.add(ds3);

        ds4 = new THREE.Mesh(geo, mat);
        ds4.position.y = 275
        ds4.position.x = 400
        ds4.position.z = -800
        scene.add(ds4);


}



const orbit = () =>{
    ds1.rotation.z += 0.05;
    ds2.rotation.z += 0.05;
    ds3.rotation.z += 0.05;
    ds4.rotation.z += 0.05;
}





const update = () =>{
    rotatingPlane.rotation.x += 0.003;
    moon.rotation.y += 0.004;

    if(score > 950){
        orbit();
    }

    starGeo.vertices.forEach(p => {
        p.velocity += p.acceleration
        p.y -= p.velocity;
        if (p.y < -200) {
            p.y = 200;
            p.velocity = 0;
        }
    });

    starGeo.verticesNeedUpdate = true;
    stars.rotation.x +=0.002;
    

    const delta = clock.getDelta();
    if(character){
        if(character.position.y <= 1.6){
            jumping = false;
            bounceVal = (Math.random()*0.04)+0.005;
        }
        character.position.y += bounceVal;
        character.position.x = THREE.Math.lerp(character.position.x, currentLane, 2 * delta);
        bounceVal -= 0.005;
    }
    if(mixer){
        mixer.update(delta);
    }
    if(score > 900){
        if(flag){
            createObstaclesPool2();
            obstacleReleaseInterval = 0.8;
            incrementer = 5;
            coinIncrementOne = 15;
            scene.remove(light);
            scene.remove(sunshine);
            setupLight2();
            scene.remove(moon);
            scene.remove(stars);
            flag = false;

            //call functions to create Sun and clouds here
            createSun();
            createDesertStars();
        }
        
    }
    if(score > 5000){
        if(flag2){
            createObstaclesPool3();
            flag2 = false;
            obstacleReleaseInterval = 0.7;
            incrementer = 10;
            coinIncrementOne = 20;
            scene.remove(light2);
            scene.remove(sunshine3);
            scene.remove(sun);
            setupLight3();
            createPlanet();
   
        }
    }
    if(clock.getElapsedTime() > obstacleReleaseInterval){
        clock.start();
        addPathObstacle();
        addPathCoin();
        if(!collisionDetected){
            //update Score value exponentially
            score += 2 * incrementer;
            if(coinCollision){
                score += coinIncrementOne;
                coinCollision = false;
            }
           
            scoreNum.innerHTML = "Score: " +score;
            window.localStorage.setItem("score", score);
        }
        else{
            gameOver();
            handleGameOver();
        }
    }
    snowmanLogic();
    coinLogic();
    explosionLogic();
    render();
    if(!stopped){
        raf = requestAnimationFrame(update);
    }
    
}



const gameOver = () =>{
    if(raf){
        window.cancelAnimationFrame(raf);
    }
    stopped = true;
}



const render = () =>{
    renderer.render(scene, camera);
}




const onWindowResize = () =>{
    //must resize by new dimensions
    sceneWidth = window.innerWidth;
    sceneHeight = window.innerHeight;
    renderer.setSize(sceneWidth, sceneHeight);
    camera.aspect = (sceneWidth / sceneHeight);
    camera.updateProjectionMatrix();
}
