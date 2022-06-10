import * as alt from 'alt-client';
import { IVector3 } from 'alt-client';
import * as native from 'natives';
let bNoClip: boolean = false;
let isLKeyDown: boolean = false, isHKeyDown: boolean = false, isOKeyDown: boolean = false, isJKeyDown: boolean = false;
let camArr: number[] = [];

alt.everyTick(ReadKeys)

function ReadKeys() {
    // key L ((enable noclip))
    if (alt.isKeyDown('L'.charCodeAt(0)) && !isLKeyDown) {
        isLKeyDown = true;
        noClip();
        setTimeout(() => isLKeyDown = false, 500);
        alt.log('pressed L');
        return;
    }  
    // key H ((save-points))
    if (alt.isKeyDown('H'.charCodeAt(0)) && !isHKeyDown) {
        isHKeyDown = true;
        saveCam();
        setTimeout(() => isHKeyDown = false, 500);
        alt.log('pressed H');
        return;
    }
    // key O ((playing with cam))
    if (alt.isKeyDown('O'.charCodeAt(0)) && !isOKeyDown) {
        isOKeyDown = true;
        playCam();
        camIndex = 0;
        setTimeout(() => isOKeyDown = false, 500);
        alt.log('pressed O');
        return;
    } 
    // key J ((clearing save-points))
    if (alt.isKeyDown('J'.charCodeAt(0)) && !isJKeyDown) {
        isJKeyDown = true;
        camArr = [];
        setTimeout(() => isJKeyDown = false, 500);
        alt.log('pressed J');
        return;
    }
}

let noclipTick: number; // interval for handleNoClipMovement

function noClip():void {
    if(!bNoClip) {
        bNoClip = true;
        native.freezeEntityPosition(alt.Player.local.scriptID, true);
        native.displayHud(false);
        native.displayRadar(false);
        noclipTick = alt.everyTick(handleNoClipMovement);
    } else if (bNoClip) {
        bNoClip = false;
        alt.clearEveryTick(noclipTick);
        native.freezeEntityPosition(alt.Player.local.scriptID, false);
        native.displayHud(true);
        native.displayRadar(true);
        alt.emitServer("noclip:disabled");
    }
}

function handleNoClipMovement():void {
    let currentPos = alt.Player.local.pos;
    let speed = 3;
    let rot = native.getGameplayCamRot(2);
    let forward  = camForward(rot);
    let right = camRight(rot);
    
    if (alt.isKeyDown('Z'.charCodeAt(0))) {
        speed = speed * 5;
    } else if (alt.isKeyDown('X'.charCodeAt(0))) {
        speed = speed / 2;
    } 
    
    if (alt.isKeyDown('W'.charCodeAt(0))) {
        currentPos = changePos(currentPos, forward, speed);
    } else if (alt.isKeyDown('S'.charCodeAt(0))) {
        currentPos = changePos(currentPos, forward, -speed );
    } else if (alt.isKeyDown('A'.charCodeAt(0))) {
        currentPos = changePos(currentPos, right, -speed, true);
    } else if (alt.isKeyDown('D'.charCodeAt(0))) {
        currentPos = changePos(currentPos, right, speed, true);
    }

    if (!isVectorEqual(new alt.Vector3(currentPos.x, currentPos.y, currentPos.z), alt.Player.local.pos)) {
        alt.emitServer("noclip:set", currentPos.x, currentPos.y, currentPos.z);
    }
}

function changePos(vector1:IVector3, vector2:IVector3, speed:number, lr:boolean = false):alt.Vector3 {
    return new alt.Vector3(
        vector1.x + vector2.x * speed,
        vector1.y + vector2.y * speed,
        lr === true ? vector1.z : vector1.z + vector2.z * speed,
    );
}


function camForward(cRot:alt.Vector3):IVector3 {
    let rotRad = {
        x: cRot.x * (Math.PI / 180),
        y: cRot.y * (Math.PI / 180),
        z: cRot.z * (Math.PI / 180) + Math.PI / 2,
    }

    let cDir = {
        x: Math.cos(rotRad.z),
        y: Math.sin(rotRad.z),
        z: Math.sin(rotRad.x),
    }

    return cDir;
}

function camRight(cRot:alt.Vector3):IVector3 {
    let rotRad = {
        x: cRot.x * (Math.PI / 180),
        y: cRot.y * (Math.PI / 180),
        z: cRot.z * (Math.PI / 180),
    }

    var cDir = {
        x: Math.cos(rotRad.z),
        y: Math.sin(rotRad.z),
        z: Math.sin(rotRad.x),
    }

    return cDir;
}

function isVectorEqual(vector1:alt.Vector3, vector2:alt.Vector3):boolean {
    return (
        vector1.x === vector2.x &&
        vector1.y === vector2.y &&
        vector1.z === vector2.z
    );
}

function saveCam():void {
    if(camArr.length < 10) {
        let camCoords:alt.Vector3 = native.getGameplayCamCoord();
        let camRot:alt.Vector3 = native.getGameplayCamRot(2);
        let camFov:number = native.getGameplayCamFov();
        let camera: number = native.createCamWithParams("DEFAULT_SCRIPTED_CAMERA", camCoords.x, camCoords.y, camCoords.z, camRot.x, camRot.y, camRot.z, camFov, false, 0);
        camArr.push(camera);
    } else {
        alt.log('Maximum 10 cams in arr');
    }
}

let camIndex: number = 0;
let intervalRef: NodeJS.Timer; //interval between switching cams

function playCam():void {
    if (camArr.length > 0) {
        intervalRef = setInterval(() => {
            if (camIndex < camArr.length - 1) {
                native.setCamActiveWithInterp(camArr[camIndex + 1], camArr[camIndex], 3500, 1, 1);
                native.renderScriptCams(true, true, 1500, false, false, 0);
                camIndex++;
            } else {
                clearInterval(intervalRef);
                native.stopRenderingScriptCamsUsingCatchUp(false, 0, 0, 0);
            }
        }, 3500)
    } else if(camArr.length <= 0) return;
    
}