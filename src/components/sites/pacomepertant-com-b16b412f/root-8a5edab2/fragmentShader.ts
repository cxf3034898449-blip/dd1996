export const fragmentShader = `uniform sampler2D uTexture;
uniform float uColorStrength;
uniform float uZoom;
uniform vec2 uPlaneSizes;
uniform vec2 uImageSizes;
uniform float uRevealProgress;

varying vec2 vUv;

float roundedRectSDF(vec2 uv, vec2 size, float radius) {
  vec2 d = abs(uv - 0.5) - size * 0.5 + radius;
  return length(max(d, 0.0)) - radius;
}

void main() {

  vec2 ratio = vec2(
    min((uPlaneSizes.x / uPlaneSizes.y) / (uImageSizes.x / uImageSizes.y), 1.0),
    min((uPlaneSizes.y / uPlaneSizes.x) / (uImageSizes.y / uImageSizes.x), 1.0)
  );

  vec2 uv = vec2(
    vUv.x * ratio.x + (1.0 - ratio.x) * 0.5,
    vUv.y * ratio.y + (1.0 - ratio.y) * 0.5
  );


  vec2 zoomedUv = (uv - 0.5) / uZoom + 0.5;

  vec4 color;

  if (gl_FrontFacing) {
    color = texture2D(uTexture, zoomedUv);
    color = mix(color, vec4(0.0, 0.0, 0.0, 1.0), uColorStrength);
  } else {
    float offset = 40.0 / 1024.0;
    vec4 c = vec4(0.0);

    c += texture2D(uTexture, uv + vec2(-offset, -offset)) * 1.0;
    c += texture2D(uTexture, uv + vec2( 0.0,    -offset)) * 2.0;
    c += texture2D(uTexture, uv + vec2( offset, -offset)) * 1.0;
    c += texture2D(uTexture, uv + vec2(-offset,  0.0))   * 2.0;
    c += texture2D(uTexture, uv)                         * 4.0;
    c += texture2D(uTexture, uv + vec2( offset,  0.0))   * 2.0;
    c += texture2D(uTexture, uv + vec2(-offset,  offset)) * 1.0;
    c += texture2D(uTexture, uv + vec2( 0.0,     offset)) * 2.0;
    c += texture2D(uTexture, uv + vec2( offset,  offset)) * 1.0;
    c /= 16.0;

    color = c;
  }

  float reveal = clamp(uRevealProgress, 0.0, 1.0);

  // Scale fictif via alpha
  vec2 revealSize = vec2(reveal);

  // Border radius suit le reveal
  float baseRadius = 0.05;
  float radius = baseRadius * reveal;

  // Signed Distance Field
  float sdf = roundedRectSDF(vUv, revealSize, radius);

  // Soft edge
  float edge = 0.002;
  float alpha = 1.0 - smoothstep(0.0, edge, sdf);
  alpha *= smoothstep(0.1, 1.0, uRevealProgress);

  // Final color
  gl_FragColor = vec4(color.rgb, color.a * alpha);

  gl_FragColor = vec4(color.rgb, alpha);
}
`;
