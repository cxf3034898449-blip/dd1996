export const vertexShader = `varying vec2 vUv;
varying vec3 vWorldPosition;
#define PI 3.14159265359

uniform float uScrollSpeed;

void main() {
  // gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  vec3 worldPosition = (modelMatrix * vec4(position, 1.0)).xyz;
  vec3 newPosition = position;
  newPosition.z = sin(uv.x * PI) * 0.2;

  // newPosition.x -= pow(worldPosition.y, 2.0) * 0.05;


  vec4 modelPosition = modelMatrix * vec4(newPosition, 1.0);
  vec4 viewPosition = viewMatrix * modelPosition;
  viewPosition.x += pow(worldPosition.y, 2.0) * 0.1;
  // viewPosition.x += uv.y * worldPosition.y * uScrollSpeed * 3.0;
  viewPosition.x += sin(uv.y * PI) * uScrollSpeed * 2.0;
  vec4 projectedPosition = projectionMatrix * viewPosition;
  // projectedPosition.x += pow(worldPosition.y, 3.0);
  gl_Position = projectedPosition;

  // VARYINGS
  vUv = uv;
}`;
