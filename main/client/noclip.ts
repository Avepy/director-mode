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

let somePing

function NoClip() {
    alt.log('im in noclip')
    if(bNoClip === false) {
        bNoClip = true
        native.freezeEntityPosition(alt.Player.local.scriptID, true)
        //ExecNoClip()
        somePing = alt.everyTick(PingNoClip)
    } else if (bNoClip === true) {
        alt.log('setting noclip to false')
        alt.clearEveryTick(somePing)
        bNoClip = false
        native.freezeEntityPosition(alt.Player.local.scriptID, false)
        alt.emitServer("noclip:disabled")
    }
}

function PingNoClip() {
    let currentPos = alt.Player.local.pos
    let speed = 3
    let rot = native.getGameplayCamRot(2)
    let forward  = CamForward(rot)
    let right = CamRight(rot)
    //alt.log('pinging noclip')
    
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

function ChangePos(vector1, vector2, speed:number, lr = false) {
    return new alt.Vector3(
        vector1.x + vector2.x * speed,
        vector1.y + vector2.y * speed,
        lr === true ? vector1.z : vector1.z + vector2.z * speed,
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