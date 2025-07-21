// Importamos la función getRandomUser desde api.js (RandomUser API)
import { getRandomUser } from './api.js';

// ======================
// VARIABLES GLOBALES
// ======================
const USERS_API_URL = 'http://localhost:3000/users'; // URL base para json-server
export let users = []; // Lista en memoria
let editingIndex = null;
let deleteIndex = null;

// ======================
// EVENTOS PRINCIPALES (CONSOLIDADO EN UN ÚNICO DOMContentLoaded)
// ======================
document.addEventListener('DOMContentLoaded', () => {
    // Cargar usuarios desde json-server al iniciar
    loadUsersFromJSON();

    // Configurar eventos para el formulario principal
    document.getElementById('autoFillBtn').addEventListener('click', autoFillForm);
    document.getElementById('clearBtn').addEventListener('click', clearForm);
    document.getElementById('userForm').addEventListener('submit', handleSubmit);

    // Configurar eventos para el modal de edición
    document.getElementById('saveEditBtn').addEventListener('click', saveEdit);

    // Configurar eventos para el modal de eliminación
    document.getElementById('confirmDeleteBtn').addEventListener('click', confirmDelete);

    // INICIO: Delegación de eventos para los botones dentro de cada tarjeta de usuario
    // Adjuntamos un único listener al contenedor principal de usuarios
    document.getElementById('usersList').addEventListener('click', async (e) => {
        // Verifica si el clic fue en un botón de editar o en su icono
        if (e.target.closest('.edit-btn')) {
            const userId = e.target.closest('.edit-btn').dataset.id;
            window.editUser(userId); // Llama a tu función editUser existente
        }
        // Verifica si el clic fue en un botón de eliminar o en su icono
        else if (e.target.closest('.delete-btn')) {
            const userId = e.target.closest('.delete-btn').dataset.id;
            window.askDelete(userId); // Llama a tu función askDelete existente
        }
        // Verifica si el clic fue en un botón de favorito o en su icono
        else if (e.target.closest('.favorite-btn')) {
            const userId = e.target.closest('.favorite-btn').dataset.id;
            const userIndex = users.findIndex(u => u.id == userId);
            if (userIndex > -1) {
                // Alterna el estado de favorito
                users[userIndex].favorite = !users[userIndex].favorite;

                // Envía el cambio al json-server
                await updateUserOnServer(userId, users[userIndex]);

                renderUsers(); // Vuelve a renderizar para actualizar la UI y el badge
                showToast(users[userIndex].favorite ? 'Usuario añadido a favoritos' : 'Usuario quitado de favoritos', 'info');
            }
        }
    });
    // FIN: Delegación de eventos

    // Inicializar tooltips de Bootstrap para elementos estáticos al cargar la página
    // Los tooltips de elementos dinámicos se re-inicializarán en renderUsers
    const staticTooltips = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
    staticTooltips.map(function(el) {
        return new bootstrap.Tooltip(el);
    });
});


// ======================
// FUNCIONES CRUD CON JSON-SERVER (estas permanecen igual)
// ======================
async function loadUsersFromJSON() {
    try {
        const response = await fetch(USERS_API_URL);
        if (!response.ok) throw new Error('Error al cargar usuarios');
        users = await response.json();
        renderUsers(); // Renderiza los usuarios cargados
    } catch (error) {
        console.error('Error al leer JSON:', error);
        showToast('No se pudo cargar el archivo JSON', 'danger');
    }
}

async function createUserOnServer(user) {
    try {
        const response = await fetch(USERS_API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(user)
        });
        return await response.json();
    } catch (error) {
        console.error('Error en POST:', error);
        showToast('Error al crear usuario en el servidor', 'danger'); // Añadir toast para errores de servidor
        return null; // Devuelve null para manejar el error en handleSubmit
    }
}

async function updateUserOnServer(id, user) {
    try {
        const response = await fetch(`${USERS_API_URL}/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(user)
        });
        if (!response.ok) throw new Error('Error al actualizar usuario'); // Verificar la respuesta
        return await response.json();
    } catch (error) {
        console.error('Error en PUT:', error);
        showToast('Error al actualizar usuario en el servidor', 'danger');
        return null;
    }
}

async function deleteUserOnServer(id) {
    try {
        const response = await fetch(`${USERS_API_URL}/${id}`, { method: 'DELETE' });
        if (!response.ok) throw new Error('Error al eliminar usuario'); // Verificar la respuesta
        return response.ok;
    } catch (error) {
        console.error('Error en DELETE:', error);
        showToast('Error al eliminar usuario del servidor', 'danger');
        return false;
    }
}

// ======================
// FUNCIONES DEL FORMULARIO
// ======================
function getFormData() {
    return {
        fullName: document.getElementById('fullName').value.trim(),
        email: document.getElementById('email').value.trim(),
        phone: document.getElementById('phone').value.trim(),
        profileImage: document.getElementById('profileImage').src
    };
}

function fillForm(user) {
    document.getElementById('fullName').value = user.fullName;
    document.getElementById('email').value = user.email;
    document.getElementById('phone').value = user.phone;
    document.getElementById('profileImage').src = user.profileImage;
}

async function autoFillForm() {
    try {
        const user = await getRandomUser(); // Datos desde RandomUser
        fillForm(user);
        showToast('Formulario auto-rellenado con datos de RandomUser', 'success');
    } catch {
        showToast('Error al obtener datos de la API', 'danger');
    }
}

// Esta es la ÚNICA función handleSubmit, ubicada correctamente
async function handleSubmit(e) {
    e.preventDefault();
    const userData = getFormData();

    if (!validateUser(userData)) return;

    // INICIO: Inicializar la propiedad 'favorite' para nuevos usuarios
    userData.favorite = false; // Por defecto, un nuevo usuario no es favorito
    // FIN: Inicializar la propiedad 'favorite'

    const createdUser = await createUserOnServer(userData);
    if (createdUser) {
        users.push(createdUser);
        clearForm();
        renderUsers();
        showToast('Usuario agregado correctamente', 'success');
    } else {
        // Manejar caso donde createUserOnServer falló
        showToast('No se pudo agregar el usuario', 'danger');
    }
}

function clearForm() {
    document.getElementById('userForm').reset();
    document.getElementById('profileImage').src = 'https://cdn.pixabay.com/photo/2023/02/18/11/00/icon-7797704_640.png'; // Restablecer a la imagen por defecto
}

// ======================
// RENDERIZADO DE USUARIOS
// ======================
export function renderUsers(filteredList = null) {
    const list = filteredList || users;
    const container = document.getElementById('usersList');

    // Actualizar el contador total de usuarios
    document.getElementById('userCount').textContent = `${list.length} usuarios`;

    // INICIO: Código para actualizar el Badge de Favoritos
    const favoriteCountSpan = document.getElementById('favoriteCount');
    // Asegúrate de que los usuarios tengan la propiedad 'favorite'.
    // Si no la tienen desde el json-server, asegúrate de añadirla al crear o cargar.
    const favoriteUsersCount = users.filter(u => u.favorite).length;
    favoriteCountSpan.textContent = favoriteUsersCount;
    // FIN: Código para actualizar el Badge de Favoritos

    container.innerHTML = list.length
        ? list.map(user => userCard(user)).join('')
        : `<div class="col-12 text-center text-muted py-5">
               <i class="fas fa-user-friends fa-3x mb-3 text-secondary"></i>
               <h5>No hay usuarios registrados</h5>
               <p>Utiliza el formulario para agregar tu primer usuario</p>
           </div>`;

    // Re-inicializar tooltips para elementos recién agregados al DOM
    const dynamicTooltips = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
    dynamicTooltips.map(function(el) {
        return new bootstrap.Tooltip(el);
    });
}

// ======================
// FUNCION QUE GENERA LA TARJETA DE USUARIO
// ======================
function userCard(user) {
 return `
        <div class="col-md-6 col-lg-4 mb-3">
            <div class="card h-100 shadow user-card ${user.favorite ? 'favorite' : ''}">
                <div class="card-body d-flex flex-column align-items-center text-center">
                    <img src="${user.profileImage}" class="rounded-circle img-thumbnail mb-3 border border-primary p-1" width="90" alt="Foto de perfil">
                    <h5 class="card-title mb-1">${user.fullName}</h5>
                    <p class="card-text text-muted mb-1"><small>${user.email}</small></p>
                    <p class="card-text text-muted mb-3"><small>${user.phone}</small></p>
                    <div class="mt-auto d-flex justify-content-center w-100">
                        <button class="btn btn-sm ${user.favorite ? 'btn-warning' : 'btn-outline-warning'} favorite-btn me-2"
                                data-id="${user.id}" data-bs-toggle="tooltip" data-bs-placement="top" title="${user.favorite ? 'Quitar de Favoritos' : 'Marcar como Favorito'}">
                            <i class="fas fa-star"></i>
                        </button>
                        <button class="btn btn-sm btn-info edit-btn me-2" data-id="${user.id}"
                                data-bs-toggle="tooltip" data-bs-placement="top" title="Editar Usuario">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn btn-sm btn-danger delete-btn" data-id="${user.id}"
                                data-bs-toggle="tooltip" data-bs-placement="top" title="Eliminar Usuario">
                            <i class="fas fa-trash-alt"></i>
                        </button>
                    </div>
                </div>
            </div>
        </div>`;
}
// ======================
// MODAL DE EDICIÓN
// ======================
window.editUser = (id) => {
    editingIndex = id;
    const user = users.find(u => u.id === id);
    if (!user) { // Añadir verificación si el usuario no se encuentra
        showToast('Usuario no encontrado para edición', 'danger');
        return;
    }
    document.getElementById('editUserIndex').value = id;
    document.getElementById('editProfileImage').src = user.profileImage;
    document.getElementById('editFullName').value = user.fullName;
    document.getElementById('editEmail').value = user.email;
    document.getElementById('editPhone').value = user.phone;
    new bootstrap.Modal(document.getElementById('editModal')).show();
};

async function saveEdit() {
    const id = editingIndex;
    if (id === null) return;

    // En el modal de edición, también podrías permitir editar el nombre, si lo deseas.
    // Por ahora, solo email y teléfono como en tu original.
    const fullName = document.getElementById('editFullName').value.trim(); // Captura el nombre
    const email = document.getElementById('editEmail').value.trim();
    const phone = document.getElementById('editPhone').value.trim();

    // Validar también el nombre al editar
    if (!fullName || fullName.length < 2 || !validateEmail(email) || !validatePhone(phone)) {
        showToast('Datos inválidos al editar', 'danger');
        return;
    }

    const userIndex = users.findIndex(u => u.id === id);
    if (userIndex === -1) { // Añadir verificación si el usuario no se encuentra
        showToast('Usuario a editar no encontrado en la lista', 'danger');
        return;
    }

    // Actualiza el objeto usuario en la lista en memoria
    users[userIndex].fullName = fullName; // Actualiza el nombre
    users[userIndex].email = email;
    users[userIndex].phone = phone;

    // Envía el usuario actualizado al servidor
    const updated = await updateUserOnServer(id, users[userIndex]);
    if (updated) {
        editingIndex = null;
        bootstrap.Modal.getInstance(document.getElementById('editModal')).hide();
        renderUsers(); // Vuelve a renderizar los usuarios para reflejar los cambios
        showToast('Usuario actualizado correctamente', 'success');
    } else {
        showToast('No se pudo actualizar el usuario', 'danger');
    }
}

// ======================
// MODAL DE ELIMINACIÓN
// ======================
window.askDelete = (id) => {
    deleteIndex = id;
    const user = users.find(u => u.id === id);
    if (!user) { // Añadir verificación
        showToast('Usuario no encontrado para eliminar', 'danger');
        return;
    }
    document.getElementById('deleteUserName').textContent = user.fullName;
    new bootstrap.Modal(document.getElementById('deleteModal')).show();
};

async function confirmDelete() {
    if (deleteIndex === null) return;

    const deleted = await deleteUserOnServer(deleteIndex);
    if (deleted) {
        users = users.filter(u => u.id !== deleteIndex);
        deleteIndex = null;
        bootstrap.Modal.getInstance(document.getElementById('deleteModal')).hide();
        renderUsers();
        showToast('Usuario eliminado', 'warning');
    } else {
        showToast('No se pudo eliminar el usuario', 'danger');
    }
}

// ======================
// VALIDACIONES (estas permanecen igual)
// ======================
function validateUser(user) {
    if (!user.fullName || user.fullName.length < 2) {
        showToast('Nombre inválido', 'danger');
        return false;
    }
    if (!validateEmail(user.email)) {
        showToast('Email inválido', 'danger');
        return false;
    }
    if (!validatePhone(user.phone)) {
        showToast('Teléfono inválido', 'danger');
        return false;
    }
    return true;
}

function validateEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function validatePhone(phone) {
    return /^[0-9+\-()\s]{7,15}$/.test(phone);
}

// ======================
// NOTIFICACIONES (TOAST) (esta permanece igual)
// ======================
function showToast(message, type = 'primary') {
    const toast = document.getElementById('mainToast');
    toast.className = `toast align-items-center text-bg-${type} border-0`;
    document.getElementById('toastMessage').textContent = message;
    new bootstrap.Toast(toast).show();
}