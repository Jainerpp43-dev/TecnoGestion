
// ==========================================
// TECNOGESTIÓN - SISTEMA DE GESTIÓN
// ==========================================

const $ = selector => document.querySelector(selector);

const datosIniciales = {
    equipos: [
        {id:1,codigo:"EQ-001",nombre:"Computador portátil",categoria:"Cómputo",marca:"Dell",ubicacion:"Sala de sistemas",estado:"Disponible"},
        {id:2,codigo:"EQ-002",nombre:"Video beam",categoria:"Proyección",marca:"Epson",ubicacion:"Aula 203",estado:"Prestado"},
        {id:3,codigo:"EQ-003",nombre:"Computador de escritorio",categoria:"Cómputo",marca:"HP",ubicacion:"Biblioteca",estado:"Disponible"},
        {id:4,codigo:"EQ-004",nombre:"Tableta",categoria:"Dispositivo móvil",marca:"Samsung",ubicacion:"Coordinación",estado:"Mantenimiento"},
        {id:5,codigo:"EQ-005",nombre:"Impresora",categoria:"Periférico",marca:"Epson",ubicacion:"Secretaría",estado:"Disponible"}
    ],
    prestamos: [
        {id:1,usuario:"Laura Martínez",equipo:"EQ-002 · Video beam",fecha:"2026-11-14",devolucion:"2026-11-20",estado:"Prestado"}
    ],
    usuarios: [
        {id:1,nombre:"Laura Martínez",documento:"1020304050",correo:"laura@institucion.edu.co",rol:"Docente"},
        {id:2,nombre:"Carlos Rodríguez",documento:"1098765432",correo:"carlos@institucion.edu.co",rol:"Docente"},
        {id:3,nombre:"Ana Gómez",documento:"1002345678",correo:"ana@institucion.edu.co",rol:"Administradora"}
    ],
    mantenimientos: [
        {id:1,equipo:"EQ-004 · Tableta",descripcion:"Revisión de pantalla",fecha:"2026-11-12",responsable:"Soporte técnico",estado:"En proceso"}
    ]
};

function cargarDatos() {
    try {
        return JSON.parse(localStorage.getItem("tecnogestion")) || structuredClone(datosIniciales);
    } catch {
        return structuredClone(datosIniciales);
    }
}

let datos = cargarDatos();
let paginaActual = "dashboard";
let usuarioActual = "Administrador";

function guardarDatos() {
    localStorage.setItem("tecnogestion", JSON.stringify(datos));
}

function notificar(mensaje) {
    const toast = $("#toast");
    toast.textContent = mensaje;
    toast.classList.add("show");

    setTimeout(() => {
        toast.classList.remove("show");
    }, 2500);
}

function estadoHTML(estado) {
    let clase = "";

    if (["Prestado","Mantenimiento","En proceso","Pendiente"].includes(estado)) {
        clase = "warning";
    }

    if (estado === "Inactivo" || estado === "Vencido") {
        clase = "danger";
    }

    return `<span class="status ${clase}">${estado}</span>`;
}

function encabezado(titulo, descripcion, boton = "") {
    return `
        <div class="page-heading">
            <div>
                <h1>${titulo}</h1>
                <p>${descripcion}</p>
            </div>
            <div class="heading-actions">${boton}</div>
        </div>
    `;
}

function tarjeta(titulo, cantidad, icono) {
    return `
        <div class="stat-card">
            <span>${titulo}</span>
            <i class="bi ${icono} stat-icon"></i>
            <strong>${cantidad}</strong>
        </div>
    `;
}

function tabla(titulos, filas) {
    return `
        <div class="panel">
            <div class="table-wrap">
                <table>
                    <thead>
                        <tr>${titulos.map(t => `<th>${t}</th>`).join("")}</tr>
                    </thead>
                    <tbody>
                        ${filas || `<tr><td colspan="${titulos.length}">No hay registros disponibles.</td></tr>`}
                    </tbody>
                </table>
            </div>
        </div>
    `;
}

// ==========================================
// NAVEGACIÓN
// ==========================================

function navegar(pagina) {
    paginaActual = pagina;

    document.querySelectorAll(".nav-link[data-page]").forEach(boton => {
        boton.classList.toggle("active", boton.dataset.page === pagina);
    });

    $("#sidebar").classList.remove("open");

    renderizar();
}

function renderizar() {
    const vistas = {
        dashboard: panelPrincipal,
        inventory: inventario,
        loans: prestamos,
        returns: devoluciones,
        users: usuarios,
        maintenance: mantenimientos,
        reports: reportes,
        about: acerca
    };

    $("#pageContent").innerHTML = vistas[paginaActual]();
}

// ==========================================
// PANEL PRINCIPAL
// ==========================================

function panelPrincipal() {
    const disponibles = datos.equipos.filter(e => e.estado === "Disponible").length;
    const prestados = datos.prestamos.filter(p => p.estado === "Prestado").length;
    const pendientes = datos.mantenimientos.filter(m => m.estado !== "Completado").length;

    const filas = datos.equipos.slice(-5).reverse().map(e => `
        <tr>
            <td><strong>${e.codigo}</strong></td>
            <td>${e.nombre}</td>
            <td>${e.categoria}</td>
            <td>${e.ubicacion}</td>
            <td>${estadoHTML(e.estado)}</td>
        </tr>
    `).join("");

    return `
        ${encabezado("Panel principal","Resumen general de los recursos tecnológicos.",
        '<button class="btn primary" data-action="nuevo-equipo"><i class="bi bi-plus"></i> Registrar equipo</button>')}

        <div class="stats-grid">
            ${tarjeta("Total de equipos",datos.equipos.length,"bi-laptop")}
            ${tarjeta("Equipos disponibles",disponibles,"bi-check-circle")}
            ${tarjeta("Préstamos activos",prestados,"bi-arrow-left-right")}
            ${tarjeta("Mantenimientos pendientes",pendientes,"bi-tools")}
        </div>

        <div class="panel-grid">
            <div class="panel">
                <h3>Últimos equipos registrados</h3>
                ${tabla(["Código","Equipo","Categoría","Ubicación","Estado"],filas)}
            </div>

            <div class="panel">
                <h3>Accesos directos</h3>
                <div class="quick-grid">
                    <button class="quick-link" data-page="inventory"><i class="bi bi-laptop"></i>Inventario</button>
                    <button class="quick-link" data-page="loans"><i class="bi bi-arrow-left-right"></i>Préstamos</button>
                    <button class="quick-link" data-page="returns"><i class="bi bi-arrow-return-left"></i>Devoluciones</button>
                    <button class="quick-link" data-page="users"><i class="bi bi-people"></i>Usuarios</button>
                    <button class="quick-link" data-page="maintenance"><i class="bi bi-tools"></i>Mantenimientos</button>
                    <button class="quick-link" data-page="reports"><i class="bi bi-bar-chart"></i>Reportes</button>
                </div>
            </div>
        </div>
    `;
}

// ==========================================
// INVENTARIO
// ==========================================

function inventario() {
    const filas = datos.equipos.map(e => `
        <tr>
            <td><strong>${e.codigo}</strong></td>
            <td>${e.nombre}</td>
            <td>${e.categoria}</td>
            <td>${e.marca}</td>
            <td>${e.ubicacion}</td>
            <td>${estadoHTML(e.estado)}</td>
            <td>
                <button class="action-btn" data-action="editar-equipo" data-id="${e.id}">
                    <i class="bi bi-pencil"></i>
                </button>
                <button class="action-btn" data-action="eliminar-equipo" data-id="${e.id}">
                    <i class="bi bi-trash"></i>
                </button>
            </td>
        </tr>
    `).join("");

    return `
        ${encabezado("Inventario de equipos","Consulta y administra los equipos tecnológicos.",
        '<button class="btn primary" data-action="nuevo-equipo"><i class="bi bi-plus"></i> Nuevo equipo</button>')}

        <div class="stats-grid">
            ${tarjeta("Total",datos.equipos.length,"bi-laptop")}
            ${tarjeta("Disponibles",datos.equipos.filter(e=>e.estado==="Disponible").length,"bi-check-circle")}
            ${tarjeta("Prestados",datos.equipos.filter(e=>e.estado==="Prestado").length,"bi-arrow-left-right")}
            ${tarjeta("En mantenimiento",datos.equipos.filter(e=>e.estado==="Mantenimiento").length,"bi-tools")}
        </div>

        <div class="panel">
            <h3>Listado de equipos</h3>
            <div class="toolbar">
                <input id="buscarTabla" placeholder="Buscar equipo, código o marca...">
                <select id="filtrarEstado">
                    <option value="">Todos los estados</option>
                    <option>Disponible</option>
                    <option>Prestado</option>
                    <option>Mantenimiento</option>
                </select>
            </div>
            <div id="tablaInventario">
                ${tabla(["Código","Equipo","Categoría","Marca","Ubicación","Estado","Acciones"],filas)}
            </div>
        </div>
    `;
}

// ==========================================
// PRÉSTAMOS
// ==========================================

function prestamos() {
    const filas = datos.prestamos.map(p => `
        <tr>
            <td>PR-${p.id}</td>
            <td>${p.usuario}</td>
            <td>${p.equipo}</td>
            <td>${p.fecha}</td>
            <td>${p.devolucion}</td>
            <td>${estadoHTML(p.estado)}</td>
            <td>
                ${p.estado === "Prestado" ?
                `<button class="btn light" data-action="devolver" data-id="${p.id}">Devolver</button>` : "—"}
            </td>
        </tr>
    `).join("");

    return `
        ${encabezado("Gestión de préstamos","Administra las asignaciones de equipos.",
        '<button class="btn primary" data-action="nuevo-prestamo"><i class="bi bi-plus"></i> Nuevo préstamo</button>')}

        <div class="stats-grid">
            ${tarjeta("Total de préstamos",datos.prestamos.length,"bi-journal-text")}
            ${tarjeta("Activos",datos.prestamos.filter(p=>p.estado==="Prestado").length,"bi-arrow-left-right")}
            ${tarjeta("Devueltos",datos.prestamos.filter(p=>p.estado==="Devuelto").length,"bi-check-circle")}
        </div>

        ${tabla(["Código","Usuario","Equipo","Fecha de entrega","Devolución prevista","Estado","Acción"],filas)}
    `;
}

// ==========================================
// DEVOLUCIONES
// ==========================================

function devoluciones() {
    const filas = datos.prestamos.map(p => `
        <tr>
            <td>PR-${p.id}</td>
            <td>${p.usuario}</td>
            <td>${p.equipo}</td>
            <td>${p.fecha}</td>
            <td>${p.devolucion}</td>
            <td>${estadoHTML(p.estado)}</td>
            <td>
                ${p.estado === "Prestado" ?
                `<button class="btn light" data-action="devolver" data-id="${p.id}">Registrar devolución</button>` : "—"}
            </td>
        </tr>
    `).join("");

    return `
        ${encabezado("Control de devoluciones","Consulta los equipos prestados y registra su recepción.")}
        <div class="stats-grid">
            ${tarjeta("Pendientes",datos.prestamos.filter(p=>p.estado==="Prestado").length,"bi-clock")}
            ${tarjeta("Devueltos",datos.prestamos.filter(p=>p.estado==="Devuelto").length,"bi-check-circle")}
        </div>
        ${tabla(["Préstamo","Usuario","Equipo","Entrega","Devolución prevista","Estado","Acción"],filas)}
    `;
}

// ==========================================
// USUARIOS
// ==========================================

function usuarios() {
    const filas = datos.usuarios.map(u => `
        <tr>
            <td><strong>${u.nombre}</strong></td>
            <td>${u.documento}</td>
            <td>${u.correo}</td>
            <td>${u.rol}</td>
            <td>${estadoHTML("Activo")}</td>
            <td>
                <button class="action-btn" data-action="editar-usuario" data-id="${u.id}">
                    <i class="bi bi-pencil"></i>
                </button>
            </td>
        </tr>
    `).join("");

    return `
        ${encabezado("Gestión de usuarios","Administra las personas registradas en el sistema.",
        '<button class="btn primary" data-action="nuevo-usuario"><i class="bi bi-plus"></i> Agregar usuario</button>')}
        <div class="stats-grid">
            ${tarjeta("Usuarios registrados",datos.usuarios.length,"bi-people")}
            ${tarjeta("Docentes",datos.usuarios.filter(u=>u.rol==="Docente").length,"bi-mortarboard")}
        </div>
        ${tabla(["Nombre","Documento","Correo electrónico","Rol","Estado","Acciones"],filas)}
    `;
}

// ==========================================
// MANTENIMIENTOS
// ==========================================

function mantenimientos() {
    const filas = datos.mantenimientos.map(m => `
        <tr>
            <td>${m.equipo}</td>
            <td>${m.descripcion}</td>
            <td>${m.fecha}</td>
            <td>${m.responsable}</td>
            <td>${estadoHTML(m.estado)}</td>
            <td>
                ${m.estado !== "Completado" ?
                `<button class="action-btn" data-action="completar-mantenimiento" data-id="${m.id}"><i class="bi bi-check-lg"></i></button>` : "—"}
            </td>
        </tr>
    `).join("");

    return `
        ${encabezado("Gestión de mantenimientos","Registra y consulta las revisiones de los equipos.",
        '<button class="btn primary" data-action="nuevo-mantenimiento"><i class="bi bi-plus"></i> Registrar mantenimiento</button>')}
        <div class="stats-grid">
            ${tarjeta("Solicitudes",datos.mantenimientos.length,"bi-tools")}
            ${tarjeta("En proceso",datos.mantenimientos.filter(m=>m.estado==="En proceso").length,"bi-arrow-repeat")}
            ${tarjeta("Completados",datos.mantenimientos.filter(m=>m.estado==="Completado").length,"bi-check-circle")}
        </div>
        ${tabla(["Equipo","Descripción","Fecha","Responsable","Estado","Acción"],filas)}
    `;
}

// ==========================================
// REPORTES
// ==========================================

function reportes() {
    const estados = ["Disponible","Prestado","Mantenimiento"];
    const cantidades = estados.map(estado =>
        datos.equipos.filter(e=>e.estado===estado).length
    );

    const maximo = Math.max(...cantidades,1);

    return `
        ${encabezado("Reportes y estadísticas","Resumen de la información del sistema.")}

        <div class="stats-grid">
            ${tarjeta("Equipos",datos.equipos.length,"bi-laptop")}
            ${tarjeta("Préstamos",datos.prestamos.length,"bi-arrow-left-right")}
            ${tarjeta("Usuarios",datos.usuarios.length,"bi-people")}
            ${tarjeta("Mantenimientos",datos.mantenimientos.length,"bi-tools")}
        </div>

        <div class="panel">
            <h3>Estado actual del inventario</h3>
            <div class="chart">
                ${estados.map((estado,i)=>`
                    <div class="chart-item">
                        <strong>${cantidades[i]}</strong>
                        <div class="chart-bar" style="height:${Math.max(8,cantidades[i]/maximo*110)}px"></div>
                        ${estado}
                    </div>
                `).join("")}
            </div>
        </div>

        <div class="panel">
            <h3>Exportar inventario</h3>
            <p>Descarga los registros actuales del inventario en formato CSV.</p>
            <br>
            <button class="btn primary" data-action="exportar">
                <i class="bi bi-download"></i> Descargar reporte
            </button>
        </div>
    `;
}

// ==========================================
// ACERCA DEL PROYECTO
// ==========================================

function acerca() {
    return `
        ${encabezado("Acerca de TecnoGestión","Información general del proyecto.")}

        <div class="panel">
            <h3>¿Qué es TecnoGestión?</h3>
            <p class="about-text">
                TecnoGestión es una propuesta de aplicación web diseñada para
                facilitar la administración y el control de los equipos
                tecnológicos de una institución educativa.
                <br><br>
                Su propósito es organizar la información de los dispositivos,
                permitir el seguimiento de los préstamos y las devoluciones,
                administrar los usuarios y registrar los procesos de mantenimiento.
                <br><br>
                La aplicación integra diferentes módulos en una interfaz sencilla,
                organizada y adaptable a dispositivos móviles.
            </p>
        </div>

        <div class="panel">
            <h3>Tecnologías utilizadas</h3>
            <p class="about-text">
                HTML5: estructura de la aplicación.<br>
                CSS3: diseño y presentación visual.<br>
                JavaScript: funcionalidades e interacciones.<br>
                Bootstrap Icons: iconografía.<br>
                LocalStorage: almacenamiento demostrativo en el navegador.
            </p>
        </div>

        <div class="panel">
            <h3>Vídeo de demostración</h3>
            <p class="about-text">
                El vídeo de presentación del proyecto se puede consultar
                mediante el enlace que se entregue junto con el proyecto.
            </p>
        </div>
    `;
}

// ==========================================
// VENTANAS Y FORMULARIOS
// ==========================================

function abrirModal(titulo,contenido) {
    $("#modalTitle").textContent = titulo;
    $("#modalContent").innerHTML = contenido;
    $("#modal").classList.remove("hidden");
}

function cerrarModal() {
    $("#modal").classList.add("hidden");
}

function campo(etiqueta,nombre,valor="",tipo="text") {
    return `
        <div class="form-field">
            <label>${etiqueta}</label>
            <input name="${nombre}" type="${tipo}" value="${valor}" required>
        </div>
    `;
}

function opciones(etiqueta,nombre,valores,seleccionado) {
    return `
        <div class="form-field">
            <label>${etiqueta}</label>
            <select name="${nombre}" required>
                ${valores.map(v=>`
                    <option ${v===seleccionado?"selected":""}>${v}</option>
                `).join("")}
            </select>
        </div>
    `;
}

// EQUIPOS

function formularioEquipo(id=null) {
    const equipo = datos.equipos.find(e=>e.id===id) || {};

    abrirModal(id?"Editar equipo":"Registrar equipo",`
        <form id="formRegistro">
            <div class="form-grid">
                ${campo("Código","codigo",equipo.codigo||"")}
                ${campo("Nombre","nombre",equipo.nombre||"")}
                ${opciones("Categoría","categoria",["Cómputo","Proyección","Dispositivo móvil","Periférico","Redes","Otro"],equipo.categoria||"Cómputo")}
                ${campo("Marca","marca",equipo.marca||"")}
                ${campo("Ubicación","ubicacion",equipo.ubicacion||"")}
                ${opciones("Estado","estado",["Disponible","Prestado","Mantenimiento"],equipo.estado||"Disponible")}
            </div>
            <div class="modal-actions">
                <button type="button" class="btn light" data-action="cerrar">Cancelar</button>
                <button class="btn primary">Guardar</button>
            </div>
        </form>
    `);

    $("#formRegistro").addEventListener("submit",e=>{
        e.preventDefault();
        const registro=Object.fromEntries(new FormData(e.target));

        if(datos.equipos.some(x=>x.codigo.toLowerCase()===registro.codigo.toLowerCase() && x.id!==id)){
            notificar("Ese código de equipo ya está registrado.");
            return;
        }

        if(id){
            datos.equipos=datos.equipos.map(x=>x.id===id?{...x,...registro}:x);
        }else{
            datos.equipos.push({id:Date.now(),...registro});
        }

        guardarDatos();
        cerrarModal();
        renderizar();
        notificar("Equipo guardado correctamente.");
    });
}

// USUARIOS

function formularioUsuario(id=null) {
    const usuario=datos.usuarios.find(u=>u.id===id)||{};

    abrirModal(id?"Editar usuario":"Agregar usuario",`
        <form id="formRegistro">
            <div class="form-grid">
                ${campo("Nombre completo","nombre",usuario.nombre||"")}
                ${campo("Documento","documento",usuario.documento||"")}
                ${campo("Correo electrónico","correo",usuario.correo||"","email")}
                ${opciones("Rol","rol",["Docente","Administradora","Soporte técnico"],usuario.rol||"Docente")}
            </div>
            <div class="modal-actions">
                <button type="button" class="btn light" data-action="cerrar">Cancelar</button>
                <button class="btn primary">Guardar usuario</button>
            </div>
        </form>
    `);

    $("#formRegistro").addEventListener("submit",e=>{
        e.preventDefault();
        const registro=Object.fromEntries(new FormData(e.target));

        if(id){
            datos.usuarios=datos.usuarios.map(u=>u.id===id?{...u,...registro}:u);
        }else{
            datos.usuarios.push({id:Date.now(),...registro});
        }

        guardarDatos();
        cerrarModal();
        renderizar();
        notificar("Usuario guardado correctamente.");
    });
}

// PRÉSTAMOS

function formularioPrestamo() {
    const disponibles=datos.equipos.filter(e=>e.estado==="Disponible");
    if(!disponibles.length){
        notificar("No hay equipos disponibles.");
        return;
    }

    const personas=datos.usuarios;

    abrirModal("Registrar préstamo",`
        <form id="formRegistro">
            <div class="form-grid">
                ${opciones("Usuario","usuario",personas.map(u=>u.nombre),personas[0].nombre)}
                ${opciones("Equipo","equipo",disponibles.map(e=>e.codigo+" · "+e.nombre),disponibles[0].codigo+" · "+disponibles[0].nombre)}
                ${campo("Fecha de entrega","fecha",new Date().toISOString().slice(0,10),"date")}
                ${campo("Fecha de devolución","devolucion",new Date(Date.now()+7*86400000).toISOString().slice(0,10),"date")}
            </div>
            <div class="modal-actions">
                <button type="button" class="btn light" data-action="cerrar">Cancelar</button>
                <button class="btn primary">Registrar préstamo</button>
            </div>
        </form>
    `);

    $("#formRegistro").addEventListener("submit",e=>{
        e.preventDefault();
        const registro=Object.fromEntries(new FormData(e.target));

        if(registro.devolucion<registro.fecha){
            notificar("La fecha de devolución no puede ser anterior a la entrega.");
            return;
        }

        datos.prestamos.push({
            id:Date.now(),
            ...registro,
            estado:"Prestado"
        });

        const equipo=datos.equipos.find(x=>x.codigo+" · "+x.nombre===registro.equipo);
        equipo.estado="Prestado";

        guardarDatos();
        cerrarModal();
        renderizar();
        notificar("Préstamo registrado.");
    });
}

// MANTENIMIENTOS

function formularioMantenimiento() {
    const equipos=datos.equipos;

    if(!equipos.length){
        notificar("Primero registra un equipo.");
        return;
    }

    abrirModal("Registrar mantenimiento",`
        <form id="formRegistro">
            <div class="form-grid">
                ${opciones("Equipo","equipo",equipos.map(e=>e.codigo+" · "+e.nombre),equipos[0].codigo+" · "+equipos[0].nombre)}
                ${campo("Fecha","fecha",new Date().toISOString().slice(0,10),"date")}
                ${campo("Responsable","responsable",usuarioActual)}
                ${opciones("Estado","estado",["Pendiente","En proceso","Completado"],"Pendiente")}
                <div class="form-field" style="grid-column:1/-1">
                    <label>Descripción</label>
                    <textarea name="descripcion" required></textarea>
                </div>
            </div>
            <div class="modal-actions">
                <button type="button" class="btn light" data-action="cerrar">Cancelar</button>
                <button class="btn primary">Guardar mantenimiento</button>
            </div>
        </form>
    `);

    $("#formRegistro").addEventListener("submit",e=>{
        e.preventDefault();
        const registro=Object.fromEntries(new FormData(e.target));
        datos.mantenimientos.push({id:Date.now(),...registro});

        const equipo=datos.equipos.find(x=>x.codigo+" · "+x.nombre===registro.equipo);
        if(equipo && registro.estado!=="Completado"){
            equipo.estado="Mantenimiento";
        }

        guardarDatos();
        cerrarModal();
        renderizar();
        notificar("Mantenimiento registrado.");
    });
}

// ==========================================
// ACCIONES
// ==========================================

function ejecutarAccion(accion,id) {
    id=Number(id);

    switch(accion){

        case "cerrar":
            cerrarModal();
            break;

        case "nuevo-equipo":
            formularioEquipo();
            break;

        case "editar-equipo":
            formularioEquipo(id);
            break;

        case "eliminar-equipo":
            if(confirm("¿Deseas eliminar este equipo?")){
                const equipo=datos.equipos.find(e=>e.id===id);
                if(datos.prestamos.some(p=>p.equipo.startsWith(equipo.codigo) && p.estado==="Prestado")){
                    notificar("No puedes eliminar un equipo que está prestado.");
                    return;
                }
                datos.equipos=datos.equipos.filter(e=>e.id!==id);
                guardarDatos();
                renderizar();
                notificar("Equipo eliminado.");
            }
            break;

        case "nuevo-usuario":
            formularioUsuario();
            break;

        case "editar-usuario":
            formularioUsuario(id);
            break;

        case "nuevo-prestamo":
            formularioPrestamo();
            break;

        case "nuevo-mantenimiento":
            formularioMantenimiento();
            break;

        case "devolver": {
            const prestamo=datos.prestamos.find(p=>p.id===id);
            if(!prestamo || prestamo.estado!=="Prestado")return;

            if(confirm("¿Confirmas la devolución del equipo?")){
                prestamo.estado="Devuelto";
                const codigo=prestamo.equipo.split(" · ")[0];
                const equipo=datos.equipos.find(e=>e.codigo===codigo);

                if(equipo)equipo.estado="Disponible";

                guardarDatos();
                renderizar();
                notificar("Devolución registrada correctamente.");
            }
            break;
        }

        case "completar-mantenimiento": {
            const mantenimiento=datos.mantenimientos.find(m=>m.id===id);
            mantenimiento.estado="Completado";

            const codigo=mantenimiento.equipo.split(" · ")[0];
            const equipo=datos.equipos.find(e=>e.codigo===codigo);

            if(equipo)equipo.estado="Disponible";

            guardarDatos();
            renderizar();
            notificar("Mantenimiento completado.");
            break;
        }

        case "exportar":
            exportarCSV();
            break;
    }
}

// ==========================================
// EXPORTAR INFORMACIÓN
// ==========================================

function exportarCSV() {
    const encabezados=["Código","Nombre","Categoría","Marca","Ubicación","Estado"];

    const filas=datos.equipos.map(e=>[
        e.codigo,e.nombre,e.categoria,e.marca,e.ubicacion,e.estado
    ]);

    const contenido=[
        encabezados,
        ...filas
    ].map(fila=>fila.map(v=>`"${String(v).replace(/"/g,'""')}"`).join(";")).join("\n");

    const archivo=new Blob(["\uFEFF"+contenido],{type:"text/csv;charset=utf-8;"});
    const url=URL.createObjectURL(archivo);
    const enlace=document.createElement("a");

    enlace.href=url;
    enlace.download="Reporte_TecnoGestion.csv";
    enlace.click();

    URL.revokeObjectURL(url);
    notificar("Reporte descargado.");
}

// ==========================================
// INICIO DE SESIÓN
// ==========================================

$("#loginForm").addEventListener("submit",e=>{
    e.preventDefault();

    usuarioActual=$("#username").value.trim()||"Administrador";

    $("#displayUser").textContent=usuarioActual;

    $("#loginScreen").classList.add("hidden");
    $("#application").classList.remove("hidden");

    navegar("dashboard");

    notificar("Bienvenido a TecnoGestión.");
});

$("#logout").addEventListener("click",()=>{
    $("#application").classList.add("hidden");
    $("#loginScreen").classList.remove("hidden");
    $("#password").value="";
});

// ==========================================
// EVENTOS GENERALES
// ==========================================

document.addEventListener("click",e=>{

    const botonPagina=e.target.closest("[data-page]");

    if(botonPagina){
        navegar(botonPagina.dataset.page);
        return;
    }

    const botonAccion=e.target.closest("[data-action]");

    if(botonAccion){
        ejecutarAccion(
            botonAccion.dataset.action,
            botonAccion.dataset.id
        );
    }
});

$("#closeModal").addEventListener("click",cerrarModal);

$("#modal").addEventListener("click",e=>{
    if(e.target.id==="modal")cerrarModal();
});

$("#menuToggle").addEventListener("click",()=>{
    $("#sidebar").classList.toggle("open");
});

// BÚSQUEDA GLOBAL

$("#globalSearch").addEventListener("input",e=>{
    if(paginaActual!=="inventory")return;

    const texto=e.target.value.toLowerCase();

    document.querySelectorAll("#pageContent tbody tr").forEach(fila=>{
        fila.hidden=!fila.textContent.toLowerCase().includes(texto);
    });
});

// BÚSQUEDA DEL INVENTARIO

document.addEventListener("input",e=>{
    if(e.target.id==="buscarTabla"){
        const texto=e.target.value.toLowerCase();

        document.querySelectorAll("#pageContent tbody tr").forEach(fila=>{
            fila.hidden=!fila.textContent.toLowerCase().includes(texto);
        });
    }
});

document.addEventListener("change",e=>{
    if(e.target.id==="filtrarEstado"){
        const estado=e.target.value.toLowerCase();

        document.querySelectorAll("#pageContent tbody tr").forEach(fila=>{
            fila.hidden=!!estado && !fila.children[5]?.textContent.toLowerCase().includes(estado);
        });
    }
});
