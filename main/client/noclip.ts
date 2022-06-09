import * as alt from 'alt-client'
import * as native from 'natives'
let bNoClip: boolean = false
let bB_KeyDown: boolean = false, bO_KeyDown: boolean = false, bK_KeyDown: boolean = false, dk_KeyDown: boolean = false
let camArr: Cam[] = []
type Cam = number

alt.everyTick(ReadKeys)

function ReadKeys() {
    // key L ((enable noclip))
    if (alt.isKeyDown('L'.charCodeAt(0)) && !bB_KeyDown) {
        bB_KeyDown = true
        NoClip()
        setTimeout(() => bB_KeyDown = false, 500)
        alt.log('pressed L')
    }  
    // key H ((save-points))
    if (alt.isKeyDown('H'.charCodeAt(0)) && !bO_KeyDown) {
        bO_KeyDown = true
        SaveCam()
        setTimeout(() => bO_KeyDown = false, 500)
        alt.log('pressed H')
    }
    // key O ((playing with cam))
    if (alt.isKeyDown('O'.charCodeAt(0)) && !bK_KeyDown) {
        bK_KeyDown = true
        PlayCam()
        camIndex = 0
        setTimeout(() => bK_KeyDown = false, 500)
        alt.log('pressed O')
    } 
    // key J ((clearing save-points))
    if (alt.isKeyDown('J'.charCodeAt(0)) && !dk_KeyDown) {
        dk_KeyDown = true
        camArr = []
        setTimeout(() => dk_KeyDown = false, 500)
        alt.log('pressed J')
    }
}

let noclipTick: number // interval for HandleNoClipMovement

function NoClip():void {
    if(bNoClip === false) {
        bNoClip = true
        native.freezeEntityPosition(alt.Player.local.scriptID, true)
        noclipTick = alt.everyTick(HandleNoClipMovement)
    } else if (bNoClip === true) {
        alt.clearEveryTick(noclipTick)
        bNoClip = false
        native.freezeEntityPosition(alt.Player.local.scriptID, false)
        alt.emitServer("noclip:disabled")
    }
}

function HandleNoClipMovement():void {
    let currentPos = alt.Player.local.pos
    let speed = 3
    let rot = native.getGameplayCamRot(2)
    let forward  = CamForward(rot)
    let right = CamRight(rot)
    
    if (alt.isKeyDown('Z'.charCodeAt(0)))
        speed = speed * 5
    if (alt.isKeyDown('X'.charCodeAt(0)))
        speed = speed / 2
    if (alt.isKeyDown('W'.charCodeAt(0)))
        currentPos = ChangePos(currentPos, forward, speed)
    if (alt.isKeyDown('S'.charCodeAt(0)))
        currentPos = ChangePos(currentPos, forward, -speed )
    if (alt.isKeyDown('A'.charCodeAt(0)))
        currentPos = ChangePos(currentPos, right, -speed, true)
    if (alt.isKeyDown('D'.charCodeAt(0)))
        currentPos = ChangePos(currentPos, right, speed, true)

    if (!isVEq(new alt.Vector3(currentPos.x, currentPos.y, currentPos.z), alt.Player.local.pos))   
        alt.emitServer("noclip:set", currentPos.x, currentPos.y, currentPos.z)
}

function ChangePos(vector1, vector2, speed:number, lr = false):alt.Vector3 {
    return new alt.Vector3(
        vector1.x + vector2.x * speed,
        vector1.y + vector2.y * speed,
        lr === true ? vector1.z : vector1.z + vector2.z * speed,
    )
}

interface Rotator {
    x: number,
    y: number,
    z: number,
}

function CamForward(cRot):Rotator {
    let rotRad:Rotator = {
        x: cRot.x * (Math.PI / 180),
        y: cRot.y * (Math.PI / 180),
        z: cRot.z * (Math.PI / 180) + Math.PI / 2,
    }

    let cDir:Rotator = {
        x: Math.cos(rotRad.z),
        y: Math.sin(rotRad.z),
        z: Math.sin(rotRad.x),
    }

    return cDir
}

function CamRight(cRot):Rotator {
    let rotRad:Rotator = {
        x: cRot.x * (Math.PI / 180),
        y: cRot.y * (Math.PI / 180),
        z: cRot.z * (Math.PI / 180),
    }

    var cDir:Rotator = {
        x: Math.cos(rotRad.z),
        y: Math.sin(rotRad.z),
        z: Math.sin(rotRad.x),
    }

    return cDir
}

function isVEq(v1, v2):boolean {
    return (
        v1.x === v2.x &&
        v1.y === v2.y &&
        v1.z === v2.z
    )
}

function SaveCam():void {
    if(camArr.length < 10) {
        let camCoords = native.getGameplayCamCoord()
        let camRot = native.getGameplayCamRot(2)
        let camFov = native.getGameplayCamFov()
        let camera: Cam = native.createCamWithParams("DEFAULT_SCRIPTED_CAMERA", camCoords.x, camCoords.y, camCoords.z, camRot.x, camRot.y, camRot.z, camFov, false, 0)
        camArr.push(camera)
    } else {
        alt.log('Maximum 10 cams in arr')
    }
}

let camIndex: number = 0
let intervalRef: NodeJS.Timer //interval between switching cams

function PlayCam():void {
    if (camArr.length > 0) {
        intervalRef = setInterval(() => {
            if (camIndex < camArr.length - 1) {
                native.setCamActiveWithInterp(camArr[camIndex + 1], camArr[camIndex], 3500, 1, 1)
                native.renderScriptCams(true, true, 1500, false, false, 0)
                camIndex++;
            } else {
                clearInterval(intervalRef)
                native.stopRenderingScriptCamsUsingCatchUp(false, 0, 0, 0)
            }
        }, 3500)
    } else {
        alt.log(`Can't play cam without set cam`)
    }
    
}