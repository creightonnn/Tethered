import { useEffect, useRef } from 'react'
import { prefersReducedMotion } from '../lib/reducedMotion'

const VERTEX_SRC = `#version 300 es
in vec2 aPosition;
void main() {
  gl_Position = vec4(aPosition, 0.0, 1.0);
}
`

const FRAGMENT_SRC = `#version 300 es
precision highp float;

uniform vec2 uResolution;
uniform float uTime;
out vec4 fragColor;

float hash(vec2 p) {
  p = fract(p * vec2(123.34, 456.21));
  p += dot(p, p + 45.32);
  return fract(p.x * p.y);
}

float noise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  float a = hash(i);
  float b = hash(i + vec2(1.0, 0.0));
  float c = hash(i + vec2(0.0, 1.0));
  float d = hash(i + vec2(1.0, 1.0));
  vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(a, b, u.x) + (c - a) * u.y * (1.0 - u.x) + (d - b) * u.x * u.y;
}

float fbm(vec2 p) {
  float value = 0.0;
  float amplitude = 0.5;
  for (int i = 0; i < 5; i++) {
    value += amplitude * noise(p);
    p *= 2.0;
    amplitude *= 0.5;
  }
  return value;
}

// Domain-warped cloud field (fbm-of-fbm-of-fbm), same structure as the
// user's shadcn/Tailwind reference component's clouds() function.
float clouds(vec2 p, float t) {
  vec2 q = vec2(fbm(p + t * 0.05), fbm(p + vec2(5.2, 1.3) + t * 0.03));
  vec2 r = vec2(
    fbm(p + 4.0 * q + vec2(1.7, 9.2) + t * 0.02),
    fbm(p + 4.0 * q + vec2(8.3, 2.8) - t * 0.015)
  );
  return fbm(p + 4.0 * r);
}

// One soft light streak with a distinct fan angle and a center offset spread
// evenly across the frame, so 11 of these read as 11 separate streaks rather
// than collapsing toward the same line.
float streak(vec2 uv, float i, float t) {
  float seed = i * 12.9898;
  float baseAngle = 0.4 + (i / 11.0 - 0.5) * 0.9;
  float angle = baseAngle + 0.06 * sin(t * 0.07 + seed);
  vec2 dir = vec2(cos(angle), sin(angle));
  vec2 perp = vec2(-dir.y, dir.x);
  vec2 p = uv - vec2(0.5);
  float along = dot(p, dir);
  float across = dot(p, perp);

  float jitter = (hash(vec2(seed, 3.1)) - 0.5) * 0.12;
  float center = (i / 10.0 - 0.5) * 1.1 + jitter;
  float drift = fract(seed * 0.61 + t * 0.05) - 0.5;
  center += drift * 0.15;

  float core = exp(-pow((across - center) * 5.5, 2.0) * 26.0);
  float fade = smoothstep(0.9, 0.1, abs(along));
  return core * fade;
}

void main() {
  vec2 uv = gl_FragCoord.xy / uResolution.xy;
  vec2 p = uv * vec2(uResolution.x / uResolution.y, 1.0) * 2.4;

  float c = clouds(p, uTime);
  // --ink-950 (#0e1712) -> --green-800 (#14432e), pine-green retint of the
  // reference's orange/brown cloud mix.
  vec3 bgLow = vec3(0.055, 0.090, 0.071);
  vec3 bgHigh = vec3(0.078, 0.263, 0.180);
  vec3 bg = mix(bgLow, bgHigh, c);

  // 11 streaks (not 12): leaves room for the plane to read as occupying
  // the missing streak's position.
  float streaks = 0.0;
  for (int i = 0; i < 11; i++) {
    streaks += streak(uv, float(i), uTime) * (0.55 + 0.45 * hash(vec2(float(i) * 7.31, 1.0)));
  }
  streaks = clamp(streaks, 0.0, 1.0);

  // White-hot core, cool (teal) falloff — amber is deliberately not used
  // here; it's reserved as a scarce UI accent per DESIGN.md.
  vec3 streakCool = vec3(0.65, 0.89, 0.92);
  vec3 streakColor = mix(streakCool, vec3(1.0), streaks);
  vec3 color = bg + streakColor * streaks * 0.9;

  fragColor = vec4(color, 1.0);
}
`

function compileShader(gl: WebGL2RenderingContext, type: number, source: string): WebGLShader {
  const shader = gl.createShader(type)
  if (!shader) throw new Error('Failed to create shader')
  gl.shaderSource(shader, source)
  gl.compileShader(shader)
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    const info = gl.getShaderInfoLog(shader)
    gl.deleteShader(shader)
    throw new Error(`Shader compile error: ${info}`)
  }
  return shader
}

export function ShaderSky() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const gl = canvas.getContext('webgl2')
    if (!gl) return

    const vertexShader = compileShader(gl, gl.VERTEX_SHADER, VERTEX_SRC)
    const fragmentShader = compileShader(gl, gl.FRAGMENT_SHADER, FRAGMENT_SRC)

    const program = gl.createProgram()
    if (!program) return
    gl.attachShader(program, vertexShader)
    gl.attachShader(program, fragmentShader)
    gl.linkProgram(program)
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      throw new Error(`Program link error: ${gl.getProgramInfoLog(program)}`)
    }

    const positionBuffer = gl.createBuffer()
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer)
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]),
      gl.STATIC_DRAW,
    )

    const aPosition = gl.getAttribLocation(program, 'aPosition')
    const uResolution = gl.getUniformLocation(program, 'uResolution')
    const uTime = gl.getUniformLocation(program, 'uTime')

    gl.useProgram(program)
    gl.enableVertexAttribArray(aPosition)
    gl.vertexAttribPointer(aPosition, 2, gl.FLOAT, false, 0, 0)

    const reduced = prefersReducedMotion()
    let rafId = 0
    let startTime = performance.now()
    let pausedAt = 0

    function draw(t: number) {
      gl!.uniform1f(uTime, t)
      gl!.drawArrays(gl!.TRIANGLE_STRIP, 0, 4)
    }

    function resize() {
      const dpr = Math.min(window.devicePixelRatio || 1, 1.5)
      const width = Math.round(canvas!.clientWidth * dpr)
      const height = Math.round(canvas!.clientHeight * dpr)
      if (canvas!.width !== width || canvas!.height !== height) {
        canvas!.width = width
        canvas!.height = height
      }
      gl!.viewport(0, 0, width, height)
      gl!.uniform2f(uResolution, width, height)
    }

    function render(now: number) {
      draw((now - startTime) / 1000)
      rafId = requestAnimationFrame(render)
    }

    resize()

    if (reduced) {
      draw(0)
    } else {
      rafId = requestAnimationFrame(render)
    }

    function handleResize() {
      resize()
      if (reduced) draw(0)
    }

    function handleVisibility() {
      if (reduced) return
      if (document.hidden) {
        cancelAnimationFrame(rafId)
        pausedAt = performance.now()
      } else {
        startTime += performance.now() - pausedAt
        rafId = requestAnimationFrame(render)
      }
    }

    window.addEventListener('resize', handleResize)
    document.addEventListener('visibilitychange', handleVisibility)

    return () => {
      cancelAnimationFrame(rafId)
      window.removeEventListener('resize', handleResize)
      document.removeEventListener('visibilitychange', handleVisibility)
      gl.deleteBuffer(positionBuffer)
      gl.deleteProgram(program)
      gl.deleteShader(vertexShader)
      gl.deleteShader(fragmentShader)
    }
  }, [])

  return <canvas className="mkt-hero__shader-sky" ref={canvasRef} aria-hidden="true" />
}
