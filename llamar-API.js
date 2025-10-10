//Llave para la API de Cohere
const API_KEY = 'UnJ5t9AxgYACMtiLi039ddZhJrQbJ6nuL3L7VSmk';

// Cargar el dataset 
const datasetUrl = './dataset_sql.json';
let dataset;
async function loadDataset() {
    const response = await fetch(datasetUrl);
    dataset = await response.json();
}

// Llamar a la funcion de carga del dataset al inicio
loadDataset();

//Funcion par llamar y obtener respuesta de la API
async function llamarAPI() {
    //Obtenemos la setencia SQL que escribio el usuario 
    const setenciaSQL = document.getElementById('areaSQL').value;

    //Verificamos que que la setencia no este vacia
    if (!setenciaSQL.trim()) {
        alert('Por favor ingresa una pregunta');
        return;
    }

    document.getElementById('idPUsuario').innerText = setenciaSQL;
    document.getElementById('idPIA').innerText = "Aqui se mostrara la respuesta de la IA";

    /* 
    // Endpoint de la API de Cohere
    const url = 'https://api.cohere.ai/v1/generate';

    //Configuramos los headers
    const headers = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_KEY}`,
    };

    try {
        // Esperar a que se cargue el dataset
        if (!dataset) {
            await loadDataset();
        }

        //Cuerpo para enviar a la API
        const body = JSON.stringify({
            // Modelo de cohere que se va a utilizar
            model: 'command-r-plus-08-2024',
            // Prompt que se envia a la IA, incluyendo el dataset
            prompt: `Explica de manera corta (quiero que toda la explicacion la realizes en un maximo de 250 palabras) para que una persona que no tenga conocimientos de SQL pueda entender la siguiente consulta SQL: ${setenciaSQL}. En el contexto del dataset: ${JSON.stringify(dataset)}`,
            // Tokens que va a regrear la IA
            max_tokens: 250,
        });

        //Obtenmos la respuesta de la API
        const respuestaAPI = await fetch(url, {
            method: 'POST',
            headers: headers,
            body: body,
        });

        //Obtemos el texto de la repsuesta
        const respuestaTexto = await respuestaAPI.json();

        // Si hubo una respuesta "ok" se imprime la respuesta de la IA
        if (respuestaAPI.ok) {
            document.getElementById('idPIA').innerText = respuestaTexto.generations[0].text;
            document.getElementById('idPUsuario').innerText = setenciaSQL;
            document.getElementById('areaSQL').value = "";
        } else {
            // En caso que sea otra respuesta imprimir el error
            document.getElementById('idPIA').innerText = 'Hubo un error al obtener la explicación. Intenta nuevamente, error: ' + respuestaTexto;
            console.error('Error en la solicitud:', respuestaTexto);
            document.getElementById('idPUsuario').innerText = setenciaSQL;
        }
    } catch (error) {
        document.getElementById('idPIA').innerText = 'Hubo un error con la API. Por favor, intenta más tarde, error: ' + error;
        console.error('Error con la API:', error);
        document.getElementById('idPUsuario').innerText = setenciaSQL;
    }
    */
}