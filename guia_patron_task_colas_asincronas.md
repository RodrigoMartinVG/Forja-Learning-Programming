la idea es meter un objeto-metodo-funcion-parametros serializado en una cola (productor) quizas con un calback tambien serializado... y luego un consumer asincronicamente lo trabaja...

# Guía del Patrón de Colas de Tareas Asíncronas

Este documento describe el patrón de diseño para el procesamiento de tareas de forma asincrónica, sus variantes y sus aplicaciones prácticas tanto en desarrollo de software de alto nivel como en sistemas de bajo nivel.

---

## 1. Descripción del Patrón

El patrón de **Colas de Tareas Asíncronas** (Asynchronous Task Queuing) es un modelo de arquitectura diseñado para desacoplar la ejecución de una tarea de la solicitud que la originó. 

En lugar de que un programa ejecute una función y espere a que esta termine para continuar (procesamiento sincrónico), el programa envía los datos necesarios para realizar esa tarea a un sistema de mensajería (cola) y sigue con su ejecución principal de inmediato. Un proceso separado, conocido como "Worker" o "Consumidor", extrae la tarea de la cola y la ejecuta en segundo plano.

### Componentes principales:
1. **Productor:** El código que identifica que una tarea debe realizarse y la coloca en la cola.
2. **Cola (Broker/Mensajería):** El almacén donde residen las tareas pendientes (ej. Redis, RabbitMQ o un Búfer Circular en memoria).
3. **Consumidor (Worker):** El agente encargado de procesar y ejecutar la lógica de la tarea pendiente.

---

## 2. Variantes del Patrón

Existen diversas formas de implementar y gestionar estas colas según la necesidad del sistema:

* **FIFO (First-In, First-Out):** La variante más simple donde las tareas se procesan estrictamente en el orden en que llegaron.
* **Colas de Prioridad:** Permite asignar un nivel de urgencia a cada tarea. El consumidor siempre procesará primero las tareas de "Alta Prioridad" antes de pasar a las de "Prioridad Baja", independientemente del orden de llegada.
* **Tareas Programadas o Diferidas (Scheduled/Delayed Tasks):** La tarea se coloca en la cola pero con una instrucción de no ser ejecutada hasta que pase un tiempo determinado o se alcance una hora específica.
* **Reintentos y Colas de Error (Dead Letter Queues):** Si una tarea falla, el sistema puede intentar ejecutarla nuevamente tras un tiempo. Si persiste el fallo, se mueve a una "Cola de Mensajes Muertos" para su inspección manual o análisis posterior.
* **Fan-out o Publicación/Suscripción:** Una sola tarea producida puede ser enviada a múltiples colas diferentes para que distintos consumidores realicen acciones distintas sobre el mismo evento.

---

## 3. Casos de Uso

Este patrón es fundamental para construir sistemas escalables y resilientes:

### Mejora de la Experiencia de Usuario (Latencia)
Cuando una acción del usuario requiere un proceso que tarda segundos (como enviar un email de bienvenida o generar un PDF), el sistema responde "Procesando..." de inmediato, evitando que la interfaz se bloquee o que el usuario tenga que esperar.

### Procesamiento de Cargas Pesadas
Ideal para tareas que consumen muchos recursos de CPU o memoria, como el procesamiento de imágenes, edición de video, análisis de grandes volúmenes de datos o entrenamiento de modelos de IA.

### Integración con Servicios de Terceros
Cuando una aplicación depende de una API externa (como una pasarela de pagos o un servicio de mensajería), el uso de colas protege al sistema contra la lentitud o caídas temporales de dicho proveedor externo, permitiendo que la tarea se complete cuando el servicio vuelva a estar disponible.

### Estabilización de Picos de Tráfico (Buffering)
En momentos de alta demanda, la cola actúa como un amortiguador. En lugar de que el servidor colapse intentando procesar mil solicitudes simultáneas, estas se almacenan en la cola y los consumidores las procesan de forma constante según su capacidad.

### Gestión de Recursos en Sistemas de Bajo Nivel (Bare Metal)
En entornos donde no hay un sistema operativo, este patrón permite que las interrupciones de hardware (ISR) sean extremadamente rápidas, delegando el procesamiento real de los datos recibidos a un bucle principal, garantizando que no se pierdan eventos críticos del hardware.


y que mas podemos decir al respecto, que variantes exisiten

Este patrón es más profundo de lo que parece a simple vista, especialmente cuando pasamos de la teoría general a las necesidades críticas de rendimiento y estabilidad.

Aquí tienes un desglose de las variantes estratégicas, políticas de gestión y conceptos clave que terminan de definir este ecosistema:

1. Variantes en la Lógica de Ejecución
Dependiendo de la urgencia y el volumen de trabajo, el patrón puede configurarse de diversas formas:

FIFO (First-In, First-Out): Es la forma más básica; las tareas se procesan estrictamente en el orden en que llegaron a la cola.  

Colas de Prioridad: Se asignan niveles de importancia a las tareas. El sistema procesa siempre lo urgente (Alta Prioridad) antes que lo rutinario, sin importar el orden de llegada.  
+1

Tareas Programadas o Diferidas: Permiten encolar una acción para que no se ejecute "ahora", sino tras un tiempo específico o en un horario determinado.  

Fan-out (Publicación/Suscripción): Un único evento producido se envía a múltiples colas para que diferentes procesos realicen acciones distintas simultáneamente sobre el mismo dato.  

Reintentos y Dead Letter Queues (DLQ): Si una tarea falla, el sistema puede intentar ejecutarla de nuevo. Si el error persiste, la tarea se mueve a una "cola de mensajes muertos" para inspección manual y evitar que bloquee el sistema.  
+1

2. Políticas de Desbordamiento (Overflow)
En sistemas con recursos limitados, es vital definir qué sucede cuando la cola se llena. Existen dos estrategias principales:

Drop Newest (Descartar Nueva): Si la cola está llena, se ignora la nueva tarea entrante. Es útil en sistemas donde los datos antiguos son más valiosos que los nuevos.  

Overwrite Oldest (Sobrescribir Antigua): La tarea nueva reemplaza a la más antigua en el búfer. Esto es común en streaming de sensores, donde siempre interesa tener el dato más reciente.  
+1

3. Beneficios Estratégicos y de Hardware
Más allá de la organización del código, este patrón resuelve problemas físicos y de eficiencia:

Diferir Cargas de Trabajo (ISR Deferring): En niveles bajos, las interrupciones de hardware deben ser instantáneas. La cola permite que la interrupción solo "anote" el evento y delegue el procesamiento pesado al hilo principal, evitando perder otros eventos críticos.  
+3

Serialización de Periféricos: Evita conflictos cuando múltiples partes del código intentan usar el mismo recurso (como una consola UART o una pantalla) al mismo tiempo. La cola asegura que los mensajes se escriban en orden y sin solaparse.  
+3

Gestión de Energía: Permite que la CPU entre en modos de bajo consumo mientras la cola esté vacía, despertando únicamente cuando hay trabajo pendiente.  

Atomicidad y Seguridad: Garantiza que el manejo de los índices de la cola sea seguro frente a condiciones de carrera, protegiendo la integridad de los datos procesados.  
+1

4. Estructuras de Datos Comunes
Para que el patrón funcione correctamente, se suelen utilizar estructuras específicas:

Task Descriptor: Una estructura mínima que encapsula el puntero a la función y sus argumentos necesarios.  
+1

Ring Buffer (Búfer Circular): Es la estructura de datos ideal para colas en memoria estática, ya que evita desplazamientos de memoria costosos y permite una gestión eficiente sin asignación dinámica.  
+1

¿Te interesa profundizar en cómo se maneja la prioridad cuando hay múltiples colas compitiendo por el mismo procesador?

si

Cuando manejamos múltiples colas compitiendo por un mismo procesador, entramos en el terreno del Scheduling (Planificación). En sistemas de alto rendimiento o bare metal, la forma en que el "Dispatcher" decide qué tarea extraer es crítica para la estabilidad del sistema.

Aquí te explico las estrategias para gestionar estas prioridades:

1. Planificación por Prioridad Estricta
Esta es la variante más común. El sistema no tiene una sola cola, sino un arreglo de colas (por ejemplo: Alta, Media y Baja).  
+1

Funcionamiento: El Dispatcher siempre revisa primero la cola de Alta Prioridad. Solo si esa cola está completamente vacía, pasa a revisar la de Prioridad Media, y así sucesivamente.  
+4

Ventaja: Garantiza que las tareas críticas (como una respuesta de seguridad o control de hardware) se ejecuten con la mínima latencia posible.  
+1

Riesgo: Puede causar inanición (starvation) de las colas bajas; si siempre llegan tareas de alta prioridad, las de baja prioridad nunca se ejecutarán.

2. Weighted Round Robin (Prioridad con Pesos)
Para evitar que las tareas de baja prioridad queden "olvidadas", se utiliza una distribución de tiempo o de carga.

Funcionamiento: El Dispatcher no vacía una cola antes de pasar a la siguiente, sino que procesa una proporción fija.

Ejemplo: Por cada 3 tareas de la cola Alta, procesa 2 tareas de la cola Media y 1 tarea de la cola Baja.

Resultado: Todas las colas avanzan, pero las importantes reciben más tiempo de CPU de forma proporcional.

3. Dinámica de "Aging" (Envejecimiento)
Esta técnica se usa para rescatar tareas que llevan demasiado tiempo esperando.

Concepto: Si una tarea en la cola de Baja Prioridad permanece ahí por más de un tiempo determinado (ej. 500ms), el sistema la promueve automáticamente a una cola de Prioridad Superior.

Objetivo: Asegurar que incluso los procesos menos importantes terminen ejecutándose en momentos de alta carga.

4. Implementación del Dispatcher
En un entorno bare metal o de bajo nivel, el código del "Consumidor" cambia su estructura simple por una jerárquica.  
+1

Estructura del Bucle: El Dispatcher se convierte en un bucle que recorre un puntero de arreglos de colas.  

Salida Temprana: Tan pronto como el Dispatcher ejecuta una tarea (incluso de prioridad media), vuelve a empezar la revisión desde la cola de Alta Prioridad para asegurarse de que no entró algo urgente mientras procesaba la tarea anterior.  

Resumen de variantes de selección:
Estrategia	Cuándo usarla
Estricta	
Cuando el hardware tiene tareas críticas que no pueden esperar nada (Hard Real-Time).  
+1

Round Robin	Cuando todas las tareas deben avanzar tarde o temprano.
Diferida	
Para tareas que no son urgentes pero deben ejecutarse en momentos de baja actividad (Idle tasks).  

¿Te gustaría que profundizáramos en cómo se gestiona la exclusión mutua (Race Conditions) cuando una interrupción intenta escribir en una de estas colas mientras el procesador está leyendo otra?

si

Este es el "punto de quiebre" donde un sistema bare metal se vuelve robusto o falla de forma aleatoria. Cuando tienes una ISR (Productor) y un Bucle Principal (Consumidor) compartiendo una cola, ambos compiten por los mismos recursos, lo que genera condiciones de carrera (Race Conditions).

Para gestionar la exclusión mutua sin el overhead de un sistema operativo, se utilizan estas cuatro estrategias:

1. Secciones Críticas (Deshabilitar Interrupciones)
Es el método más directo y común en C. Consiste en "ensordecer" a la CPU momentáneamente mientras se manipulan los índices de la cola.  

Mecanismo: Antes de leer o escribir en la cola, deshabilitas las interrupciones globales. Una vez terminada la operación, las vuelves a habilitar.  

Riesgo: Si la sección crítica es muy larga, puedes perder otras interrupciones de alta prioridad o generar jitter (variación en el tiempo de respuesta).  

Implementación: Suele hacerse con instrucciones de ensamblador como cli (Clear Interrupts) y sei (Set Interrupts) en arquitecturas como AVR o ARM.  

2. El Diseño SPSC (Single Producer Single Consumer)
Esta es la estrategia más elegante y eficiente. Si diseñas la cola de modo que solo una entidad escriba en cada variable, puedes evitar los bloqueos casi por completo.  
+1

La Regla de Oro:

El Productor (ISR) es el único que modifica el índice head.  
+1

El Consumidor (Main Loop) es el único que modifica el índice tail.  
+1

Funcionamiento: Cada uno puede leer el índice del otro para saber si la cola está llena o vacía, pero nunca escribir en él. Al no haber dos entidades intentando cambiar la misma variable, el riesgo de corrupción desaparece (siempre que la arquitectura garantice lecturas atómicas de los índices).  
+3

3. Uso de la palabra clave volatile (en C)
En sistemas de bajo nivel, volatile es obligatorio para los índices head y tail.  
+1

¿Por qué?: Le indica al compilador que el valor de esa variable puede cambiar en cualquier momento debido a un evento externo (la interrupción).  

Efecto: Evita que el compilador realice optimizaciones peligrosas, como guardar el valor de tail en un registro de la CPU para ahorrar tiempo, lo que causaría que el bucle principal nunca se entere de que la ISR añadió una tarea nueva.  

4. Abstracciones de Rust (heapless y CriticalSection)
Rust eleva la seguridad al nivel del compilador, eliminando el error humano en la gestión de estas secciones.  
+1

Estructuras SPSC seguras: Librerías como heapless proveen colas específicamente diseñadas para sistemas embebidos que garantizan, por su propia estructura, que no habrá condiciones de carrera sin necesidad de bloqueos manuales pesados.  

CriticalSection: Rust utiliza el concepto de tokens de acceso. Para tocar un recurso compartido, el código debe demostrar que está dentro de una sección crítica, garantizando que es imposible olvidar deshabilitar las interrupciones.  

Comparativa de técnicas
Técnica	Overhead de CPU	Seguridad	Dificultad
Deshabilitar Interrupciones	Medio	Alta	
Fácil (pero arriesgado)  

Diseño SPSC	Mínimo	Muy Alta	
Media (requiere diseño fino)  
+1

Atómicos (Hardware)	Bajo	Máxima	Alta (depende de la CPU)
¿Te gustaría ver cómo se implementaría una Cola de Prioridad específica donde las tareas de "Pánico" saltan al principio del búfer circular?

si

Implementar una tarea de "Pánico" que salte al principio de la cola en un entorno bare metal requiere romper la estructura tradicional FIFO (First-In, First-Out) del búfer circular. Mover todos los elementos existentes hacia atrás para "hacer espacio" es costoso e ineficiente en sistemas de bajo nivel.  
+1

Aquí tienes las dos estrategias más efectivas para lograr este "salto" de prioridad:

1. La Estrategia del "Panic Slot" (LIFO Injection)
En lugar de modificar la cola existente, se reserva un espacio dedicado para una única tarea de máxima prioridad que invalida todo lo demás.

Mecanismo: El sistema tiene una variable global volatile task_t panic_task que normalmente está vacía (puntero nulo).  

El Salto: Cuando ocurre un evento crítico, la ISR escribe directamente en panic_task.

El Dispatcher: En cada iteración del bucle principal, lo primero que se evalúa es si panic_task tiene contenido. Si es así, se ejecuta inmediatamente antes de mirar siquiera la cola regular.  
+1

2. Multi-Queue Dispatcher (Colas Estrictas)
Esta es la implementación más robusta para el desarrollo de núcleos o sistemas complejos, donde manejas diferentes niveles de urgencia.  
+1

Estructura: Se definen dos o más búferes circulares independientes: critical_queue y normal_queue.  

Lógica de Inserción:

Si es una interrupción de seguridad (ej. sobrecalentamiento), la ISR llama a task_enqueue(&critical_queue, fn).

Si es un log rutinario, se usa task_enqueue(&normal_queue, fn).

Lógica del Dispatcher (Consumidor):

El bucle principal siempre intenta vaciar la critical_queue primero.  
+1

Solo si la cola crítica está vacía (head == tail), el procesador procede a ejecutar una tarea de la normal_queue.  

Re-check: Después de ejecutar una sola tarea normal, el dispatcher vuelve a comprobar la cola crítica. Esto asegura que una tarea de pánico que llegue "en medio" de la carga normal sea atendida de inmediato.  

3. Manejo de la Exclusión Mutua en el Salto
Cuando una tarea de pánico "salta" a la ejecución, el riesgo de corrupción de datos aumenta. Para gestionarlo, se aplican estas reglas de exclusión:

Secciones Críticas Atómicas: Durante el breve instante en que la ISR añade la tarea de pánico, se deben deshabilitar las interrupciones para asegurar que los índices del búfer no queden en un estado inconsistente.  

SPSC (Single Producer Single Consumer): Si diseñas el sistema de modo que solo la ISR escriba en la cola de pánico y solo el hilo principal lea, puedes evitar bloqueos complejos utilizando barreras de memoria o variables volatile.  
+1

Priority Inversion: Se debe tener cuidado de que la tarea de pánico no intente adquirir un recurso (como un Mutex) que ya tiene la tarea normal a la que acaba de interrumpir, lo que causaría un bloqueo infinito (Deadlock).

Comparativa de Implementación
Método	Complejidad	Latencia de Pánico	Uso de Memoria
Panic Slot (Único)	Muy Baja	
Mínima (Inmediata)  

Mínimo (1 estructura)
Multi-Queue (Búferes)	Media	
Muy Baja  
+1

Mayor (Requiere pre-asignar varios búferes)  

Deque (Double-Ended)	Alta	Baja	Medio (Búfer circular bidireccional)
Esta arquitectura es la base de lo que luego se convierte en un Scheduler de RTOS (Sistema Operativo de Tiempo Real). ¿Te gustaría ver cómo se estructuraría el código del Dispatcher para que "vuelva al principio" de la jerarquía después de cada tarea ejecutada?

que ejemplos industriales hay de todo esto?

Esto no es solo teoría académica; es la arquitectura que sostiene desde los dispositivos que llevas en la muñeca hasta los sistemas que orbitan la Tierra. Cuando pasamos del "hola mundo" a la industria, estas colas se vuelven la columna vertebral de la confiabilidad.

Aquí tienes ejemplos industriales concretos donde estos patrones son la norma:

1. Industria Automotriz: Unidades de Control (ECU)
Un coche moderno tiene decenas de ECUs (Engine Control Units) comunicándose por un bus CAN. El procesador de frenado ABS, por ejemplo, utiliza colas de prioridad estricta.  
+1

Pánico (Máxima Prioridad): El sensor de colisión o el control de tracción generan tareas que saltan al principio de la cola.  
+1

Tareas Normales: El reporte de temperatura del motor o el envío de telemetría al tablero se encolan para procesarse cuando la CPU esté libre.  
+1

Gestión de Recursos: Se utilizan Ring Buffers estáticos para garantizar que la memoria no se fragmente, algo prohibido en sistemas de seguridad crítica.  
+1

2. Aeroespacial: Controladores de Vuelo
En satélites o drones industriales, el sistema debe gestionar tareas de navegación (críticas) y tareas de comunicación (secundarias).  

Deferring de ISR: Las señales de los giroscopios e IMU llegan a miles de veces por segundo. La interrupción (ISR) solo "anota" el dato en la cola, permitiendo que el bucle principal calcule la trayectoria sin bloquear otros sensores.  
+1

FSM (Máquinas de Estado): Las transiciones de fase (ej. de "vuelo nivelado" a "aterrizaje") se gestionan como tareas encoladas que disparan el cambio de estado del sistema completo.  

3. Redes de Alta Performance: Routers y Switches
Los equipos de infraestructura (como los de Cisco o Juniper) separan el Data Plane del Control Plane usando este patrón.  
+1

Procesamiento de Paquetes: Cuando llega un paquete, la ISR de la tarjeta de red lo coloca en una cola. El procesador luego lo analiza (checksums, ruteo) fuera del contexto de la interrupción.  
+1

Buffering contra Picos: Si llega una ráfaga de tráfico, la cola actúa como amortiguador (buffer), evitando que el procesador colapse.  

Priority Queues: Los paquetes de voz (VoIP) o video se colocan en colas de prioridad alta para garantizar que no tengan latencia, mientras que las descargas de archivos van a la cola de "mejor esfuerzo".  

4. Dispositivos Médicos: Monitoreo de Vida
En un respirador artificial o un monitor cardíaco, la precisión temporal es cuestión de vida o muerte.  

Serialización de Periféricos: Las alertas sonoras, la actualización de la pantalla y el registro de datos en la tarjeta SD compiten por recursos compartidos. El uso de colas asegura que los logs no interrumpan la actualización visual de la frecuencia cardíaca.  
+2

Manejo de Errores (DLQ): Si una tarea de escritura en disco falla por un sector defectuoso, se mueve a una cola de error para intentar reintentarla más tarde sin detener el monitoreo en tiempo real del paciente.  

5. IoT y Wearables: Ahorro de Energía
En dispositivos como smartwatches, el patrón de colas es el mejor amigo de la batería.  

Executive Loop: El procesador pasa el 99% del tiempo "durmiendo". Una interrupción (un paso detectado o una notificación) despierta a la CPU, esta añade la tarea a la cola, la procesa y, en cuanto la cola está vacía (head == tail), el sistema vuelve a entrar en modo de bajo consumo de inmediato.  

Resumen de Aplicación Industrial
Industria	Prioridad Máxima	Tarea Diferida	Beneficio Clave
Automotriz	Frenado/Colisión	Diagnóstico de motor	
Seguridad (Safety)  
+1

Telecom	Tráfico de Voz/Video	Logs de sistema	
Baja Latencia  

Médica	Alarma Vital	Guardado de historial	
Resiliencia  
+1

IoT	Sensor de movimiento	Sincronización Cloud	
Duración de Batería  

¿Te imaginas algún escenario en tus propios desarrollos de sistemas donde la "inanición" (starvation) de la cola de baja prioridad pueda causar un problema real?

me referia a bare metal implementaciones de task quque

En el mundo bare metal, las implementaciones de colas de tareas son mucho más "crudas" y directas, ya que actúan como el reemplazo minimalista de un planificador de sistema operativo. Aquí no hay abstracciones: el programador tiene el control total sobre cada byte y cada ciclo de reloj.

Aquí tienes los ejemplos industriales y arquitecturas de referencia más comunes:

1. Arquitectura de "Deferred Procedure Call" (DPC)
Utilizada en el desarrollo de drivers de alto rendimiento y núcleos de sistemas operativos (como el kernel de Windows o sistemas embebidos industriales).

Implementación: Cuando el hardware dispara una interrupción (ISR), el procesador detiene todo. Si la ISR se queda procesando datos, el sistema se vuelve inestable.  
+1

La Tarea: La ISR solo lee el registro del hardware, coloca el dato en una estructura de tarea y la encola.  

Variante Industrial: Se utiliza un búfer circular estático para evitar el uso de malloc, asegurando que la operación de encolado sea de tiempo constante O(1).  
+1

2. El "Executive Loop" en la Industria Aeroespacial
Sistemas como los que controlan los pequeños satélites (CubeSats) o drones industriales no usan hilos, sino un Bucle Ejecutivo basado en colas de tareas.

Implementación: Se manejan dos colas estrictas: una para tareas de tiempo real (navegación) y otra para tareas de fondo (telemetría).  
+1

Caso de Uso: Si el sensor de posición detecta una desviación, encola una tarea en la cola de prioridad. El bucle principal extrae esa tarea y ajusta los motores antes de pasar a la siguiente tarea menos urgente.  
+1

Variante: Run-to-completion. Cada tarea debe ser corta y no bloquearse nunca, ya que no existe un "preemptive scheduler" que le quite el control a la CPU si se queda colgada.  

3. Pilas de Red (Networking) en Bare Metal
Los controladores de red de alta velocidad (como en equipos de telecomunicaciones) implementan colas de tareas para manejar ráfagas de paquetes.

Implementación: Se utiliza una variante llamada Ring Buffer Descriptor. La tarjeta de red (NIC) escribe el paquete en memoria y "avisa" al procesador añadiendo un descriptor a la cola.  
+1

Variante de Prioridad: Los paquetes de control de red (como protocolos de enrutamiento) se encolan en una lista separada que el procesador revisa con mayor frecuencia que la cola de datos de usuario.  

4. Gestión de Energía en Dispositivos Médicos
En monitores cardíacos portátiles o bombas de insulina, la cola de tareas es la que decide cuándo la CPU puede dormir.

Implementación: El sistema vive en un bucle: while(cola_vacia) { entrar_en_bajo_consumo(); }.

El Salto de Pánico: Si un sensor detecta un valor fuera de rango, la interrupción encola una tarea de "Alarma". Al despertar la CPU, el Dispatcher detecta que hay una tarea en la cola, la ejecuta y vuelve a dormir.  

Beneficio Industrial: Esto garantiza que la batería dure meses, procesando tareas solo bajo demanda absoluta.  

Resumen de Variantes Bare Metal
Nombre Técnico	Estructura de Datos	Uso Principal
SPSC Queue	Single Producer Single Consumer (Lock-free)	
Comunicación segura entre ISR y Main Loop.  
+1

Priority Bitmask	Un entero donde cada bit es una cola de prioridad	
Despacho ultrarrápido (el bit más significativo indica la tarea más urgente).  

Static Pool	Arreglo pre-asignado de tareas	
Evitar fragmentación de memoria en sistemas de seguridad crítica.  

Estas implementaciones son las que permiten que un microcontrolador de pocos dólares sea capaz de manejar tareas complejas con una precisión de microsegundos, algo que un sistema operativo general (como Linux o Windows) no siempre puede garantizar debido a su mayor latencia.