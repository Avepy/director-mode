import * as alt from 'alt-client';
import { IVector3 } from 'alt-client';

export function camForward(cRot: alt.Vector3): IVector3 {
    let rotRad = {
        x: cRot.x * (Math.PI / 180),
        y: cRot.y * (Math.PI / 180),
        z: cRot.z * (Math.PI / 180) + Math.PI / 2,
    }

    return {
        x: Math.cos(rotRad.z),
        y: Math.sin(rotRad.z),
        z: Math.sin(rotRad.x),
    };
}

export function camRight(cRot: alt.Vector3): IVector3 {
    let rotRad = {
        x: cRot.x * (Math.PI / 180),
        y: cRot.y * (Math.PI / 180),
        z: cRot.z * (Math.PI / 180),
    }

    return {
        x: Math.cos(rotRad.z),
        y: Math.sin(rotRad.z),
        z: Math.sin(rotRad.x),
    };
}

export function isVectorEqual(vector1: alt.Vector3, vector2: alt.Vector3): boolean {
    return (
        vector1.x === vector2.x &&
        vector1.y === vector2.y &&
        vector1.z === vector2.z
    );
}