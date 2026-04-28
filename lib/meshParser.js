/**
 * Roblox .mesh binary/text parser
 *
 * Supported versions:
 *   v1.00  — text format (triangles on a single line)
 *   v2.00  — binary, 36-byte vertex (pos + norm + uv3)
 *   v3.xx  — binary, variable vertex size (pos + norm + uv + tangent)
 *   v4.xx  — binary, 40-byte vertex (pos + norm + uv + tangent + color)
 *   v5.xx  — same layout as v4
 *
 * Returns { vertices: Float32Array, normals: Float32Array, uvs: Float32Array, indices: Uint32Array }
 */

export function parseRobloxMesh(buf) {
  // Find the newline that ends the version header
  let headerEnd = -1;
  for (let i = 0; i < Math.min(buf.length, 50); i++) {
    if (buf[i] === 0x0a) {
      headerEnd = i;
      break;
    }
  }
  if (headerEnd < 0) throw new Error("Invalid mesh: no header newline");

  const header = buf.slice(0, headerEnd).toString("ascii").replace(/\r$/, "");
  const versionMatch = header.match(/version (\d+)\.(\d+)/);
  if (!versionMatch) throw new Error(`Invalid mesh header: ${header}`);

  const major = parseInt(versionMatch[1], 10);
  const minor = parseInt(versionMatch[2], 10);

  if (major === 1) {
    return parseV1(buf.toString("ascii"));
  }
  if (major === 2) {
    return parseV2(buf, headerEnd + 1);
  }
  // v3, v4, v5 share the same general layout
  return parseV3Plus(buf, headerEnd + 1, major, minor);
}

// ────────────────────────────────────────────────────────────
// Version 1.00 — text-based, non-indexed triangles
// Format: "version 1.00\n<numTriangles>\n[px,py,pz][nx,ny,nz][tu,tv,tw]..."
// ────────────────────────────────────────────────────────────
function parseV1(text) {
  const lines = text.split(/\r?\n/);
  const numTriangles = parseInt(lines[1], 10);
  if (isNaN(numTriangles) || numTriangles <= 0) {
    throw new Error(`Invalid v1 mesh: bad triangle count "${lines[1]}"`);
  }

  // All triangle data is on line 2 (or spread across remaining lines)
  const dataStr = lines.slice(2).join("");
  const groups = dataStr.match(/\[([^\]]+)\]/g);
  if (!groups) throw new Error("Invalid v1 mesh: no vertex data");

  // Each triangle has 3 vertices, each vertex has 3 groups: [pos][norm][uv]
  const numVerts = numTriangles * 3;
  const vertices = new Float32Array(numVerts * 3);
  const normals = new Float32Array(numVerts * 3);
  const uvs = new Float32Array(numVerts * 2);
  const indices = new Uint32Array(numVerts); // sequential 0,1,2,3,...

  for (let v = 0; v < numVerts; v++) {
    const gi = v * 3; // 3 groups per vertex
    const pos = groups[gi].slice(1, -1).split(",").map(Number);
    const nrm = groups[gi + 1].slice(1, -1).split(",").map(Number);
    const uv = groups[gi + 2].slice(1, -1).split(",").map(Number);

    vertices[v * 3] = pos[0];
    vertices[v * 3 + 1] = pos[1];
    vertices[v * 3 + 2] = pos[2];
    normals[v * 3] = nrm[0];
    normals[v * 3 + 1] = nrm[1];
    normals[v * 3 + 2] = nrm[2];
    uvs[v * 2] = uv[0];
    uvs[v * 2 + 1] = 1 - uv[1]; // flip V
    indices[v] = v;
  }

  return { vertices, normals, uvs, indices };
}

// ────────────────────────────────────────────────────────────
// Version 2.00 — binary, fixed-size header + 36-byte vertices
// Header: u32 sizeof_MeshHeader, u32 sizeof_Vertex, u32 sizeof_Face
//         u32 numVerts, u32 numFaces
// Vertex (36 bytes): float px,py,pz, float nx,ny,nz, float tu,tv,tw
// Face (12 bytes): u32 a, u32 b, u32 c
// ────────────────────────────────────────────────────────────
function parseV2(buf, offset) {
  const sizeHeader = buf.readUInt32LE(offset); offset += 4;
  const sizeVertex = buf.readUInt32LE(offset); offset += 4;
  const sizeFace = buf.readUInt32LE(offset); offset += 4;
  const numVerts = buf.readUInt32LE(offset); offset += 4;
  const numFaces = buf.readUInt32LE(offset); offset += 4;

  const vertices = new Float32Array(numVerts * 3);
  const normals = new Float32Array(numVerts * 3);
  const uvs = new Float32Array(numVerts * 2);

  for (let i = 0; i < numVerts; i++) {
    const base = offset + i * sizeVertex;
    vertices[i * 3] = buf.readFloatLE(base);
    vertices[i * 3 + 1] = buf.readFloatLE(base + 4);
    vertices[i * 3 + 2] = buf.readFloatLE(base + 8);
    normals[i * 3] = buf.readFloatLE(base + 12);
    normals[i * 3 + 1] = buf.readFloatLE(base + 16);
    normals[i * 3 + 2] = buf.readFloatLE(base + 20);
    uvs[i * 2] = buf.readFloatLE(base + 24);
    uvs[i * 2 + 1] = 1 - buf.readFloatLE(base + 28); // flip V
  }

  offset += numVerts * sizeVertex;

  const indices = new Uint32Array(numFaces * 3);
  for (let i = 0; i < numFaces; i++) {
    const base = offset + i * sizeFace;
    indices[i * 3] = buf.readUInt32LE(base);
    indices[i * 3 + 1] = buf.readUInt32LE(base + 4);
    indices[i * 3 + 2] = buf.readUInt32LE(base + 8);
  }

  return { vertices, normals, uvs, indices };
}

// ────────────────────────────────────────────────────────────
// Version 3.xx / 4.xx / 5.xx — binary with extended header
//
// MeshHeader (sizeof_header bytes, starting right after newline):
//   u16 sizeof_header
//   u16 lodType
//   u32 numVerts
//   u32 numFaces
//   u32 numLODs
//   u32 numBones
//   ... (remaining bytes to fill sizeof_header)
//
// Vertex data (numVerts * sizeof_vertex):
//   float32 px,py,pz  (12)
//   float32 nx,ny,nz  (12)
//   float32 tu,tv      (8)
//   [byte[4] tangent]  (if sizeof_vertex >= 36)
//   [byte[4] color]    (if sizeof_vertex >= 40)
//
// Face data (numFaces * 12):
//   u32 a, b, c
//
// LOD data at end (numLODs * 4)
// ────────────────────────────────────────────────────────────
function parseV3Plus(buf, offset, major) {
  const headerStart = offset;
  const sizeofHeader = buf.readUInt16LE(offset); offset += 2;
  /* lodType */ buf.readUInt16LE(offset); offset += 2;
  const numVerts = buf.readUInt32LE(offset); offset += 4;
  const numFaces = buf.readUInt32LE(offset); offset += 4;
  /* numLODs */ buf.readUInt32LE(offset); offset += 4;
  /* numBones */ buf.readUInt32LE(offset); offset += 4;

  // Jump to end of header — vertex data starts immediately after
  const vertexStart = headerStart + sizeofHeader;

  // Determine sizeof_vertex from the remaining data
  // remaining = numVerts * sizeof_vertex + numFaces * 12 + LOD data
  // We'll derive sizeof_vertex; LOD data is at most a few hundred bytes
  const dataAfterHeader = buf.length - vertexStart;
  const faceBytes = numFaces * 12;
  // sizeof_vertex is 36 (v3 without color) or 40 (v4/v5 with tangent + color)
  // Try 40 first (most common for v4+), then 36
  let sizeofVertex;
  const try40 = (dataAfterHeader - faceBytes) / numVerts;
  if (Math.abs(try40 - 40) < 1) {
    sizeofVertex = 40;
  } else if (Math.abs(try40 - 36) < 1) {
    sizeofVertex = 36;
  } else {
    // Fallback: round to nearest plausible value
    sizeofVertex = Math.round(try40);
    if (sizeofVertex < 32) {
      throw new Error(`Unsupported vertex size: ${try40.toFixed(2)} for v${major}`);
    }
  }

  const vertices = new Float32Array(numVerts * 3);
  const normals = new Float32Array(numVerts * 3);
  const uvs = new Float32Array(numVerts * 2);

  for (let i = 0; i < numVerts; i++) {
    const base = vertexStart + i * sizeofVertex;
    vertices[i * 3] = buf.readFloatLE(base);
    vertices[i * 3 + 1] = buf.readFloatLE(base + 4);
    vertices[i * 3 + 2] = buf.readFloatLE(base + 8);
    normals[i * 3] = buf.readFloatLE(base + 12);
    normals[i * 3 + 1] = buf.readFloatLE(base + 16);
    normals[i * 3 + 2] = buf.readFloatLE(base + 20);
    uvs[i * 2] = buf.readFloatLE(base + 24);
    uvs[i * 2 + 1] = 1 - buf.readFloatLE(base + 28); // flip V
  }

  const faceStart = vertexStart + numVerts * sizeofVertex;
  const indices = new Uint32Array(numFaces * 3);
  for (let i = 0; i < numFaces; i++) {
    const base = faceStart + i * 12;
    indices[i * 3] = buf.readUInt32LE(base);
    indices[i * 3 + 1] = buf.readUInt32LE(base + 4);
    indices[i * 3 + 2] = buf.readUInt32LE(base + 8);
  }

  return { vertices, normals, uvs, indices };
}
