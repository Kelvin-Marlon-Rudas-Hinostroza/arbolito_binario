// ==========================================
// ÁRBOL BINARIO DE BÚSQUEDA — WEKA STYLE
// ==========================================

class Node {
  constructor(value) {
    this.value = value;
    this.left = null;
    this.right = null;
  }
}

class BST {
  constructor() {
    this.root = null;
  }

  insert(value) {
    if (this.root === null) {
      this.root = new Node(value);
      return "root";
    }

    let current = this.root;
    while (true) {
      if (value === current.value) return "duplicate";

      if (value < current.value) {
        if (current.left === null) {
          current.left = new Node(value);
          return "left";
        }
        current = current.left;
      } else {
        if (current.right === null) {
          current.right = new Node(value);
          return "right";
        }
        current = current.right;
      }
    }
  }

  search(value) {
    let current = this.root;
    let steps = 0;
    const path = [];

    while (current) {
      steps++;
      path.push(current.value);

      if (value === current.value) {
        return { found: true, steps, path };
      }

      current = value < current.value ? current.left : current.right;
    }

    return { found: false, steps, path };
  }

  preOrder(node = this.root, result = []) {
    if (!node) return result;
    result.push(node.value);
    this.preOrder(node.left, result);
    this.preOrder(node.right, result);
    return result;
  }

  inOrder(node = this.root, result = [], counter = { steps: 0 }) {
    if (!node) return { values: result, steps: counter.steps };
    this.inOrder(node.left, result, counter);
    counter.steps++;
    result.push(node.value);
    this.inOrder(node.right, result, counter);
    return { values: result, steps: counter.steps };
  }

  postOrder(node = this.root, result = []) {
    if (!node) return result;
    this.postOrder(node.left, result);
    this.postOrder(node.right, result);
    result.push(node.value);
    return result;
  }

  inOrderDesc(node = this.root, result = [], counter = { steps: 0 }) {
    if (!node) return { values: result, steps: counter.steps };
    this.inOrderDesc(node.right, result, counter);
    counter.steps++;
    result.push(node.value);
    this.inOrderDesc(node.left, result, counter);
    return { values: result, steps: counter.steps };
  }

  count(node = this.root) {
    if (!node) return 0;
    return 1 + this.count(node.left) + this.count(node.right);
  }
}

let tree = new BST();
let insertHistory = [];
let highlightedValue = null;
let searchPath = [];

function $(id) {
  return document.getElementById(id);
}

function sanitizeNumber(inputId) {
  const input = $(inputId);
  const value = parseInt(input.value, 10);
  return Number.isNaN(value) ? null : value;
}

function addLog(message, type = "log-info") {
  const log = $("log");
  const item = document.createElement("div");
  item.className = type;
  item.textContent = "➜ " + message;
  log.appendChild(item);
  log.scrollTop = log.scrollHeight;
}

function setRoot() {
  if (tree.root) {
    addLog("La raíz ya existe.", "log-error");
    return;
  }

  const value = sanitizeNumber("rootInput");
  if (value === null) {
    addLog("Ingrese un número válido para la raíz.", "log-error");
    return;
  }

  tree.insert(value);
  insertHistory.push({ value, position: 1, type: "root" });
  $("rootInput").value = "";
  highlightedValue = value;
  addLog(`Raíz creada: ${value}`, "log-insert");
  updateAll();
}

function insertNode() {
  if (!tree.root) {
    addLog("Primero cree la raíz.", "log-error");
    return;
  }

  const value = sanitizeNumber("nodeInput");
  if (value === null) {
    addLog("Número inválido.", "log-error");
    return;
  }

  const result = tree.insert(value);
  if (result === "duplicate") {
    addLog(`El nodo ${value} ya existe.`, "log-error");
    return;
  }

  insertHistory.push({
    value,
    position: insertHistory.length + 1,
    type: result
  });

  $("nodeInput").value = "";
  highlightedValue = value;
  searchPath = [];
  $("searchResult").className = "search-box";
  $("searchResult").innerHTML = "";
  addLog(`Nodo ${value} insertado (${result}).`, "log-insert");
  updateAll();
}

function searchNode() {
  if (!tree.root) {
    addLog("El árbol está vacío.", "log-error");
    return;
  }

  const value = sanitizeNumber("searchInput");
  if (value === null) {
    addLog("Ingrese un valor válido.", "log-error");
    return;
  }

  const result = tree.search(value);
  searchPath = result.path;
  highlightedValue = value;

  const box = $("searchResult");

  if (result.found) {
    box.className = "search-box found";
    box.innerHTML = `
      ✔ Nodo encontrado<br>
      Pasos: ${result.steps}<br>
      Ruta: ${result.path.join(" → ")}
    `;
    addLog(`Nodo ${value} encontrado en ${result.steps} pasos.`, "log-search");
  } else {
    box.className = "search-box notfound";
    box.innerHTML = `
      ✖ Nodo no encontrado<br>
      Pasos realizados: ${result.steps}<br>
      Ruta: ${result.path.join(" → ")}
    `;
    addLog(`Nodo ${value} no encontrado.`, "log-error");
  }

  $("stepsSearch").textContent = result.steps;
  updateTreeRender();
}

function updateAll() {
  updateTraversals();
  updateNodeList();
  updateStats();
  updateWekaTable();
  updateTreeRender();
}

function updateTraversals() {
  if (!tree.root) {
    $("rPreorden").textContent = "—";
    $("rInorden").textContent = "—";
    $("rPostorden").textContent = "—";
    $("rInordenDesc").textContent = "—";
    $("stepsAsc").textContent = "0";
    $("stepsDesc").textContent = "0";
    return;
  }

  const pre = tree.preOrder();
  const inorder = tree.inOrder();
  const post = tree.postOrder();
  const desc = tree.inOrderDesc();

  $("rPreorden").textContent = pre.join(" → ");
  $("rInorden").textContent = inorder.values.join(" → ");
  $("rPostorden").textContent = post.join(" → ");
  $("rInordenDesc").textContent = desc.values.join(" → ");
  $("stepsAsc").textContent = inorder.steps;
  $("stepsDesc").textContent = desc.steps;
}

function updateNodeList() {
  const container = $("nodeList");

  if (insertHistory.length === 0) {
    container.innerHTML = `<span class="empty">Sin nodos aún...</span>`;
    return;
  }

  container.innerHTML = insertHistory.map(node => {
    const cls =
      node.type === "root" ? "chip-root" :
      node.type === "left" ? "chip-left" : "chip-right";

    return `<span class="node-chip ${cls}">${node.value}</span>`;
  }).join("");
}

function updateStats() {
  $("totalNodes").textContent = tree.count();
}

function updateWekaTable() {
  const body = $("wekaBody");

  if (insertHistory.length === 0) {
    body.innerHTML = `
      <tr>
        <td colspan="4" class="empty-table">Sin datos aún</td>
      </tr>
    `;
    return;
  }

  body.innerHTML = insertHistory.map((node, index) => `
    <tr>
      <td>${index + 1}</td>
      <td>${node.value}</td>
      <td>${node.position}</td>
      <td>${node.type}</td>
    </tr>
  `).join("");
}

function resetTree() {
  tree = new BST();
  insertHistory = [];
  highlightedValue = null;
  searchPath = [];

  $("rPreorden").textContent = "—";
  $("rInorden").textContent = "—";
  $("rPostorden").textContent = "—";
  $("rInordenDesc").textContent = "—";
  $("stepsAsc").textContent = "0";
  $("stepsDesc").textContent = "0";
  $("stepsSearch").textContent = "0";
  $("totalNodes").textContent = "0";

  $("searchResult").className = "search-box";
  $("searchResult").innerHTML = "";
  $("log").innerHTML = `<div class="log-info">Sistema reiniciado...</div>`;
  $("nodeList").innerHTML = `<span class="empty">Sin nodos aún...</span>`;
  $("wekaBody").innerHTML = `
    <tr>
      <td colspan="4" class="empty-table">Sin datos aún</td>
    </tr>
  `;

  updateTreeRender();
}

const canvas = $("treeCanvas");
const ctx = canvas.getContext("2d");
let positions = new Map();

function resizeCanvas() {
  const ratio = window.devicePixelRatio || 1;
  const rect = canvas.getBoundingClientRect();

  canvas.width = rect.width * ratio;
  canvas.height = rect.height * ratio;
  ctx.setTransform(ratio, 0, 0, ratio, 0, 0);

  updateTreeRender();
}

window.addEventListener("resize", resizeCanvas);

function buildPositions(node, x, y, gap, depth = 0, posMap = new Map()) {
  if (!node) return posMap;

  posMap.set(node.value, { x, y, depth });

  const nextGap = Math.max(gap * 0.55, 38);
  const nextY = y + 92;

  buildPositions(node.left, x - gap, nextY, nextGap, depth + 1, posMap);
  buildPositions(node.right, x + gap, nextY, nextGap, depth + 1, posMap);

  return posMap;
}

function drawConnections(node) {
  if (!node) return;

  const current = positions.get(node.value);
  if (!current) return;

  if (node.left) {
    const left = positions.get(node.left.value);
    if (left) {
      ctx.beginPath();
      ctx.moveTo(current.x, current.y);
      ctx.lineTo(left.x, left.y);
      ctx.strokeStyle = "rgba(255,255,255,.18)";
      ctx.lineWidth = 2.6;
      ctx.stroke();
    }
    drawConnections(node.left);
  }

  if (node.right) {
    const right = positions.get(node.right.value);
    if (right) {
      ctx.beginPath();
      ctx.moveTo(current.x, current.y);
      ctx.lineTo(right.x, right.y);
      ctx.strokeStyle = "rgba(255,255,255,.18)";
      ctx.lineWidth = 2.6;
      ctx.stroke();
    }
    drawConnections(node.right);
  }
}

function getNodeColor(node) {
  if (node.value === tree.root?.value) return "#7c6cff";
  if (searchPath.includes(node.value)) return "#ffd166";
  if (node.value < tree.root.value) return "#57e6a0";
  return "#ff6f86";
}

function drawNodes(node) {
  if (!node) return;

  const pos = positions.get(node.value);
  if (!pos) return;

  const color = getNodeColor(node);
  const isHighlighted = node.value === highlightedValue;

  ctx.beginPath();
  ctx.arc(pos.x, pos.y, isHighlighted ? 36 : 33, 0, Math.PI * 2);
  ctx.fillStyle = `${color}25`;
  ctx.fill();

  ctx.beginPath();
  ctx.arc(pos.x, pos.y, 27, 0, Math.PI * 2);
  ctx.fillStyle = color;
  ctx.fill();

  ctx.beginPath();
  ctx.arc(pos.x, pos.y, 27, 0, Math.PI * 2);
  ctx.strokeStyle = "rgba(255,255,255,.12)";
  ctx.lineWidth = 2;
  ctx.stroke();

  ctx.fillStyle = "#fff";
  ctx.font = "700 16px Inter";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(node.value, pos.x, pos.y);

  drawNodes(node.left);
  drawNodes(node.right);
}

function updateTreeRender() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  if (!tree.root) return;

  const rect = canvas.getBoundingClientRect();
  const startX = rect.width / 2;
  const startY = 86;
  const startGap = Math.max(rect.width * 0.22, 180);

  positions = buildPositions(tree.root, startX, startY, startGap);
  drawConnections(tree.root);
  drawNodes(tree.root);
}

addLog("Sistema de Árbol Binario iniciado.", "log-info");
resizeCanvas();
updateAll();