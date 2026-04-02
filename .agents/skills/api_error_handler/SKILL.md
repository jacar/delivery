---
name: "Modelo y API Error Handler"
description: "Estrategias para manejar interrupciones por MODEL_CAPACITY_EXHAUSTED o errores HTTP 503."
---

# Manejo de Errores 503 (Model Capacity Exhausted)

Este skill define cómo debes actuar cuando el usuario te reporte (o el sistema intercepte) un error de tipo `HTTP 503 Service Unavailable` con la razón `MODEL_CAPACITY_EXHAUSTED`.

## Contexto del Problema
Este error no proviene del código base del proyecto del usuario (por ejemplo, no es un error de React, Node.js, Laravel, etc.). Es un error de la infraestructura de los servidores de LLMs (como la sobrecarga en la API de *Gemini*). Por lo tanto, **hacer cambios en el código no reparará este problema.**

## Instrucciones y Pasos a Seguir

1. **Reconocimiento Inmediato:**
   - Detecta si el error contiene `"reason": "MODEL_CAPACITY_EXHAUSTED"` o `"code": 503`.
   - Detén cualquier intento de diagnosticar el código del proyecto del usuario. No intentes modificar archivos de configuración del proyecto para arreglar esto.

2. **Informe y Guía para el Usuario:**
   - Comunica al usuario que los servidores del modelo que está utilizando actualmente están experimentando una saturación temporal.
   - Bríndale dos opciones claras:
     - **Opción A (Recomendada):** Cambiar de modelo. Dile explícitamente: *"Te sugiero ir a la configuración (Settings > Model Selection) y cambiar a otro modelo, por ejemplo Claude 3.5/3.7 Sonnet u otro modelo disponible, y luego decirme 'Continue'."*
     - **Opción B:** Esperar el tiempo sugerido en la traza (usualmente 15-60 segundos indicados en el `retryDelay`) antes de enviar nuevamente su petición.

3. **Restaurar el Contexto:**
   - Recapitula brevemente qué era lo último en lo que estaban trabajando para asegurarle al usuario que el contexto (archivos, estado del servidor, línea en la que se quedaron) sigue intacto y listo para retomarse.

4. **Prevención de Pánicos:**
   - Evita disculparte excesivamente. Sé directo, técnico, útil y mantén siempre tus respuestas en **Español** conforme a las reglas globales del usuario.
