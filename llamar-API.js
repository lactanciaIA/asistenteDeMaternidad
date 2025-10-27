// ============================================
// CONFIGURACIÓN
// ============================================
const API_KEY = 'AIzaSyAr3mbb8Y4oCtXsZVW5a_GOJXVHO41aImI';
const API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-lite:generateContent';
const MAX_OUTPUT_TOKENS = 50;

// ============================================
// HISTORIAL DE CONVERSACIÓN (solo en memoria)
// ============================================
let historialConversacion = [];

// ============================================
// FUNCIÓN PRINCIPAL
// ============================================
async function llamarAPI() {
    const textarea = document.getElementById('areaSQL');
    const preguntaUsuario = textarea.value.trim();
    if (!preguntaUsuario) {
        alert('Por favor escribe una pregunta');
        return;
    }

    // 1) Mostrar y guardar el mensaje del usuario en el historial INMEDIATAMENTE
    const idMensajeUsuario = mostrarMensaje(preguntaUsuario, 'usuario');
    historialConversacion.push({ rol: 'usuario', texto: preguntaUsuario });

    // limpiar textarea
    textarea.value = '';

    // 2) Crear mensaje de carga para la IA y guardar su id para actualizar luego
    const idLoading = mostrarMensaje('Pensando...', 'ia');

    try {
        const respuesta = await consultarGemini(preguntaUsuario);

        // 3) Actualizar el mensaje de "Pensando..." con la respuesta real
        actualizarMensaje(idLoading, respuesta.texto);

        // 4) Guardar la respuesta en el historial
        historialConversacion.push({ rol: 'ia', texto: respuesta.texto });

        // 5) Log de tokens (opcional)
        console.log('════════════════════════════');
        console.log('Tokens entrada:', respuesta.tokensEntrada);
        console.log('Tokens salida:', respuesta.tokensSalida);
        console.log('Tokens total:', respuesta.tokensTotal);
        console.log('Límite configurado:', MAX_OUTPUT_TOKENS);
        console.log('════════════════════════════');

    } catch (error) {
        console.error('❌ Error al llamar a la API:', error);
        actualizarMensaje(idLoading, 'Lo siento, hubo un error al procesar tu pregunta. Por favor intenta de nuevo.');
    }
}

// ============================================
// FUNCIÓN PARA CONSULTAR GEMINI
// ============================================
async function consultarGemini(pregunta) {
    // Construir historial en formato de texto (lo que se enviará como contexto)
    const historialTexto = historialConversacion
        .map(msg => `${msg.rol === 'usuario' ? 'Usuario' : 'Asistente'}: ${msg.texto}`)
        .join('\n');

    // Eres un asistente empático y experto en lactancia materna. Responde de manera clara, breve y basada en evidencia científica.
    const promptConContexto = `
        Responde con un maximo de 50 tokens.
        Historial de conversación:
        ${historialTexto}

        Usuario: ${pregunta}
        Asistente:
    `;

    const requestBody = {
        contents: [{ parts: [{ text: promptConContexto }] }],
        generationConfig: {
            temperature: 0.7,
            maxOutputTokens: MAX_OUTPUT_TOKENS,
            topK: 40,
            topP: 0.95
        }
    };

    const response = await fetch(`${API_URL}?key=${API_KEY}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
        let errText = '';
        try {
            const errJson = await response.json();
            errText = JSON.stringify(errJson);
        } catch (e) {
            errText = await response.text();
        }
        console.error('❌ Error de la API:', errText);
        throw new Error(`Error ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();

    // Asegurarse de que la estructura existe
    const texto = (data?.candidates?.[0]?.content?.parts?.[0]?.text) || 'No se recibió respuesta de la IA.';
    const usageMetadata = data.usageMetadata || {};

    return {
        texto,
        tokensEntrada: usageMetadata.promptTokenCount || 0,
        tokensSalida: usageMetadata.candidatesTokenCount || 0,
        tokensTotal: usageMetadata.totalTokenCount || 0
    };
}

// ============================================
// FUNCIONES AUXILIARES PARA MOSTRAR MENSAJES
// ============================================
function mostrarMensaje(texto, tipo) {
    const divCuerpo = document.getElementById('divCuerpo');
    const contenedor = document.createElement('div');

    // id único (Date.now + contador aleatorio pequeño para evitar colisiones)
    const uniqueId = 'msg_' + Date.now() + '_' + Math.floor(Math.random() * 1000);
    contenedor.id = uniqueId;
    contenedor.setAttribute('data-role', tipo);
    contenedor.className = tipo === 'usuario' ? 'div-text-usuario' : 'div-text-IA';

    // estructura interna consistente
    const p = document.createElement('p');
    p.textContent = texto;
    contenedor.appendChild(p);

    divCuerpo.appendChild(contenedor);

    // scroll automático al final
    divCuerpo.scrollTop = divCuerpo.scrollHeight;

    return uniqueId;
}

function actualizarMensaje(id, nuevoTexto) {
    const mensaje = document.getElementById(id);
    if (!mensaje) {
        console.warn('No se encontró el mensaje con id:', id);
        return;
    }
    // Reemplazamos solo el contenido textual del primer <p>
    const p = mensaje.querySelector('p');
    if (p) p.textContent = nuevoTexto;
    else mensaje.innerHTML = `<p>${nuevoTexto}</p>`;

    // asegurar scroll al mensaje actualizado
    const divCuerpo = document.getElementById('divCuerpo');
    divCuerpo.scrollTop = divCuerpo.scrollHeight;
}

// ============================================
// ENTER PARA ENVIAR
// ============================================
document.addEventListener('DOMContentLoaded', () => {
    const textarea = document.getElementById('areaSQL');
    textarea.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            llamarAPI();
        }
    });
});

window.llamarAPI = llamarAPI;
