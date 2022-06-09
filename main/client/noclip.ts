import * as alt from 'alt-client'
import * as native from 'natives'
let bNoClip: boolean = false
let bB_KeyDown: boolean = false, bO_KeyDown: boolean = false

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
    if (alt.isKeyDown('H'.charCodeAt(0)))
        alt.log('pressed H')
    // key O ((playing with cam))
    if (alt.isKeyDown('O'.charCodeAt(0)))
        alt.log('pressed O')
}

function NoClip() {
    alt.log('im in noclip')
    if(bNoClip === false) {
        bNoClip = true
        native.freezeEntityPosition(alt.Player.local.scriptID, true)
        ExecNoClip()
    } else if (bNoClip === true) {
        bNoClip = false
        native.freezeEntityPosition(alt.Player.local.scriptID, false)
    }
}

function ExecNoClip() {
    alt.log('im in execnoclip')
    alt.everyTick(PingNoclip)
}

function PingNoclip() {
    let currentPos = alt.Player.local.pos
    let speed = 3
    let rot = native.getGameplayCamRot(2)
    let fwd  = CamForward(rot)
    let rght = CamRight(rot)
    let zMod: number = 0
    
    if (alt.isKeyDown('SHIFT'.charCodeAt(0)))
        speed = speed * 5
    if (alt.isKeyDown('W'.charCodeAt(0)))
        currentPos = ChangePos(currentPos, fwd, speed)
    if (alt.isKeyDown('S'.charCodeAt(0)))
        currentPos = ChangePos(currentPos, fwd, -speed )
    if (alt.isKeyDown('A'.charCodeAt(0)))
        currentPos = ChangePos(currentPos, rght, -speed, true)
    if (alt.isKeyDown('D'.charCodeAt(0)))
        currentPos = ChangePos(currentPos, rght, speed, true)
    if (alt.isKeyDown('UpArr'.charCodeAt(0)))
        zMod += speed
    if (alt.isKeyDown('DownArr'.charCodeAt(0)))
        zMod -= speed

    if (!isVEq(new alt.Vector3(currentPos.x, currentPos.y, currentPos.z + zMod), alt.Player.local.pos))   
        alt.emitServer("noclip:set", currentPos.x, currentPos.y, currentPos.z + zMod)
}

function ChangePos(vector1, vector2, speed:number, lr = false) {
    return new alt.Vector3(
        vector1.x + vector2.x * speed,
        vector1.y + vector2.y * speed,
        lr === true ? vector1.z : vector1.z + vector2.z * speed
    )
}

function CamForward(cRot) {
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

    return cDir
}

function CamRight(cRot) {
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

    return cDir
}

function isVEq(v1, v2) {
    return (
        v1.x === v2.x &&
        v1.y === v2.y &&
        v1.z === v2.z
    )
}