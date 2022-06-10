import * as alt from 'alt-client';
import { IVector3 } from 'alt-client';
import * as native from 'natives';
import { camForward, camRight, isVectorEqual } from './vectorHelper';

let bNoClip: boolean = false;

// tablice moga byc const poniewaz nie zmienia sie ich typ tylko zawartosc
const camArr: number[] = [];

let camIndex: number = 0;

let intervalRef: NodeJS.Timer;

alt.on("keydown", onKeyDown);
function onKeyDown(number: number): void {
    const converted = String.fromCharCode(number);
    
    switch(converted) {
        case "L":
            noClip();
            break;
        case "H":
            saveCam();
            break;
        case "O":
            playCam();
            camIndex = 0;
            break;
        case "J":
            camArr = [];
            break;
    }

    if(bNoClip) {
        handleNoClipMovement(converted);
    }

}

function noClip(): void {
    native.freezeEntityPosition(alt.Player.local.scriptID, !bNoClip);
    native.displayHud(bNoClip);
    native.displayRadar(bNoClip);

    if(bNoClip) {
        alt.emitServer("noclip:disabled");
    }

    bNoClip = !bNoClip;
}

function handleNoClipMovement(converted: string): void {
    let currentPos = alt.Player.local.pos;
    let speed = 3;
    
    const rot = native.getGameplayCamRot(2);
    const forward  = camForward(rot);
    const right = camRight(rot);

    switch(converted) {
        case "Z":
            speed = speed * 5;
            break;
        case "X":
            speed = speed / 2;
            break;
        case "W":
            currentPos = changePos(currentPos, forward, speed);
            break;
        case "S":
            currentPos = changePos(currentPos, forward, -speed);
            break;
        case "A":
            currentPos = changePos(currentPos, right, -speed, true);
            break;
        case "D":
            currentPos = changePos(currentPos, right, speed, true);
            break;
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

function saveCam(): void {
    if(camArr.length >= 10) {
        return alt.log('Maximum 10 cams in arr');;
    }

    let camCoords: alt.Vector3 = native.getGameplayCamCoord();
    let camRot: alt.Vector3 = native.getGameplayCamRot(2);
    let camFov: number = native.getGameplayCamFov();
    let camera: number = native.createCamWithParams("DEFAULT_SCRIPTED_CAMERA", camCoords.x, camCoords.y, camCoords.z, camRot.x, camRot.y, camRot.z, camFov, false, 0);
    camArr.push(camera);
}

function playCam():void {
    if(camArr.length <= 0) {
        return;
    }

    intervalRef = setInterval(camIntervalTick, 3500)
}

function camIntervalTick() {
    if (camIndex < camArr.length - 1) {
        native.setCamActiveWithInterp(camArr[camIndex + 1], camArr[camIndex], 3500, 1, 1);
        native.renderScriptCams(true, true, 1500, false, false, 0);
        camIndex++;
        return;
    }

    clearInterval(intervalRef);
    native.stopRenderingScriptCamsUsingCatchUp(false, 0, 0, 0);
}