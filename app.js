const DB_KEY = "libreria_el_estudiante_db_v1";
const SESSION_KEY = "libreria_el_estudiante_session";

const demoDB = {
  categorias: [
    { id: 1, nombre: "Útiles escolares" },
    { id: 2, nombre: "Papelería" },
    { id: 3, nombre: "Oficina" }
  ],
  marcas: [
    { id: 1, nombre: "Bic" },
    { id: 2, nombre: "Norma" },
    { id: 3, nombre: "Pelikan" }
  ],
  clientes: [
    { id: 1, nombre: "Cliente General", telefono: "N/A", direccion: "Jinotepe" }
  ],
  proveedores: [
    { id: 1, nombre: "Proveedor Central", telefono: "2222-0000", direccion: "Managua" }
  ],
  usuarios: [
    { id: 1, nombre: "Administrador Supremo", username: "admin", password: "1234", rol: "ADMIN" },
    { id: 2, nombre: "Empleado", username: "empleado", password: "1234", rol: "EMPLEADO" }
  ],
  productos: [
    { id: 1, nombre: "Cuaderno universitario", categoriaId: 1, marcaId: 2, precioVenta: 65, costo: 45, stock: 20 },
    { id: 2, nombre: "Lapicero azul", categoriaId: 1, marcaId: 1, precioVenta: 12, costo: 7, stock: 50 },
    { id: 3, nombre: "Papel bond carta", categoriaId: 2, marcaId: 3, precioVenta: 180, costo: 130, stock: 12 }
  ],
  compras: [],
  ventas: [],
  movimientos: [
    { id: 1, fecha: new Date().toISOString(), productoId: 1, tipo: "ENTRADA", cantidad: 20, referencia: "Stock inicial" },
    { id: 2, fecha: new Date().toISOString(), productoId: 2, tipo: "ENTRADA", cantidad: 50, referencia: "Stock inicial" },
    { id: 3, fecha: new Date().toISOString(), productoId: 3, tipo: "ENTRADA", cantidad: 12, referencia: "Stock inicial" }
  ]
};

function loadDB() {
  const raw = localStorage.getItem(DB_KEY);

  if (!raw) {
    const copia = JSON.parse(JSON.stringify(demoDB));
    localStorage.setItem(DB_KEY, JSON.stringify(copia));
    return copia;
  }

  return JSON.parse(raw);
}

function saveDB(data) {
  localStorage.setItem(DB_KEY, JSON.stringify(data));
}

function db() {
  return loadDB();
}

function money(n) {
  return "C$" + Number(n || 0).toFixed(2);
}

function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

function nextId(arr) {
  return arr.length ? Math.max(...arr.map(x => x.id)) + 1 : 1;
}

function getSession() {
  return JSON.parse(localStorage.getItem(SESSION_KEY) || "null");
}

function setSession(user) {
  localStorage.setItem(SESSION_KEY, JSON.stringify(user));
}

function isAdmin() {
  return getSession()?.rol === "ADMIN";
}

function init() {
  document.getElementById("loginForm").addEventListener("submit", login);
  document.getElementById("logoutBtn").addEventListener("click", logout);
  document.getElementById("resetDemoBtn").addEventListener("click", resetDemo);

  document.querySelectorAll(".nav-btn").forEach(btn => {
    btn.addEventListener("click", () => showSection(btn.dataset.section));
  });

  if (getSession()) {
    showApp();
  } else {
    showLogin();
  }
}

function login(e) {
  e.preventDefault();

  const data = db();
  const username = document.getElementById("loginUser").value.trim();
  const password = document.getElementById("loginPass").value.trim();

  const user = data.usuarios.find(u => u.username === username && u.password === password);

  if (!user) {
    alert("Usuario o contraseña incorrectos.");
    return;
  }

  setSession({
    id: user.id,
    nombre: user.nombre,
    username: user.username,
    rol: user.rol
  });

  showApp();
}

function logout() {
  localStorage.removeItem(SESSION_KEY);
  showLogin();
}

function showLogin() {
  document.getElementById("loginView").classList.remove("hidden");
  document.getElementById("appView").classList.add("hidden");
}

function showApp() {
  const session = getSession();

  document.getElementById("loginView").classList.add("hidden");
  document.getElementById("appView").classList.remove("hidden");
  document.getElementById("sessionInfo").textContent = `${session.nombre} | Rol: ${session.rol}`;

  document.querySelectorAll(".admin-only").forEach(el => {
    el.style.display = isAdmin() ? "" : "none";
  });

  renderAll();
}

function showSection(id) {
  document.querySelectorAll(".section").forEach(section => {
    section.classList.remove("active");
  });

  document.getElementById(id).classList.add("active");

  document.querySelectorAll(".nav-btn").forEach(btn => {
    btn.classList.remove("active");
  });

  const activeButton = document.querySelector(`.nav-btn[data-section="${id}"]`);
  if (activeButton) activeButton.classList.add("active");

  renderAll();
}

function resetDemo() {
  if (!confirm("Esto eliminará los datos actuales y cargará datos demo. ¿Continuar?")) return;

  const copia = JSON.parse(JSON.stringify(demoDB));
  localStorage.setItem(DB_KEY, JSON.stringify(copia));
  renderAll();
}

function renderAll() {
  renderDashboard();
  renderProductos();
  renderSimple("categorias", "categoriasTable");
  renderSimple("marcas", "marcasTable");
  renderPersonas("clientes", "clientesTable");
  renderPersonas("proveedores", "proveedoresTable");
  renderCompras();
  renderVentas();
  renderInventario();
  renderUsuarios();
}

function table(headers, rows) {
  return `
    <div class="table-wrap">
      <table>
        <thead>
          <tr>${headers.map(h => `<th>${h}</th>`).join("")}</tr>
        </thead>
        <tbody>
          ${rows.join("") || `<tr><td colspan="${headers.length}">Sin registros.</td></tr>`}
        </tbody>
      </table>
    </div>
  `;
}

function renderDashboard() {
  const data = db();
  const hoy = todayISO();

  const ventasHoy = data.ventas
    .filter(v => v.fecha.slice(0, 10) === hoy)
    .reduce((acc, v) => acc + v.total, 0);

  const comprasHoy = data.compras
    .filter(c => c.fecha.slice(0, 10) === hoy)
    .reduce((acc, c) => acc + c.total, 0);

  const stockBajo = data.productos.filter(p => p.stock <= 10);

  document.getElementById("kpiVentasHoy").textContent = money(ventasHoy);
  document.getElementById("kpiComprasHoy").textContent = money(comprasHoy);
  document.getElementById("kpiClientes").textContent = data.clientes.length;
  document.getElementById("kpiStockBajo").textContent = stockBajo.length;

  const ventasRows = data.ventas.slice(-5).reverse().map(v => {
    const cliente = data.clientes.find(c => c.id === v.clienteId)?.nombre || "Cliente eliminado";

    return `
      <tr>
        <td>#${v.id}</td>
        <td>${cliente}</td>
        <td>${new Date(v.fecha).toLocaleDateString()}</td>
        <td>${money(v.total)}</td>
      </tr>
    `;
  });

  document.getElementById("ventasRecientes").innerHTML = table(
    ["Factura", "Cliente", "Fecha", "Total"],
    ventasRows
  );

  const stockRows = stockBajo.map(p => `
    <tr>
      <td>${p.nombre}</td>
      <td>${p.stock}</td>
      <td><span class="badge badge-low">Stock bajo</span></td>
    </tr>
  `);

  document.getElementById("stockBajoLista").innerHTML = table(
    ["Producto", "Stock", "Estado"],
    stockRows
  );
}

function renderProductos() {
  const data = db();

  const rows = data.productos.map(p => {
    const categoria = data.categorias.find(c => c.id === p.categoriaId)?.nombre || "N/A";
    const marca = data.marcas.find(m => m.id === p.marcaId)?.nombre || "N/A";

    const estado = p.stock <= 10
      ? `<span class="badge badge-low">Bajo</span>`
      : `<span class="badge badge-ok">OK</span>`;

    const actions = isAdmin()
      ? `
        <td class="actions">
          <button class="edit" onclick="openProductoModal(${p.id})">Editar</button>
          <button class="delete" onclick="deleteItem('productos', ${p.id})">Eliminar</button>
        </td>
      `
      : "";

    return `
      <tr>
        <td>${p.nombre}</td>
        <td>${categoria}</td>
        <td>${marca}</td>
        <td>${money(p.costo)}</td>
        <td>${money(p.precioVenta)}</td>
        <td>${p.stock}</td>
        <td>${estado}</td>
        ${actions}
      </tr>
    `;
  });

  const headers = ["Producto", "Categoría", "Marca", "Costo", "Precio venta", "Stock", "Estado"];
  if (isAdmin()) headers.push("Acciones");

  document.getElementById("productosTable").innerHTML = table(headers, rows);
}

function renderSimple(collection, target) {
  const data = db();

  const rows = data[collection].map(item => {
    const actions = isAdmin()
      ? `
        <td class="actions">
          <button class="edit" onclick="openSimpleModal('${collection}', '${collection}', ${item.id})">Editar</button>
          <button class="delete" onclick="deleteItem('${collection}', ${item.id})">Eliminar</button>
        </td>
      `
      : "";

    return `
      <tr>
        <td>${item.id}</td>
        <td>${item.nombre}</td>
        ${actions}
      </tr>
    `;
  });

  const headers = ["ID", "Nombre"];
  if (isAdmin()) headers.push("Acciones");

  document.getElementById(target).innerHTML = table(headers, rows);
}

function renderPersonas(collection, target) {
  const data = db();

  const rows = data[collection].map(item => {
    const actions = isAdmin()
      ? `
        <td class="actions">
          <button class="edit" onclick="openPersonaModal('${collection}', '${collection}', ${item.id})">Editar</button>
          <button class="delete" onclick="deleteItem('${collection}', ${item.id})">Eliminar</button>
        </td>
      `
      : "";

    return `
      <tr>
        <td>${item.id}</td>
        <td>${item.nombre}</td>
        <td>${item.telefono}</td>
        <td>${item.direccion}</td>
        ${actions}
      </tr>
    `;
  });

  const headers = ["ID", "Nombre", "Teléfono", "Dirección"];
  if (isAdmin()) headers.push("Acciones");

  document.getElementById(target).innerHTML = table(headers, rows);
}

function renderCompras() {
  const data = db();

  const rows = data.compras.map(c => {
    const proveedor = data.proveedores.find(p => p.id === c.proveedorId)?.nombre || "Proveedor eliminado";

    return `
      <tr>
        <td>#${c.id}</td>
        <td>${new Date(c.fecha).toLocaleDateString()}</td>
        <td>${proveedor}</td>
        <td>${c.detalles.length}</td>
        <td>${money(c.total)}</td>
        <td><button class="view" onclick="verDocumento('compras', ${c.id})">Ver</button></td>
      </tr>
    `;
  });

  document.getElementById("comprasTable").innerHTML = table(
    ["Compra", "Fecha", "Proveedor", "Productos", "Total", "Detalle"],
    rows
  );
}

function renderVentas() {
  const data = db();

  const rows = data.ventas.map(v => {
    const cliente = data.clientes.find(c => c.id === v.clienteId)?.nombre || "Cliente eliminado";

    return `
      <tr>
        <td>#${v.id}</td>
        <td>${new Date(v.fecha).toLocaleDateString()}</td>
        <td>${cliente}</td>
        <td>${v.detalles.length}</td>
        <td>${money(v.total)}</td>
        <td><button class="view" onclick="verDocumento('ventas', ${v.id})">Ver factura</button></td>
      </tr>
    `;
  });

  document.getElementById("ventasTable").innerHTML = table(
    ["Factura", "Fecha", "Cliente", "Productos", "Total", "Detalle"],
    rows
  );
}

function renderInventario() {
  const data = db();

  const rows = data.productos.map(p => {
    const estado = p.stock <= 10
      ? `<span class="badge badge-low">Stock bajo</span>`
      : `<span class="badge badge-ok">Disponible</span>`;

    return `
      <tr>
        <td>${p.id}</td>
        <td>${p.nombre}</td>
        <td>${p.stock}</td>
        <td>${money(p.precioVenta)}</td>
        <td>${estado}</td>
      </tr>
    `;
  });

  const movRows = data.movimientos.slice().reverse().map(m => {
    const producto = data.productos.find(p => p.id === m.productoId)?.nombre || "Producto eliminado";

    return `
      <tr>
        <td>${new Date(m.fecha).toLocaleString()}</td>
        <td>${producto}</td>
        <td>${m.tipo}</td>
        <td>${m.cantidad}</td>
        <td>${m.referencia}</td>
      </tr>
    `;
  });

  document.getElementById("inventarioTable").innerHTML = `
    <h2>Existencias actuales</h2>
    <br>
    ${table(["ID", "Producto", "Stock", "Precio", "Estado"], rows)}
    <br>
    <h2>Movimientos de inventario</h2>
    <br>
    ${table(["Fecha", "Producto", "Tipo", "Cantidad", "Referencia"], movRows)}
  `;
}

function renderUsuarios() {
  const data = db();

  const rows = data.usuarios.map(u => {
    const actions = isAdmin()
      ? `
        <td class="actions">
          <button class="edit" onclick="openUsuarioModal(${u.id})">Editar</button>
          <button class="delete" onclick="deleteItem('usuarios', ${u.id})">Eliminar</button>
        </td>
      `
      : "";

    return `
      <tr>
        <td>${u.id}</td>
        <td>${u.nombre}</td>
        <td>${u.username}</td>
        <td>${u.rol}</td>
        ${actions}
      </tr>
    `;
  });

  const headers = ["ID", "Nombre", "Usuario", "Rol"];
  if (isAdmin()) headers.push("Acciones");

  document.getElementById("usuariosTable").innerHTML = table(headers, rows);
}

function modal(html) {
  document.getElementById("modalRoot").innerHTML = `
    <div class="modal-backdrop">
      <div class="modal">${html}</div>
    </div>
  `;
}

function closeModal() {
  document.getElementById("modalRoot").innerHTML = "";
}

function options(arr, selected = null) {
  return arr.map(item => `
    <option value="${item.id}" ${Number(selected) === item.id ? "selected" : ""}>
      ${item.nombre}
    </option>
  `).join("");
}

function openSimpleModal(collection, label, id = null) {
  if (!isAdmin()) return alert("No tienes permiso.");

  const data = db();
  const item = id ? data[collection].find(x => x.id === id) : { nombre: "" };

  modal(`
    <h2>${id ? "Editar" : "Agregar"} ${label}</h2>
    <form onsubmit="saveSimple(event, '${collection}', ${id})">
      <label>Nombre</label>
      <input name="nombre" value="${item.nombre}" required>

      <div class="modal-actions">
        <button type="button" class="secondary" onclick="closeModal()">Cancelar</button>
        <button class="primary">Guardar</button>
      </div>
    </form>
  `);
}

function saveSimple(e, collection, id) {
  e.preventDefault();

  const data = db();
  const nombre = e.target.nombre.value.trim();

  if (id) {
    data[collection].find(x => x.id === id).nombre = nombre;
  } else {
    data[collection].push({
      id: nextId(data[collection]),
      nombre
    });
  }

  saveDB(data);
  closeModal();
  renderAll();
}

function openPersonaModal(collection, label, id = null) {
  if (!isAdmin()) return alert("No tienes permiso.");

  const data = db();
  const item = id
    ? data[collection].find(x => x.id === id)
    : { nombre: "", telefono: "", direccion: "" };

  modal(`
    <h2>${id ? "Editar" : "Agregar"} ${label}</h2>
    <form onsubmit="savePersona(event, '${collection}', ${id})" class="form-grid">
      <div>
        <label>Nombre</label>
        <input name="nombre" value="${item.nombre}" required>
      </div>

      <div>
        <label>Teléfono</label>
        <input name="telefono" value="${item.telefono}" required>
      </div>

      <div class="full">
        <label>Dirección</label>
        <input name="direccion" value="${item.direccion}" required>
      </div>

      <div class="modal-actions full">
        <button type="button" class="secondary" onclick="closeModal()">Cancelar</button>
        <button class="primary">Guardar</button>
      </div>
    </form>
  `);
}

function savePersona(e, collection, id) {
  e.preventDefault();

  const data = db();

  const item = {
    nombre: e.target.nombre.value.trim(),
    telefono: e.target.telefono.value.trim(),
    direccion: e.target.direccion.value.trim()
  };

  if (id) {
    Object.assign(data[collection].find(x => x.id === id), item);
  } else {
    data[collection].push({
      id: nextId(data[collection]),
      ...item
    });
  }

  saveDB(data);
  closeModal();
  renderAll();
}

function openProductoModal(id = null) {
  if (!isAdmin()) return alert("No tienes permiso.");

  const data = db();

  const producto = id
    ? data.productos.find(x => x.id === id)
    : { nombre: "", categoriaId: "", marcaId: "", costo: 0, precioVenta: 0, stock: 0 };

  modal(`
    <h2>${id ? "Editar" : "Agregar"} Producto</h2>

    <form onsubmit="saveProducto(event, ${id})" class="form-grid">
      <div class="full">
        <label>Nombre</label>
        <input name="nombre" value="${producto.nombre}" required>
      </div>

      <div>
        <label>Categoría</label>
        <select name="categoriaId" required>${options(data.categorias, producto.categoriaId)}</select>
      </div>

      <div>
        <label>Marca</label>
        <select name="marcaId" required>${options(data.marcas, producto.marcaId)}</select>
      </div>

      <div>
        <label>Costo</label>
        <input name="costo" type="number" min="0" step="0.01" value="${producto.costo}" required>
      </div>

      <div>
        <label>Precio venta</label>
        <input name="precioVenta" type="number" min="0" step="0.01" value="${producto.precioVenta}" required>
      </div>

      <div>
        <label>Stock inicial / actual</label>
        <input name="stock" type="number" min="0" value="${producto.stock}" required>
      </div>

      <div class="modal-actions full">
        <button type="button" class="secondary" onclick="closeModal()">Cancelar</button>
        <button class="primary">Guardar</button>
      </div>
    </form>
  `);
}

function saveProducto(e, id) {
  e.preventDefault();

  const data = db();

  const item = {
    nombre: e.target.nombre.value.trim(),
    categoriaId: Number(e.target.categoriaId.value),
    marcaId: Number(e.target.marcaId.value),
    costo: Number(e.target.costo.value),
    precioVenta: Number(e.target.precioVenta.value),
    stock: Number(e.target.stock.value)
  };

  if (id) {
    Object.assign(data.productos.find(x => x.id === id), item);
  } else {
    const newId = nextId(data.productos);

    data.productos.push({
      id: newId,
      ...item
    });

    if (item.stock > 0) {
      data.movimientos.push({
        id: nextId(data.movimientos),
        fecha: new Date().toISOString(),
        productoId: newId,
        tipo: "ENTRADA",
        cantidad: item.stock,
        referencia: "Stock inicial"
      });
    }
  }

  saveDB(data);
  closeModal();
  renderAll();
}

function openCompraModal() {
  if (!isAdmin()) return alert("No tienes permiso.");

  const data = db();

  modal(`
    <h2>Registrar compra</h2>

    <form onsubmit="saveCompra(event)">
      <label>Proveedor</label>
      <select name="proveedorId" required>${options(data.proveedores)}</select>

      <h3 style="margin-top:16px">Detalle de compra</h3>
      <div id="lineasCompra"></div>

      <button type="button" class="secondary" onclick="addCompraLinea()">Agregar producto</button>

      <div class="modal-actions">
        <button type="button" class="secondary" onclick="closeModal()">Cancelar</button>
        <button class="primary">Guardar compra</button>
      </div>
    </form>
  `);

  addCompraLinea();
}

function addCompraLinea() {
  const data = db();

  const div = document.createElement("div");
  div.className = "line-item";

  div.innerHTML = `
    <div>
      <label>Producto</label>
      <select name="productoId">${options(data.productos)}</select>
    </div>

    <div>
      <label>Cantidad</label>
      <input name="cantidad" type="number" min="1" value="1" required>
    </div>

    <div>
      <label>Costo unitario</label>
      <input name="precio" type="number" min="0" step="0.01" value="0" required>
    </div>

    <button type="button" class="danger" onclick="this.parentElement.remove()">X</button>
  `;

  document.getElementById("lineasCompra").appendChild(div);
}

function saveCompra(e) {
  e.preventDefault();

  const data = db();
  const proveedorId = Number(e.target.proveedorId.value);
  const lineas = [...document.querySelectorAll("#lineasCompra .line-item")];

  const detalles = lineas.map(linea => ({
    productoId: Number(linea.querySelector('[name="productoId"]').value),
    cantidad: Number(linea.querySelector('[name="cantidad"]').value),
    precio: Number(linea.querySelector('[name="precio"]').value)
  })).filter(d => d.cantidad > 0);

  if (!detalles.length) {
    alert("Agrega al menos un producto.");
    return;
  }

  let total = 0;
  const compraId = nextId(data.compras);

  detalles.forEach(detalle => {
    const producto = data.productos.find(p => p.id === detalle.productoId);

    producto.stock += detalle.cantidad;
    producto.costo = detalle.precio;

    total += detalle.cantidad * detalle.precio;

    data.movimientos.push({
      id: nextId(data.movimientos),
      fecha: new Date().toISOString(),
      productoId: detalle.productoId,
      tipo: "ENTRADA",
      cantidad: detalle.cantidad,
      referencia: `Compra #${compraId}`
    });
  });

  data.compras.push({
    id: compraId,
    fecha: new Date().toISOString(),
    proveedorId,
    detalles,
    total
  });

  saveDB(data);
  closeModal();
  renderAll();

  alert("Compra registrada. El inventario fue aumentado correctamente.");
}

function openVentaModal() {
  const data = db();

  modal(`
    <h2>Registrar venta</h2>

    <form onsubmit="saveVenta(event)">
      <label>Cliente</label>
      <select name="clienteId" required>${options(data.clientes)}</select>

      <h3 style="margin-top:16px">Detalle de venta</h3>
      <div id="lineasVenta"></div>

      <button type="button" class="secondary" onclick="addVentaLinea()">Agregar producto</button>

      <div class="modal-actions">
        <button type="button" class="secondary" onclick="closeModal()">Cancelar</button>
        <button class="primary">Guardar venta</button>
      </div>
    </form>
  `);

  addVentaLinea();
}

function addVentaLinea() {
  const data = db();

  const div = document.createElement("div");
  div.className = "line-item";

  div.innerHTML = `
    <div>
      <label>Producto</label>
      <select name="productoId">
        ${data.productos.map(p => `
          <option value="${p.id}">
            ${p.nombre} | Stock: ${p.stock} | ${money(p.precioVenta)}
          </option>
        `).join("")}
      </select>
    </div>

    <div>
      <label>Cantidad</label>
      <input name="cantidad" type="number" min="1" value="1" required>
    </div>

    <div>
      <label>Precio unitario</label>
      <input name="precio" type="number" min="0" step="0.01" value="0" required>
    </div>

    <button type="button" class="danger" onclick="this.parentElement.remove()">X</button>
  `;

  const select = div.querySelector('[name="productoId"]');
  const precio = div.querySelector('[name="precio"]');

  const setPrecio = () => {
    const producto = data.productos.find(p => p.id === Number(select.value));
    precio.value = producto?.precioVenta || 0;
  };

  select.addEventListener("change", setPrecio);
  setPrecio();

  document.getElementById("lineasVenta").appendChild(div);
}

function saveVenta(e) {
  e.preventDefault();

  const data = db();
  const clienteId = Number(e.target.clienteId.value);
  const lineas = [...document.querySelectorAll("#lineasVenta .line-item")];

  const detalles = lineas.map(linea => ({
    productoId: Number(linea.querySelector('[name="productoId"]').value),
    cantidad: Number(linea.querySelector('[name="cantidad"]').value),
    precio: Number(linea.querySelector('[name="precio"]').value)
  })).filter(d => d.cantidad > 0);

  if (!detalles.length) {
    alert("Agrega al menos un producto.");
    return;
  }

  const acumulado = {};

  detalles.forEach(detalle => {
    acumulado[detalle.productoId] = (acumulado[detalle.productoId] || 0) + detalle.cantidad;
  });

  for (const productoId in acumulado) {
    const producto = data.productos.find(p => p.id === Number(productoId));

    if (producto.stock < acumulado[productoId]) {
      alert(`Stock insuficiente para "${producto.nombre}". Stock actual: ${producto.stock}. Cantidad solicitada: ${acumulado[productoId]}.`);
      return;
    }
  }

  let total = 0;
  const ventaId = nextId(data.ventas);

  detalles.forEach(detalle => {
    const producto = data.productos.find(p => p.id === detalle.productoId);

    producto.stock -= detalle.cantidad;

    total += detalle.cantidad * detalle.precio;

    data.movimientos.push({
      id: nextId(data.movimientos),
      fecha: new Date().toISOString(),
      productoId: detalle.productoId,
      tipo: "SALIDA",
      cantidad: detalle.cantidad,
      referencia: `Venta #${ventaId}`
    });
  });

  data.ventas.push({
    id: ventaId,
    fecha: new Date().toISOString(),
    clienteId,
    detalles,
    total
  });

  saveDB(data);
  closeModal();
  renderAll();

  alert("Venta registrada. El inventario fue disminuido correctamente.");
}

function verDocumento(collection, id) {
  const data = db();
  const doc = data[collection].find(x => x.id === id);

  const tercero = collection === "ventas"
    ? data.clientes.find(c => c.id === doc.clienteId)?.nombre
    : data.proveedores.find(p => p.id === doc.proveedorId)?.nombre;

  const rows = doc.detalles.map(detalle => {
    const producto = data.productos.find(p => p.id === detalle.productoId)?.nombre || "Producto eliminado";

    return `
      <tr>
        <td>${producto}</td>
        <td>${detalle.cantidad}</td>
        <td>${money(detalle.precio)}</td>
        <td>${money(detalle.cantidad * detalle.precio)}</td>
      </tr>
    `;
  });

  modal(`
    <h2>${collection === "ventas" ? "Factura de venta" : "Comprobante de compra"} #${doc.id}</h2>

    <p><b>Fecha:</b> ${new Date(doc.fecha).toLocaleString()}</p>
    <p><b>${collection === "ventas" ? "Cliente" : "Proveedor"}:</b> ${tercero}</p>

    <br>

    ${table(["Producto", "Cantidad", "Precio", "Subtotal"], rows)}

    <h2 style="text-align:right;margin-top:16px">
      Total: ${money(doc.total)}
    </h2>

    <div class="modal-actions">
      <button class="secondary" onclick="closeModal()">Cerrar</button>
    </div>
  `);
}

function openUsuarioModal(id = null) {
  if (!isAdmin()) return alert("No tienes permiso.");

  const data = db();

  const usuario = id
    ? data.usuarios.find(x => x.id === id)
    : { nombre: "", username: "", password: "1234", rol: "EMPLEADO" };

  modal(`
    <h2>${id ? "Editar" : "Agregar"} Usuario</h2>

    <form onsubmit="saveUsuario(event, ${id})" class="form-grid">
      <div>
        <label>Nombre</label>
        <input name="nombre" value="${usuario.nombre}" required>
      </div>

      <div>
        <label>Usuario</label>
        <input name="username" value="${usuario.username}" required>
      </div>

      <div>
        <label>Contraseña</label>
        <input name="password" value="${usuario.password}" required>
      </div>

      <div>
        <label>Rol</label>
        <select name="rol">
          <option value="ADMIN" ${usuario.rol === "ADMIN" ? "selected" : ""}>ADMIN</option>
          <option value="EMPLEADO" ${usuario.rol === "EMPLEADO" ? "selected" : ""}>EMPLEADO</option>
        </select>
      </div>

      <div class="modal-actions full">
        <button type="button" class="secondary" onclick="closeModal()">Cancelar</button>
        <button class="primary">Guardar</button>
      </div>
    </form>
  `);
}

function saveUsuario(e, id) {
  e.preventDefault();

  const data = db();

  const item = {
    nombre: e.target.nombre.value.trim(),
    username: e.target.username.value.trim(),
    password: e.target.password.value.trim(),
    rol: e.target.rol.value
  };

  if (id) {
    Object.assign(data.usuarios.find(x => x.id === id), item);
  } else {
    data.usuarios.push({
      id: nextId(data.usuarios),
      ...item
    });
  }

  saveDB(data);
  closeModal();
  renderAll();
}

function deleteItem(collection, id) {
  if (!isAdmin()) return alert("No tienes permiso.");

  if (collection === "usuarios" && getSession()?.id === id) {
    alert("No puedes eliminar tu propio usuario activo.");
    return;
  }

  if (!confirm("¿Eliminar este registro?")) return;

  const data = db();

  data[collection] = data[collection].filter(x => x.id !== id);

  saveDB(data);
  renderAll();
}

init();