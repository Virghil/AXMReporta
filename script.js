// ---------- LOGIN / REGISTRO ----------
function mostrarRegistro() {
    document.getElementById("login").style.display = "none";
    document.getElementById("registro").style.display = "block";

    document.querySelectorAll(".tabs button")[0].classList.remove("active");
    document.querySelectorAll(".tabs button")[1].classList.add("active");
}

function mostrarLogin() {
    document.getElementById("login").style.display = "block";
    document.getElementById("registro").style.display = "none";

    document.querySelectorAll(".tabs button")[0].classList.add("active");
    document.querySelectorAll(".tabs button")[1].classList.remove("active");
}

function registrar() {
    let usuarios = JSON.parse(localStorage.getItem("usuarios")) || [];

    let nuevo = {
        cedula: rCedula.value,
        nombre: rNombre.value,
        apellido: rApellido.value,
        correo: rCorreo.value,
        password: rPassword.value
    };

    usuarios.push(nuevo);
    localStorage.setItem("usuarios", JSON.stringify(usuarios));
    alert("Registrado");
}

function login() {
    let usuarios = JSON.parse(localStorage.getItem("usuarios")) || [];

    let user = usuarios.find(u => u.cedula == cedula.value && u.password == password.value);

    if (user) {
        localStorage.setItem("usuarioActivo", JSON.stringify(user));
        window.location.href = "dashboard.html";
    } else alert("Error");
}

// ---------- DASHBOARD ----------
function cargarReportes() {

    let lista = document.getElementById("listaReportes");

    if (!lista) return;

    let reportes = JSON.parse(localStorage.getItem("reportes")) || [];

    let usuario = JSON.parse(localStorage.getItem("usuarioActivo"));

    lista.innerHTML = "";

    if (reportes.length === 0) {
        lista.innerHTML = "<p>No hay reportes aún</p>";
        return;
    }

    // 🔥 FILTRAR SOLO LOS DEL USUARIO
    let misReportes = reportes.filter(r => r.cedula === usuario?.cedula);

    if (misReportes.length === 0) {
        lista.innerHTML = "<p>No tienes reportes</p>";
        return;
    }

    misReportes.forEach(r => {

        let div = document.createElement("div");
        div.classList.add("card");

        div.innerHTML = `
            ${r.foto ? `<img src="${r.foto}">` : ""}
            <div class="card-body">
                <h4>${r.descripcion}</h4>
                <p><b>Categoría:</b> ${r.categoria}</p>
                <p><b>Estado:</b> ${r.estado || "Recibido"}</p>
                <p><small>${r.fecha}</small></p>
            </div>
        `;

        lista.appendChild(div);
    });
}

// ---------- REPORTES ----------
function enviarReporte() {

    let desc = document.getElementById("descripcion")?.value;
    let cat = document.getElementById("categoria")?.value;
    let archivo = document.getElementById("foto")?.files[0];

    let usuario = JSON.parse(localStorage.getItem("usuarioActivo"));

    console.log("DEBUG:", desc, cat, archivo, ubicacionSeleccionada);

    // 🔒 VALIDACIONES
    if (!usuario) {
        alert("Debe iniciar sesión");
        window.location.href = "index.html";
        return;
    }

    if (!desc || desc.trim() === "") {
        alert("Ingrese una descripción");
        return;
    }

    // ⚠️ TEMPORAL (para que no te bloquee)
    if (!ubicacionSeleccionada) {
        console.warn("No hay ubicación, se guardará vacío");
    }

    let reportes = JSON.parse(localStorage.getItem("reportes")) || [];

    function guardar(imagen) {

        let nuevo = {
            id: Date.now(),
            descripcion: desc,
            categoria: cat,
            foto: imagen || null,
            fecha: new Date().toLocaleDateString(),
            ubicacion: ubicacionSeleccionada || null,
            cedula: usuario.cedula,
            estado: "Recibido"
        };

        reportes.push(nuevo);

        localStorage.setItem("reportes", JSON.stringify(reportes));

        alert("Reporte enviado correctamente");

        window.location.href = "dashboard.html";
    }

    // 📸 CON IMAGEN
    if (archivo) {
        try {
            let lector = new FileReader();

            lector.onload = function () {
                guardar(lector.result);
            };

            lector.readAsDataURL(archivo);

        } catch (error) {
            console.error("Error con imagen:", error);
            guardar(null);
        }
    } 
    // 📄 SIN IMAGEN
    else {
        guardar(null);
    }
}

// ---------- MAPA ----------
let mapa;
let marcador;
let ubicacionSeleccionada = null;

function iniciarMapa() {

    mapa = L.map('map').setView([4.5339, -75.6811], 13);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: 'Mapa'
    }).addTo(mapa);

    // 📍 Ubicación actual
    navigator.geolocation.getCurrentPosition(pos => {

        let lat = pos.coords.latitude;
        let lng = pos.coords.longitude;

        mapa.setView([lat, lng], 15);

        marcador = L.marker([lat, lng]).addTo(mapa);

        ubicacionSeleccionada = { lat, lng };

    });

    // 👇 PERMITIR SELECCIONAR EN EL MAPA
    mapa.on('click', function (e) {

        let lat = e.latlng.lat;
        let lng = e.latlng.lng;

        if (marcador) {
            mapa.removeLayer(marcador);
        }

        marcador = L.marker([lat, lng]).addTo(mapa);

        ubicacionSeleccionada = { lat, lng };

        alert("Ubicación seleccionada");
    });
}

// ---------- OTROS ----------
function logout() {
    localStorage.removeItem("usuarioActivo");
    window.location.href = "index.html";
}

function recuperarPassword() {
    alert("Funcional");
}

window.onload = function () {

    cargarReportes();

    if (document.getElementById("map")) {
        iniciarMapa();
    }

    if (document.getElementById("mapDashboard")) {
        mostrarMapaReportes();
    }
};

function irReportar() {
    window.location.href = "reportar.html";
}

function mostrarMapaReportes() {

    let contenedor = document.getElementById("mapDashboard");
    if (!contenedor) return;

    let mapa = L.map('mapDashboard').setView([4.5339, -75.6811], 13);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: 'Mapa'
    }).addTo(mapa);

    let reportes = JSON.parse(localStorage.getItem("reportes")) || [];

    console.log("Reportes:", reportes); // DEBUG

    reportes.forEach(r => {

        if (r.ubicacion && r.ubicacion.lat && r.ubicacion.lng) {

            L.marker([r.ubicacion.lat, r.ubicacion.lng])
                .addTo(mapa)
                .bindPopup(`
                    <b>${r.descripcion}</b><br>
                    ${r.categoria}
                `);
        }
    });
}