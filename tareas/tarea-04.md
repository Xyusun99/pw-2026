# Tarea 04 - Reflexión

**Nombre:** Bagner Francisco Ojeda Esquite  
**Carné:** 1790-18-25212  
**Fecha:** 7 de agosto de 2026

## ¿Cuál principio del testing es más importante y por qué?

Para mí, el principio más importante es el **Principio 7: "La falacia de la ausencia de errores"**.

Este principio establece que encontrar y corregir defectos no sirve de nada si el sistema no satisface las necesidades del usuario o no se usa en el contexto real para el que fue diseñado. Un software puede tener muy pocos bugs o incluso ninguno, pero si no resuelve el problema que el usuario espera o es difícil de usar, el esfuerzo de prueba ha sido en vano.

**¿Por qué lo considero el más importante?**

Porque pone al **usuario en el centro** del proceso de aseguramiento de la calidad. En nuestro curso, estamos aprendiendo a probar una aplicación web de comercio electrónico (DemoBlaze). Podríamos tener cientos de pruebas que verifiquen que los botones funcionan, que los colores son correctos o que los tiempos de carga son buenos. Sin embargo, si el proceso de compra es confuso, si el carrito no muestra el precio total de forma clara, o si el usuario necesita registrarse de una forma demasiado compleja, entonces el producto es un fracaso, aunque no tenga defectos técnicos.

Este principio se conecta directamente con el **Principio 6 ("Las pruebas dependen del contexto")** y nos recuerda que nuestra misión no es solo "encontrar bugs", sino **proveer información sobre la calidad del producto** desde la perspectiva de quien lo va a usar. Un test de login con credenciales incorrectas (como el que hicimos en clase) es valioso, pero lo es aún más saber que el mensaje de error que mostramos es comprensible y útil para el usuario final.