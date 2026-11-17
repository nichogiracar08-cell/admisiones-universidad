const API = '/api';
const $ = (sel) => document.querySelector(sel);
const pesos = (n) => '$' + Number(n || 0).toLocaleString('es-CO');
const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);

let facultades = [];
let programas = [];

// ---------- Sesión ----------
const token = localStorage.getItem('token');
let usuario = null;
try { usuario = JSON.parse(localStorage.getItem('usuario')); } catch {}
if (!token || !usuario) location.replace('/login.html');

const esAdmin = () => usuario?.rol === 'admin';

function salir() {
  localStorage.removeItem('token');
  localStorage.removeItem('usuario');
  location.replace('/login.html');
}

$('#nombreUsuario').textContent = usuario?.nombre || '';
$('#rolUsuario').textContent = usuario?.rol || '';
document.querySelectorAll('.solo-admin').forEach((el) => el.classList.toggle('solo-admin-oculto', !esAdmin()));

$('#btnLogout').addEventListener('click', async () => {
  try { await api('/auth/logout', { method: 'POST' }); } catch {}
  salir();
});

// ---------- Utilidades ----------
async function api(ruta, opciones = {}) {
  const res = await fetch(API + ruta, {
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    ...opciones,
    body: opciones.body ? JSON.stringify(opciones.body) : undefined,
  });
  const json = await res.json();
  if (res.status === 401) { salir(); throw new Error(json.mensaje); }
  if (!res.ok) throw new Error(json.mensaje || 'Error en la petición');
  return json;
}

const botonEliminar = (recurso, id) =>
  esAdmin() ? `<button class="peligro" onclick="eliminar('${recurso}','${id}')">Eliminar</button>` : '';

function toast(msg, error = false) {
  const t = $('#toast');
  t.textContent = msg;
  t.className = 'visible' + (error ? ' error' : '');
  clearTimeout(t._timer);
  t._timer = setTimeout(() => (t.className = ''), 3000);
}

function datosFormulario(form) {
  const datos = {};
  for (const [k, v] of new FormData(form)) if (v !== '') datos[k] = v;
  return datos;
}

// ---------- Tabs ----------
document.querySelectorAll('.tab').forEach((btn) =>
  btn.addEventListener('click', () => {
    document.querySelectorAll('.tab, .panel').forEach((el) => el.classList.remove('activo'));
    btn.classList.add('activo');
    $('#' + btn.dataset.tab).classList.add('activo');
  })
);

// ---------- Estadísticas ----------
async function cargarStats() {
  const { data } = await api('/estadisticas');
  const e = data.porEstado;
  $('#stats').innerHTML = [
    [data.facultades, 'Facultades'],
    [data.programas, 'Programas'],
    [data.estudiantes, 'Inscritos'],
    [e['Admitido'] || 0, 'Admitidos'],
    [e['En revisión'] || 0, 'En revisión'],
  ].map(([n, t]) => `<div class="stat"><b>${n}</b><span>${t}</span></div>`).join('');
}

// ---------- Facultades ----------
async function cargarFacultades() {
  ({ data: facultades } = await api('/facultades'));
  const opciones = facultades.map((f) => `<option value="${f._id}">${esc(f.nombre)}</option>`).join('');
  $('#selFacultadPrograma').innerHTML = opciones;
  $('#selFacultadInscripcion').innerHTML = '<option value="">Todas</option>' + opciones;

  $('#tablaFacultades').innerHTML = `
    <tr><th>Código</th><th>Nombre</th><th>Decano</th><th>Programas</th><th></th></tr>
    ${facultades.map((f) => `
      <tr>
        <td>${esc(f.codigo)}</td><td>${esc(f.nombre)}</td><td>${esc(f.decano)}</td>
        <td>${f.programas.length}</td>
        <td>${botonEliminar('facultades', f._id)}</td>
      </tr>`).join('')}`;
}

$('#formFacultad').addEventListener('submit', async (ev) => {
  ev.preventDefault();
  try {
    await api('/facultades', { method: 'POST', body: datosFormulario(ev.target) });
    ev.target.reset();
    toast('Facultad creada ✔');
    refrescar();
  } catch (e) { toast(e.message, true); }
});

// ---------- Programas ----------
async function cargarProgramas() {
  ({ data: programas } = await api('/programas'));
  llenarProgramasInscripcion();

  $('#tablaProgramas').innerHTML = `
    <tr><th>Código</th><th>Programa</th><th>Facultad</th><th>Nivel</th><th>Modalidad</th><th>Cupos</th><th>Valor sem.</th><th></th></tr>
    ${programas.map((p) => `
      <tr>
        <td>${esc(p.codigo)}</td><td>${esc(p.nombre)}</td><td>${esc(p.facultad?.nombre)}</td>
        <td>${esc(p.nivel)}</td><td>${esc(p.modalidad)}</td><td>${p.cupos}</td><td>${pesos(p.valorSemestre)}</td>
        <td>${botonEliminar('programas', p._id)}</td>
      </tr>`).join('')}`;
}

function llenarProgramasInscripcion() {
  const fac = $('#selFacultadInscripcion').value;
  const lista = programas.filter((p) => p.activo && (!fac || p.facultad?._id === fac));
  $('#selProgramaInscripcion').innerHTML = lista
    .map((p) => `<option value="${p._id}">${esc(p.nombre)} — ${esc(p.nivel)} (${esc(p.modalidad)})</option>`)
    .join('');
}
$('#selFacultadInscripcion').addEventListener('change', llenarProgramasInscripcion);

$('#formPrograma').addEventListener('submit', async (ev) => {
  ev.preventDefault();
  try {
    await api('/programas', { method: 'POST', body: datosFormulario(ev.target) });
    ev.target.reset();
    toast('Programa creado ✔');
    refrescar();
  } catch (e) { toast(e.message, true); }
});

// ---------- Estudiantes ----------
async function cargarEstudiantes() {
  const params = new URLSearchParams();
  if ($('#buscar').value) params.set('buscar', $('#buscar').value);
  if ($('#filtroEstado').value) params.set('estado', $('#filtroEstado').value);
  const { data } = await api('/estudiantes?' + params);

  const estados = ['Inscrito', 'En revisión', 'Admitido', 'Rechazado'];
  $('#tablaEstudiantes').innerHTML = `
    <tr><th>Documento</th><th>Estudiante</th><th>Programa</th><th>ICFES</th><th>Estado</th><th></th></tr>
    ${data.map((s) => `
      <tr>
        <td>${esc(s.tipoDocumento)} ${esc(s.documento)}</td>
        <td>${esc(s.nombres)} ${esc(s.apellidos)}<br><small>${esc(s.email)}</small></td>
        <td>${esc(s.programa?.nombre)}<br><small>${esc(s.programa?.facultad?.nombre)}</small></td>
        <td>${s.puntajeIcfes ?? '—'}</td>
        <td>
          <select class="estado" data-v="${esc(s.estadoAdmision)}" onchange="cambiarEstado('${s._id}', this)">
            ${estados.map((e) => `<option ${e === s.estadoAdmision ? 'selected' : ''}>${e}</option>`).join('')}
          </select>
        </td>
        <td>${botonEliminar('estudiantes', s._id)}</td>
      </tr>`).join('') || '<tr><td colspan="6">Sin resultados</td></tr>'}`;
}

let debounce;
$('#buscar').addEventListener('input', () => { clearTimeout(debounce); debounce = setTimeout(cargarEstudiantes, 300); });
$('#filtroEstado').addEventListener('change', cargarEstudiantes);

async function cambiarEstado(id, select) {
  try {
    await api(`/estudiantes/${id}/estado`, { method: 'PATCH', body: { estadoAdmision: select.value } });
    toast(`Estado actualizado a "${select.value}"`);
  } catch (e) { toast(e.message, true); }
  refrescar();
}

$('#formEstudiante').addEventListener('submit', async (ev) => {
  ev.preventDefault();
  try {
    const { data } = await api('/estudiantes', { method: 'POST', body: datosFormulario(ev.target) });
    ev.target.reset();
    llenarProgramasInscripcion();
    toast(`¡Inscripción exitosa! ${data.nombres}, quedaste inscrito en ${data.programa.nombre}`);
    refrescar();
  } catch (e) { toast(e.message, true); }
});

// ---------- Común ----------
async function eliminar(recurso, id) {
  if (!confirm('¿Seguro que deseas eliminar este registro?')) return;
  try {
    await api(`/${recurso}/${id}`, { method: 'DELETE' });
    toast('Registro eliminado');
    refrescar();
  } catch (e) { toast(e.message, true); }
}

async function refrescar() {
  try {
    await cargarFacultades();
    await Promise.all([cargarProgramas(), cargarEstudiantes(), cargarStats()]);
  } catch (e) { toast('No se pudo conectar con la API: ' + e.message, true); }
}

if (token && usuario) refrescar();
