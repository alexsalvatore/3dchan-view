import {
    Vector3,
  } from "babylonjs";

  /**
   * 
   * @param {*} rotatingObject 
   * @param {*} pointToRotateTo 
   */
export function facePoint(rotatingObject, pointToRotateTo) {
    if( !pointToRotateTo.subtract ) return;
    // a directional vector from one object to the other one
    var direction = pointToRotateTo.subtract(rotatingObject.position);
    
    var v1 = new Vector3(0,0,1);
    var v2 = direction;
    
    // caluculate the angel for the new direction
    var angle = Math.acos(Vector3.Dot(v1, v2.normalize()));
    if (direction.x < 0) angle = (angle) * -1;
    angle += Math.PI;
    rotatingObject.rotation.y = angle;
    
};

/**
 * 
 * @param {*} fileData File url or type
 */
export function getTypeFromFile(fileData){

    if(
        fileData.toLowerCase().indexOf('jpg') > -1 ||
        fileData.toLowerCase().indexOf('jpeg') > -1 ||
        fileData.toLowerCase().indexOf('png') > -1 ||
        fileData.toLowerCase().indexOf('webp') > -1 ||
        fileData.toLowerCase().indexOf('gif') > -1
    ){
       return 'image/';
        
    } else if ( fileData.toLowerCase().indexOf('mp3') > -1){
        return 'audio/';
    } else if ( fileData.toLowerCase().indexOf('mp4') > -1){
        return'video/';
    } else if (
        fileData.toLowerCase().indexOf('http://') > -1 ||
        fileData.toLowerCase().indexOf('https://') > -1){
        return'web/';
    } else if (
        fileData.toLowerCase().indexOf('.onion') > -1){
        return'onion/';
    }

    return '';
}

/**
 * 
 * @param {*} fileData File url or type
 */
export function getNameFromUrl(fileData){

    const type = getTypeFromFile(fileData);

    if( type === 'web/' || type === 'onion/' ) return fileData;

    const parsed = fileData.split('/');

    return parsed[parsed.length -1];
    
}